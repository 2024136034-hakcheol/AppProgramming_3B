"""
gui/app.py
Tkinter GUI application class for the handwritten digit recognizer.
"""

import tkinter as tk
from tkinter import font as tkfont

import numpy as np
from PIL import Image, ImageDraw
from tensorflow import keras

from utils.preprocess import preprocess_canvas

CANVAS_SIZE  = 280   # Drawing canvas size in pixels (10x the 28px MNIST image)
BRUSH_RADIUS = 12    # Brush radius in pixels


class DigitRecognizerApp:
    """
    Full Tkinter window for drawing and recognizing handwritten digits.

    Layout (top to bottom):
        Title label
        Drawing canvas  (280x280 px, black background)
        Prediction result label
        Probability bar chart  (one bar per digit 0-9)
        [Predict] [Clear] buttons
    """

    def __init__(self, root: tk.Tk, model: keras.Model) -> None:
        self.root  = root
        self.model = model

        self.root.title("Handwritten Digit Recognizer - Desktop (MNIST)")
        self.root.resizable(False, False)

        # Hidden PIL grayscale buffer kept in sync with the Tk canvas for inference
        self.pil_image = Image.new("L", (CANVAS_SIZE, CANVAS_SIZE), color=0)
        self.draw      = ImageDraw.Draw(self.pil_image)

        self._build_ui()

    # ── UI Construction ───────────────────────────────────────────────────────

    def _build_ui(self) -> None:
        """Create and arrange all Tkinter widgets."""
        title_font = tkfont.Font(family="Helvetica", size=14, weight="bold")
        label_font = tkfont.Font(family="Helvetica", size=12)
        btn_font   = tkfont.Font(family="Helvetica", size=11)

        tk.Label(
            self.root,
            text="Draw a digit (0-9) below",
            font=title_font, pady=8,
        ).pack()

        # Drawing canvas
        self.canvas = tk.Canvas(
            self.root,
            width=CANVAS_SIZE, height=CANVAS_SIZE,
            bg="black", cursor="crosshair",
        )
        self.canvas.pack(padx=16, pady=(0, 8))
        self.canvas.bind("<B1-Motion>",      self._on_draw)
        self.canvas.bind("<ButtonRelease-1>", self._on_release)

        # Prediction label
        self.result_var = tk.StringVar(value="Prediction: -")
        tk.Label(
            self.root,
            textvariable=self.result_var,
            font=label_font, pady=4,
        ).pack()

        # Probability bar chart canvas
        self.bar_canvas = tk.Canvas(
            self.root, width=CANVAS_SIZE, height=120, bg="white",
        )
        self.bar_canvas.pack(padx=16, pady=(0, 8))

        # Buttons
        btn_frame = tk.Frame(self.root)
        btn_frame.pack(pady=(0, 12))

        tk.Button(
            btn_frame, text="Predict", font=btn_font,
            width=10, bg="#4CAF50", fg="white",
            command=self._predict,
        ).grid(row=0, column=0, padx=8)

        tk.Button(
            btn_frame, text="Clear", font=btn_font,
            width=10, bg="#F44336", fg="white",
            command=self._clear,
        ).grid(row=0, column=1, padx=8)

    # ── Drawing ───────────────────────────────────────────────────────────────

    def _on_draw(self, event: tk.Event) -> None:
        """Paint a white circle on both the visible Tk canvas and the PIL buffer."""
        x, y, r = event.x, event.y, BRUSH_RADIUS
        self.canvas.create_oval(x - r, y - r, x + r, y + r, fill="white", outline="white")
        self.draw.ellipse([x - r, y - r, x + r, y + r], fill=255)

    def _on_release(self, _event: tk.Event) -> None:
        """Auto-predict after every stroke for real-time feedback."""
        self._predict()

    # ── Prediction ────────────────────────────────────────────────────────────

    def _predict(self) -> None:
        """Run inference on the canvas content and update the result display."""
        input_arr = preprocess_canvas(self.pil_image)

        # Skip prediction if the canvas is essentially blank
        if input_arr.max() < 0.05:
            self.result_var.set("Prediction: (draw a digit first)")
            return

        probs      = self.model.predict(input_arr, verbose=0)[0]  # shape (10,)
        digit      = int(np.argmax(probs))
        confidence = float(probs[digit]) * 100

        self.result_var.set(f"Prediction:  {digit}   ({confidence:.1f}% confidence)")
        self._draw_bars(probs)

    def _draw_bars(self, probs: np.ndarray) -> None:
        """Render per-class probability bars (0-9) on the bar chart canvas."""
        self.bar_canvas.delete("all")

        bar_w     = CANVAS_SIZE / 10
        max_bar_h = 90    # Reserve 30 px for digit labels
        top_digit = int(np.argmax(probs))

        for digit, prob in enumerate(probs):
            x0    = digit * bar_w + 4
            x1    = (digit + 1) * bar_w - 4
            bar_h = prob * max_bar_h
            color = "#4CAF50" if digit == top_digit else "#2196F3"

            self.bar_canvas.create_rectangle(
                x0, 120 - 20 - bar_h, x1, 120 - 20,
                fill=color, outline="",
            )
            self.bar_canvas.create_text(
                (x0 + x1) / 2, 110,
                text=str(digit), font=("Helvetica", 9),
            )

    # ── Clear ─────────────────────────────────────────────────────────────────

    def _clear(self) -> None:
        """Reset the visible canvas and the hidden PIL buffer to solid black."""
        self.canvas.delete("all")
        self.draw.rectangle([0, 0, CANVAS_SIZE, CANVAS_SIZE], fill=0)
        self.result_var.set("Prediction: -")
        self.bar_canvas.delete("all")
