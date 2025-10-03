import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Suspense } from "react";
import Experience from "./components/Experience";

function App() {
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
          <Experience />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;
