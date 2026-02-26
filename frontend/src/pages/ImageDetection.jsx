import { useMemo, useState } from "react";
import GlowBackground from "../components/GlowBackground";
import ResultCard from "../components/ResultCard";
import SignalsAccordion from "../components/SignalsAccordion";
import { detectImage } from "../services/api";

export default function ImageDetection() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
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

  const onPick = (e) => {
    const f = e.target.files?.[0];
    setResult(null);
    setError("");
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : "");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const res = await detectImage(file);
      setResult(res);
    } catch (err) {
      setError("Image detection failed. Check backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <GlowBackground tint={tint} />

      {loading ? (
        <div className="fixed inset-0 z-10 backdrop-blur-[2px] bg-white/30" />
      ) : null}

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-2xl font-semibold text-slate-900">Image Detection</div>
            <div className="mt-1 text-sm text-slate-600">
              Upload an image and get an AI vs Human prediction + confidence.
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Backend: <span className="font-mono">/detect/image</span>
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

        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-2xl border border-slate-900/10 bg-white/70 backdrop-blur-xl shadow-[0_10px_35px_rgba(15,23,42,0.08)] p-6"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">Upload image</div>
            <div className="text-xs text-slate-500">
              {file ? file.name : "No file selected"}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-900/10 bg-white p-4">
              <input type="file" accept="image/*" onChange={onPick} />
              <div className="mt-3 text-xs text-slate-500">
                Supported: JPG, PNG, WEBP
              </div>
            </div>

            <div className="rounded-xl border border-slate-900/10 bg-white p-4">
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="max-h-56 w-full object-contain"
                />
              ) : (
                <div className="text-sm text-slate-500">Preview will appear here</div>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="text-sm text-red-600">{error}</div>

            <button
              type="submit"
              disabled={!file || loading}
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
              style={{ backgroundColor: "#0F172A" }}
            >
              {loading ? "Detecting…" : "Detect"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}