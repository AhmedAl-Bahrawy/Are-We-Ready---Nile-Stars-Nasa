import { Suspense, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { TimingProvider } from "./contexts/TimingContext";
import { IS, SS } from "./components/Scenes";
import { IntroOverlay } from "./components/UI";

function SceneContent({ onMouseDown }) {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Navigate to="/Intro" />} />
        <Route path="/Intro" element={<IS onMouseDown={onMouseDown} />} />
        <Route path="/Simulation" element={<SS onMouseDown={onMouseDown} />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  const handleMouseDown = useCallback(() => {
    // This function will be called by both components
    // The specific logic is handled within each component
  }, []);

  return (
    <TimingProvider>
      <div
        id="canvas-container"
        style={{ position: "relative", width: "100vw", height: "100vh" }}
      >
        <SceneContent onMouseDown={handleMouseDown} />
      </div>
      <IntroOverlay onMouseDown={handleMouseDown} />
    </TimingProvider>
  );
}

export default App;
