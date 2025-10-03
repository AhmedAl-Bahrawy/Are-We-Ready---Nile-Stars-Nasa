import React from "react";
import { FollowCamera, OverviewCamera, FreeCamera } from "../Camera";

export default function CameraController({ spaceshipRef, mode = "follow" }) {
  // Get the ship's position for FreeCamera
  let shipPosition = [0, 5, 15];
  if (spaceshipRef && spaceshipRef.current) {
    const pos = spaceshipRef.current.position;
    shipPosition = [pos.x, pos.y, pos.z];
  }
  return (
    <>
      <group>
        <FollowCamera spaceshipRef={spaceshipRef} active={mode === "follow"} />
        <OverviewCamera
          spaceshipRef={spaceshipRef}
          active={mode === "overview"}
        />
        <FreeCamera active={mode === "free"} shipPosition={shipPosition} />
      </group>
    </>
  );
}
