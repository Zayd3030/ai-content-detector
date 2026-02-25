import { useMemo, useState } from "react";

const DESCRIPTIONS = {
  avg_sent_len: "Average sentence length (tokens).",
  std_sent_len: "Variation in sentence length (lower can indicate uniform style).",
  avg_word_len: "Average word length (characters).",
  length_tokens: "Number of tokens in the text.",
  punct_ratio: "Punctuation density relative to total characters.",
  repetition_ratio: "How often tokens repeat (higher can suggest templated output).",
  type_token_ratio: "Lexical diversity: unique tokens / total tokens.",
  top1_freq: "Frequency of the most common token.",
  top5_freq: "Combined frequency of the top 5 tokens.",
};

function groupSignals(signals) {
  const g = {
    Length: ["length_tokens", "avg_sent_len", "std_sent_len", "avg_word_len"],
    Diversity: ["type_token_ratio"],
    Repetition: ["repetition_ratio", "top1_freq", "top5_freq"],
    Punctuation: ["punct_ratio"],
  };

  const groups = {};
  for (const [name, keys] of Object.entries(g)) {
    const present = keys.filter((k) => signals?.[k] != null);
    if (present.length) groups[name] = present;
  }
  return groups;
}

export default function SignalsAccordion({ signals = {} }) {
  const [open, setOpen] = useState(true);

  const top = useMemo(() => {
    const entries = Object.entries(signals || {}).filter(([, v]) => typeof v === "number");
    entries.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    return entries.slice(0, 3);
  }, [signals]);

  const groups = useMemo(() => groupSignals(signals), [signals]);

  return (
    <div className="rounded-2xl border border-slate-900/10 bg-white/70 backdrop-blur-xl shadow-[0_10px_35px_rgba(15,23,42,0.08)] p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">Signals</div>
          <div className="mt-1 text-xs text-slate-600">Feature values used for the prediction</div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>

      {open ? (
        <div className="mt-5 space-y-5">
          {top.length ? (
            <div>
              <div className="text-xs font-semibold text-slate-700">Top contributors (heuristic)</div>
              <div className="mt-2 space-y-2">
                {top.map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-slate-900/10 bg-white px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-slate-900">{pretty(k)}</div>
                      <div className="text-xs font-mono text-slate-700">{format(v)}</div>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">{DESCRIPTIONS[k] || ""}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {Object.entries(groups).map(([groupName, keys]) => (
            <div key={groupName}>
              <div className="text-xs font-semibold text-slate-700">{groupName}</div>
              <div className="mt-2 space-y-2">
                {keys.map((k) => (
                  <SignalRow key={k} k={k} v={signals[k]} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SignalRow({ k, v }) {
  return (
    <div className="rounded-xl border border-slate-900/10 bg-white px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold text-slate-900">{pretty(k)}</div>
        <div className="text-xs font-mono text-slate-700">{format(v)}</div>
      </div>
      <div className="mt-1 text-[11px] text-slate-500">{DESCRIPTIONS[k] || ""}</div>
    </div>
  );
}

function pretty(k) {
  return k
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function format(v) {
  if (typeof v !== "number") return String(v ?? "");
  return Number.isInteger(v) ? String(v) : v.toFixed(4);
}
