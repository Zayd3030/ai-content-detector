import { useMemo, useState } from "react";

const DESCRIPTIONS = {
  length_tokens: "Number of word tokens in the text.",
  type_token_ratio: "Lexical diversity: unique tokens / total tokens.",
  repetition_ratio: "How often tokens repeat (higher can suggest templated output).",
  top1_freq: "Frequency of the most common token.",
  top5_freq: "Combined frequency of the top 5 tokens.",
  avg_word_len: "Average word length (characters).",
  avg_sent_len: "Average sentence length (tokens).",
  std_sent_len: "Variation in sentence length (lower can indicate uniform style).",
  punct_ratio: "Punctuation density relative to total characters.",
};

function prettyKey(k) {
  return k.replaceAll("_", " ");
}

export default function SignalsAccordion({ signals = {} }) {
  const [open, setOpen] = useState(false);

  const rows = useMemo(() => {
    if (!signals) return [];
    return Object.entries(signals).map(([k, v]) => ({
      key: k,
      value: typeof v === "number" ? v : Number(v),
      desc: DESCRIPTIONS[k] || "Signal used by the classifier.",
    }));
  }, [signals]);

  return (
    <div className="rounded-2xl border border-slate-900/10 bg-white/70 backdrop-blur-xl shadow-[0_10px_35px_rgba(15,23,42,0.08)] overflow-hidden">
      <button
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div>
          <div className="text-sm font-semibold text-slate-900">Signals</div>
          <div className="text-xs text-slate-600">Feature values used for the prediction</div>
        </div>
        <div className="text-slate-500 text-sm">{open ? "Hide" : "Show"}</div>
      </button>

      {open ? (
        <div className="px-5 pb-5">
          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.key} className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 capitalize">
                    {prettyKey(r.key)}
                  </div>
                  <div className="text-[11px] text-slate-500">{r.desc}</div>
                </div>
                <div className="shrink-0 text-xs font-mono text-slate-700">
                  {Number.isFinite(r.value) ? r.value.toFixed(4) : String(r.value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
