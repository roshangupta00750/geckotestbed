import datetime
from flask import Flask, request, send_from_directory, jsonify, send_file
from flask_socketio import SocketIO
import threading, time
import RPi.GPIO as GPIO
import serial
import struct
import math
import json
import io



# === Global State ===
stop_threads = False
latest_force = {"Fx": 0.0, "Fy": 0.0, "Fz": 0.0}
sequence_running = False
serial_lock = threading.Lock()
MAX_FORCE_SENSOR_LIMIT = 10 # Newtons
log_file = None
logs_buffer = []
log_f_name = ''
SERIAL_PORT = '/dev/ttyUSB0'
BAUDRATE = 115200
CALIBRATION_FACTORS = {'Fx': 10.0 / 0.5, 'Fy': 10.0 / 0.5, 'Fz': 10.0 / 0.49}
step_delay = 0.001  # seconds between edges → adjust speed
AXES = {
    "X": (24, 25),
    "Y": (16, 26),
    "Z": (27, 17),
}
moving = {ax: False for ax in AXES}
global_step_counts = {"X": 0, "Y": 0, "Z": 0}


# === Flask & SocketIO Setup ===
app = Flask(__name__, static_folder='static')
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# === GPIO Setup ===
GPIO.setmode(GPIO.BCM)
for step_pin, dir_pin in AXES.values():
    GPIO.setup(step_pin, GPIO.OUT, initial=GPIO.LOW)
    GPIO.setup(dir_pin, GPIO.OUT, initial=GPIO.LOW)

# === Serial Sensor Setup ===

ser = serial.Serial(SERIAL_PORT, BAUDRATE, timeout=1)
def init_force_sensor():
    with serial_lock:
        ser.write(b'\x23')
        time.sleep(0.5)
        ser.write(b'\x26\x01\x62\x65\x72\x6C\x69\x6E')
        time.sleep(0.1)
        ser.write(b'\x12\xA6')  # 12.5 Hz
        time.sleep(0.1)
        ser.write(b'\x0C\x01')
        time.sleep(0.5)
        ser.write(b'\x0C\x02')
        time.sleep(0.5)
        ser.write(b'\x0C\x03')
        time.sleep(0.5)
        ser.write(b'\x24')
        time.sleep(0.5)

init_force_sensor()
print("Serial sensor initialized")


# === Read Force Function ===
def read_force():
    with serial_lock:
        frame_header = b''
        while frame_header != b'\xA5': # this keeps on looking and only starts if the first byte is xA5.
            frame_header = ser.read(1)
        frame = frame_header + ser.read(10)

    if len(frame) != 11 or frame[0] != 0xA5 or frame[-2:] != b'\x0D\x0A': # more validation of frame
        return None
    fx = struct.unpack('>H', frame[1:3])[0]
    fy = struct.unpack('>H', frame[3:5])[0]
    fz = struct.unpack('>H', frame[5:7])[0]
    def raw_to_mv_v(raw): return (raw - 32768) / 32768 * 2.0
    force_vector =  {
        'Fx': round(raw_to_mv_v(fx) * CALIBRATION_FACTORS['Fx'], 2),
        'Fy': round(raw_to_mv_v(fy) * CALIBRATION_FACTORS['Fy'], 2),
        'Fz': round(raw_to_mv_v(fz) * CALIBRATION_FACTORS['Fz'], 2),
    }

    force_vector['F_shear'] = math.sqrt(force_vector['Fx'] ** 2 + force_vector['Fy'] ** 2)
    force_vector['F_shear'] = round(force_vector['F_shear'], 2)
    return force_vector

# === Force Poller Thread ===
def force_poller():
    print("Starting force poller...")
    while not stop_threads:
        data = read_force()
        if data:
            latest_force.update(data)
            socketio.emit("force", latest_force)
            print(f"[emit] force {latest_force}")

            # only add force log events in file when sequence is executing
            if sequence_running:
                logs_buffer.append(f'{str(datetime.datetime.now())} | {str(latest_force)} | {str(global_step_counts)} ')

        time.sleep(0.01) # 10ms


