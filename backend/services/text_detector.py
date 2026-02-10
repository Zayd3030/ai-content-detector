import os
import joblib
from typing import Dict, Any

from services.text_features import extract_text_features, FEATURE_KEYS
from services.ollama_client import OllamaClient

MODELS_PATH = os.path.join(os.path.dirname(__file__), "..", "models")
MODELS_PATH = os.path.abspath(MODELS_PATH)
BIN_PATH = os.path.join(MODELS_PATH, "ai_vs_human.pkl")
ATTR_PATH = os.path.join(MODELS_PATH, "source_attrib.pkl")

# Use Ollama for explanation only
EXPLAIN_MODEL = "llama3:latest"

# Thresholds
AI_THRESHOLD = 0.70
ATTR_THRESHOLD = 0.60


def _load_model(path: str):
    if not os.path.exists(path):
        return None
    return joblib.load(path)


_bin = _load_model(BIN_PATH)
_attr = _load_model(ATTR_PATH)


def _explain(signals: Dict[str, float], label: str, confidence: float, source_guess: str | None) -> list[str]:
    client = OllamaClient()
    summary = "\n".join([f"- {k}: {signals[k]:.4f}" for k in FEATURE_KEYS])
    src = source_guess if source_guess else "Unknown"

    prompt = f"""
You are explaining an AI-generated text detection decision for a university project.

Given the measured signals below, produce 3 short bullet explanations (no numbering),
each referencing at least one signal and how it supports the decision.

Output only plain text, 3 lines, each starting with "- ".

Decision:
- label: {label}
- confidence: {confidence:.2f}
- source_guess: {src}

Signals:
{summary}
""".strip()

    raw = client.generate(EXPLAIN_MODEL, prompt)
    lines = [l.strip() for l in raw.splitlines() if l.strip()]
    bullets = [l if l.startswith("-") else f"- {l}" for l in lines][:3]
    while len(bullets) < 3:
        bullets.append("- Limited explanation available from current signals.")
    return bullets


def detect_text(user_text: str) -> Dict[str, Any]:
    signals = extract_text_features(user_text)
    X = [[signals[k] for k in FEATURE_KEYS]]

    if _bin is None:
        return {
            "label": "Unknown",
            "confidence": 0.0,
            "predicted_source": "Unknown",
            "source_probs": {},
            "explanation": [
                "Binary model not trained yet.",
                "Run: python -m services.train_text_models after adding dataset files.",
                "Signals are returned for debugging and evaluation."
            ],
            "signals": signals,
            "model": "feature+ml"
        }

    clf = _bin["model"]
    proba = clf.predict_proba(X)[0]
    classes = list(clf.classes_)
    prob_map = {classes[i]: float(proba[i]) for i in range(len(classes))}

    ai_prob = prob_map.get("AI", 0.0)
    human_prob = prob_map.get("HUMAN", 0.0)

    label = "AI-generated" if ai_prob >= 0.5 else "Human-written"
    confidence = max(ai_prob, human_prob)

    predicted_source = "Unknown"
    source_probs = {}

    if ai_prob >= AI_THRESHOLD and _attr is not None:
        a_clf = _attr["model"]
        a_proba = a_clf.predict_proba(X)[0]
        a_classes = list(a_clf.classes_)
        source_probs = {a_classes[i]: float(a_proba[i]) for i in range(len(a_classes))}
        best_source = max(source_probs, key=source_probs.get)
        if source_probs[best_source] >= ATTR_THRESHOLD:
            predicted_source = best_source

    explanation = _explain(signals, label, confidence, predicted_source)

    return {
        "label": label,
        "confidence": float(confidence),
        "predicted_source": predicted_source,
        "source_probs": source_probs,
        "explanation": explanation,
        "signals": signals,
        "model": "feature+ml"
    }
