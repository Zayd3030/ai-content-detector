import os
import requests
from typing import Optional


class OllamaClient:
    def __init__(self, base_url: Optional[str] = None, timeout_s: int = 60):
        self.base_url = (base_url or os.getenv("OLLAMA_BASE_URL") or "http://localhost:11434").rstrip("/")
        self.timeout_s = timeout_s

    def generate(self, model: str, prompt: str) -> str:
        """
        Calls Ollama /api/generate and returns the response text.
        """
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False
        }

        try:
            resp = requests.post(url, json=payload, timeout=self.timeout_s)
            resp.raise_for_status()
            data = resp.json()
            return (data.get("response") or "").strip()
        except requests.RequestException as e:
            raise RuntimeError(f"Ollama request failed: {e}")
