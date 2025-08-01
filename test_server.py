#!/usr/bin/env python3
"""
Mock server for testing the Gecko Adhesion Laboratory interface
without hardware dependencies.
"""

from flask import Flask, request, send_from_directory, jsonify, send_file
from flask_socketio import SocketIO
import threading
import time
import random
import json
import io
import datetime

app = Flask(__name__, static_folder='static')
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Mock state that mirrors app.py
latest_force = {"Fx": 0.0, "Fy": 0.0, "Fz": 0.0}
sequence_running = False
motor_check_done = False
global_step_counts = {"X": 0, "Y": 0, "Z": 0}
CALIBRATION_FACTORS = {'Fx': 10.0 / 0.5, 'Fy': 10.0 / 0.5, 'Fz': 10.0 / 0.49}
CALIBRATION_OFFSETS = {'Fx': 0.0, 'Fy': 0.0, 'Fz': 0.0}
CONFIG_FILE = 'test_config.json'
logs_buffer = []
log_f_name = ''

def mock_force_poller():
    """Generate fake force data for testing"""
    while True:
        if sequence_running:
            # Generate more dynamic data when sequence is running
            latest_force["Fx"] = round(random.uniform(-2, 2), 2)
            latest_force["Fy"] = round(random.uniform(-2, 2), 2) 
            latest_force["Fz"] = round(random.uniform(0, 8), 2)
        else:
            # Generate stable low values when idle
            latest_force["Fx"] = round(random.uniform(-0.5, 0.5), 2)
            latest_force["Fy"] = round(random.uniform(-0.5, 0.5), 2)
            latest_force["Fz"] = round(random.uniform(0, 1), 2)
        
        socketio.emit("force", latest_force)
        time.sleep(0.1)  # 10Hz update rate

# Routes
@app.route('/')
def index():
    return send_from_directory('static', 'index-fixed-final.html')

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

@app.route('/live_force')
def live_force():
    return jsonify(latest_force)

@app.route('/run_sequence', methods=['POST'])
def run_sequence():
    global sequence_running
    sequence_running = True
    socketio.emit("log", "Sequence started")
    
    # Mock sequence completion after 5 seconds
    def complete_sequence():
        time.sleep(5)
        global sequence_running
        sequence_running = False
        socketio.emit("log", "Sequence complete")
    
    threading.Thread(target=complete_sequence, daemon=True).start()
    return "Sequence started"

@app.route('/stop_sequence', methods=['POST'])
def stop_sequence():
    global sequence_running
    sequence_running = False
    socketio.emit("log", "Sequence manually stopped")
    return "Stopping"

@app.route('/emergency_stop', methods=['POST'])
def emergency_stop():
    global sequence_running
    sequence_running = False
    socketio.emit("log", "Emergency stop: All motors halted.")
    return "Emergency stopped"

@app.route('/start')
def start():
    axis = request.args.get('axis', '').upper()
    dir_flag = request.args.get('dir')
    
    if axis in ['X', 'Y', 'Z'] and dir_flag in ('0', '1'):
        direction = "negative" if dir_flag == '0' else "positive"
        socketio.emit("log", f"Manual move {axis} axis {direction}")
        
        # Update step count
        if dir_flag == '0':
            global_step_counts[axis] -= 1
        else:
            global_step_counts[axis] += 1
        
        socketio.emit("step_count", global_step_counts)
    
    return 'OK'

@app.route('/stop')
def stop():
    axis = request.args.get('axis', '').upper()
    if axis in ['X', 'Y', 'Z']:
        socketio.emit("log", f"Stopped {axis} axis")
    return 'OK'

@app.route('/calibrate', methods=['POST'])
def calibrate():
    """Handle calibration factor updates - mirrors app.py functionality"""
    global CALIBRATION_FACTORS
    try:
        new_factors = request.get_json()
        if not new_factors or not all(k in new_factors for k in ['Fx', 'Fy', 'Fz']):
            socketio.emit("log", "Calibration failed: Invalid data")
            return "Invalid data", 400
        
        CALIBRATION_FACTORS = new_factors
        
        # Mock saving to config file (app.py saves to JSON)
        try:
            with open(CONFIG_FILE, 'w') as f:
                json.dump({'calibration_factors': CALIBRATION_FACTORS, 'calibration_offsets': CALIBRATION_OFFSETS}, f)
        except:
            pass  # Silent fail for test server
        
        socketio.emit("log", "Calibration updated.")
        print(f"🎯 Calibration factors updated: {CALIBRATION_FACTORS}")
        
        return "Calibration updated"
    except Exception as e:
        socketio.emit("log", f"Calibration failed: {str(e)}")
        return f"Calibration failed: {str(e)}", 400

