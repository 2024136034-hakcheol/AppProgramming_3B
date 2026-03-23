"""
model/train.py
CNN architecture definition, MNIST training pipeline, and model persistence.
"""

import os
import numpy as np
from tensorflow import keras

IMG_SIZE = 28   # MNIST image dimensions


def build_model() -> keras.Model:
    """
    Build a CNN for 10-class MNIST digit classification.

    Architecture:
        Input(28, 28, 1)
        -> Conv2D(32, 3x3, relu) -> MaxPool(2x2)
        -> Conv2D(64, 3x3, relu) -> MaxPool(2x2)
        -> Flatten
        -> Dense(128, relu) -> Dropout(0.3)
        -> Dense(10, softmax)
    """
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


def train_and_save(model_path: str) -> keras.Model:
    """
    Download MNIST, train the CNN for 5 epochs, evaluate, and save the model.

    Args:
        model_path: Destination path for the saved .keras file.

    Returns:
        The trained Keras model.
    """
    print("Loading MNIST dataset...")
    (x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()

    # Normalize pixel values to [0, 1] and add channel dimension
    x_train = x_train.astype("float32") / 255.0
    x_test  = x_test.astype("float32")  / 255.0
    x_train = x_train[..., np.newaxis]  # (60000, 28, 28, 1)
    x_test  = x_test[..., np.newaxis]   # (10000, 28, 28, 1)

    model = build_model()
    model.summary()

    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    print("\nTraining the model (5 epochs)...")
    model.fit(
        x_train, y_train,
        epochs=5,
        batch_size=128,
        validation_split=0.1,
        verbose=1,
    )

    _, test_acc = model.evaluate(x_test, y_test, verbose=0)
    print(f"\nTest accuracy: {test_acc * 100:.2f}%")

    model.save(model_path)
    print(f"Model saved to '{model_path}'")
    return model


def load_or_train(model_path: str) -> keras.Model:
    """
    Return a trained model: load from disk if available, else train fresh.

    Args:
        model_path: Path to the .keras model file.

    Returns:
        A ready-to-use Keras model.
    """
    if os.path.exists(model_path):
        print(f"Loading saved model from '{model_path}'...")
        return keras.models.load_model(model_path)
    return train_and_save(model_path)
