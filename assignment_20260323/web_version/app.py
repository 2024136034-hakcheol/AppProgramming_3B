"""
app.py - Web Version: Handwritten Digit Recognizer
Flask server that serves the frontend and exposes a /predict REST endpoint.

Run:
    python app.py
    Open http://localhost:5000 in a browser.
"""

import base64
import io
import os

import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from PIL import Image
from tensorflow import keras

# ── Configuration ─────────────────────────────────────────────────────────────

# Use the main project's verified model (99.09% accuracy, no race-condition risk)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "mnist_model.keras")
IMG_SIZE   = 28
HOST       = "0.0.0.0"
PORT       = 5000

# ── Model: load or train ──────────────────────────────────────────────────────

def build_model() -> keras.Model:
    """Build the same CNN architecture used by the desktop version."""
    return keras.Sequential([
        keras.layers.Input(shape=(IMG_SIZE, IMG_SIZE, 1)),
        keras.layers.Conv2D(32, (3, 3), activation="relu"),
        keras.layers.MaxPooling2D((2, 2)),
        keras.layers.Conv2D(64, (3, 3), activation="relu"),
        keras.layers.MaxPooling2D((2, 2)),
        keras.layers.Flatten(),
        keras.layers.Dense(128, activation="relu"),
        keras.layers.Dropout(0.3),
        keras.layers.Dense(10, activation="softmax"),
    ], name="mnist_cnn")


def train_and_save(path: str) -> keras.Model:
    """Train the CNN on MNIST and save to path."""
    import numpy as np
    print("Training model on MNIST dataset (first run only)...")
    (x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()

    x_train = x_train.astype("float32") / 255.0
    x_test  = x_test.astype("float32")  / 255.0
    x_train = x_train[..., np.newaxis]
    x_test  = x_test[..., np.newaxis]

    model = build_model()
    model.compile(optimizer="adam",
                  loss="sparse_categorical_crossentropy",
                  metrics=["accuracy"])
    model.fit(x_train, y_train, epochs=5, batch_size=128,
              validation_split=0.1, verbose=1)

    _, acc = model.evaluate(x_test, y_test, verbose=0)
    print(f"Test accuracy: {acc * 100:.2f}%")
    model.save(path)
    print(f"Model saved to '{path}'")
    return model


def load_or_train(path: str) -> keras.Model:
    """Load an existing model or train a fresh one."""
    if os.path.exists(path):
        print(f"Loading model from '{path}'...")
        return keras.models.load_model(path)
    return train_and_save(path)


# ── Flask App ─────────────────────────────────────────────────────────────────

app = Flask(__name__, static_folder="static", static_url_path="")

print("=== Handwritten Digit Recognizer - Web Version ===")
model: keras.Model = load_or_train(MODEL_PATH)
print("Server ready.")

# ── Image Pre-processing ──────────────────────────────────────────────────────

def preprocess_image(data_url: str) -> np.ndarray:
    """
    Convert a base64 PNG data URL into model input using PIL LANCZOS resize.
    This matches the preprocessing used during model training.

    Args:
        data_url: "data:image/png;base64,<...>" string from canvas.toDataURL().

    Returns:
        numpy array of shape (1, 28, 28, 1), dtype float32, values in [0, 1].
    """
    if "," in data_url:
        data_url = data_url.split(",", 1)[1]
    img = Image.open(io.BytesIO(base64.b64decode(data_url))).convert("L")
    img = img.resize((IMG_SIZE, IMG_SIZE), Image.LANCZOS)
    arr = np.array(img, dtype="float32") / 255.0
    return arr[np.newaxis, ..., np.newaxis]  # (1, 28, 28, 1)

# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    """Serve the main HTML page."""
    return send_from_directory("static", "index.html")


@app.route("/predict", methods=["POST"])
def predict():
    """
    Accept a JSON body { "image": "<data URL>" } and return a prediction.

    Response 200: { "digit": int, "confidence": float, "probabilities": list[float] }
    Response 422: { "error": str }
    """
    data = request.get_json(force=True)
    if not data or "image" not in data:
        return jsonify({"error": "Missing 'image' field"}), 400

    try:
        input_arr = preprocess_image(data["image"])
    except Exception as exc:
        return jsonify({"error": f"Image processing failed: {exc}"}), 422

    if input_arr.max() < 0.05:
        return jsonify({"error": "Canvas appears to be blank"}), 422

    px_max    = float(input_arr.max())
    px_mean   = float(input_arr.mean())
    nonzero   = int(np.count_nonzero(input_arr > 0.05))

    probs      = model.predict(input_arr, verbose=0)[0].tolist()
    digit      = int(np.argmax(probs))
    confidence = round(probs[digit] * 100, 2)

    print(f"[DEBUG] px_max={px_max:.3f} px_mean={px_mean:.3f} nonzero={nonzero}/784 -> digit={digit} conf={confidence}%")

    return jsonify({
        "digit":         digit,
        "confidence":    confidence,
        "probabilities": probs,
        "debug":         {"px_max": px_max, "px_mean": px_mean, "nonzero": nonzero},
    })


# ── Entry Point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(host=HOST, port=PORT, debug=False)
