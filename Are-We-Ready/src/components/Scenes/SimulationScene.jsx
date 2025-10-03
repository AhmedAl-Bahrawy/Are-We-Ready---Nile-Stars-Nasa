// SimulationScene.jsx
import React, { Suspense, useRef, useEffect } from "react";
import { OrbitControls, Stars, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function latLonToVector3(lat, lon, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return [
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

function EarthMarker({ lat, lon, size = 1 }) {
  const pos = latLonToVector3(lat, lon, 1.01);
  return (
    <mesh position={pos}>
      <sphereGeometry args={[size / 2, 16, 16]} />
      <meshStandardMaterial color="red" emissive="red" emissiveIntensity={3} />
    </mesh>
  );
}

function EarthModel({ earthRef }) {
  const { scene } = useGLTF("Models/earth.glb");

  useEffect(() => {
    if (earthRef.current) {
      const sphere = new THREE.Sphere();
      new THREE.Box3().setFromObject(earthRef.current).getBoundingSphere(sphere);
      earthRef.current.userData.boundingSphere = { radius: sphere.radius };
    }
  }, []);

  return <primitive ref={earthRef} object={scene} scale={1} />;
}

function SimulationScene({ markerLat, markerLon, explosion_radius }) {
  const earthRef = useRef();
  const markerSize = explosion_radius ? explosion_radius / 1000 : 1;

  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} />

      <Stars radius={300} depth={60} count={20000} factor={7} fade />

      <Suspense fallback={null}>
        <EarthModel earthRef={earthRef} />
        {markerLat && markerLon && (
          <EarthMarker lat={markerLat} lon={markerLon} size={markerSize} />
        )}
      </Suspense>

      <OrbitControls enableZoom enableRotate />
    </>
  );
}

useGLTF.preload("Models/earth.glb");

export default SimulationScene;
