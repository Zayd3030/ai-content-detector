import os
from services.ollama_client import OllamaClient

PROMPTS = [
    "Explain how wind turbines work in simple terms.",
    "Summarise the causes of the French Revolution.",
    "Write a paragraph about the benefits of exercise.",
    "Describe how photosynthesis works.",
    "Write an informative paragraph about cyber security threats."
]

MODELS = ["llama3", "mistral"]  # must exist in `ollama list`
N_PER_MODEL = 50

DATA_ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "datasets", "text", "ai")

def main():
    client = OllamaClient()
    os.makedirs(DATA_ROOT, exist_ok=True)

    for model in MODELS:
        out_dir = os.path.join(DATA_ROOT, model)
        os.makedirs(out_dir, exist_ok=True)

        for i in range(N_PER_MODEL):
            prompt = PROMPTS[i % len(PROMPTS)]
            text = client.generate(model, prompt)
            fp = os.path.join(out_dir, f"{model}_{i:03d}.txt")
            with open(fp, "w", encoding="utf-8") as f:
                f.write(text)
            print("Wrote", fp)

if __name__ == "__main__":
    main()
