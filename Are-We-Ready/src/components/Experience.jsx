import { Routes, Route, Navigate } from "react-router-dom";
import { IntroScene, SimulationScene } from "./Scenes";

export default function Experience() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/Intro" />} />

        <Route
          path="/Intro"
          element={
            <>
              <IntroScene />
            </>
          }
        />
        <Route
          path="/Simulation"
          element={
            <>
              <SimulationScene />
            </>
          }
        />
      </Routes>
    </>
  );
}
