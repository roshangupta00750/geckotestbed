// const sequenceList = document.getElementById("sequence-list");
// const addActionBtn = document.getElementById("add-action");
// const runSequenceBtn = document.getElementById("run-sequence");
// const timelineView = document.getElementById("timeline-view");
//
// const FORCE_TYPES = ["Fx", "Fy", "Fz", "F_Gesamt"];
// const AXES = ["Z", "Y", "X"];
// let sequence = [];
//
// addActionBtn.addEventListener("click", () => {
//   addMoveAxesStep();
// });
//
// runSequenceBtn.addEventListener("click", () => {
//   const result = getSequenceData();
//   console.log("Sequence:", result);
//   alert("Check console for the built sequence object.");
// });
//
// function getSequenceData() {
//   return sequence.map(step => {
//     if (step.type === "hold") {
//       return { type: "hold", duration: step.getDuration() };
//     }
//     const axes = {};
//     for (const axis of AXES) {
//       if (step.axes[axis].enabled()) {
//         axes[axis] = {
//           direction: step.axes[axis].getDirection(),
//           speed: step.axes[axis].getSpeed(),
//           triggers: step.axes[axis].getTriggers()
//         };
//       }
//     }
//     return { type: "move-multiple-axes", axes };
//   });
// }
//
// function renderTimeline() {
//   timelineView.innerHTML = "";
//   const data = getSequenceData();
//   data.forEach((step, i) => {
//     const div = document.createElement("div");
//     div.className = "timeline-item";
//
//     if (step.type === "hold") {
//       div.textContent = `Hold ${step.duration}s`;
//     } else if (step.type === "move-multiple-axes") {
//       const activeAxes = Object.entries(step.axes)
//         .filter(([_, a]) => a && a.direction)
//         .map(([axis, a]) => {
//           const dir = (() => {
//             if (axis === "Z") return a.direction === "positive" ? "↓" : "↑";
//             else return a.direction === "positive" ? "→" : "←";
//           })();
//           return `${axis}${dir}`;
//         });
//       div.textContent = `Move: ${activeAxes.join(", ") || "—"}`;
//     }
//
//     timelineView.appendChild(div);
//
//     if (i < data.length - 1) {
//       const arrow = document.createElement("div");
//       arrow.className = "timeline-arrow";
//       arrow.innerHTML = `<i class="fas fa-arrow-down"></i>`;
//       timelineView.appendChild(arrow);
//     }
//   });
// }
//
// function renumberSteps() {
//   const stepDivs = document.querySelectorAll(".sequence-step");
//   stepDivs.forEach((div, i) => {
//     const h2 = div.querySelector("h2");
//     if (h2) {
//       const isHold = h2.textContent.includes("Hold");
//       h2.textContent = isHold
//         ? `Step ${i + 1}: Hold`
//         : `Step ${i + 1}: Move Selected Axes`;
//     }
//   });
// }
//
// function removeStep(index) {
//   sequence.splice(index, 1);
//   const allSteps = document.querySelectorAll(".sequence-step");
//   if (allSteps[index]) {
//     allSteps[index].remove();
//   }
//   renumberSteps();
//   renderTimeline();
// }
//
// function addMoveAxesStep() {
//   const stepIndex = sequence.length;
//   const stepData = { type: "move-multiple-axes", axes: {} };
//
//   const stepDiv = document.createElement("div");
//   stepDiv.className = "sequence-step";
//
//   const headerRow = document.createElement("div");
//   headerRow.style.display = "flex";
//   headerRow.style.justifyContent = "space-between";
//   headerRow.style.alignItems = "center";
//
//   const header = document.createElement("h2");
//   header.textContent = `Step ${stepIndex + 1}: Move Selected Axes`;
//
//   const deleteBtn = document.createElement("button");
//   deleteBtn.className = "icon-btn";
//   deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
//   deleteBtn.style.backgroundColor = "#cc0000";
//   deleteBtn.style.padding = "6px 10px";
//   deleteBtn.onclick = () => removeStep(stepIndex);
//
//   headerRow.appendChild(header);
//   headerRow.appendChild(deleteBtn);
//   stepDiv.appendChild(headerRow);
//
//   const summary = document.createElement("div");
//   summary.className = "summary-text";
//   summary.textContent = "No triggers set yet.";
//
//   const updateSummary = () => {
//     const lines = [];
//     for (const axis of AXES) {
//       if (!stepData.axes[axis]) continue;
//       const enabled = stepData.axes[axis].enabled();
//       const triggers = stepData.axes[axis].getTriggers();
//       if (enabled && triggers.length > 0) {
//         const parts = triggers.map(t => `${t.forceType} > ${t.value}N`);
//         lines.push(`Axis ${axis} stops if ${parts.join(" OR ")}`);
//       }
//     }
//     summary.textContent = lines.length
//       ? `This action ends when all active axes stop:\n- ${lines.join("\n- ")}`
//       : "This action has no stop triggers defined.";
//     renderTimeline();
//   };
//
//   AXES.forEach(axis => {
//     const axisSection = document.createElement("div");
//     axisSection.className = "axis-config";
//
//     const checkbox = document.createElement("input");
//     checkbox.type = "checkbox";
//     checkbox.addEventListener("change", updateSummary);
//
//     const headerRow = document.createElement("div");
//     headerRow.className = "axis-header";
//
//     const axisLabel = document.createElement("label");
//     axisLabel.textContent = `Use Axis ${axis}`;
//
//     const dirNeg = document.createElement("button");
//     dirNeg.className = "dir-btn";
//     const dirPos = document.createElement("button");
//     dirPos.className = "dir-btn";
//
//     if (axis === "Z") {
//       dirNeg.innerHTML = `<i class="fas fa-arrow-up"></i>`;
//       dirPos.innerHTML = `<i class="fas fa-arrow-down"></i>`;
//     } else {
//       dirNeg.innerHTML = `<i class="fas fa-arrow-left"></i>`;
//       dirPos.innerHTML = `<i class="fas fa-arrow-right"></i>`;
//     }
//
//     let currentDir = null;
//     dirNeg.onclick = () => {
//       dirNeg.classList.add("active");
//       dirPos.classList.remove("active");
//       currentDir = "negative";
//       updateSummary();
//     };
//     dirPos.onclick = () => {
//       dirPos.classList.add("active");
//       dirNeg.classList.remove("active");
//       currentDir = "positive";
//       updateSummary();
//     };
//
//     const speedInput = document.createElement("input");
//     speedInput.type = "number";
//     speedInput.placeholder = "Speed mm/s";
//     speedInput.addEventListener("input", updateSummary);
//
//     headerRow.appendChild(checkbox);
//     headerRow.appendChild(axisLabel);
//     headerRow.appendChild(dirNeg);
//     headerRow.appendChild(dirPos);
//     headerRow.appendChild(speedInput);
//     axisSection.appendChild(headerRow);
//
//     const triggerList = document.createElement("div");
//     triggerList.className = "trigger-list";
//
//     const addTrigger = document.createElement("button");
//     addTrigger.className = "add-trigger-btn";
//     addTrigger.textContent = "➕ Add Force Trigger";
//
//     addTrigger.onclick = () => {
//       const item = document.createElement("div");
//       item.className = "trigger-item";
//
//       const forceDropdown = document.createElement("select");
//       FORCE_TYPES.forEach(f => {
//         const opt = document.createElement("option");
//         opt.value = f;
//         opt.textContent = f;
//         forceDropdown.appendChild(opt);
//       });
//
//       const input = document.createElement("input");
//       input.type = "number";
//       input.placeholder = "N";
//       input.className = "force-small";
//       input.addEventListener("input", updateSummary);
//
//       item.appendChild(document.createTextNode("Stop if"));
//       item.appendChild(forceDropdown);
//       item.appendChild(document.createTextNode(">"));
//       item.appendChild(input);
//       item.appendChild(document.createTextNode("N"));
//
//       triggerList.appendChild(item);
//       updateSummary();
//     };
//
//     axisSection.appendChild(triggerList);
//     axisSection.appendChild(addTrigger);
//     stepDiv.appendChild(axisSection);
//
//     stepData.axes[axis] = {
//       enabled: () => checkbox.checked,
//       getDirection: () => currentDir,
//       getSpeed: () => Number(speedInput.value),
//       getTriggers: () => {
//         const triggers = [];
//         triggerList.querySelectorAll(".trigger-item").forEach(item => {
//           const fType = item.querySelector("select").value;
//           const value = parseFloat(item.querySelector("input").value);
//           if (!isNaN(value)) {
//             triggers.push({ forceType: fType, value });
//           }
//         });
//         return triggers;
//       }
//     };
//   });
//
//   stepDiv.appendChild(summary);
//   sequence.push(stepData);
//   sequenceList.appendChild(stepDiv);
//   renderTimeline();
// }
//
// const holdBtn = document.createElement("button");
// holdBtn.className = "icon-btn";
// holdBtn.innerHTML = `<i class="fas fa-clock"></i> Add Hold Step`;
// addActionBtn.before(holdBtn);
//
// holdBtn.addEventListener("click", () => {
//   const stepIndex = sequence.length;
//
//   const stepDiv = document.createElement("div");
//   stepDiv.className = "sequence-step";
//
//   const headerRow = document.createElement("div");
//   headerRow.style.display = "flex";
//   headerRow.style.justifyContent = "space-between";
//   headerRow.style.alignItems = "center";
//
//   const header = document.createElement("h2");
//   header.textContent = `Step ${stepIndex + 1}: Hold`;
//
//   const deleteBtn = document.createElement("button");
//   deleteBtn.className = "icon-btn";
//   deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
//   deleteBtn.style.backgroundColor = "#cc0000";
//   deleteBtn.style.padding = "6px 10px";
//   deleteBtn.onclick = () => removeStep(stepIndex);
//
//   headerRow.appendChild(header);
//   headerRow.appendChild(deleteBtn);
//   stepDiv.appendChild(headerRow);
//
//   const label = document.createElement("label");
//   label.textContent = "Duration (seconds):";
//   const input = document.createElement("input");
//   input.type = "number";
//   input.step = "0.1";
//   input.min = "0";
//   input.placeholder = "e.g. 2.5";
//   input.addEventListener("input", renderTimeline);
//
//   stepDiv.appendChild(label);
//   stepDiv.appendChild(input);
//
//   sequence.push({
//     type: "hold",
//     getDuration: () => Number(input.value)
//   });
//
//   sequenceList.appendChild(stepDiv);
//   renderTimeline();
// });
