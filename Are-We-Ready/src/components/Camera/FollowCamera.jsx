import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

export default function FollowCamera({ spaceshipRef, active = true }) {
  const cameraRef = useRef();
  const offsetVector = new THREE.Vector3(0, 2, -6);
  const lookAtOffset = new THREE.Vector3(0, 0, 10);

  useFrame(() => {
    if (!active || !spaceshipRef.current || !cameraRef.current) return;

    // Get ship's world position and rotation
    const shipPosition = spaceshipRef.current.position;
    const shipQuaternion = spaceshipRef.current.quaternion;

    // Calculate camera position based on ship
    const offset = offsetVector
      .clone()
      .applyQuaternion(shipQuaternion)
      .add(shipPosition);

    // Calculate look at position based on ship
    const lookAtPos = lookAtOffset
      .clone()
      .applyQuaternion(shipQuaternion)
      .add(shipPosition);

    // Update camera
    cameraRef.current.position.lerp(offset, 0.1);
    cameraRef.current.lookAt(lookAtPos);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault={active}
      position={[0, 2, -6]}
      fov={75}
      near={0.1}
      far={1000}
    />
  );
}
