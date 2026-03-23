# Desktop Version — Handwritten Digit Recognizer

> Inherits all shared conventions from the root `../CLAUDE.md`.
> This file adds desktop-specific context only.

## Purpose
A fully offline Tkinter desktop app. The user draws on a canvas with the mouse;
the app predicts the digit in real time after each stroke.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| GUI | Python 3, Tkinter (stdlib — no extra install needed) |
| Image capture | Pillow (PIL) — hidden grayscale buffer synced with the canvas |
| ML Model | TensorFlow/Keras (loaded from `../mnist_model.keras`) |

## Module Responsibilities
| Module | Responsibility |
|--------|---------------|
| `main.py` | Entry point — resolves model path, calls `load_or_train`, opens Tk window |
| `model/train.py` | `build_model()`, `train_and_save()`, `load_or_train()` |
| `utils/preprocess.py` | `preprocess_canvas()` — PIL image → (1,28,28,1) numpy array |
| `gui/app.py` | `DigitRecognizerApp` Tkinter class — all UI and event handling |

## GUI Behaviour
- Canvas: 280×280 px black background, white brush (radius 12 px).
- Prediction fires automatically on every `<ButtonRelease-1>` event.
- Probability bar chart is redrawn after every prediction.
- "Clear" resets both the visible Tk canvas and the hidden PIL buffer.

## Key Implementation Notes
- The PIL image buffer is kept **in sync** with the Tk canvas pixel-for-pixel.
  Both are drawn to simultaneously in `_on_draw()`.
- `preprocess_canvas()` uses LANCZOS downscaling for best 28×28 quality.
- The model is loaded once in `main()` and passed into `DigitRecognizerApp`.
- Blank-canvas guard: if `input_arr.max() < 0.05`, prediction is skipped.
- This version runs **fully offline** — no network calls.

## How to Run
```bash
pip install tensorflow pillow numpy
python main.py
```