def write_log():
    for l in logs_buffer:
        log_file.write(l)
        log_file.write('\n')

    log_file.close()
    return


def trigger_comparator(current_value, target_value, comparator):
    if comparator == '>=':
        return current_value >= target_value
    elif comparator == '<=':
        return current_value <= target_value
    elif comparator == '==':
        return current_value == target_value
    elif comparator == '>':
        return current_value > target_value
    elif comparator == '<':
        return current_value < target_value



def check_if_trigger_fired(trigger, duration, step_count):
    if '(N)' in trigger['triggerType']:
        force_trigger_type = trigger['triggerType'].split(' (N)')[0]  # example: Fy (N) => Fy, Fz (N) => Fz
        current_value = latest_force.get(force_trigger_type)
        target_value = trigger['value']
        if trigger_comparator(current_value, target_value, trigger['comparator']) or latest_force.get(force_trigger_type) > MAX_FORCE_SENSOR_LIMIT: # also return true if the current force is outside of sensor tolerance
            # halt movement
            return True
    
    elif 'duration' in trigger['triggerType']:
        current_value = duration
        target_value = trigger['value']
        if trigger_comparator(current_value, target_value, trigger['comparator']):
            return True
    
    elif 'steps' in trigger['triggerType']:
        current_value = step_count
        target_value = trigger['value']
        if trigger_comparator(current_value, target_value, trigger['comparator']):
            return True
    
    elif '(mm)' in trigger['triggerType']:
        # Placeholder for future distance calibration (e.g., step_count / STEPS_PER_MM)
        return False
    
    return False



def axis_from_pins(step_pin):
    for ax, (sp, dp) in AXES.items():
        if sp == step_pin:
            return ax
    return None

def move_axis(step_pin, dir_pin, direction, step_size): # pulse width is dependent on the speed at which 
    
    # print('move: ', step_pin, dir_pin, direction, step_size/1000)
    GPIO.output(dir_pin, GPIO.HIGH if direction == 'positive' else GPIO.LOW)
    GPIO.output(step_pin, GPIO.HIGH)
    time.sleep(step_size/1000) # step_size in (ms)
    
    GPIO.output(step_pin, GPIO.LOW)
    time.sleep(1/1000) # by default set it to 1ms

    axis = axis_from_pins(step_pin)

    if direction == "negative":
        global_step_counts[axis] += 1
    else:
        global_step_counts[axis] -= 1

    socketio.emit("step_count", global_step_counts)
    return

def reset_motors_to_starting_positions():
    global global_step_counts

    for axis in AXES.keys():
        step_pin = AXES[axis][0]
        dir_pin = AXES[axis][1]
        direction = 'positive' if global_step_counts[axis] > 0 else 'negative'
        while global_step_counts[axis] != 0:
            move_axis(step_pin, dir_pin, direction, 1)

    return




def hold_force(axis, threshold, step_pin, dir_pin, direction):
    step_pin, dir_pin = AXES[axis]
    force_axis = 'F' + axis.lower() # X => Fx

    while sequence_running:
        if abs(latest_force.get(force_axis) - threshold) <= 0.1: # if force along this axis is within tolerance
           return # force is within tolerance, exit from this function
        
        elif latest_force.get(force_axis) > threshold:
            # making negative movement along this axis to reduce latest force along this axis
            move_axis(step_pin, dir_pin, 'positive', 20) # use 5ms step size  
        
        elif latest_force.get(force_axis) < threshold:
            # making positive movement along this axis to increase latest force along this axis
            move_axis(step_pin, dir_pin, 'negative', 20) # use 5ms step size

def _stepper_loop(axis: str, direction: bool):
    step_pin, dir_pin = AXES[axis]
    GPIO.output(dir_pin, GPIO.HIGH if direction else GPIO.LOW)
    while moving[axis]:
        GPIO.output(step_pin, GPIO.HIGH)
        time.sleep(step_delay)
        GPIO.output(step_pin, GPIO.LOW)
        time.sleep(step_delay)

