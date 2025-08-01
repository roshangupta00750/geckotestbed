import { sequence, renumberSteps } from './utils.js';

const INIT_TRIGGER_TYPES = ["Fx (N)", "Fy (N)", "Fz (N)", "F_Gesamt (N)", 'steps (count)'];
const TRIGGER_TYPES = ["Fx (N)", "Fy (N)", "Fz (N)", "F_Gesamt (N)", 'steps (count)'];
const HOLD_TRIGGER_TYPES = ["Fz (N)", "Fx (N)", "Fy (N)", "F_Gesamt (N)", 'duration (sec)', 'steps (count)'];
const COMPARATORS = ['>=', '<=', '==', '>', '<']



export function createMoveStep(index, update, axis) {

  const AXES = [axis];
  const stepData = { type: `move-${axis}-axis`, data: {} };
  const stepDiv = document.createElement("div");
  stepDiv.className = "sequence-step";
  stepDiv.id = `movement-step-${axis}-axis-` + Math.random();

  // const header = document.createElement("h2");
  // header.textContent = `Step ${index + 1}: Move Selected Axes`;

  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
  deleteBtn.className = "icon-btn";
  deleteBtn.style.background = "#cc0000";
  
  deleteBtn.onclick = () => {
    sequence.splice(index, 1);
    stepDiv.remove();
    // renumberSteps();
    // renderTimeline();
  };

  const top = document.createElement("div");
  top.style.display = "flex";
  top.style.justifyContent = "space-between";
  top.append(deleteBtn);//top.append(header, deleteBtn);
  stepDiv.appendChild(top);

  const summary = document.createElement("div");
  summary.className = "summary-text";
  summary.textContent = "No triggers set yet.";

  function updateSummary() {
    const lines = [];
    for (const axis of AXES) {
      const config = stepData['data'];
      if (!config) continue;

      if (config.enabled() && config.getInitTriggers().length) {
        const triggers = config.getInitTriggers().map((t) => {
          if (t.triggerType.includes('(N)')) {
            return `${t.triggerType.replace('(N)', '')} ${t.comparator} ${t.value}N`
          }
          if (t.triggerType.includes('(sec)')){
            return `${t.triggerType.replace('(sec)', '')} ${t.comparator} ${t.value}sec`;
          }
          else if (t.triggerType.includes('(mm)')) {
            return `${t.triggerType.replace('(mm)', '')} ${t.comparator} ${t.value}mm`
          }
          else if (t.triggerType.includes('(count)')) {
            return `${t.triggerType.replace('(count)', '')} ${t.comparator} ${t.value}`
          }
        });
        let trigger_string =  triggers.join(config.getTriggersAllorOne() === 'True' ? " AND " : " OR ")
        lines.push(`Axis ${axis} starts moving if ${trigger_string}`);
      }

      if (config.enabled() && config.getTriggers().length) {
        const triggers = config.getTriggers().map((t) => {
          if (t.triggerType.includes('(N)')) {
            return `${t.triggerType.replace('(N)', '')} ${t.comparator} ${t.value}N`
          }
          if (t.triggerType.includes('(sec)')){
            return `${t.triggerType.replace('(sec)', '')} ${t.comparator} ${t.value}sec`;
          }
          else if (t.triggerType.includes('(mm)')) {
            return `${t.triggerType.replace('(mm)', '')} ${t.comparator} ${t.value}mm`
          } 
          else if (t.triggerType.includes('(count)')) {
            return `${t.triggerType.replace('(count)', '')} ${t.comparator} ${t.value}`
          } 
        });
        let trigger_string =  triggers.join(config.getTriggersAllorOne() === 'True' ? " AND " : " OR ")
        lines.push(`Axis ${axis} stops moving if ${trigger_string}`);
      }
      
      if (config.enabled() && config.getHoldTriggers().length){
        const holdTriggers = config.getHoldTriggers().map((t) => {
          if (t.triggerType.includes('(N)')) {
            return `${t.triggerType.replace('(N)', '')} ${t.comparator} ${t.value}N`
          }
          if (t.triggerType.includes('(sec)')){
            return `${t.triggerType.replace('(sec)', '')} ${t.comparator} ${t.value}sec`;
          }
          else if (t.triggerType.includes('(mm)')) {
            return `${t.triggerType.replace('(mm)', '')} ${t.comparator} ${t.value}mm`
          } 
        })
        let hold_trigger_string = holdTriggers.join(config.getHoldfireAllOrOneTriggers() === 'True' ? " AND " : " OR ")
        lines.push(`Axis ${axis} stops holding force along its direction if ${hold_trigger_string}`);
      }
    }
    summary.textContent = lines.length
      ? `This action ends when. \n- ${lines.join("\n- ")}`
      : "This action has no start/stop/hold triggers defined.";
    // update();
  }

  for (const axis of AXES) {
    const axisSection = document.createElement("div");
    axisSection.className = "axis-config";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;

    const header = document.createElement("div");
    header.className = "axis-header";

    const label = document.createElement("label");
    label.textContent = `Move Axis ${axis}`;

    const dirNeg = document.createElement("button");
    const dirPos = document.createElement("button");
    
    dirNeg.className = "dir-btn";
    dirPos.className = "dir-btn";
    if (axis === "Z") {
      dirNeg.innerHTML = `<i class="fas fa-arrow-down"></i>`;
      dirPos.innerHTML = `<i class="fas fa-arrow-up"></i>`;
    } else {
      dirNeg.innerHTML = `<i class="fas fa-arrow-left"></i>`;
      dirPos.innerHTML = `<i class="fas fa-arrow-right"></i>`;
    }

    let currentDir = "positive";
    dirPos.classList.add("active");

    dirNeg.onclick = () => {
      currentDir = "negative";
      dirNeg.classList.add("active");
      dirPos.classList.remove("active");
      updateSummary();
    };
    dirPos.onclick = () => {
      currentDir = "positive";
      dirPos.classList.add("active");
      dirNeg.classList.remove("active");
      updateSummary();
    };

    const step_size_label = document.createElement("span");
    step_size_label.textContent = "Pulse Frequency";
    step_size_label.onclick = () => {
      alert('Step Size indicates the granularity of movement. For Example: if step size is set to 10ms then movement will occur for 10ms, at the speed set manually in the CL57T controller. All triggers will be evaluated after each movement step.');
    }

    const step_size = document.createElement("input");
    step_size.type = "number";
    step_size.value = "1";
    step_size.style.width = "60px";
    step_size.addEventListener("input", updateSummary);

    const unit = document.createElement("span");
    unit.textContent = "ms";

    header.append(checkbox, label, dirNeg, dirPos, step_size_label ,step_size, unit);
    axisSection.appendChild(header);



    // (a or b) and (c or d)
    // a or (b and c) or d => no cant do maam!

    // ~~~~~~~~~~~~ MOVEMENT BREAKING TRIGGERS ~~~~~~~~~~~~

    let triggerAllOrOneCreated = false;
    const triggerAllOrOneParent = document.createElement("div");

    const triggerAllOrOneDropdownCreator = () => {

      if (triggerAllOrOneCreated === false) {
        let triggerAllOrOneDiv = '';
        triggerAllOrOneDiv = document.createElement('div');
        triggerAllOrOneDiv.style.width = '100%';


        const triggerAllOrOneDropdown = document.createElement('select');
        triggerAllOrOneDropdown.onchange = () => {updateSummary();}
        triggerAllOrOneDropdown.id = 'triggerAllOrOneDropdown';


        const o1 = document.createElement("option");
        o1.value = 'False'; o1.textContent = 'False'; o1.selected = true;
        triggerAllOrOneDropdown.appendChild(o1);

        const o2 = document.createElement("option");
        o2.value = 'True'; o2.textContent = 'True';
        triggerAllOrOneDropdown.appendChild(o2);


        // triggerAllOrOne.className = "force-small";
        // triggerAllOrOne.style.width = "60px";
        triggerAllOrOneDiv.append('Fire All Triggers = ', triggerAllOrOneDropdown);
        triggerAllOrOneParent.append(triggerAllOrOneDiv);
        triggerAllOrOneCreated = true;
      }
    }




    const triggerList = document.createElement("div");
    triggerList.className = "trigger-list";

    const addTrigger = document.createElement("button");
    addTrigger.className = "add-trigger-btn";
    addTrigger.textContent = "➕ Add Stop Condition / Trigger";

    const insertTrigger = () => {
      const row = document.createElement("div");
      row.id = `halt-trigger-${axis}-axis-` + Math.random();
      row.className = "trigger-item";

      const selectTrigger = document.createElement("select");
      selectTrigger.onchange = () => {updateSummary();}

      TRIGGER_TYPES.forEach(f => {
        const o = document.createElement("option");
        o.value = f;
        o.textContent = f;
        selectTrigger.appendChild(o);
      });

      const triggerComparator = document.createElement("select");
      triggerComparator.id = 'trigger-comparator';
      triggerComparator.onchange = () => {
        updateSummary();
      }

      COMPARATORS.forEach(c => {
        const op = document.createElement("option");
        op.value = c;
        op.textContent = c;
        triggerComparator.appendChild(op);
      });


      const input = document.createElement("input");
      input.type = "number";
      input.value = "1";
      input.max = "10";
      input.className = "force-small";
      input.style.width = "60px";
      input.addEventListener("input", updateSummary);
      
      // delete trigger condition
      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
      deleteBtn.className = "icon-btn-small";
      deleteBtn.style.background = "#cc0000";

      deleteBtn.onclick = () => {
        // find the row in triggerList and delete it
        for (let trigger of triggerList.children) {
          if (row.id === trigger.id){
            trigger.remove();
          }
        }
        // update trigger summary
        updateSummary();
      };
      
      row.append("Stop if ", selectTrigger, triggerComparator , input, " ", deleteBtn);
      triggerList.appendChild(row);
    };

    addTrigger.onclick = () => {
      triggerAllOrOneDropdownCreator();
      insertTrigger();
      updateSummary();
    };



    // ~~~~~~~~~~~~ MOVEMENT INITIATING TRIGGERS ~~~~~~~~~~~~
    const moveStartTriggerList = document.createElement("div")
    moveStartTriggerList.className = "trigger-list";

    const addMoveInitTriggerBtn = document.createElement('button');
    addMoveInitTriggerBtn.className = "add-trigger-btn";
    addMoveInitTriggerBtn.textContent = "Add Trigger which starts movement";


    let initTriggerAllOrOneCreated = false;
    const initTriggerAllOrOneParent = document.createElement("div");

    const initTriggerAllOrOneDropdownCreator = () => {

      if (initTriggerAllOrOneCreated === false) {
        let triggerAllOrOneDiv = '';
        triggerAllOrOneDiv = document.createElement('div');
        triggerAllOrOneDiv.style.width = '100%';


        const triggerAllOrOneDropdown = document.createElement('select');
        triggerAllOrOneDropdown.onchange = () => {updateSummary();}
        triggerAllOrOneDropdown.id = 'initTriggerAllOrOneDropdown';


        const o1 = document.createElement("option");
        o1.value = 'False'; o1.textContent = 'False'; o1.selected = true;
        triggerAllOrOneDropdown.appendChild(o1);

        const o2 = document.createElement("option");
        o2.value = 'True'; o2.textContent = 'True';
        triggerAllOrOneDropdown.appendChild(o2);


        triggerAllOrOneDiv.append('Fire All Triggers = ', triggerAllOrOneDropdown);
        initTriggerAllOrOneParent.append(triggerAllOrOneDiv);
        initTriggerAllOrOneCreated = true;
      }
    }

    const InsertInitTrigger = () => {
      const row = document.createElement("div");
      row.id = `init-trigger-${axis}-axis-` + Math.random();
      row.className = "trigger-item";

      const selectTrigger = document.createElement("select");
      selectTrigger.onchange = () => {updateSummary();}

      INIT_TRIGGER_TYPES.forEach(f => {
        const o = document.createElement("option");
        o.value = f;
        o.textContent = f;
        selectTrigger.appendChild(o);
      });

      const triggerComparator = document.createElement("select");
      triggerComparator.id = 'init-trigger-comparator';
      triggerComparator.onchange = () => {
        updateSummary();
      }

      COMPARATORS.forEach(c => {
        const op = document.createElement("option");
        op.value = c;
        op.textContent = c;
        triggerComparator.appendChild(op);
      });


      const input = document.createElement("input");
      input.type = "number";
      input.value = "1";
      input.max = "10";
      input.className = "force-small";
      input.style.width = "60px";
      input.addEventListener("input", updateSummary);

      // delete trigger condition
      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
      deleteBtn.className = "icon-btn-small";
      deleteBtn.style.background = "#cc0000";

      deleteBtn.onclick = () => {
        // find the row in triggerList and delete it
        for (let trigger of moveStartTriggerList.children) {
          if (row.id === trigger.id){
            trigger.remove();
          }
        }
        // update trigger summary
        updateSummary();
      };

      row.append("Move if ", selectTrigger, triggerComparator , input, " ", deleteBtn);
      moveStartTriggerList.appendChild(row);
    };


    addMoveInitTriggerBtn.onclick = () => {
      initTriggerAllOrOneDropdownCreator();
      InsertInitTrigger();
      updateSummary();
    };

    // ~~~~~~~~~~~~ MOVEMENT INITIATING TRIGGERS ~~~~~~~~~~~~



























    // ~~~~~~~~~~~~ HOLD BREAKING TRIGGERS ~~~~~~~~~~~~
    const holdTriggerList = document.createElement("div");
    holdTriggerList.className = "trigger-list";

    const addHoldState = document.createElement('button');
    addHoldState.className = "add-trigger-btn";
    addHoldState.textContent = "Hold Force";
    
    let holdingForceThresholdDivCreated = false;
    const holdingForceDivParent = document.createElement("div");

    const createHoldThresholdInput = () => {

      if (holdingForceThresholdDivCreated == false) {
        let holdingForceDiv = '';
        holdingForceDiv = document.createElement('div');
        holdingForceDiv.style.width = '100%';
        const threshold_input = document.createElement('input');
        threshold_input.id = 'holding_threshold'
        threshold_input.type = "number";
        threshold_input.value = "1";
        threshold_input.className = "force-small";
        threshold_input.style.width = "60px";
        threshold_input.addEventListener("input", updateSummary);
        holdingForceDiv.append('Hold F' + axis + ' (N) = ', threshold_input);


        const holdTriggerAllOrOneDropdown = document.createElement('select');
        holdTriggerAllOrOneDropdown.onchange = () => {updateSummary();}
        holdTriggerAllOrOneDropdown.id = 'holdTriggerAllOrOneDropdown';


        const o1 = document.createElement("option");
        o1.value = 'False'; o1.textContent = 'False'; o1.selected = true;
        holdTriggerAllOrOneDropdown.appendChild(o1);

        const o2 = document.createElement("option");
        o2.value = 'True'; o2.textContent = 'True';
        holdTriggerAllOrOneDropdown.appendChild(o2);


        holdingForceDiv.append('Fire All Hold Triggers: ', holdTriggerAllOrOneDropdown)
        holdingForceDivParent.append(holdingForceDiv);
        holdingForceThresholdDivCreated = true;

      }
    }

    const createHoldStateUI = () => {

      const row = document.createElement("div")
      row.id = `hold-state-${axis}-axis-` + Math.random();
      row.className = "trigger-item";

      const selectHoldTrigger = document.createElement('select');
      selectHoldTrigger.onchange = () => {
        updateSummary();
      }

      HOLD_TRIGGER_TYPES.forEach(t => {
        if (t.includes(`F${axis.toLowerCase()}`) === false){
          const o = document.createElement('option');
          o.value = t;
          o.textContent = t;
          selectHoldTrigger.appendChild(o);
        }
      });


      const holdTriggerComparator = document.createElement("select");
      holdTriggerComparator.id = 'hold-trigger-comparator';
      holdTriggerComparator.onchange = () => {
        updateSummary();
      }

      COMPARATORS.forEach(c => {
        const op = document.createElement("option");
        op.value = c;
        op.textContent = c;
        holdTriggerComparator.appendChild(op);
      });


      const input = document.createElement('input');
      input.type = "number";
      input.value = "1";
      input.className = "force-small";
      input.style.width = "60px";
      input.addEventListener("input", updateSummary);

      // delete hold condition
      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
      deleteBtn.className = "icon-btn-small";
      deleteBtn.style.background = "#cc0000";

      deleteBtn.onclick = () => {
        // find the row in the hold trigger conditions list and delete it
        for (let trigger of holdTriggerList.children){
          if (row.id === trigger.id)
            trigger.remove();
        }

        if (holdTriggerList.children.length == 0) {
          // delete holding force threshold div!
          holdingForceThresholdDivCreated = false
          document.getElementById('holding_threshold').parentElement.remove();
        }
        // update hold trigger summary
        updateSummary();
      }

      row.append("Stop Holding if : ", selectHoldTrigger, holdTriggerComparator, input, " ", deleteBtn);
      holdTriggerList.appendChild(row);
    };

    addHoldState.onclick = () => {
      createHoldThresholdInput();
      createHoldStateUI();
      updateSummary();
    }

    axisSection.append(initTriggerAllOrOneParent, moveStartTriggerList , addMoveInitTriggerBtn ,triggerAllOrOneParent, triggerList, addTrigger, holdingForceDivParent, holdTriggerList ,addHoldState);
    checkbox.onchange = () => {
      // commenting this out because we might want to move indefinitely and not stop on any trigger
      // if (checkbox.checked && triggerList.children.length === 0) {
      //   insertTrigger();
      // }
      updateSummary();
    };

    stepData['data'] = {
      enabled: () => checkbox.checked,
      getDirection: () => currentDir,
      getStepSize: () => Number(step_size.value),
      axis: axis,
      getInitTriggers: () => {
        return Array.from(moveStartTriggerList.children).map(row => {
          const s = row.querySelector("select");
          const i = row.querySelector("input");
          const c = row.querySelector("#init-trigger-comparator");
          return {
            triggerType: s?.value || "",
            value: parseFloat(i?.value || "0"),
            comparator: c?.value || '=='
          };
        });
      },
      getTriggers: () =>
        Array.from(triggerList.children).map(row => {
          const s = row.querySelector("select");
          const i = row.querySelector("input");
          const c = row.querySelector("#trigger-comparator");
          return {
            triggerType: s?.value || "",
            value: parseFloat(i?.value || "0"),
            comparator: c?.value || '=='

          };
        }),
      getHoldTriggers: () => {
        return Array.from(holdTriggerList.children).map(row => {
          const s = row.querySelector("select");
          const i = row.querySelector("input");
          const c = row.querySelector("#hold-trigger-comparator");
          return {
            triggerType: s?.value || "",
            value: parseFloat(i?.value || "0"),
            comparator: c?.value || '=='
          }
        });
      },
      getHoldThreshold: () => {
        let threshold = document.getElementById('holding_threshold');
        return threshold?.value || 'NaN'
      },
      getTriggersAllorOne: () => {
        let allOrOne = document.getElementById('triggerAllOrOneDropdown');
        return allOrOne?.value || "False";
      },
      getHoldfireAllOrOneTriggers: () => {
        let allOrOne = document.getElementById('holdTriggerAllOrOneDropdown');
        return allOrOne?.value || "False";
      },
      getInitfireAllOrOneTriggers: () => {
        let allOrOne = document.getElementById('initTriggerAllOrOneDropdown');
        return allOrOne?.value || "False";
      }
    };

    stepDiv.appendChild(axisSection);
  }


  stepDiv.appendChild(summary);


  stepData.export = () => {
    const out = { type: `move-${axis}-axis`, ['data']: {} };
      if (stepData['data'].enabled()) {
        out['data'] = {
          direction: stepData['data'].getDirection(),
          stepSize: stepData['data'].getStepSize(),
          triggers: stepData['data'].getTriggers(),
          moveInitTriggers: stepData['data'].getInitTriggers(),
          holdTriggers: stepData['data'].getHoldTriggers(),
          holdThreshold: stepData['data'].getHoldThreshold(),
          axis: stepData['data'].axis,
          fireAllTriggers: stepData['data'].getTriggersAllorOne(),
          fireAllHoldTriggers: stepData['data'].getHoldfireAllOrOneTriggers(),
          fireAllInitTriggers: stepData['data'].getInitfireAllOrOneTriggers(),
        };
      }
    return out;
  };

  sequence.push(stepData);
  return stepDiv;
}

