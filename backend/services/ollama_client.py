import os
import requests
from typing import Optional


class OllamaClient:
    def __init__(self, base_url: Optional[str] = None, timeout_s: int = 60):
        self.base_url = (base_url or os.getenv("OLLAMA_BASE_URL") or "http://localhost:11434").rstrip("/")
        self.timeout_s = timeout_s

    def generate(self, model: str, prompt: str) -> str:
        """
        Uses Ollama OpenAI-compatible API:
        POST /v1/chat/completions
        """
        url = f"{self.base_url}/v1/chat/completions"

        payload = {
            "model": model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.1
        }

        try:
            resp = requests.post(url, json=payload, timeout=self.timeout_s)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"].strip()
        except requests.RequestException as e:
            raise RuntimeError(f"Ollama request failed: {e}")
