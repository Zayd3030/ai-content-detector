import os
import io
import joblib
import numpy as np
import cv2
from PIL import Image
from typing import Dict, Any

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
BIN_PATH = os.path.join(MODELS_DIR, "ai_vs_human_image.pkl")
ATTR_PATH = os.path.join(MODELS_DIR, "source_attrib_image.pkl")

AI_THRESHOLD = 0.70
ATTR_THRESHOLD = 0.60

FEATURE_KEYS = [
    "w", "h",
    "mean_r", "mean_g", "mean_b",
    "std_r", "std_g", "std_b",
    "sat_mean", "sat_std",
    "edge_ratio",
    "lap_var",
    "hf_ratio"
]

def _load(path: str):
    return joblib.load(path) if os.path.exists(path) else None

_bin = _load(BIN_PATH)
_attr = _load(ATTR_PATH)

def _clamp01(x: float) -> float:
    return max(0.0, min(1.0, float(x)))

def extract_image_features(pil_img: Image.Image) -> Dict[str, float]:
    img = pil_img.convert("RGB")
    arr = np.array(img)  # H,W,3
    h, w = arr.shape[:2]

    rgb = arr.astype(np.float32) / 255.0
    mean = rgb.mean(axis=(0,1))
    std = rgb.std(axis=(0,1))

    # HSV saturation stats
    hsv = cv2.cvtColor((arr).astype(np.uint8), cv2.COLOR_RGB2HSV)
    sat = hsv[:,:,1].astype(np.float32) / 255.0
    sat_mean = float(sat.mean())
    sat_std = float(sat.std())

    # Edge density (Canny)
    gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    edge_ratio = float((edges > 0).mean())

    # Sharpness (Laplacian variance)
    lap = cv2.Laplacian(gray, cv2.CV_64F)
    lap_var = float(lap.var())

    # High-frequency ratio via FFT
    f = np.fft.fft2(gray.astype(np.float32))
    fshift = np.fft.fftshift(f)
    mag = np.log1p(np.abs(fshift))

    cy, cx = mag.shape[0] // 2, mag.shape[1] // 2
    r = min(cy, cx)
    # low freq circle radius
    low_r = int(0.15 * r)
    Y, X = np.ogrid[:mag.shape[0], :mag.shape[1]]
    dist = np.sqrt((Y - cy) ** 2 + (X - cx) ** 2)
    low_mask = dist <= low_r
    high_mask = dist >= int(0.45 * r)

    low_energy = float(mag[low_mask].mean())
    high_energy = float(mag[high_mask].mean())
    hf_ratio = float(high_energy / (low_energy + 1e-6))

    return {
        "w": float(w),
        "h": float(h),
        "mean_r": float(mean[0]), "mean_g": float(mean[1]), "mean_b": float(mean[2]),
        "std_r": float(std[0]), "std_g": float(std[1]), "std_b": float(std[2]),
        "sat_mean": sat_mean,
        "sat_std": sat_std,
        "edge_ratio": edge_ratio,
        "lap_var": lap_var,
        "hf_ratio": hf_ratio
    }

def detect_image(file_storage) -> Dict[str, Any]:
    raw = file_storage.read()
    pil_img = Image.open(io.BytesIO(raw))

    signals = extract_image_features(pil_img)
    X = [[signals[k] for k in FEATURE_KEYS]]

    # fallback if not trained
    if _bin is None:
        return {
            "label": "Unknown",
            "confidence": 0.0,
            "predicted_source": "Unknown",
            "source_probs": {},
            "signals": signals,
            "explanation": [
                "Image model not trained yet.",
                "Add datasets then run: python -m services.train_image_models",
                "Signals returned for evaluation/debug."
            ],
            "model": "feature+ml"
        }

    clf = _bin["model"]
    proba = clf.predict_proba(X)[0]
    classes = list(clf.classes_)  # ["AI","HUMAN"] order may vary
    prob_map = {classes[i]: float(proba[i]) for i in range(len(classes))}

    ai_prob = prob_map.get("AI", 0.0)
    human_prob = prob_map.get("HUMAN", 0.0)
    label = "AI-generated" if ai_prob >= 0.5 else "Human-made"
    confidence = float(max(ai_prob, human_prob))

    predicted_source = "Unknown"
    source_probs = {}

    if ai_prob >= AI_THRESHOLD and _attr is not None:
        a_clf = _attr["model"]
        a_proba = a_clf.predict_proba(X)[0]
        a_classes = list(a_clf.classes_)
        source_probs = {a_classes[i]: float(a_proba[i]) for i in range(len(a_classes))}
        best = max(source_probs, key=source_probs.get)
        if source_probs[best] >= ATTR_THRESHOLD:
            predicted_source = best

    return {
        "label": label,
        "confidence": confidence,
        "predicted_source": predicted_source,
        "source_probs": source_probs,
        "signals": signals,
        "explanation": [
            "Decision is based on compression, sharpness, edge density, and frequency-domain signals.",
            "Higher/lower high-frequency energy and sharpness can correlate with generation pipelines.",
            "Attribution is only attempted when AI probability is sufficiently high."
        ],
        "model": "feature+ml"
    }