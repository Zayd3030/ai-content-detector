import json
from typing import Dict, Any

from services.ollama_client import OllamaClient


MODEL_NAME = "llama3"  # change if you want e.g. "mistral"


def _build_prompt(user_text: str) -> str:
    """
    We force the model to return strict JSON so the frontend can display it.
    """
    return f"""
You are an AI-generated text detector. Classify the input as either "AI" or "HUMAN".

Return ONLY valid JSON in this exact format:
{{
  "label": "AI" or "HUMAN",
  "confidence": number between 0 and 1,
  "explanation": ["reason 1", "reason 2", "reason 3"]
}}

Rules:
- confidence must be a float 0..1
- explanation must be 3 short bullet-style strings
- Do NOT include extra keys.
- Do NOT wrap JSON in code fences.

TEXT:
\"\"\"{user_text}\"\"\"
""".strip()


def detect_text(user_text: str) -> Dict[str, Any]:
    client = OllamaClient()
    prompt = _build_prompt(user_text)

    raw = client.generate(MODEL_NAME, prompt)

    # Try to parse strict JSON
    try:
        parsed = json.loads(raw)
        label = parsed.get("label")
        confidence = parsed.get("confidence")
        explanation = parsed.get("explanation")

        # Basic validation / fallback
        if label not in ["AI", "HUMAN"]:
            raise ValueError("Invalid label")

        if not isinstance(confidence, (int, float)):
            raise ValueError("Invalid confidence")

        confidence = max(0.0, min(1.0, float(confidence)))

        if not isinstance(explanation, list):
            explanation = []

        explanation = [str(x) for x in explanation][:3]
        while len(explanation) < 3:
            explanation.append("No additional signal available.")

        return {
            "label": "AI-generated" if label == "AI" else "Human-written",
            "confidence": confidence,
            "explanation": explanation,
            "model": MODEL_NAME
        }

    except Exception:
        # Fallback: if model returns non-JSON, still responds
        return {
            "label": "Unknown",
            "confidence": 0.0,
            "explanation": [
                "Model did not return valid JSON.",
                "Try a different Ollama model or prompt.",
                "Check Ollama is running at OLLAMA_BASE_URL."
            ],
            "raw_output": raw[:500],
            "model": MODEL_NAME
        }
