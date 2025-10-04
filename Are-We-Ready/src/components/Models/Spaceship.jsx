import React, { useMemo, Fragment, forwardRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { FireParticles } from "../Effects";
import * as THREE from "three";

// Use CDN path for the Spaceship model
const SPACESHIP_MODEL_URL = "https://cdn.jsdelivr.net/gh/AhmedAl-Bahrawy/Are-We-Ready---Nile-Stars-Nasa-Models@main/Spaceship.glb";

const Spaceship = forwardRef((props, ref) => {
  // Load the spaceship model
  const { scene, nodes, materials } = useGLTF(SPACESHIP_MODEL_URL);

  // Debug logging
  useEffect(() => {
    console.group("🚀 Spaceship Model Loading");
    console.log("Model URL:", SPACESHIP_MODEL_URL);
    console.log("Scene loaded:", !!scene);
    console.log("Available nodes:", nodes ? Object.keys(nodes) : "None");
    console.log("Available materials:", materials ? Object.keys(materials) : "None");
    console.groupEnd();
  }, [scene, nodes, materials]);

  // Log scene structure
  useEffect(() => {
    if (scene) {
      console.group("✅ Spaceship Scene Structure");
      
      const logObject = (obj, depth = 0) => {
        const prefix = "  ".repeat(depth);
        console.log(`${prefix}${obj.name || 'unnamed'} [${obj.type}]`, {
          hasGeometry: !!obj.geometry,
          hasMaterial: !!obj.material,
          children: obj.children.length
        });
        obj.children.forEach(child => logObject(child, depth + 1));
      };
      
      logObject(scene);
      console.groupEnd();
    }
  }, [scene]);

  // Memoize engine configurations
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

  // Clone the scene to avoid mutations
  const spaceshipScene = useMemo(() => {
    if (!scene) return null;
    return scene.clone();
  }, [scene]);

  if (!spaceshipScene) {
    console.error("❌ Spaceship scene not loaded");
    return null;
  }

  return (
    <group {...props} ref={ref}>
      {/* Main spaceship - using primitive with the cloned scene */}
      <primitive 
        object={spaceshipScene} 
        scale={100}
        rotation={[0, Math.PI, 0]}
      />

      {/* Main Engine Exhausts - Large and Powerful */}
      <group>
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

      {/* Engine glow effects */}
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

// Preload the model
useGLTF.preload(SPACESHIP_MODEL_URL);

Spaceship.displayName = "Spaceship";

export default Spaceship;