// frontend/src/utils/decision.js

export const clamp01 = (n) => Math.max(0, Math.min(1, n ?? 0));

export const isUncertain = (aiProb) => {
  const p = clamp01(aiProb);
  return p > 0.40 && p < 0.60;
};

// Interpolate between colors (hex -> rgb -> hex)
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const bigint = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}
function rgbToHex({ r, g, b }) {
  const toHex = (v) => v.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function lerpColor(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex({
    r: Math.round(lerp(A.r, B.r, t)),
    g: Math.round(lerp(A.g, B.g, t)),
    b: Math.round(lerp(A.b, B.b, t)),
  });
}

// Palette
const GREEN = "#16A34A";  // human
const ORANGE = "#F59E0B"; // uncertain
const RED = "#DC2626";    // ai

// Map aiProb -> color (green -> orange -> red)
export const decisionColor = (aiProb) => {
  const p = clamp01(aiProb);

  if (p <= 0.5) {
    // 0..0.5 : green -> orange
    return lerpColor(GREEN, ORANGE, p / 0.5);
  }
  // 0.5..1 : orange -> red
  return lerpColor(ORANGE, RED, (p - 0.5) / 0.5);
};
