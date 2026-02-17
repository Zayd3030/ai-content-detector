import { motion } from "framer-motion";
import ConfidenceCircle from "./ConfidenceCircle";
import ProbabilityBars from "./ProbabilityBars";

function lerp(a, b, t) {
  return a + (b - a) * t;
}
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex({ r, g, b }) {
  const to = (x) => x.toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}
function mix(c1, c2, t) {
  const A = hexToRgb(c1);
  const B = hexToRgb(c2);
  return rgbToHex({
    r: Math.round(lerp(A.r, B.r, t)),
    g: Math.round(lerp(A.g, B.g, t)),
    b: Math.round(lerp(A.b, B.b, t)),
  });
}

function decisionFrom(result) {
  const label = result?.label || "Unknown";
  const conf = typeof result?.confidence === "number" ? result.confidence : 0;

  // You store confidence as "max prob", not explicitly ai_prob.
  // Derive aiProb based on label:
  const aiProb = label.toLowerCase().includes("ai") ? conf : 1 - conf;
  const humanProb = 1 - aiProb;

  // 0 => green, 0.5 => orange, 1 => red
  const green = "#16A34A";
  const orange = "#F59E0B";
  const red = "#DC2626";
  const color = aiProb < 0.5 ? mix(green, orange, aiProb / 0.5) : mix(orange, red, (aiProb - 0.5) / 0.5);

  let tint = "neutral";
  if (aiProb >= 0.65) tint = "ai";
  else if (aiProb <= 0.35) tint = "human";
  else tint = "uncertain";

  return { label, conf, aiProb, humanProb, color, tint };
}

export default function ResultCard({ result, loading = false }) {
  const d = decisionFrom(result);

  const subtitle =
    result?.predicted_source && result.predicted_source !== "Unknown"
      ? `Source guess: ${result.predicted_source}`
      : "Source guess: Unknown";

  const showAttribution = d.aiProb >= 0.7 && result?.source_probs && Object.keys(result.source_probs).length > 0;

  return (
    <motion.div
      key={(result?.label || "none") + String(result?.confidence ?? "")}
      initial={{ opacity: 0, y: 10, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl border border-slate-900/10 bg-white/70 backdrop-blur-xl shadow-[0_10px_35px_rgba(15,23,42,0.08)] overflow-hidden"
    >
      <div
        className="absolute -inset-px rounded-2xl opacity-40 pointer-events-none"
        style={{ background: `radial-gradient(650px circle at 15% 0%, ${d.color}22, transparent 55%)` }}
      />

      <div className="p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            <ConfidenceCircle value={d.aiProb} color={d.color} label={d.label} subtitle={subtitle} />
            <div className="space-y-2">
              <div className="text-xl font-semibold text-slate-900">
                {d.label === "Unknown" ? "Run a detection to see a result" : d.label}
              </div>

              <div className="text-sm text-slate-600 max-w-md">
                {loading ? "Running analysis…" : "Decision is based on linguistic signals + trained classifiers."}
              </div>

              {result?.explanation?.length ? (
                <div className="mt-3 space-y-1">
                  {result.explanation.slice(0, 3).map((line, idx) => (
                    <div key={idx} className="text-sm text-slate-700">
                      {line.startsWith("-") ? line : `- ${line}`}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="shrink-0">
            <div
              className="px-3 py-1 rounded-full text-xs font-semibold border"
              style={{ borderColor: `${d.color}55`, backgroundColor: `${d.color}10`, color: "#0F172A" }}
            >
              {loading ? "Analysing" : "Ready"}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <ProbabilityBars
            aiProb={d.aiProb}
            humanProb={d.humanProb}
            showAttribution={showAttribution}
            sourceProbs={result?.source_probs || {}}
          />
        </div>
      </div>
    </motion.div>
  );
}
