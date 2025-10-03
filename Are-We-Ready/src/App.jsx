import { OrbitControls, Environment } from "@react-three/drei";
import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { TimingProvider } from "./contexts/TimingContext";
import { IS, SS } from "./components/Scenes";
import { IntroOverlay } from "./components/UI";

function SceneContent() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Navigate to="/Intro" />} />
        <Route path="/Intro" element={<IS />} />
        <Route path="/Simulation" element={<SS />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <TimingProvider>
      <div
        id="canvas-container"
        style={{ position: "relative", width: "100vw", height: "100vh" }}
      >
        <SceneContent />
      </div>
      <IntroOverlay />
    </TimingProvider>
  );
}

export default App;
