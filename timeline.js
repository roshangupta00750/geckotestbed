import { sequence } from './utils.js';

export function renderTimeline() {
  return;
  
  const timeline = document.getElementById("timeline-view");
  timeline.innerHTML = "";

  sequence.forEach((step, i) => {
    const block = document.createElement("div");
    block.className = "timeline-item";

    if (step.type === "hold") {
      block.innerHTML = `<strong>Hold</strong><br>${step.getDuration()} s`;
    } else if (step.type === "move-multiple-axes") {
      const axes = step.export().axes;
      const details = Object.entries(axes).map(([axis, cfg]) => {
        const arrow =
          axis === "Z"
            ? cfg.direction === "positive" ? "↓" : "↑"
            : cfg.direction === "positive" ? "→" : "←";
        return `${axis}${arrow} @ ${cfg.speed} mm/s`;
      });

      block.innerHTML = `<strong>Move</strong><br>${details.join("<br>")}`;
    }

    timeline.appendChild(block);

    if (i < sequence.length - 1) {
      const arrow = document.createElement("div");
      arrow.className = "timeline-arrow";
      arrow.innerHTML = `<i class="fas fa-arrow-down"></i>`;
      timeline.appendChild(arrow);
    }
  });
}