// export function createHoldStep(index, update) {
//   const stepData = { type: "hold", getDuration: () => 1 };
//   const div = document.createElement("div");
//   div.className = "sequence-step";
//
//   const header = document.createElement("h2");
//   header.textContent = `Step ${index + 1}: Hold`;
//
//   const deleteBtn = document.createElement("button");
//   deleteBtn.className = "icon-btn";
//   deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
//   deleteBtn.style.backgroundColor = "#cc0000";
//   deleteBtn.onclick = () => {
//     sequence.splice(index, 1);
//     div.remove();
//     renumberSteps();
//     // renderTimeline();
//   };
//
//   const row = document.createElement("div");
//   row.style.display = "flex";
//   row.style.justifyContent = "space-between";
//   row.style.alignItems = "center";
//   row.appendChild(header);
//   row.appendChild(deleteBtn);
//   div.appendChild(row);
//
//   const label = document.createElement("label");
//   label.textContent = "Duration:";
//   const input = document.createElement("input");
//   input.type = "number";
//   input.value = "1";
//   input.min = "0";
//   input.style.width = "60px";
//   input.addEventListener("input", update);
//
//   const unit = document.createElement("span");
//   unit.textContent = " s";
//
//   div.append(label, input, unit);
//   stepData.getDuration = () => Number(input.value);
//   stepData.export = () => ({ type: "hold", duration: stepData.getDuration() });
//
//   sequence.push(stepData);
//   return div;
// }
