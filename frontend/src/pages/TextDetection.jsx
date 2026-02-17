import { useMemo, useState } from "react";
import { detectText } from "../services/api";
import GlowBackground from "../components/GlowBackground";
import ResultCard from "../components/ResultCard";
import SignalsAccordion from "../components/SignalsAccordion";

export default function TextDetection() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const tint = useMemo(() => {
    const label = result?.label?.toLowerCase() || "";
    if (!label) return "neutral";
    if (label.includes("ai")) return "ai";
    if (label.includes("human")) return "human";
    return "neutral";
  }, [result]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await detectText(text);
      setResult(res);
    } catch {
      setError("Detection failed. Check backend is running and CORS is enabled.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <GlowBackground tint={tint} />

      {/* Blur overlay when loading */}
      {loading ? (
        <div className="fixed inset-0 z-10 backdrop-blur-[2px] bg-white/30" />
      ) : null}

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-2xl font-semibold text-slate-900">AI Content Detector</div>
            <div className="mt-1 text-sm text-slate-600">
              Text analysis using linguistic signals + trained classifiers. Optional LLM explanation.
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Backend: <span className="font-mono">/detect/text</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ResultCard result={result} loading={loading} />
          </div>
          <div className="lg:col-span-1">
            <SignalsAccordion signals={result?.signals || {}} />
          </div>
        </div>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-8 rounded-2xl border border-slate-900/10 bg-white/70 backdrop-blur-xl shadow-[0_10px_35px_rgba(15,23,42,0.08)] p-6"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">Input text</div>
            <div className="text-xs text-slate-500">{text.length} chars</div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste text here…"
            className="mt-3 w-full min-h-[160px] rounded-xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-900/10"
          />

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="text-sm text-red-600">{error}</div>

            <button
              type="submit"
              disabled={!text.trim() || loading}
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
              style={{ backgroundColor: "#0F172A" }}
            >
              {loading ? "Detecting…" : "Detect"}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