# === Steps Execution ===
def execute_steps_along_axis(axis, steps):
    for s in range(len(steps)):

        step = steps[s]
        data = step['data']
        direction = data['direction']

        if data['holdThreshold'] != 'NaN':
            data['holdThreshold'] = float(data['holdThreshold']) # example: '0.001' => 0.001


        # step initiation log
        socketio.emit("log", f"{axis}: Step {s} is initiated.")

        step_pin, dir_pin = AXES[axis]
        trigger_fired = False
        hold_trigger_fired = False
        init_movement_trigger_fired = False

        # setting up timers for "duration (sec) hold trigger type."
        start_time = time.time()
        end_time = 0
        step_count = 0
        emitted_hold_state_event = False

        # write log event before starting execution of this step!
        message = f"{str(datetime.datetime.now())} | {str(latest_force)} | Starting Step No: {s} on {axis} axis"
        logs_buffer.append(message)

        while sequence_running:
            now = str(datetime.datetime.now())

            # Step 1: first we wait for movement initiating triggers to fire (all or one)
            if len(data['moveInitTriggers']) and init_movement_trigger_fired == False:
                # none of the movement initiating triggers have fired yet.
                # check if one of them fired.
                init_movement_trigger_fired = 0
                for trig in data['moveInitTriggers']:
                    if check_if_trigger_fired(trig, 0, step_count): # temp fix: we do not have duration option in movement initiating triggers, yet! (we should)
                        init_movement_trigger_fired += 1
                        if trig.get('fired') == None:  # only emit trigger fired log event the first time the trigger fires
                            socketio.emit("log",f"Axis {axis}: {trig['triggerType']} ≥ {trig['value']}, movement starting trigger fired.")
                            # this is more detailed (granular) experiment log, to be stored in file
                            logs_buffer.append(f"{now} | {str(latest_force)} | Axis {axis}: {trig['triggerType']} ≥ {trig['value']}, movement starting trigger fired.")
                            # finally set the trigger fired to be True
                            trig['fired'] = True

                # checking if all triggers needs to be fired or just one
                if data['fireAllInitTriggers'] == 'True':
                    # all start triggers should be fired
                    init_movement_trigger_fired = init_movement_trigger_fired == len(data['moveInitTriggers'])
                else:
                    # only one trigger firing is enough to start movement
                    init_movement_trigger_fired = init_movement_trigger_fired > 0

            # moving the axis until a breaking trigger is fired.
            elif len(data['triggers']) and trigger_fired == False:
                triggers_fired_count = 0

                # 1. check all triggers, if anyone is true? halt movement!
                for trig in data['triggers']:
                    if check_if_trigger_fired(trig, 0, step_count): # temp fix: we do not have duration option in movement breaking triggers, yet!
                        triggers_fired_count += 1
                        if trig.get('fired') == None: #only emit trigger fired log event the first time the trigger fires
                            # this is for realtime display log
                            socketio.emit("log", f"Axis {axis}: {trig['triggerType']} ≥ {trig['value']}, movement break trigger fired.")
                            # this is more detailed (granular) experiment log, to be stored in file
                            logs_buffer.append(f"{now} | {str(latest_force)} | Axis {axis}: {trig['triggerType']} ≥ {trig['value']}, movement break trigger fired.")
                            # finllay set the trigger fired to be True
                            trig['fired'] = True

                # checking if all triggers needs to be fired or just one
                if data['fireAllTriggers'] == 'True':
                    # all triggers should be fired
                    trigger_fired = triggers_fired_count == len(data['triggers'])
                else:
                    # only trigger firing is enough halt movement. 
                    trigger_fired = triggers_fired_count > 0

                if trigger_fired == False:
                    # if none of the triggers fired
                    # initiate (keep) movement
                    move_axis(step_pin, dir_pin, direction ,data['stepSize'])
                    step_count += 1

                elif trigger_fired == True:
                    # movement has been broken for this, logging this event
                    message = f"{now} | {str(latest_force)} | Breaking movement on {axis} axis. All (or atleast one) triggers fired."
                    logs_buffer.append(message)

            # the movement breaking trigger has fired
            # now check if we need to hold a force along this axis?
            elif data['holdThreshold'] != 'NaN' and hold_trigger_fired == False:

                hold_triggers_fired_count = 0
                if emitted_hold_state_event == False:
                    # emitting hold state notifcaition
                    socketio.emit("log", f'Holding force: F{axis.lower()} = {data["holdThreshold"]}N')
                    logs_buffer.append(f'Holding force: F{axis.lower()} = {data["holdThreshold"]}N')
                    emitted_hold_state_event = True

                # check if any of the triggers is True
                for hold_trig in data['holdTriggers']:
                    if check_if_trigger_fired(hold_trig, end_time - start_time, 0):
                        hold_triggers_fired_count += 1

                        if hold_trig.get('fired') == None: # only emit trigger fired log event the first time the trigger fires
                            socketio.emit("log", f"Axis {axis}: {hold_trig['triggerType']} ≥ {hold_trig['value']}N, force hold break trigger fired")
                            # this is more detailed (granular) experiment log, to be stored in file
                            logs_buffer.append(f"{now} | {str(latest_force)} | Axis {axis}: {hold_trig['triggerType']} ≥ {hold_trig['value']}, force hold breaking trigger fired.")
                            hold_trig['fired'] = True

                # checking if all holding triggers needs to be fired or just one
                if data['fireAllHoldTriggers'] == 'True':
                    # all holding triggers should fire
                    hold_trigger_fired = hold_triggers_fired_count == len(data['holdTriggers'])

                else:
                    # only one hold trigger needs to be fired
                    hold_trigger_fired = hold_triggers_fired_count > 0

                if hold_trigger_fired == False:
                    # maintain force through movement
                    hold_force(axis, data['holdThreshold'], step_pin, dir_pin, direction) # hold force by micro-movements in this axis
                    end_time = time.time()

                elif hold_trigger_fired == True:
                    socketio.emit("log", f'Holding force: F{axis.lower()} = {data["holdThreshold"]}N completed!')
                    # holding state has been broken, logging this event
                    message = f"{now} | {str(latest_force)} | Breaking force hold on {axis} axis. All (or atleast one) hold breaking triggers fired."
                    logs_buffer.append(message)

            else:
                socketio.emit("log", f"{axis}: Step {s} is completed!")
                break # get to the next step!!



