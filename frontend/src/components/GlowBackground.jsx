export default function GlowBackground({ tint = "neutral" }) {
  const tintMap = {
    neutral: ["rgba(59,130,246,0.12)", "rgba(245,158,11,0.10)"],
    human: ["rgba(34,197,94,0.16)", "rgba(59,130,246,0.10)"],
    ai: ["rgba(239,68,68,0.16)", "rgba(245,158,11,0.10)"],
    uncertain: ["rgba(245,158,11,0.14)", "rgba(59,130,246,0.10)"],
  };

  const [a, b] = tintMap[tint] ?? tintMap.neutral;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-28 -left-28 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-70"
        style={{ background: `radial-gradient(circle, ${a}, transparent 60%)` }}
      />
      <div
        className="absolute top-24 -right-28 h-[32rem] w-[32rem] rounded-full blur-3xl opacity-70"
        style={{ background: `radial-gradient(circle, ${b}, transparent 60%)` }}
      />
      <div
        className="absolute -bottom-36 left-1/3 h-[34rem] w-[34rem] rounded-full blur-3xl opacity-60"
        style={{ background: `radial-gradient(circle, rgba(15,23,42,0.06), transparent 60%)` }}
      />
    </div>
  );
}
