import { Text, Float } from "@react-three/drei";
import React, { useMemo } from "react";
import SolarSystemPathCurve from "./SolarSystemPathCurve";

/**
 * TextViewer - Displays floating text labels along the solar system journey path
 *
 * PURPOSE:
 * Places informational text at key waypoints along the spaceship's journey.
 * Uses the same Empty object positions from the Blender scene.
 *
 * The text floats gently to create a dynamic, living feel to the labels.
 */
export default function TextViewer() {
  // Generate the same curve used by the spaceship
  const curve = useMemo(
    () =>
      SolarSystemPathCurve({
        solarSystemScale: 15,
        tension: 0.5,
        closed: false,
      }),
    []
  );

  const curveLength = useMemo(() => curve.getLength(), [curve]);

  // Editable config for each text label (position offset and rotation)
  const textConfigs = [
    // Example: { positionOffset: [0, 5, 0], rotation: [0, Math.PI, 0] }
    { positionOffset: [-30, 15, -25], rotation: [0, Math.PI / 2.5, 0] },
    { positionOffset: [0, 6, -10], rotation: [0, Math.PI / 1.8, 0] },
    { positionOffset: [-10, 5, 5], rotation: [0, Math.PI / 0.8, 0] },
    { positionOffset: [1, 5, 0], rotation: [-Math.PI / 3.5, Math.PI, 0] },
    { positionOffset: [0, 3, 5], rotation: [0, Math.PI, 0] },
    { positionOffset: [0, 5, -2], rotation: [0, Math.PI / 3, 0] },
    { positionOffset: [2, 5, 0], rotation: [0, Math.PI, 0] },
    { positionOffset: [0, 5, 0], rotation: [0, Math.PI / 6, 0] },
    { positionOffset: [-1, 5, 0], rotation: [0, Math.PI, 0] },
    { positionOffset: [0, 5, 1], rotation: [0, Math.PI / 1.5, 0] },
  ];

  // Get waypoint positions from the curve
  const textPositions = useMemo(() => {
    const positions = [];
    const numWaypoints = textConfigs.length;
    for (let i = 0; i < numWaypoints; i++) {
      const u = i / (numWaypoints - 1);
      const point = curve.getPointAt(u);
      positions.push(point);
    }
    return positions;
  }, [curve, textConfigs.length]);

  // Get a random point on the curve for additional text
  const randomPoint = useMemo(() => {
    const randomDistance = Math.random() * curveLength;
    const u = randomDistance / curveLength;
    return curve.getPointAt(u);
  }, [curve, curveLength]);

  return (
    <>
      {/* Text at each waypoint with editable config */}
      {textPositions.map((position, i) => {
        const config = textConfigs[i] || {
          positionOffset: [0, 5, 0],
          rotation: [0, Math.PI, 0],
        };
        const pos = [
          position.x + config.positionOffset[0],
          position.y + config.positionOffset[1],
          position.z + config.positionOffset[2],
        ];
        return (
          <group key={i} position={pos} rotation={config.rotation}>
            <Text
              color={"cyan"}
              backgroundColor={"black"}
              anchorX={"center"}
              anchorY={"middle"}
              fontSize={1}
            >
              Waypoint {String(i).padStart(3, "0")}
              {"\n"}
              Exploring the Solar System{"\n"}
              Are We Ready?
            </Text>
          </group>
        );
      })}
    </>
  );
}
