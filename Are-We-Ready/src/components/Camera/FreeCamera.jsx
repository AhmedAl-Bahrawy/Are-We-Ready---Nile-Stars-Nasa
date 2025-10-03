import React, { useRef, useEffect } from "react";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";

export default function FreeCamera({ active = false, shipPosition }) {
  const cameraRef = useRef();

  useEffect(() => {
    if (active && cameraRef.current && shipPosition) {
      cameraRef.current.position.set(...shipPosition);
    }
  }, [active, shipPosition]);

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault={active}
        position={shipPosition || [0, 5, 15]}
        fov={60}
        near={0.1}
        far={5000}
      />
      {active && (
        <OrbitControls
          makeDefault={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={2.5}
          zoomSpeed={2.5}
          panSpeed={2.5}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={0.1}
          maxDistance={100000}
          minAzimuthAngle={-Infinity}
          maxAzimuthAngle={Infinity}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
        />
      )}
    </>
  );
}
