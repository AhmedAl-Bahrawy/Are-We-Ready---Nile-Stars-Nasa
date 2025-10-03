import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Suspense } from "react";
import Experience from "./components/Experience";
import { TimingProvider } from "./contexts/TimingContext";
import { useCallback } from "react";
import { IntroOverlay } from "./components/UI";

function AppContent() {
  const handleMouseDown = useCallback(() => {
    // This function will be called by both components
    // The specific logic is handled within each component
  }, []);

  return (
    <div id="canvas-container">
      <Canvas
        shadows
        camera={{ position: [5, 5, 5], fov: 60 }}
        style={{ height: "100vh", width: "100vw" }}
      >
        <Suspense fallback={null}>
          <Environment preset="city" />

          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />

          {/* Scene */}
          <Experience onMouseDown={handleMouseDown} />
        </Suspense>
      </Canvas>
      <IntroOverlay />
    </div>
  );
}

function App() {
  return (
    <TimingProvider>
      <AppContent />
    </TimingProvider>
  );
}

export default App;
