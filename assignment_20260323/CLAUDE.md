# Handwritten Digit Recognizer — Assignment Submission

## Assignment
Extend the handwritten digit recognition program to a web version using Claude Code.

## Project Overview
A full-stack handwritten digit recognition system built with Python and TensorFlow.
The shared CNN model (trained on MNIST, ~99% accuracy) is used by both versions.

## CLAUDE.md Hierarchy
This project uses a three-level CLAUDE.md structure:

```
assignment_submission/          ← ROOT: shared conventions, model, overall architecture
├── CLAUDE.md                   (this file)
├── mnist_model.keras           ← shared trained model (auto-generated on first run)
├── web_version/
│   └── CLAUDE.md               ← WEB: Flask server, REST API, HTML5 Canvas specifics
└── desktop_version/
    └── CLAUDE.md               ← DESKTOP: Tkinter GUI, offline operation specifics
```

Each sub-CLAUDE.md inherits the conventions defined here and adds version-specific detail.
When working inside web_version/ or desktop_version/, Claude reads both the root and
the subfolder CLAUDE.md to understand the full context.

## Shared Conventions (apply to all sub-projects)
- **Language**: All code and comments must be written in English.
- **Model**: The shared `mnist_model.keras` lives at the assignment root.
  Both versions resolve it with `os.path.join(__file__, "..", "mnist_model.keras")`.
  It is auto-trained on first run if the file does not exist.
- **Image format**: 280×280 px canvas → resized to 28×28 → normalized to [0, 1].
  White digit on black background (matching MNIST conventions).
- **Dependencies**: `tensorflow`, `pillow`, `numpy` are common to both versions.
  `flask` is additionally required for the web version.

## Model Details
| Item | Value |
|------|-------|
| Architecture | Conv2D(32) → MaxPool → Conv2D(64) → MaxPool → Dense(128, Dropout 0.3) → Dense(10) |
| Dataset | MNIST (60,000 train / 10,000 test) |
| Optimizer | Adam |
| Loss | sparse_categorical_crossentropy |
| Epochs | 5 |
| Test Accuracy | ~99% |

## Folder Structure
```
assignment_submission/
├── CLAUDE.md                        ← root context (this file)
├── mnist_model.keras                ← shared trained model
│
├── web_version/
│   ├── CLAUDE.md                    ← web-specific context
│   ├── app.py                       ← Flask server + /predict endpoint
│   ├── requirements.txt
│   └── static/
│       ├── index.html               ← HTML5 Canvas UI
│       ├── style.css
│       └── app.js                   ← drawing logic + fetch to /predict
│
└── desktop_version/
    ├── CLAUDE.md                    ← desktop-specific context
    ├── main.py                      ← entry point
    ├── model/train.py               ← CNN definition + training
    ├── utils/preprocess.py          ← image preprocessing
    └── gui/app.py                   ← Tkinter application class
```

## How to Run

### Web version
```bash
cd web_version
pip install flask tensorflow pillow numpy
python app.py
# Open http://localhost:5000
```

### Desktop version
```bash
cd desktop_version
pip install tensorflow pillow numpy
python main.py
```
