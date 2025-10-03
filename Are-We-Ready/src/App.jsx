import { Routes, Route, Navigate } from "react-router-dom";
import { TimingProvider } from "./contexts/TimingContext";
import { IntroOverlay } from "./components/UI";
import { IS, SS } from "./components/Scenes";

function App() {
  return (
    <TimingProvider>
      <Routes>
        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/Intro" />} />

        {/* Intro 3D Scene */}
        <Route path="/Intro" element={<IS />} />

        {/* Simulation page (3D + DOM map + panels) */}
        <Route path="/Simulation" element={<SS />} />
      </Routes>

      {/* UI overlay that should always be visible */}
      <IntroOverlay />
    </TimingProvider>
  );
}

export default App;
