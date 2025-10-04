import React, { useMemo, Fragment, forwardRef } from "react";
import { useGLTF } from "@react-three/drei";
import { FireParticles } from "../Effects";
import * as THREE from "three";
const GLTF_LOADER =
  "https://cdn.jsdelivr.net/gh/AhmedAl-Bahrawy/Are-We-Ready---Nile-Stars-Nasa-Models@main/Spaceship.glb";

const Spaceship = forwardRef((props, ref) => {
  const { nodes, materials } = useGLTF(GLTF_LOADER);

  // Memoize engine configurations to prevent re-creation
  const engineConfigs = useMemo(
    () => ({
      mainEngines: [
        {
          name: "MainEngine_Left",
          position: [-1.2, -1.4, -2.5],
          colors: {
            core: new THREE.Color(0xaaccff),
            mid: new THREE.Color(0x4488ff),
            outer: new THREE.Color(0x1144aa),
            smoke: new THREE.Color(0x002244),
          },
        },
        {
          name: "MainEngine_Right",
          position: [1.2, -1.4, -2.5],
          colors: {
            core: new THREE.Color(0xaaccff),
            mid: new THREE.Color(0x4488ff),
            outer: new THREE.Color(0x1144aa),
            smoke: new THREE.Color(0x002244),
          },
        },
      ],
      maneuveringThrusters: [
        {
          name: "Thruster_TopLeft",
          position: [-1.2, 1.4, -2.2],
          colors: {
            core: new THREE.Color(0xffffaa),
            mid: new THREE.Color(0xffaa44),
            outer: new THREE.Color(0xff8800),
            smoke: new THREE.Color(0x442200),
          },
        },
        {
          name: "Thruster_TopRight",
          position: [1.2, 1.4, -2.2],
          colors: {
            core: new THREE.Color(0xffffaa),
            mid: new THREE.Color(0xffaa44),
            outer: new THREE.Color(0xff8800),
            smoke: new THREE.Color(0x442200),
          },
        },
      ],
    }),
    []
  );

  return (
    <group {...props} ref={ref} dispose={null}>
      {/* Main spaceship mesh */}
      <mesh
        geometry={nodes.Spaceship_BarbaraTheBee?.geometry}
        material={materials.Atlas}
        scale={100}
      />
      <group>
        {/* Main Engine Exhausts - Large and Powerful */}
        {engineConfigs.mainEngines.map((engine) => (
          <Fragment key={`main-${engine.name}`}>
            <FireParticles
              position={engine.position}
              scale={1.0}
              countCore={300}
              countPlume={500}
              countSmoke={200}
              coreSize={0.1}
              plumeSize={0.15}
              smokeSize={0.25}
              nozzleRadius={0.08}
              length={3.0}
              spreadAngle={20.0 * (Math.PI / 180.0)}
              coreColor={engine.colors.core}
              midColor={engine.colors.mid}
              outerColor={engine.colors.outer}
              smokeColor={engine.colors.smoke}
              turbulence={2.0}
              buoyancy={0.3}
            />
          </Fragment>
        ))}
      </group>

      {/* Maneuvering Thrusters - Smaller and More Precise */}
      <group>
        {engineConfigs.maneuveringThrusters.map((thruster) => (
          <Fragment key={`thruster-${thruster.name}`}>
            <FireParticles
              position={thruster.position}
              scale={0.5}
              countCore={150}
              countPlume={250}
              countSmoke={100}
              coreSize={0.06}
              plumeSize={0.09}
              smokeSize={0.15}
              nozzleRadius={0.04}
              length={1.5}
              spreadAngle={18.0 * (Math.PI / 180.0)}
              coreColor={thruster.colors.core}
              midColor={thruster.colors.mid}
              outerColor={thruster.colors.outer}
              smokeColor={thruster.colors.smoke}
              coreSpeed={20.0}
              plumeSpeed={14.0}
              smokeSpeed={8.0}
            />
          </Fragment>
        ))}
      </group>

      {/* Optional: Engine glow effects */}
      {engineConfigs.mainEngines.map((engine, index) => (
        <pointLight
          key={`glow-main-${index}`}
          position={[
            engine.position[0],
            engine.position[1],
            engine.position[2] - 0.5,
          ]}
          color={engine.colors.mid}
          intensity={0.8}
          distance={3}
          decay={2}
        />
      ))}

      {engineConfigs.maneuveringThrusters.map((thruster, index) => (
        <pointLight
          key={`glow-thruster-${index}`}
          position={[
            thruster.position[0],
            thruster.position[1],
            thruster.position[2] - 0.3,
          ]}
          color={thruster.colors.mid}
          intensity={0.4}
          distance={2}
          decay={2}
        />
      ))}
    </group>
  );
});
useGLTF.preload(GLTF_LOADER);

Spaceship.displayName = "Spaceship";

export default Spaceship;
