import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

/**
 * SolarSystemPathCurve - Generates a smooth curve path for the spaceship journey
 *
 * PURPOSE:
 * Creates a navigable path around the solar system using Empty object positions
 * from the Blender scene. The spaceship will follow this curve to explore the
 * solar system in a cinematic journey.
 *
 * BLENDER SETUP:
 * - Empty objects are placed in Blender as waypoints (Empty.000, Empty.001, etc.)
 * - In the GLTF export, these become "Empty000", "Empty001", etc.
 * - The solar system is scaled 15x in the scene, so positions are scaled accordingly
 *
 * PROGRESSION:
 * The path follows the numerical order: 000 → 001 → 002 → ... → end
 * No explicit loop is created, but the curve can be extended by adding more Empties
 *
 * @param {number} solarSystemScale - Scale factor applied to solar system (default: 15)
 * @param {number} tension - Curve tension for smoothness (0 = sharp, 1 = very smooth)
 * @param {boolean} closed - Whether the curve should loop back to start
 * @returns {THREE.CatmullRomCurve3} - Smooth curve through all waypoint positions
 */

const url =
  "https://cdn.jsdelivr.net/gh/AhmedAl-Bahrawy/Are-We-Ready---Nile-Stars-Nasa-Models@main/SolarSystem.glb";

export default function SolarSystemPathCurve({
  solarSystemScale = 15,
  tension = 0.5,
  closed = false,
} = {}) {
  // Load the Solar System GLTF to extract Empty object positions
  const { nodes } = useGLTF(url);

  // Extract all Empty objects and sort them numerically
  const emptyObjects = extractSortedEmptyObjects(nodes);

  if (emptyObjects.length === 0) {
    console.warn(
      "⚠️ No Empty objects found in Solar System. Using fallback points."
    );
    return createFallbackCurve(solarSystemScale, tension, closed);
  }

  // Extract positions and apply solar system scale
  const scaledPoints = emptyObjects.map((emptyObj) => {
    const worldPosition = new THREE.Vector3();

    // Get the world position of the empty object
    if (emptyObj.position) {
      worldPosition.copy(emptyObj.position);
    }

    // Apply the 15x scale to match the solar system scaling in SceneObjects.jsx
    worldPosition.multiplyScalar(solarSystemScale);

    return worldPosition;
  });

  console.log(
    `✅ Solar System Path: Generated curve with ${scaledPoints.length} waypoints`
  );
  console.log(
    `📍 Journey progression: Empty000 → Empty${String(
      scaledPoints.length - 1
    ).padStart(3, "0")}`
  );

  // Create smooth curve using Catmull-Rom interpolation
  // This provides natural, flowing motion between waypoints
  return new THREE.CatmullRomCurve3(
    scaledPoints,
    closed,
    "catmullrom",
    tension
  );
}

/**
 * Extracts and sorts Empty objects from the GLTF nodes
 *
 * @param {Object} nodes - GLTF nodes object from useGLTF
 * @returns {Array} - Sorted array of Empty objects
 */
function extractSortedEmptyObjects(nodes) {
  // Find all objects with names like "Empty000", "Empty001", etc.
  const emptyEntries = Object.entries(nodes).filter(([name]) =>
    /^Empty\d{3}$/.test(name)
  );

  // Sort by the numeric suffix to ensure correct progression
  emptyEntries.sort((a, b) => {
    const numA = parseInt(a[0].replace("Empty", ""), 10);
    const numB = parseInt(b[0].replace("Empty", ""), 10);
    return numA - numB;
  });

  // Log the found waypoints for debugging
  if (emptyEntries.length > 0) {
    console.log(
      "🗺️ Found waypoints:",
      emptyEntries.map(([name]) => name).join(" → ")
    );
  }

  return emptyEntries.map(([, obj]) => obj);
}

/**
 * Creates a fallback curve if no Empty objects are found
 * This ensures the app doesn't break if the GLTF export is missing waypoints
 *
 * @param {number} scale - Scale factor
 * @param {number} tension - Curve tension
 * @param {boolean} closed - Whether to close the curve
 * @returns {THREE.CatmullRomCurve3} - Fallback curve
 */
function createFallbackCurve(scale, tension, closed) {
  console.log(
    "🔄 Using fallback curve - add Empty objects to Solar_System.glb"
  );

  // Simple circular path around the solar system as fallback
  const fallbackPoints = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(50, 10, 50),
    new THREE.Vector3(0, 20, 100),
    new THREE.Vector3(-50, 10, 50),
    new THREE.Vector3(0, 0, 0),
  ].map((p) => p.multiplyScalar(scale));

  return new THREE.CatmullRomCurve3(
    fallbackPoints,
    closed,
    "catmullrom",
    tension
  );
}

// Preload the GLTF file for better performance
useGLTF.preload(url);
