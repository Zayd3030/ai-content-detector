import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import TextDetection from "./pages/TextDetection";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 16, borderBottom: "1px solid #eee" }}>
        <Link to="/" style={{ marginRight: 12 }}>Text</Link>
      </div>

      <Routes>
        <Route path="/" element={<TextDetection />} />
      </Routes>
    </BrowserRouter>
  );
}
