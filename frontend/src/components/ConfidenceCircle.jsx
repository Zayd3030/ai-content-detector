import { motion } from "framer-motion";
import { useMemo } from "react";

export default function ConfidenceCircle({
  value = 0.5, // 0..1
  size = 156,
  strokeWidth = 12,
  color = "#F59E0B",
  label = "Confidence",
  subtitle = "",
}) {
  const v = Math.max(0, Math.min(1, value));

  const { radius, circumference, dashOffset } = useMemo(() => {
    const r = (size - strokeWidth) / 2;
    const c = 2 * Math.PI * r;
    return { radius: r, circumference: c, dashOffset: c * (1 - v) };
  }, [v, size, strokeWidth]);

  const pct = Math.round(v * 100);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(15,23,42,0.08)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "50% 50%", transform: "rotate(-90deg)" }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-3xl font-semibold text-slate-900">{pct}%</div>
        <div className="mt-1 text-xs font-semibold text-slate-700">{label}</div>
        {subtitle ? <div className="mt-1 text-[11px] text-slate-500">{subtitle}</div> : null}
      </div>
    </div>
  );
}
