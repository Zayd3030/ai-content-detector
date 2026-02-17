import { motion } from "framer-motion";

function Bar({ label, value, color }) {
  const v = Math.max(0, Math.min(1, value));
  const pct = Math.round(v * 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="font-medium">{label}</span>
        <span>{pct}%</span>
      </div>

      <div className="h-2.5 w-full rounded-full bg-slate-900/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function ProbabilityBars({
  aiProb = 0.5,
  humanProb = 0.5,
  sourceProbs = {},
  showAttribution = false,
}) {
  return (
    <div className="space-y-4">
      <Bar label="AI probability" value={aiProb} color="#DC2626" />
      <Bar label="Human probability" value={humanProb} color="#16A34A" />

      {showAttribution && Object.keys(sourceProbs).length > 0 ? (
        <div className="pt-3 border-t border-slate-900/10">
          <div className="text-xs font-semibold text-slate-700 mb-3">Model attribution (AI only)</div>
          <div className="space-y-3">
            {Object.entries(sourceProbs)
              .sort((a, b) => b[1] - a[1])
              .map(([k, v]) => (
                <Bar key={k} label={k} value={v} color="#0F172A" />
              ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