# === Sequence Execution ===
def run_dynamic_sequence(sequence):

    global sequence_running, global_step_counts, log_file, log_f_name, logs_buffer
    if sequence_running:
        return
    global_step_counts = {"X": 0, "Y": 0, "Z": 0}  # Reset at start
    sequence_running = True

    # creating a log file
    now = datetime.datetime.now()
    log_f_name = f'log_{now.strftime("%Y-%m-%d__%H-%M-%S")}.txt'
    log_file = open(log_f_name, 'w')

    repeat = 1
    if sequence['repeat']:
        repeat = sequence.pop('repeat')
        repeat = int(repeat)

    # first we log the experiment schema (or the sequence to execute)
    logs_buffer.append('*************************** TestBed Config ***************************')
    logs_buffer.append(f'Force Sensor Calibration Factors: {str(CALIBRATION_FACTORS)}')
    logs_buffer.append('*************************** Sequence ***************************')
    logs_buffer.append(str(sequence))

    for i in range(repeat):
        logs_buffer.append(f'*************************** Execution {i} ***************************')

        socketio.emit("log", f"Experiement {i} started")
        threads = []
        for axis, steps in sequence.items():
            # for i, steps in enumerate(sequence[axis]):
            if not sequence_running:
                socketio.emit("log", "Experiment manually stopped")
                break

            # if there no steps along an axis:
            if len(steps) == 0:
                continue

            # just feed the list of actions along each axis to apropriate thread
            t = threading.Thread(
                target=execute_steps_along_axis,
                args=(axis, steps)
            )
            t.start() # non blocking thread for each axis
            threads.append(t)
        # all threads are launched
        for t in threads:
            while t.is_alive():
                if sequence_running == False:
                    return
                time.sleep(0.1) # 100ms

        # all threads are dead
        socketio.emit("log", f"experiment {i} completed!")
        socketio.emit("log", f"Total steps: X {global_step_counts['X']} | Y {global_step_counts['Y']} | Z {global_step_counts['Z']}")
        logs_buffer.append(f'*************************** Experiment {i} Finished ***************************')
        socketio.emit("log", f"Resetting motors to their initial state.")
        reset_motors_to_starting_positions()

    socketio.emit("log", f"writing experiment logs in file {log_f_name}.")
    write_log()
    logs_buffer = []
    sequence_running = False
    return

