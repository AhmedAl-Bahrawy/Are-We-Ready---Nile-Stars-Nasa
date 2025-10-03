import { Spaceship, SolarSystem } from "../Models";
import { SpaceshipController } from "../Controllers";
import { forwardRef } from "react";

const IntroSceneObjects = forwardRef(({ onMouseDown }, ref) => {
  return (
    <>
      <group scale={15}>
        <SolarSystem />
      </group>
      <group>
        <SpaceshipController ref={ref} onMouseDown={onMouseDown}>
          <Spaceship />
        </SpaceshipController>
      </group>
    </>
  );
});

IntroSceneObjects.displayName = "IntroSceneObjects";

export default IntroSceneObjects;
