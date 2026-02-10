import os
import glob
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix

from services.text_features import extract_text_features, FEATURE_KEYS

DATA_ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "datasets", "text")
HUMAN_DIR = os.path.join(DATA_ROOT, "human")
AI_DIR = os.path.join(DATA_ROOT, "ai")

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
MODELS_DIR = os.path.abspath(MODELS_DIR)
os.makedirs(MODELS_DIR, exist_ok=True)


def _read_txt_files(folder: str):
    files = glob.glob(os.path.join(folder, "*.txt"))
    for fp in files:
        with open(fp, "r", encoding="utf-8", errors="ignore") as f:
            yield fp, f.read()


def build_dataframe():
    rows = []

    # Human
    for fp, text in _read_txt_files(HUMAN_DIR):
        feats = extract_text_features(text)
        rows.append({
            "path": fp,
            "text": text,
            "label_binary": "HUMAN",
            "source": "human",
            **feats
        })

    # AI by source folder name
    if os.path.isdir(AI_DIR):
        for source_name in os.listdir(AI_DIR):
            source_folder = os.path.join(AI_DIR, source_name)
            if not os.path.isdir(source_folder):
                continue
            for fp, text in _read_txt_files(source_folder):
                feats = extract_text_features(text)
                rows.append({
                    "path": fp,
                    "text": text,
                    "label_binary": "AI",
                    "source": source_name,
                    **feats
                })

    df = pd.DataFrame(rows)
    return df


def train_binary(df: pd.DataFrame):
    X = df[FEATURE_KEYS].values
    y = df["label_binary"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    clf = LogisticRegression(max_iter=2000)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    print("=== AI vs HUMAN ===")
    print(classification_report(y_test, y_pred))
    print(confusion_matrix(y_test, y_pred))

    joblib.dump({"model": clf, "feature_keys": FEATURE_KEYS}, os.path.join(MODELS_DIR, "ai_vs_human.pkl"))
    print("Saved:", os.path.join(MODELS_DIR, "ai_vs_human.pkl"))


def train_attribution(df: pd.DataFrame):
    df_ai = df[df["label_binary"] == "AI"].copy()
    if df_ai["source"].nunique() < 2:
        print("Not enough AI sources to train attribution (need at least 2).")
        return

    X = df_ai[FEATURE_KEYS].values
    y = df_ai["source"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    clf = LogisticRegression(max_iter=3000, multi_class="auto")
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    print("=== Source Attribution (AI only) ===")
    print(classification_report(y_test, y_pred))
    print(confusion_matrix(y_test, y_pred))

    joblib.dump({"model": clf, "classes": list(clf.classes_), "feature_keys": FEATURE_KEYS},
                os.path.join(MODELS_DIR, "source_attrib.pkl"))
    print("Saved:", os.path.join(MODELS_DIR, "source_attrib.pkl"))


if __name__ == "__main__":
    df = build_dataframe()
    if df.empty:
        raise SystemExit(
            f"No data found. Add .txt files to:\n- {HUMAN_DIR}\n- {AI_DIR}\\<modelname>\\"
        )

    print("Dataset size:", len(df))
    print(df["label_binary"].value_counts())
    print("AI sources:", df[df["label_binary"] == "AI"]["source"].value_counts())

    train_binary(df)
    train_attribution(df)
