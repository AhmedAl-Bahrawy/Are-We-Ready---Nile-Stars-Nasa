import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { OrbitControls, Environment } from "@react-three/drei";
import { IntroSceneObjects } from "../Objects";
import { Stars } from "@react-three/drei";
import { Nebula, Particles } from "../Effects";

function IntroSceneContent() {
  return (
    <>
      <Stars radius={300} depth={60} count={5000} factor={7} saturation={0} fade />

      {/* All your Nebula regions */}
      <Nebula count={5} minDistance={120} maxDistance={400} baseColor="#8844ff" />

      <Particles count={4000} />
      <IntroSceneObjects />

      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </>
  );
}

export default function IS() { 
  return (
    <Canvas shadows camera={{ position: [5, 5, 5], fov: 60 }}>
      <Suspense fallback={null}>
        <Environment preset="city" />
        <OrbitControls enablePan enableZoom enableRotate />
        <IntroSceneContent />
      </Suspense>
    </Canvas>
  );
}
