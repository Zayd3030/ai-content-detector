import re
from collections import Counter
from typing import Dict, List

_WORD_RE = re.compile(r"[A-Za-z']+")
_SENT_SPLIT_RE = re.compile(r"[.!?]+")


def _tokenize(text: str) -> List[str]:
    return [t.lower() for t in _WORD_RE.findall(text)]


def _sentences(text: str) -> List[str]:
    return [s.strip() for s in _SENT_SPLIT_RE.split(text) if s.strip()]


FEATURE_KEYS = [
    "length_tokens",
    "type_token_ratio",
    "repetition_ratio",
    "top1_freq",
    "top5_freq",
    "avg_word_len",
    "avg_sent_len",
    "std_sent_len",
    "punct_ratio",
]


def extract_text_features(text: str) -> Dict[str, float]:
    tokens = _tokenize(text)
    n_tokens = len(tokens)

    if n_tokens == 0:
        return {k: 0.0 for k in FEATURE_KEYS}

    counts = Counter(tokens)
    unique = len(counts)

    repeats = sum(c - 1 for c in counts.values())
    repetition_ratio = repeats / n_tokens

    most_common = counts.most_common()
    top1_freq = most_common[0][1] / n_tokens
    top5_freq = sum(c for _, c in most_common[:5]) / n_tokens

    avg_word_len = sum(len(t) for t in tokens) / n_tokens

    sents = _sentences(text)
    sent_lens = [len(_tokenize(s)) for s in sents] if sents else []

    if not sent_lens:
        avg_sent_len = 0.0
        std_sent_len = 0.0
    else:
        avg_sent_len = sum(sent_lens) / len(sent_lens)
        var = sum((x - avg_sent_len) ** 2 for x in sent_lens) / max(1, len(sent_lens))
        std_sent_len = var ** 0.5

    punct_count = len(re.findall(r"[.,;:!?]", text))
    punct_ratio = punct_count / max(1, len(text))

    type_token_ratio = unique / n_tokens

    return {
        "length_tokens": float(n_tokens),
        "type_token_ratio": float(type_token_ratio),
        "repetition_ratio": float(repetition_ratio),
        "top1_freq": float(top1_freq),
        "top5_freq": float(top5_freq),
        "avg_word_len": float(avg_word_len),
        "avg_sent_len": float(avg_sent_len),
        "std_sent_len": float(std_sent_len),
        "punct_ratio": float(punct_ratio),
    }
