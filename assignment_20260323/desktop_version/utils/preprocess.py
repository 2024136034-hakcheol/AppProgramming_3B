"""
utils/preprocess.py
Converts a Tkinter canvas PIL image into a numpy array for model inference.
"""

import numpy as np
from PIL import Image

IMG_SIZE = 28   # Target size expected by the MNIST CNN model


def preprocess_canvas(pil_image: Image.Image) -> np.ndarray:
    """
    Resize a grayscale canvas image to 28x28 and normalize pixel values to [0, 1].

    The canvas stores a white digit on a black background, which already matches
    the MNIST format (no inversion required).

    Args:
        pil_image: Grayscale (mode "L") PIL image from the drawing canvas.

    Returns:
        numpy array of shape (1, 28, 28, 1), dtype float32, values in [0, 1].
        Ready to be passed directly to model.predict().
    """
    # Downscale with LANCZOS for best quality at 28x28
    img_small = pil_image.resize((IMG_SIZE, IMG_SIZE), Image.LANCZOS)

    # Normalize and add batch + channel dimensions
    arr = np.array(img_small, dtype="float32") / 255.0
    return arr[np.newaxis, ..., np.newaxis]   # (1, 28, 28, 1)
