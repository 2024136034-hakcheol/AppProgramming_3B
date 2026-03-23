"""
main.py - Desktop Version Entry Point
Handwritten Digit Recognizer (MNIST / TensorFlow / Tkinter)

Run:
    python main.py

On first run the model is trained on MNIST (~5 epochs) and saved to
../mnist_model.keras (shared with the web version).
Subsequent runs load the saved model instantly without retraining.
"""

import sys
import os
import tkinter as tk

# Add this folder to sys.path so that model/, utils/, gui/ can be imported
sys.path.insert(0, os.path.dirname(__file__))

from model.train import load_or_train
from gui.app import DigitRecognizerApp

# Shared model path: assignment_submission/mnist_model.keras
MODEL_PATH = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "..", "mnist_model.keras")
)


def main() -> None:
    print("=== Handwritten Digit Recognizer - Desktop Version ===")

    model = load_or_train(MODEL_PATH)

    root = tk.Tk()
    DigitRecognizerApp(root, model)
    root.mainloop()


if __name__ == "__main__":
    main()
