// components/SpaceshipController.jsx
import React, { forwardRef, useMemo } from "react";
import { SolarSystemPathCurve, PathVisualizer } from "../Objects";

const LINE_NB_POINTS = 100000;

const SpaceshipController = forwardRef(({ children }, ref) => {
  const curve = useMemo(
    () =>
      SolarSystemPathCurve({
        solarSystemScale: 15,
        tension: 0.5,
        closed: false,
      }),
    []
  );
  return (
    <>
      <group ref={ref} position={[0, 0, 0]} scale={0.5}>
        {children}
      </group>
      <PathVisualizer curve={curve} lineNbPoints={LINE_NB_POINTS} />
    </>
  );
});

SpaceshipController.displayName = "SpaceshipController";

export default SpaceshipController;
