import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InfoTooltip from "./InfoTooltip";
import StatusBadge from "./StatusBadge";
import { decisionColor, isUncertain, clamp01 } from "../utils/decision";
import ConfidenceCircle from "./ConfidenceCircle";
import ProbabilityBars from "./ProbabilityBars";

function downloadJSON(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function copyText(text) {
  navigator.clipboard?.writeText(text).catch(() => {});
}

export default function ResultCard({ result, loading, ollamaState = "ok" }) {
  const aiProb = useMemo(() => {
    // Prefer explicit probs, fallback to label+confidence
    if (result?.probs?.AI != null) return clamp01(result.probs.AI);
    if (!result?.label) return 0.5;
    const label = String(result.label).toLowerCase();
    const conf = clamp01(result.confidence ?? 0.5);
    if (label.includes("ai")) return conf;
    if (label.includes("human")) return 1 - conf;
    return 0.5;
  }, [result]);

  const humanProb = 1 - aiProb;
  const accent = decisionColor(aiProb);
  const uncertain = isUncertain(aiProb);

  const statusLabel = loading ? "Running…" : "Ready";
  const statusState = loading ? "running" : "ok";

  const explanationText = (result?.explanation || []).join("\n");
  const pipelineInfo =
    "Pipeline: extract linguistic signals → binary classifier (AI vs human) → if AI, a second classifier estimates likely source model → optional explanation generated from signals only.";

  return (
    <div className="relative rounded-2xl border border-slate-900/10 bg-white/70 backdrop-blur-xl shadow-[0_10px_35px_rgba(15,23,42,0.08)]">
      {/* Uncertain banner */}
      {result?.label && uncertain ? (
        <div className="rounded-t-2xl border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-800">
          Uncertain result — near decision boundary (45–55%). Treat as inconclusive.
        </div>
      ) : null}

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="text-lg font-semibold text-slate-900">
              {result?.label || "Run a detection to see a result"}
            </div>
            <InfoTooltip text={pipelineInfo} />
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge label={statusLabel} state={statusState} />
            <StatusBadge
              label={`Ollama: ${ollamaState === "ok" ? "Connected" : "Offline"}`}
              state={ollamaState === "ok" ? "ok" : "down"}
            />
          </div>
        </div>

        {/* calibration hint */}
        <div className="mt-2 text-xs text-slate-600">
          Confidence is an estimated probability (not proof). Uncertainty zone: 45–55%.
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
          <div className="flex items-center justify-center">
            <ConfidenceCircle
              value={result ? (result?.label?.toLowerCase().includes("human") ? humanProb : aiProb) : 0}
              // You can also pass aiProb and label to draw the correct caption inside
              label={result?.label || ""}
              accent={accent}
              sublabel={`Source guess: ${result?.predicted_source || "Unknown"}`}
            />
          </div>

          <div>
            <div className="text-sm text-slate-700">
              {result?.label
                ? "Decision is based on extracted signals + trained classifiers."
                : "Paste text below and click Detect."}
            </div>

            {/* Explanation block */}
            <AnimatePresence mode="wait">
              {result?.label ? (
                <motion.div
                  key="explain"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="mt-4"
                >
                  <div className="text-xs text-slate-500">
                    Explanation generated from extracted signals (not raw text).
                  </div>

                  <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-800">
                    {(result.explanation || []).map((x, i) => (
                      <li key={i}>{String(x).replace(/^-\s?/, "")}</li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyText(explanationText)}
                      className="rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      Copy explanation
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadJSON("result.json", result)}
                      className="rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      Export JSON
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Probability bars + attribution */}
            <div className="mt-6">
              <ProbabilityBars
                aiProb={aiProb}
                humanProb={humanProb}
                accent={accent}
                sourceProbs={result?.source_probs || {}}
                showAttribution={String(result?.label || "").toLowerCase().includes("ai")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* subtle glow outline based on decision */}
      {result?.label ? (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            boxShadow: `0 0 0 1px rgba(15,23,42,0.06), 0 0 40px ${accent}22`,
          }}
        />
      ) : null}
    </div>
  );
}
