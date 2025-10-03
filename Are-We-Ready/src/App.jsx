import { Suspense, useCallback } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { TimingProvider } from "./contexts/TimingContext";
import { IS, SS } from "./components/Scenes";
import { IntroOverlay, NavBar } from "./components/UI";

function SceneContent({ onMouseDown }) {
  return (
    <Suspense fallback={null}>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/Intro" />} />
        <Route path="/Intro" element={<IS onMouseDown={onMouseDown} />} />
        <Route path="/Simulation" element={<SS onMouseDown={onMouseDown} />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  const location = useLocation(); // هنا بنجيب ال URL الحالي
  const handleMouseDown = useCallback(() => {
    // This function will be called by both components
  }, []);

  return (
    <TimingProvider>
      <div
        id="canvas-container"
        style={{ position: "relative", width: "100vw", height: "100vh" }}
      >
        <SceneContent onMouseDown={handleMouseDown} />
      </div>

      {/* IntroOverlay يظهر بس في صفحة Intro */}
      {location.pathname === "/Intro" && (
        <IntroOverlay onMouseDown={handleMouseDown} />
      )}
    </TimingProvider>
  );
}

export default App;
