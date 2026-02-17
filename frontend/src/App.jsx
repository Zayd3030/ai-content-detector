import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import TextDetection from "./pages/TextDetection";

function TopNav() {
  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-sm font-semibold ${
      isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-900/5"
    }`;

  return (
    <div className="sticky top-0 z-20 border-b border-slate-900/10 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-900">Honours Project</div>
        <div className="flex items-center gap-2">
          <NavLink to="/" className={linkClass}>Text</NavLink>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <TopNav />
      <Routes>
        <Route path="/" element={<TextDetection />} />
      </Routes>
    </BrowserRouter>
  );
}
