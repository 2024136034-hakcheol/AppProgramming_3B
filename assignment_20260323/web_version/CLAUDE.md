# Web Version — Handwritten Digit Recognizer

> Inherits all shared conventions from the root `../CLAUDE.md`.
> This file adds web-specific context only.

## Purpose
A browser-based digit recognizer. The user draws on an HTML5 canvas; the image is
sent to a Flask REST endpoint, which runs the shared CNN model and returns a prediction.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Backend | Python 3, Flask |
| ML Model | TensorFlow/Keras (loaded from `../mnist_model.keras`) |
| Image decode | Pillow — base64 PNG → grayscale ("L") → 28×28 |
| Frontend | Vanilla HTML5 / CSS3 / JavaScript (no frameworks) |
| Canvas API | HTML5 Canvas (280×280 px) |

## File Responsibilities
| File | Responsibility |
|------|---------------|
| `app.py` | Flask app — serves static files, exposes `POST /predict` |
| `static/index.html` | Single-page UI: canvas, result label, bar chart, buttons |
| `static/style.css` | Dark gradient card layout, responsive button styles |
| `static/app.js` | Mouse/touch drawing, fetch to `/predict`, bar chart rendering |
| `requirements.txt` | Python dependency list |

## API Contract
```
POST /predict
Content-Type: application/json

Request:  { "image": "<base64 PNG data URL>" }

Response 200:
  {
    "digit":         7,
    "confidence":    98.5,
    "probabilities": [0.001, 0.002, ..., 0.985, ...]   // 10 values
  }

Response 422:
  { "error": "Canvas appears to be blank" }
  { "error": "Image decoding failed: ..." }
```

## Image Pre-processing (server side, app.py)
1. Strip `data:image/png;base64,` header from the data URL.
2. Base64-decode → PIL grayscale image ("L" mode).
   Background is black (0), strokes are white (255) — matches MNIST format.
3. Resize to 28×28 with LANCZOS.
5. Normalize to [0, 1] → shape (1, 28, 28, 1) for `model.predict()`.

## Key Implementation Notes
- The model is loaded **once at server startup** — not per request — for performance.
- If `../mnist_model.keras` is missing, the server trains the model before starting.
- CORS is not needed because the frontend is served by the same Flask process.
- `touch-action: none` in CSS prevents page scroll while drawing on mobile.
- `roundRect` is used in the JS bar chart for a polished look.

## How to Run
```bash
pip install flask tensorflow pillow numpy
python app.py
# Visit http://localhost:5000
```
