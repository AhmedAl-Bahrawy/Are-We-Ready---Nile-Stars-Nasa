import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

export default function OverviewCamera({ spaceshipRef, active = false }) {
  const cameraRef = useRef();
  const targetPosition = new THREE.Vector3(0, 100, 0); // Higher overview position
  const targetRotation = new THREE.Euler(-Math.PI / 2, 0, 0);

  useFrame(() => {
    if (!active || !cameraRef.current) return;

    // Smoothly move camera to overview position
    cameraRef.current.position.lerp(targetPosition, 0.05);

    // If there's a ship to track, look at it, otherwise look down
    if (spaceshipRef.current) {
      cameraRef.current.lookAt(spaceshipRef.current.position);
    } else {
      const currentRotation = new THREE.Euler().setFromQuaternion(
        cameraRef.current.quaternion
      );
      currentRotation.x = THREE.MathUtils.lerp(
        currentRotation.x,
        targetRotation.x,
        0.05
      );
      currentRotation.y = THREE.MathUtils.lerp(
        currentRotation.y,
        targetRotation.y,
        0.05
      );
      currentRotation.z = THREE.MathUtils.lerp(
        currentRotation.z,
        targetRotation.z,
        0.05
      );
      cameraRef.current.setRotationFromEuler(currentRotation);
    }
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault={active}
      position={[0, 200, 0]} // Starting at the higher position
      fov={75}
      near={0.1}
      far={2000} // Increased far plane for better distance visibility
    />
  );
}