# === Manual Move Function ===
# This function moves the axis until a force trigger is fired.
# It takes the axis, direction, triggers, and step size as parameters.
def move_until_force(axis, direction, triggers, step_size_ms):
    global sequence_running
    if axis not in AXES:
        return
    step_pin, dir_pin = AXES[axis]
    dir_str = 'positive' if direction else 'negative'
    while sequence_running:
        trigger_fired = False
        triggers_fired_count = 0
        for trig in triggers:
            if check_if_trigger_fired(trig, 0):
                triggers_fired_count += 1
                if trig.get('fired') is None:
                    socketio.emit("log", f"Axis {axis}: {trig['triggerType']} trigger fired during manual move.")
                    trig['fired'] = True
        if triggers_fired_count > 0:
            trigger_fired = True
            socketio.emit("log", "Manual move stopped due to trigger.")
        if trigger_fired:
            break
        move_axis(step_pin, dir_pin, dir_str, step_size_ms)
    sequence_running = False
    socketio.emit("log", "Manual move completed.")

def motor_check():
    global sequence_running
    if sequence_running:
        socketio.emit("log", "Motor check in progress.")
        return
    sequence_running = True
    socketio.emit("log", "Motor check started.")
    
    threads = []
    for axis in AXES:
        t = threading.Thread(target=motor_check_axis, args=(axis,))
        t.start()
        threads.append(t)
    
    for t in threads:
        t.join()
    
    sequence_running = False
    socketio.emit("log", "Motor check completed.")

def motor_check_axis(axis):
    step_pin, dir_pin = AXES[axis]
    # Forward (positive direction) for 3s at 10ms step size
    GPIO.output(dir_pin, GPIO.HIGH)
    start_time = time.time()
    while time.time() - start_time < 3:
        GPIO.output(step_pin, GPIO.HIGH)
        time.sleep(0.01)
        GPIO.output(step_pin, GPIO.LOW)
        time.sleep(0.01)
    
    # Backward (negative direction) for 3s at 10ms step size
    GPIO.output(dir_pin, GPIO.LOW)
    start_time = time.time()
    while time.time() - start_time < 3:
        GPIO.output(step_pin, GPIO.HIGH)
        time.sleep(0.01)
        GPIO.output(step_pin, GPIO.LOW)
        time.sleep(0.01)

# === Flask Routes ===
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/live_force')
def live_force():
    return jsonify(latest_force)

@app.route('/run_sequence', methods=['POST'])
def run_sequence():
    raw = request.get_json()
    print('raw: ', raw)
    # if not isinstance(raw, list):
    #     return "Invalid format", 400
    parsed = raw

    socketio.start_background_task(run_dynamic_sequence, parsed)
    return "Sequence started"

@app.route('/stop_sequence', methods=['POST'])
def stop_sequence():
    global sequence_running
    sequence_running = False
    return "Stopping"

