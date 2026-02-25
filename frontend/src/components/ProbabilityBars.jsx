import { motion } from "framer-motion";

function Bar({ label, value, color }) {
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span className="font-mono">{Math.round(value * 100)}%</span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
        <motion.div
          className="h-2 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.round(value * 100)}%` }}
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </div>
    </div>
  );
}

export default function ProbabilityBars({ aiProb, humanProb, accent, showAttribution, sourceProbs }) {
  return (
    <div>
      <Bar label="AI probability" value={aiProb} color="#EF4444" />
      <Bar label="Human probability" value={humanProb} color="#22C55E" />

      {showAttribution ? (
        <div className="mt-5">
          <div className="text-xs font-semibold text-slate-700">Model attribution (AI only)</div>
          <div className="mt-2 space-y-2">
            {Object.entries(sourceProbs || {})
              .sort((a, b) => b[1] - a[1])
              .map(([k, v]) => (
                <Bar key={k} label={k} value={v} color={accent} />
              ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
