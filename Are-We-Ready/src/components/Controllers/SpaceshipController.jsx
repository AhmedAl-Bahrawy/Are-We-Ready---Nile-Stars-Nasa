// components/SpaceshipController.jsx
import React, { forwardRef, useMemo, useState, useRef, useEffect } from "react";
import { SolarSystemPathCurve, PathVisualizer } from "../Objects";
import { useTiming } from "../../contexts/TimingContext";
import { useNavigate } from "react-router-dom";
import { useGLTF } from "@react-three/drei";
import { useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CameraController } from "./";

const LINE_NB_POINTS = 100000;

// Motion parameters
const ACCELERATION = 25; // units per second²
const DECELERATION = 35; // units per second² (faster decel for smooth stops)
const WAIT_TIME = 1.5; // seconds to wait before starting
const STOP_DURATION = 5; // seconds to pause at each text point
const DECEL_DISTANCE = 15; // distance before stop point to start decelerating

// ⚙️ CONFIGURE YOUR STOP INDICES HERE
const STOP_INDICES = [];

// Function to extract and sort Empty objects from nodes
const extractSortedEmptyObjects = (nodes) => {
  if (!nodes) {
    console.error("❌ extractSortedEmptyObjects: nodes is null or undefined");
    return [];
  }

  const emptyEntries = Object.entries(nodes)
    .filter(([name]) => /^Empty\d{3}$/.test(name))
    .sort((a, b) => {
      const numA = parseInt(a[0].replace("Empty", ""), 10);
      const numB = parseInt(b[0].replace("Empty", ""), 10);
      return numA - numB;
    });

  if (emptyEntries.length > 0) {
    console.log(
      "🗺️ Found waypoints:",
      emptyEntries.map(([name]) => name).join(" → ")
    );
    console.log("📊 Total waypoints:", emptyEntries.length);
  } else {
    console.warn("⚠️ No Empty objects found in nodes");
  }

  return emptyEntries;
};

