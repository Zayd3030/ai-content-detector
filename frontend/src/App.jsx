import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import TextDetection from "./pages/TextDetection";
import ImageDetection from "./pages/ImageDetection";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <div className="border-b border-slate-200 bg-white/70 backdrop-blur">
          <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">Honours Project</div>
            <div className="flex gap-2">
              <NavLink
                to="/text"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm ${isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`
                }
              >
                Text
              </NavLink>

              <NavLink
                to="/image"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm ${isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`
                }
              >
                Image
              </NavLink>
            </div>
          </div>
        </div>

        <Routes>
          <Route path="/" element={<TextDetection />} />
          <Route path="/text" element={<TextDetection />} />
          <Route path="/image" element={<ImageDetection />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}