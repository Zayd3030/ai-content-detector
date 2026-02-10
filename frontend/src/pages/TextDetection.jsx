import { useState } from "react";
import { detectText } from "../services/api";

export default function TextDetection() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!text.trim()) {
      setError("Please paste some text first.");
      return;
    }

    setLoading(true);
    try {
      const data = await detectText(text);
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1>Text Detection</h1>
      <p>Paste text and get an AI vs Human prediction with a confidence score.</p>

      <form onSubmit={onSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Paste text here..."
          style={{ width: "100%", padding: 12, fontSize: 14 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: 12, padding: "10px 16px", cursor: "pointer" }}
        >
          {loading ? "Detecting..." : "Detect"}
        </button>
      </form>

      {error && <p style={{ marginTop: 16 }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 24, padding: 16, border: "1px solid #ddd" }}>
          <h2>Result</h2>
          <p><strong>Label:</strong> {result.label}</p>
          <p><strong>Confidence:</strong> {Math.round(result.confidence * 100)}%</p>
          <p><strong>Model:</strong> {result.model}</p>

          {result.predicted_source && (
            <p><strong>Predicted Source:</strong> {result.predicted_source}</p>
          )}

          {result.source_probs && Object.keys(result.source_probs).length > 0 && (
            <>
              <h3>Source Probabilities</h3>
              <ul>
                {Object.entries(result.source_probs).map(([k, v]) => (
                  <li key={k}>{k}: {Math.round(v * 100)}%</li>
                ))}
              </ul>
            </>
          )}

          {result.signals && (
            <>
              <h3>Signals (debug)</h3>
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {JSON.stringify(result.signals, null, 2)}
              </pre>
            </>
          )}


          <h3>Explanation</h3>
          <ul>
            {result.explanation?.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>

          {result.raw_output && (
            <>
              <h3>Raw Output (debug)</h3>
              <pre style={{ whiteSpace: "pre-wrap" }}>{result.raw_output}</pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}
