import { useState } from "react";

export default function InfoTooltip({ text }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
        aria-label="Info"
      >
        i
      </button>

      {open ? (
        <div className="absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-xl border border-slate-200 bg-white/90 p-3 text-xs text-slate-700 shadow-lg backdrop-blur">
          {text}
        </div>
      ) : null}
    </span>
  );
}
