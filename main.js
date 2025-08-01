import { createMoveStep } from './stepBuilder.js';
import { renderTimeline } from './timeline.js';
import { renumberSteps, sequence, categorizeMovementSteps } from './utils.js';
import { socket } from './socket.js';

let motorCheckDone = false;
const repeatExperimentsBtn = document.getElementById("link-repeat-exp");
const repeatExpDiv = document.getElementById("repeat-experiments");
const repeatInput = document.getElementById("repeat-experiments-input");
let showInp = false
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');

const sequenceList = document.getElementById("sequence-list");
const addActionBtnZ = document.getElementById("add-action-z");
const addActionBtnX = document.getElementById("add-action-x");
const addActionBtnY = document.getElementById("add-action-y");

const runBtn = document.getElementById("run-sequence");
const stopBtn = document.getElementById("stop-sequence");
const holdBtn = document.getElementById("add-hold");

// Note: Button click handlers are now managed by the dropdown system in index-fixed-final.html
// The dropdown system handles motor check safety and step creation
// Keeping these for backward compatibility, but they won't be triggered by direct clicks
addActionBtnZ.addEventListener("click", (e) => {
  // Prevent default to allow dropdown handling
  e.preventDefault();
  console.log("Z button click intercepted by dropdown system");
});

addActionBtnX.addEventListener("click", (e) => {
  // Prevent default to allow dropdown handling  
  e.preventDefault();
  console.log("X button click intercepted by dropdown system");
});

addActionBtnY.addEventListener("click", (e) => {
  // Prevent default to allow dropdown handling
  e.preventDefault();
  console.log("Y button click intercepted by dropdown system");
});


runBtn.addEventListener("click", async () => {
  if (!motorCheckDone) return;
  let output = sequence.map(step => step.export());
  output = categorizeMovementSteps(output);
  
  try {
    const res = await fetch('/run_sequence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(output)
    });
    const text = await res.text();
    console.log("✅ Backend says:", text);
  } catch (err) {
    console.error("❌ Error sending sequence:", err);
  }
});

stopBtn.addEventListener("click", async () => {
  console.warn("🛑 Sending stop command...");
  try {
    await fetch('/stop_sequence', { method: 'POST' });
    console.log("🛑 Stop command sent.");
  } catch (err) {
    console.error("❌ Failed to send stop command:", err);
  }
});

const emergencyBtn = document.getElementById("emergency-stop");
emergencyBtn.addEventListener("click", async () => {
  console.warn("🚨 Sending emergency stop...");
  try {
    await fetch('/emergency_stop', { method: 'POST' });
    console.log("🚨 Emergency stop sent.");
  } catch (err) {
    console.error("❌ Failed to send emergency stop:", err);
  }
});

const motorCheckBtn = document.getElementById("motor-check");
motorCheckBtn.addEventListener("click", async () => {
  console.log("Starting motor check...");
  try {
    await fetch('/motor_check', { method: 'POST' });
    console.log("Motor check initiated.");
  } catch (err) {
    console.error("Failed to start motor check:", err);
  }
});

socket.on("log", (msg) => {
  // Existing log handling...
  if (msg.includes("Motor check completed")) {
    motorCheckDone = true;
    [addActionBtnZ, addActionBtnX, addActionBtnY, runBtn].forEach(btn => btn.disabled = false);
  }
});

const exportBtn = document.getElementById("export-data");
exportBtn.addEventListener("click", () => {
  window.location.href = '/export_data';
});

const zeroForceSensor = document.getElementById("zero-force-sensor");
zeroForceSensor.addEventListener("click", async () => {
  console.log("zeroing force sensor...");
  try {
    await fetch('/zero_sensor', { method: 'POST' });
    console.log("Starting : Zero Sensor.");
  } catch (err) {
    console.error("Failed to zero sensor output:", err);
  }
});


repeatExperimentsBtn.addEventListener('click', () => {
  showInp = !showInp;
  repeatExpDiv.style.display = showInp == true ? 'block' : 'none'

  if (showInp){
    repeatExperimentsBtn.innerText = 'Cancel repeat?'
  } else {
    repeatExperimentsBtn.innerText = 'Repeat?'
  }

});

document.getElementById("calibration-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const factors = {
    Fx: parseFloat(document.getElementById("fx-factor").value),
    Fy: parseFloat(document.getElementById("fy-factor").value),
    Fz: parseFloat(document.getElementById("fz-factor").value)
  };
  try {
    await fetch('/calibrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(factors)
    });
    console.log("Calibration applied.");
  } catch (err) {
    console.error("Failed to apply calibration:", err);
  }
});

uploadBtn.addEventListener('click', () => {
  // Reset the input so that 'change' always fires
  fileInput.value = null;
  fileInput.click();  // Trigger hidden file input
});


fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  fetch('/upload-state-json', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      console.log("Response from server:", data);

      // **************** Rehydrate UI from the response here *****************


      alert("Server response:\n" + JSON.stringify(data, null, 2));
    })
    .catch(error => {
      console.error("Error:", error);
      alert("Error uploading JSON file");
    });
});

document.getElementById('downloadBtn').addEventListener('click', () => {

  let data = sequence.map(step => step.export());
  data = categorizeMovementSteps(data);

  fetch('/download-state-json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (!response.ok) throw new Error("Download failed");
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "downloaded_data.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    })
    .catch(err => alert("Error: " + err));
});



// Optional: manualMove from buttons
window.manualMove = (axis, direction) => {
  socket.emit("manual_move", { axis, direction });
};