@app.route('/emergency_stop', methods=['POST'])
def emergency_stop():
    global sequence_running
    sequence_running = False
    for step_pin, dir_pin in AXES.values():
        GPIO.output(step_pin, GPIO.LOW)
        GPIO.output(dir_pin, GPIO.LOW)
    socketio.emit("log", "Emergency stop: All motors halted.")
    return "Emergency stopped"

@app.route('/start')
def start():
    axis = request.args.get('axis', '').upper()
    dir_flag = request.args.get('dir')
    if axis not in AXES or dir_flag not in ('0','1'):
        abort(400)
    direction = (dir_flag == '1')
    if not moving[axis]:
        moving[axis] = True
        threading.Thread(target=_stepper_loop, args=(axis, direction), daemon=True).start()
    return 'OK'

@app.route('/stop')
def stop():
    axis = request.args.get('axis', '').upper()
    if axis not in AXES:
        abort(400)
    moving[axis] = False
    return 'OK'

@app.route('/motor_check', methods=['POST'])
def run_motor_check():
    socketio.start_background_task(motor_check)
    return "Motor check started"

@socketio.on("manual_move")
def handle_manual_move(data):
    global sequence_running
    axis = data.get("axis")
    direction = bool(data.get("direction"))
    if axis not in AXES:
        socketio.emit("log", f"Invalid axis: {axis}")
        return
    if sequence_running:
        socketio.emit("log", "Movement already in progress.")
        return
    sequence_running = True
    socketio.emit("log", f"Manual move on {axis} axis ({'+' if direction else '-'})")
    socketio.start_background_task(move_until_force, axis, direction, [], 1)  # 1ms step size


@app.route('/export_data', methods=['GET'])
def export_data():
    global log_f_name
    return send_from_directory('.', log_f_name, as_attachment=True)

@app.route('/zero_sensor', methods=['POST'])
def zero_sensor():
    init_force_sensor()
    socketio.emit("log", "Sensor zeroed.")
    return 'sensor zeroed'

@app.route('/calibrate', methods=['POST'])
def calibrate():
    new_factors = request.get_json()
    if not new_factors or not all(k in new_factors for k in ['Fx', 'Fy', 'Fz']):
        return "Invalid data", 400
    global CALIBRATION_FACTORS
    CALIBRATION_FACTORS = new_factors
    with open(CONFIG_FILE, 'w') as f:
        json.dump({'calibration_factors': CALIBRATION_FACTORS, 'calibration_offsets': CALIBRATION_OFFSETS}, f)
    socketio.emit("log", "Calibration updated.")
    return "Calibration updated"


@app.route('/upload-state-json', methods=['POST'])
def upload_state_json():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Read and decode the file as JSON
        content = json.load(file)
        return jsonify({'status': 'success', 'data': content}), 200
    except Exception as e:
        return jsonify({'error': f'Invalid JSON: {str(e)}'}), 400


@app.route('/download-state-json', methods=['POST'])
def download_state_json():
    try:
        # Parse incoming JSON object from request body
        data = request.get_json()
        if data is None:
            return jsonify({'error': 'Invalid or missing JSON'}), 400

        # Convert JSON object to file-like object
        json_str = io.StringIO()
        json.dump(data, json_str, indent=2)
        json_str.seek(0)
        json_bytes = io.BytesIO(json_str.read().encode('utf-8'))
        json_bytes.seek(0)

        # Optional: generate a dynamic filename
        filename = f"export_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        return send_file(
            json_bytes,
            mimetype='application/json',
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500



# === Launch App ===
if __name__ == '__main__':
    try:
        threading.Thread(target=force_poller, daemon=True).start()
        print("Flask-SocketIO server starting...")
        socketio.run(app, host='0.0.0.0', port=5000)
    finally:
        stop_threads = True
        time.sleep(0.1)
        GPIO.cleanup()
        ser.write(b'\x23') # stopping force sensor data transmission
        time.sleep(0.5)
        ser.close()
        print("Clean exit")
        print("GPIO and serial port cleaned up.")
        print("Threads stopped.")
