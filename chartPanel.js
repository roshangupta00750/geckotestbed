let chart = null;
let startTime = null;
let collecting = false;

export function initChartPanel() {
  const container = document.getElementById("chart-panel");
  if (!container) return;

  container.innerHTML = `
    <div id="chart-stack" style="
      display: flex;
      flex-direction: column;
      gap: 0.5em;
      padding: 0.5em;
      overflow-y: auto;
      max-height: 100%;
    "></div>
  `;
}

export function startPlotting() {
  startTime = Date.now();
  collecting = true;

  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 200;
  const ctx = canvas.getContext("2d");

  const chartStack = document.getElementById("chart-stack");
  chartStack.prepend(canvas); // add newest chart on top

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: 'Fz (N)',
        data: [],
        borderColor: '#2196F3',
        tension: 0.2,
        fill: false,
        pointRadius: 0
      }]
    },
    options: {
      responsive: false,
      animation: false,
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: 'Time (s)' },
          ticks: { stepSize: 1 }
        },
        y: {
          title: { display: true, text: 'Fz (N)' },
          min: -10,
          max: 20,
          ticks: { stepSize: 5 }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

export function stopPlotting() {
  collecting = false;
}

export function pushForce(fz) {
  if (!collecting || !chart) return;
  const t = (Date.now() - startTime) / 1000;
  chart.data.datasets[0].data.push({ x: t, y: fz });
  chart.update('none');
}
