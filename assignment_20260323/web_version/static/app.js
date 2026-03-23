/**
 * app.js - Frontend for the Handwritten Digit Recognizer (Web Version)
 *
 * Handles:
 *   1. Mouse and touch drawing on the HTML5 canvas
 *   2. Sending the canvas image to POST /predict (Flask backend)
 *   3. Displaying the predicted digit, confidence, and a probability bar chart
 */

// ── Element References ────────────────────────────────────────────────────────

const drawCanvas  = document.getElementById("drawCanvas");
const chartCanvas = document.getElementById("chartCanvas");
const resultEl    = document.getElementById("result");
const predictBtn  = document.getElementById("predictBtn");
const clearBtn    = document.getElementById("clearBtn");

const ctx      = drawCanvas.getContext("2d");
const chartCtx = chartCanvas.getContext("2d");

// ── Canvas Initialization ─────────────────────────────────────────────────────

const BRUSH_RADIUS = 12;  // Brush size in pixels (matches desktop version)
let isDrawing = false;

// Fill the draw canvas with solid black on load
ctx.fillStyle = "#000000";
ctx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);

// Initialize chart background
chartCtx.fillStyle = "#f5f5f5";
chartCtx.fillRect(0, 0, chartCanvas.width, chartCanvas.height);

// ── Coordinate Helper ─────────────────────────────────────────────────────────

/**
 * Get canvas-relative pixel coordinates from a mouse or touch event.
 * Accounts for CSS scaling between the element size and canvas resolution.
 * @param {MouseEvent|TouchEvent} e
 * @returns {{ x: number, y: number }}
 */
function getPos(e) {
  const rect   = drawCanvas.getBoundingClientRect();
  const scaleX = drawCanvas.width  / rect.width;
  const scaleY = drawCanvas.height / rect.height;
  const src    = e.touches ? e.touches[0] : e;
  return {
    x: (src.clientX - rect.left) * scaleX,
    y: (src.clientY - rect.top)  * scaleY,
  };
}

// ── Drawing ───────────────────────────────────────────────────────────────────

/**
 * Paint a white filled circle at (x, y).
 * @param {number} x
 * @param {number} y
 */
function paintDot(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
}

// Mouse events
drawCanvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  const { x, y } = getPos(e);
  paintDot(x, y);
});

drawCanvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;
  const { x, y } = getPos(e);
  paintDot(x, y);
});

drawCanvas.addEventListener("mouseup", () => {
  if (!isDrawing) return;
  isDrawing = false;
  sendPrediction();   // Auto-predict on stroke end
});

drawCanvas.addEventListener("mouseleave", () => {
  if (!isDrawing) return;
  isDrawing = false;
  sendPrediction();
});

// Touch events (mobile support)
drawCanvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  isDrawing = true;
  const { x, y } = getPos(e);
  paintDot(x, y);
}, { passive: false });

drawCanvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (!isDrawing) return;
  const { x, y } = getPos(e);
  paintDot(x, y);
}, { passive: false });

drawCanvas.addEventListener("touchend", () => {
  isDrawing = false;
  sendPrediction();
});

// ── Prediction ────────────────────────────────────────────────────────────────

/**
 * Read the canvas pixels directly as a 28x28 grayscale array and POST to /predict.
 * This bypasses all PNG encoding/decoding and sends raw pixel values (0-1).
 */
async function sendPrediction() {
  // Export the 280×280 canvas as a PNG data URL and let the server resize
  // with PIL LANCZOS — the same method used when the model was trained.
  const image = drawCanvas.toDataURL("image/png");

  try {
    const res  = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image }),
    });
    const data = await res.json();

    if (!res.ok) {
      resultEl.textContent = `Prediction: (${data.error ?? "error"})`;
      return;
    }

    resultEl.textContent =
      `Prediction:  ${data.digit}   (${data.confidence.toFixed(1)}% confidence)`;
    drawChart(data.probabilities, data.digit);

  } catch (err) {
    resultEl.textContent = "Prediction: connection error";
    console.error("Fetch failed:", err);
  }
}

// Manual predict button
predictBtn.addEventListener("click", sendPrediction);

// ── Bar Chart ─────────────────────────────────────────────────────────────────

/**
 * Draw a probability bar chart for all 10 digit classes.
 * The winning digit is highlighted in green; others are blue.
 *
 * @param {number[]} probs     Array of 10 probability values (0-1).
 * @param {number}   topDigit  Index of the predicted digit.
 */
function drawChart(probs, topDigit) {
  const W = chartCanvas.width;
  const H = chartCanvas.height;

  chartCtx.clearRect(0, 0, W, H);
  chartCtx.fillStyle = "#f5f5f5";
  chartCtx.fillRect(0, 0, W, H);

  const barW    = W / 10;
  const maxBarH = H - 30;   // Reserve 30 px for digit labels at the bottom

  probs.forEach((prob, digit) => {
    const x0    = digit * barW + 3;
    const barH  = prob * maxBarH;
    const y0    = H - 20 - barH;
    const color = digit === topDigit ? "#4CAF50" : "#2196F3";

    chartCtx.fillStyle = color;
    chartCtx.beginPath();
    // roundRect may not be available in older browsers; fall back to fillRect
    if (chartCtx.roundRect) {
      chartCtx.roundRect(x0, y0, barW - 6, barH, 3);
    } else {
      chartCtx.rect(x0, y0, barW - 6, barH);
    }
    chartCtx.fill();

    // Digit label
    chartCtx.fillStyle  = "#333333";
    chartCtx.font       = "bold 11px Helvetica, Arial, sans-serif";
    chartCtx.textAlign  = "center";
    chartCtx.fillText(String(digit), x0 + (barW - 6) / 2, H - 6);
  });
}

// ── Clear ─────────────────────────────────────────────────────────────────────

clearBtn.addEventListener("click", () => {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);

  resultEl.textContent = "Prediction: -";

  chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
  chartCtx.fillStyle = "#f5f5f5";
  chartCtx.fillRect(0, 0, chartCanvas.width, chartCanvas.height);
});
