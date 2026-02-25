export default function ShortTextWarning({ text }) {
  const n = (text || "").trim().length;
  if (n === 0) return null;

  // adjust threshold as you like
  if (n >= 150) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
      <div className="font-semibold">Short input warning</div>
      <div className="mt-1 text-amber-800">
        This text is quite short ({n} chars). Detection is less reliable on short samples.
        For better results, try &gt;150–300 characters.
      </div>
    </div>
  );
}
