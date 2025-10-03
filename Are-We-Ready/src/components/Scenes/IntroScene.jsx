import { Suspense, useRef } from "react";
import { Environment } from "@react-three/drei";
import { IntroSceneObjects } from "../Objects";
import { Stars } from "@react-three/drei";
import { Nebula, Particles } from "../Effects";
import { Canvas } from "@react-three/fiber";
import { CameraController } from "../Controllers";

function IntroSceneContent({ onMouseDown }) {
  const spaceshipRef = useRef();
  return (
    <>
      <Stars
        radius={500}
        depth={60}
        count={5000}
        factor={7}
        saturation={0}
        fade
      />

      {/* Primary Purple Nebula Region - Close and Dense */}
      <Nebula
        count={5}
        minDistance={120}
        maxDistance={400}
        separationDistance={800}
        minScale={35}
        maxScale={75}
        baseColor="#8844ff"
        name="primary-purple"
        floatingSpeed={0.15}
        driftRange={80}
        rotationSpeed={0.08}
      />

      {/* Pink Nebula Region - Medium Distance */}
      <Nebula
        count={5}
        minDistance={200}
        maxDistance={600}
        separationDistance={750}
        minScale={40}
        maxScale={85}
        baseColor="#ff44aa"
        name="pink-region"
        floatingSpeed={0.25}
        driftRange={120}
        rotationSpeed={0.12}
      />

      {/* Blue Nebula Region - Distant and Sparse */}
      <Nebula
        count={5}
        minDistance={350}
        maxDistance={800}
        separationDistance={600}
        minScale={50}
        maxScale={100}
        baseColor="#44ccff"
        name="blue-distant"
        floatingSpeed={0.1}
        driftRange={150}
        rotationSpeed={0.05}
      />

      {/* Cyan Nebula Region - Wide Spread */}
      <Nebula
        count={6}
        minDistance={180}
        maxDistance={700}
        separationDistance={650}
        minScale={25}
        maxScale={65}
        baseColor="#4488ff"
        name="cyan-wide"
        floatingSpeed={0.3}
        driftRange={100}
        rotationSpeed={0.15}
      />

      {/* Magenta Nebula Region - Close Formation */}
      <Nebula
        count={6}
        minDistance={150}
        maxDistance={450}
        separationDistance={500}
        minScale={30}
        maxScale={70}
        baseColor="#aa44ff"
        name="magenta-close"
        floatingSpeed={0.2}
        driftRange={90}
        rotationSpeed={0.1}
      />

      {/* Green Nebula Region - Organic Movement */}
      <Nebula
        count={6}
        minDistance={250}
        maxDistance={650}
        separationDistance={450}
        minScale={35}
        maxScale={80}
        baseColor="#44ffaa"
        name="green-organic"
        floatingSpeed={0.18}
        driftRange={110}
        rotationSpeed={0.09}
      />

      {/* Orange Nebula Region - Large and Slow */}
      <Nebula
        count={6}
        minDistance={300}
        maxDistance={750}
        separationDistance={650}
        minScale={60}
        maxScale={120}
        baseColor="#ffaa44"
        name="orange-massive"
        floatingSpeed={0.08}
        driftRange={200}
        rotationSpeed={0.03}
      />

      {/* Red Nebula Region - Fast Moving */}
      <Nebula
        count={6}
        minDistance={160}
        maxDistance={500}
        separationDistance={460}
        minScale={20}
        maxScale={55}
        baseColor="#ff6644"
        name="red-fast"
        floatingSpeed={0.35}
        driftRange={70}
        rotationSpeed={0.18}
      />

      {/* Teal Nebula Region - Balanced */}
      <Nebula
        count={5}
        minDistance={220}
        maxDistance={580}
        separationDistance={450}
        minScale={40}
        maxScale={75}
        baseColor="#44ffcc"
        name="teal-balanced"
        floatingSpeed={0.2}
        driftRange={100}
        rotationSpeed={0.1}
      />

      {/* Violet Nebula Region - Dense Core */}
      <Nebula
        count={5}
        minDistance={140}
        maxDistance={350}
        separationDistance={400}
        minScale={25}
        maxScale={60}
        baseColor="#6644ff"
        name="violet-core"
        floatingSpeed={0.22}
        driftRange={85}
        rotationSpeed={0.11}
      />

      {/* Coral Nebula Region - Outer Rim */}
      <Nebula
        count={5}
        minDistance={400}
        maxDistance={850}
        separationDistance={650}
        minScale={70}
        maxScale={140}
        baseColor="#ff8844"
        name="coral-rim"
        floatingSpeed={0.12}
        driftRange={180}
        rotationSpeed={0.06}
      />

      {/* Lime Nebula Region - Energetic */}
      <Nebula
        count={6}
        minDistance={170}
        maxDistance={480}
        separationDistance={450}
        minScale={28}
        maxScale={68}
        baseColor="#88ff44"
        name="lime-energetic"
        floatingSpeed={0.28}
        driftRange={95}
        rotationSpeed={0.14}
      />

      <Particles count={4000} />
      <IntroSceneObjects ref={spaceshipRef} onMouseDown={onMouseDown} />
      <CameraController spaceshipRef={spaceshipRef} mode="overview" />

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

export default function IS({ onMouseDown }) {
  return (
    <Canvas>
      <Environment preset="city" />

      <Suspense fallback={null}>
        <Environment preset="city" />

        <IntroSceneContent onMouseDown={onMouseDown} />
      </Suspense>
    </Canvas>
  );
}
