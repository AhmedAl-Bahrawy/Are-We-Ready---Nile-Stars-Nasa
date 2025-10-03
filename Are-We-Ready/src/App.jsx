import { Routes, Route, Navigate } from "react-router-dom";
import { TimingProvider } from "./contexts/TimingContext";
import IntroScene from "./components/Scenes/IntroScene";
import Screen from "./components/Scenes/Screen"; 
import { IntroOverlay } from "./components/UI";

function App() {
  return (
    <TimingProvider>
      <Routes>
        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/Intro" />} />

        {/* Intro 3D Scene */}
        <Route path="/Intro" element={<IntroScene />} />

        {/* Simulation page (3D + DOM map + panels) */}
        <Route path="/Screen" element={<Screen />} />
      </Routes>

      {/* UI overlay that should always be visible */}
      <IntroOverlay />
    </TimingProvider>
  );
}

export default App;
