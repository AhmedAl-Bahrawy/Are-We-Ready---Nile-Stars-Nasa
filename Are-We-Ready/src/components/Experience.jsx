import { Routes, Route, Navigate } from "react-router-dom";
import { IntroScene, SimulationScene } from "./Scenes";
import { IntroOverlay } from "./UI";
import { useTiming } from "../contexts/TimingContext";
import React, { useCallback, useEffect } from "react";

export default function Experience({ onMouseDown }) {
  const { canTransform, handleClick } = useTiming();

  const handleMouseDownEvent = useCallback(
    (e) => {
      if (e.button === 0) {
        const clickProcessed = handleClick();
        if (clickProcessed) {
          setGameMode((prev) => {
            const newMode = prev === "follow" ? "overview" : "follow";
            console.log("Camera mode switched to:", newMode);
            return newMode;
          });
        }
      }

      // Call the parent's onMouseDown if provided
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
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/Intro" />} />

        <Route path="/Intro" element={<IntroScene />} />
        <Route path="/Simulation" element={<SimulationScene />} />
      </Routes>
    </>
  );
}