const SpaceshipController = forwardRef(({ children, onMouseDown }, ref) => {
  // Core hooks
  const { canTransform, handleClick } = useTiming();
  const navigate = useNavigate();

  // Load 3D assets and setup curve
  const { nodes } = useGLTF("Models/SolarSystem.glb");
  const curve = useMemo(
    () =>
      SolarSystemPathCurve({
        solarSystemScale: 15,
        tension: 0.5,
        closed: false,
      }),
    []
  );

  // Memoized curve length
  const curveLength = useMemo(() => {
    const length = curve.getLength();
    console.log("📏 Curve length:", length);
    return length;
  }, [curve]);

  // Initialize all refs before state dependencies
  const progress = useRef(0);
  const motionState = useRef({
    phase: "waiting",
    currentSpeed: 0,
    targetSpeed: 75,
    maxSpeed: 75,
    stopTimer: 0,
    waitTimer: 0,
    currentStopIndex: 0,
    nextStopProgress: null,
  });

  // Temporary vectors for calculations
  const tmpA = useMemo(() => new THREE.Vector3(), []);
  const tmpB = useMemo(() => new THREE.Vector3(), []);
  const tmpC = useMemo(() => new THREE.Vector3(), []);

  // Calculate stop points from waypoints
  const stopPointsData = useMemo(() => {
    console.log("🔄 Calculating stop points...");

    if (!nodes) {
      console.error("❌ stopPointsData: nodes is null");
      return [];
    }

    const waypoints = extractSortedEmptyObjects(nodes);
    const totalPoints = waypoints.length;

    if (totalPoints === 0) {
      console.warn("⚠️ No waypoints found, cannot create stop points");
      return [];
    }

    console.log("🎯 Creating stop points for indices:", STOP_INDICES);

    // Create stop points at specific waypoint indices
    const stops = [];
    waypoints.forEach(([name, node], index) => {
      if (STOP_INDICES.includes(index)) {
        const stopProgress = index / (totalPoints - 1);
        stops.push({
          name,
          index,
          progress: stopProgress,
          position: node.position ? node.position.clone() : null,
        });
        console.log(
          `  ✅ Stop ${
            stops.length - 1
          }: Index ${index} (${name}) at progress ${stopProgress.toFixed(4)}`
        );
      }
    });

    if (stops.length === 0) {
      console.warn(
        "⚠️ No stop points created! Check if STOP_INDICES match waypoint indices"
      );
      console.log(
        "Available waypoint indices:",
        waypoints.map((_, idx) => idx)
      );
    } else {
      console.log(
        `🛑 Generated ${stops.length} stop points:`,
        stops.map((s) => `${s.index}@${s.progress.toFixed(3)}`).join(", ")
      );
    }

    return stops;
  }, [nodes]);

  // State management that depends on stopPointsData
  const [gameMode, setGameMode] = useState("overview");
  const [canMove, setCanMove] = useState(false);

  const handleMouseDownEvent = useCallback(
    (e) => {
      if (e.button === 0) {
        const clickProcessed = handleClick();
        if (clickProcessed) {
          setGameMode((prev) => {
            const newMode = prev === "follow" ? "overview" : "follow";
            console.log("🎮 Camera mode switched to:", newMode);
            return newMode;
          });
        }
      }
      if (onMouseDown) {
        onMouseDown(e);
      }
    },
    [onMouseDown, handleClick]
  );

  useEffect(() => {
    window.addEventListener("mousedown", handleMouseDownEvent);
    return () => window.removeEventListener("mousedown", handleMouseDownEvent);
  }, [handleMouseDownEvent]);

  useEffect(() => {
    console.log("🎮 Game mode changed to:", gameMode);

    if (gameMode === "overview") {
      setCanMove(false);
      console.log("📷 Overview mode: Movement disabled");
    } else if (gameMode === "follow") {
      setCanMove(true);
      console.log("🚀 Follow mode: Movement enabled");

      // Reset motion state when entering follow mode
      const firstStopProgress = stopPointsData[0]?.progress ?? null;
      motionState.current = {
        phase: "waiting",
        currentSpeed: 0,
        targetSpeed: 75,
        maxSpeed: 50,
        stopTimer: 0,
        waitTimer: 0,
        currentStopIndex: 0,
        nextStopProgress: firstStopProgress,
      };
      progress.current = 0;

      console.log("🔄 Motion state reset:");
      console.log("  - First stop progress:", firstStopProgress);
      console.log("  - Total stops:", stopPointsData.length);
    } else if (gameMode === "free") {
      setCanMove(false);
      console.log("🆓 Free mode: Movement disabled");
    }
  }, [gameMode, stopPointsData]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "c" || e.key === "C") {
        setGameMode((prev) => (prev === "free" ? "overview" : "free"));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useFrame((_state, delta) => {
    if (!ref.current || !canTransform) return;

    // Overview mode animation
    if (!canMove) {
      ref.current.position.lerp(new THREE.Vector3(0, 100, -7), 0.02);
      if (
        ref.current.position.distanceTo(new THREE.Vector3(0, 100, -7)) < 0.1
      ) {
        ref.current.rotation.y += 2 * delta;
      }
      return;
    }

    // Follow mode movement
    const motion = motionState.current;
    const currentProgress = progress.current;

    // === PHASE 1: WAITING (Initial 1.5 second delay) ===
    if (motion.phase === "waiting") {
      motion.waitTimer += delta;
      if (motion.waitTimer >= WAIT_TIME) {
        motion.phase = "accelerating";
        motion.nextStopProgress = stopPointsData[0]?.progress ?? null;
        console.log("🚀 Journey started! Accelerating...");
        console.log("  - Next stop progress:", motion.nextStopProgress);
        console.log("  - Stop index:", motion.currentStopIndex);
      }
      return; // Don't move during wait
    }

    // === PHASE 2: STOPPED AT TEXT POINT ===
    if (motion.phase === "stopped") {
      motion.stopTimer += delta;

      // Log stop status every second
      if (
        Math.floor(motion.stopTimer) !== Math.floor(motion.stopTimer - delta)
      ) {
        console.log(
          `⏸️ Stopped at waypoint ${
            stopPointsData[motion.currentStopIndex]?.index
          } (${motion.stopTimer.toFixed(1)}/${STOP_DURATION}s)`
        );
      }

      if (motion.stopTimer >= STOP_DURATION) {
        motion.phase = "accelerating";
        motion.currentStopIndex++;

        // Check if there are more stops
        if (motion.currentStopIndex < stopPointsData.length) {
          motion.nextStopProgress =
            stopPointsData[motion.currentStopIndex]?.progress ?? null;
          motion.stopTimer = 0;
          console.log(
            `✅ Continuing journey from stop ${motion.currentStopIndex - 1}`
          );
          console.log(
            `  - Next stop: Index ${
              stopPointsData[motion.currentStopIndex]?.index
            } at progress ${motion.nextStopProgress?.toFixed(4)}`
          );
        } else {
          motion.nextStopProgress = null;
          motion.stopTimer = 0;
          console.log("🏁 All stops completed! Continuing to end...");
        }
      }
      return; // Don't move while stopped
    }

    // Calculate distance to next stop point
    let distanceToStop = Infinity;
    if (motion.nextStopProgress !== null) {
      const progressDistance =
        (motion.nextStopProgress - currentProgress) * curveLength;
      distanceToStop = Math.max(0, progressDistance);

      // Log approach to stop point
      if (
        distanceToStop < DECEL_DISTANCE * 2 &&
        motion.phase !== "decelerating"
      ) {
        console.log(`📍 Approaching stop ${motion.currentStopIndex}:`);
        console.log(`  - Current progress: ${currentProgress.toFixed(4)}`);
        console.log(`  - Stop progress: ${motion.nextStopProgress.toFixed(4)}`);
        console.log(`  - Distance: ${distanceToStop.toFixed(2)} units`);
      }
    }

    // === PHASE 3: DECELERATION (Smooth slowdown before stop) ===
    if (distanceToStop < DECEL_DISTANCE && motion.nextStopProgress !== null) {
      if (motion.phase !== "decelerating") {
        motion.phase = "decelerating";
        console.log(`🛑 Decelerating for stop ${motion.currentStopIndex}`);
        console.log(`  - Current speed: ${motion.currentSpeed.toFixed(2)}`);
        console.log(`  - Distance to stop: ${distanceToStop.toFixed(2)}`);
      }

      // Smooth deceleration
      motion.currentSpeed = Math.max(
        0,
        motion.currentSpeed - DECELERATION * delta
      );

      // Check if we've reached the stop point
      if (distanceToStop < 0.5 || motion.currentSpeed < 1) {
        motion.currentSpeed = 0;
        motion.phase = "stopped";
        progress.current = motion.nextStopProgress; // Snap to exact stop point
        console.log(
          `🔴 STOPPED at waypoint ${
            stopPointsData[motion.currentStopIndex]?.index
          }`
        );
        console.log(`  - Final progress: ${progress.current.toFixed(4)}`);
        console.log(`  - Speed: ${motion.currentSpeed.toFixed(2)}`);
        return;
      }
    }
    // === PHASE 4: ACCELERATION (Smooth start) ===
    else if (motion.phase === "accelerating") {
      motion.currentSpeed = Math.min(
        motion.maxSpeed,
        motion.currentSpeed + ACCELERATION * delta
      );

      // Switch to cruising when max speed reached
      if (motion.currentSpeed >= motion.maxSpeed) {
        motion.phase = "cruising";
        console.log("✈️ Cruising at max speed:", motion.maxSpeed);
      }
    }
    // === PHASE 5: CRUISING (Constant speed) ===
    else if (motion.phase === "cruising") {
      motion.currentSpeed = motion.maxSpeed;
    }

    // Update position along curve
    if (curveLength > 0 && motion.currentSpeed > 0) {
      const oldProgress = progress.current;
      progress.current += (motion.currentSpeed * delta) / curveLength;

      // Log significant progress changes
      if (
        Math.floor(progress.current * 100) !== Math.floor(oldProgress * 100)
      ) {
        console.log(
          `📊 Progress: ${(progress.current * 100).toFixed(
            1
          )}% | Speed: ${motion.currentSpeed.toFixed(1)} | Phase: ${
            motion.phase
          }`
        );
      }
    }

    // Clamp progress to curve bounds
    progress.current = THREE.MathUtils.clamp(progress.current, 0, 1);

    // If progress is full, move to Simulation page
    if (progress.current >= 1) {
      console.log("🏁 Journey complete! Navigating to Simulation...");
      navigate("/Simulation");
    }

    // Get position and tangent from curve
    const u = progress.current;
    curve.getPointAt(u, tmpA);
    curve.getTangentAt(u, tmpB);

    // Smooth position interpolation
    ref.current.position.lerp(tmpA, Math.min(delta * 60, 1));

    // Smooth rotation with look-ahead
    const eps = 1e-4;
    const uNext = THREE.MathUtils.clamp(u + eps, 0, 1);
    curve.getTangentAt(uNext, tmpC);

    const targetQ = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      tmpC.clone().normalize()
    );
    ref.current.quaternion.slerp(targetQ, Math.min(delta * 8, 1));
  });

  return (
    <>
      <CameraController spaceshipRef={ref} mode={gameMode} />
      <mesh ref={ref} scale={0.5}>
        {children}
      </mesh>
      <PathVisualizer curve={curve} lineNbPoints={LINE_NB_POINTS} />
    </>
  );
});

SpaceshipController.displayName = "SpaceshipController";

export default SpaceshipController;