@app.route('/motor_check', methods=['POST'])
def motor_check():
    global motor_check_done
    print("🔧 Motor check endpoint called")
    socketio.emit("log", "Motor check started")
    print("📡 Emitted: Motor check started")
    
    def complete_motor_check():
        print("⏳ Motor check simulation starting...")
        time.sleep(2)  # Simulate motor check time
        global motor_check_done
        motor_check_done = True
        print("✅ Motor check completed - emitting log")
        socketio.emit("log", "Motor check completed")
        print("📡 Emitted: Motor check completed")
    
    threading.Thread(target=complete_motor_check, daemon=True).start()
    return "Motor check started"

@app.route('/export_data', methods=['GET'])
def export_data():
    """Mock export functionality - mirrors app.py"""
    global log_f_name
    if not log_f_name:
        log_f_name = f'mock_log_{datetime.datetime.now().strftime("%Y-%m-%d__%H-%M-%S")}.txt'
    
    # Create mock log content
    mock_content = f"""*************************** TestBed Config ***************************
Force Sensor Calibration Factors: {str(CALIBRATION_FACTORS)}
*************************** Mock Test Data ***************************
Test execution completed successfully
Total steps: X {global_step_counts['X']} | Y {global_step_counts['Y']} | Z {global_step_counts['Z']}
"""
    
    # Write to temporary file and send
    with open(log_f_name, 'w') as f:
        f.write(mock_content)
    
    socketio.emit("log", f"Exporting data from {log_f_name}")
    return send_file(log_f_name, as_attachment=True)

@app.route('/zero_sensor', methods=['POST'])
def zero_sensor():
    """Mock sensor zeroing - mirrors app.py"""
    socketio.emit("log", "Sensor zeroed.")
    print("🔧 Mock sensor zeroing completed")
    return 'sensor zeroed'


@app.route('/upload-state-json', methods=['POST'])
def upload_state_json():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    try:
        content = json.load(file)
        return jsonify({'status': 'success', 'data': content}), 200
    except Exception as e:
        return jsonify({'error': f'Invalid JSON: {str(e)}'}), 400

@app.route('/download-state-json', methods=['POST'])
def download_state_json():
    """Handle JSON downloads - mirrors app.py"""
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

        # Generate dynamic filename
        filename = f"export_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        socketio.emit("log", f"Downloading state as {filename}")
        return send_file(
            json_bytes,
            mimetype='application/json',
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        socketio.emit("log", f"Download failed: {str(e)}")
        return jsonify({'error': str(e)}), 500

@socketio.on("manual_move")
def handle_manual_move(data):
    """Handle manual move requests - mirrors app.py"""
    global sequence_running
    axis = data.get("axis")
    direction = bool(data.get("direction"))
    
    if axis not in ['X', 'Y', 'Z']:
        socketio.emit("log", f"Invalid axis: {axis}")
        return
    
    if sequence_running:
        socketio.emit("log", "Movement already in progress.")
        return
    
    sequence_running = True
    direction_str = '+' if direction else '-'
    socketio.emit("log", f"Manual move on {axis} axis ({direction_str})")
    
    # Mock manual movement
    def mock_manual_move():
        time.sleep(1)  # Simulate movement duration
        global sequence_running
        sequence_running = False
        socketio.emit("log", "Manual move completed.")
    
    threading.Thread(target=mock_manual_move, daemon=True).start()

if __name__ == '__main__':
    # Start mock force poller
    threading.Thread(target=mock_force_poller, daemon=True).start()
    
    print("🦎 Mock Gecko Adhesion Laboratory Server Starting...")
    print("📊 Generating fake sensor data for testing")
    print("🌐 Access the interface at: http://localhost:5000")
    print("✨ Testing the new modern UI with gecko/space theme!")
    
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)