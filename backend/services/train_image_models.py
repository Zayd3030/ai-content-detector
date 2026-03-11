import os
import glob
import joblib
import pandas as pd
import numpy as np

from PIL import Image

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix

from services.image_detector import extract_image_features, FEATURE_KEYS

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATA_ROOT = os.path.join(PROJECT_ROOT, "datasets", "image")

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
BIN_PATH = os.path.join(OUT_DIR, "ai_vs_human_image.pkl")
ATTR_PATH = os.path.join(OUT_DIR, "source_attrib_image.pkl")

IMG_EXTS = ("*.jpg", "*.jpeg", "*.png", "*.webp")


def iter_images(folder: str):
    files = []
    for ext in IMG_EXTS:
        files.extend(glob.glob(os.path.join(folder, ext)))
    return sorted(files)


def load_features_for_file(fp: str):
    img = Image.open(fp)
    signals = extract_image_features(img)
    row = {k: float(signals.get(k, 0.0)) for k in FEATURE_KEYS}
    return row


def build_dataframe():
    rows = []

    # HUMAN
    human_dir = os.path.join(DATA_ROOT, "human")
    for fp in iter_images(human_dir):
        feat = load_features_for_file(fp)
        rows.append(
            {
                **feat,
                "label_binary": "HUMAN",
                "source": "human",
                "path": fp,
            }
        )

    # AI sources
    ai_root = os.path.join(DATA_ROOT, "ai")
    if os.path.exists(ai_root):
        for source in os.listdir(ai_root):
            src_dir = os.path.join(ai_root, source)
            if not os.path.isdir(src_dir):
                continue
            for fp in iter_images(src_dir):
                feat = load_features_for_file(fp)
                rows.append(
                    {
                        **feat,
                        "label_binary": "AI",
                        "source": source,
                        "path": fp,
                    }
                )

    df = pd.DataFrame(rows)
    return df


def train_binary(df: pd.DataFrame):
    X = df[FEATURE_KEYS].values
    y = df["label_binary"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    pipe = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=3000)),
        ]
    )

    pipe.fit(X_train, y_train)
    pred = pipe.predict(X_test)

    print("=== AI vs HUMAN (Image) ===")
    print(classification_report(y_test, pred))
    print(confusion_matrix(y_test, pred))

    os.makedirs(OUT_DIR, exist_ok=True)
    joblib.dump({"model": pipe, "feature_keys": FEATURE_KEYS}, BIN_PATH)
    print("Saved:", BIN_PATH)


def train_attribution(df: pd.DataFrame):
    ai_df = df[df["label_binary"] == "AI"].copy()
    if ai_df["source"].nunique() < 2:
        print("Not enough AI sources for attribution. Need at least 2 folders under datasets/image/ai/")
        return

    X = ai_df[FEATURE_KEYS].values
    y = ai_df["source"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    pipe = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=3000)),
        ]
    )

    pipe.fit(X_train, y_train)
    pred = pipe.predict(X_test)

    print("=== Source Attribution (AI only, Image) ===")
    print(classification_report(y_test, pred))
    print(confusion_matrix(y_test, pred))

    os.makedirs(OUT_DIR, exist_ok=True)
    joblib.dump({"model": pipe, "feature_keys": FEATURE_KEYS}, ATTR_PATH)
    print("Saved:", ATTR_PATH)


def main():
    df = build_dataframe()

    if df.empty:
        raise RuntimeError(
            "No images found. Add images to datasets/image/human and datasets/image/ai/<source>/"
        )

    print("Dataset size:", len(df))
    print(df["label_binary"].value_counts())
    print("AI sources:\n", df[df["label_binary"] == "AI"]["source"].value_counts())

    train_binary(df)
    train_attribution(df)


if __name__ == "__main__":
    main()