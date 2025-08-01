import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";
import { pushForce, startPlotting, stopPlotting } from './chartPanel.js';

const socket = io();

socket.on("connect", () => {
  console.log("Connected to backend via WebSocket");
});

socket.on("disconnect", () => {
  console.warn("Disconnected from backend");
});

socket.on("connect_error", (err) => {
  console.error("WebSocket connection error:", err.message);
});

socket.on("log", (msg) => {
  console.log("Log:", msg);
  const logEl = document.getElementById("log-entries");
  if (logEl) {
    const li = document.createElement("li");
    li.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logEl.prepend(li);
  }

  // Start or stop plotting based on log content
  if (msg.includes("Sequence started")) startPlotting();
  if (msg.includes("Sequence complete") || msg.includes("manually stopped")) stopPlotting();
});

socket.on("force", (data) => {

  const fz = data.Fz ?? 0;
  pushForce(fz);

  const fzValue = fz.toFixed(2);
  const fzTacho = document.getElementById("fzTacho");
  const fx = document.getElementById("fx");
  const fy = document.getElementById("fy");
  const fzText = document.getElementById("fz");

  if (fzTacho) {
    fzTacho.textContent = fzValue;

    const glow = Math.min(1, fz / 10);
    const red = Math.floor(255 * glow);
    const green = Math.floor(180 * (1 - glow));
    fzTacho.style.color = `rgb(${red},${green},80)`;
  }

  if (fx) fx.textContent = data.Fx?.toFixed(2) ?? "0.00";
  if (fy) fy.textContent = data.Fy?.toFixed(2) ?? "0.00";
  if (fzText) fzText.textContent = fzValue;
});

socket.on("step_count", (data) => {
  document.getElementById("x-steps").textContent = data.X;
  document.getElementById("y-steps").textContent = data.Y;
  document.getElementById("z-steps").textContent = data.Z;
});

export { socket };
