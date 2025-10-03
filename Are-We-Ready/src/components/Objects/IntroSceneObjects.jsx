import { Spaceship, SolarSystem } from "../Models";
import { SpaceshipController } from "../Controllers";

export default function IntroSceneObjects() {
  return (
    <>
      <group>
        <SolarSystem />
      </group>
      <group>
        <SpaceshipController>
          <Spaceship />
        </SpaceshipController>
      </group>
    </>
  );
}
