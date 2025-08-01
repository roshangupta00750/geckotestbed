// utils.js
export const sequence = [];

export function renumberSteps() {
  document.querySelectorAll(".sequence-step").forEach((step, index) => {
    const h2 = step.querySelector("h2");
    if (h2) {
      h2.textContent = h2.textContent.includes("Hold")
        ? `Step ${index + 1}: Hold`
        : `Step ${index + 1}: Move Selected Axes`;
    }
  });
};

export function categorizeMovementSteps(steps) {

  const categorizedSteps = {X: [], Y: [], Z: []};

  for (let step of steps){ 
    switch (step.type) {
      case 'move-X-axis':
        categorizedSteps.X.push(step);
        break
      case 'move-Y-axis':
        categorizedSteps.Y.push(step);
        break
      case 'move-Z-axis':
        categorizedSteps.Z.push(step);
        break
    } 
  }
  return categorizedSteps;
}