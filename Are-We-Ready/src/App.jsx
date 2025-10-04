import { Suspense, useCallback, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { TimingProvider } from "./contexts/TimingContext";
import { IS, SS } from "./components/Scenes";
import { IntroOverlay, NavBar, About } from "./components/UI";

function SceneContent({ onMouseDown }) {
  return (
    <Suspense fallback={null}>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/Intro" />} />
        <Route path="/Intro" element={<IS onMouseDown={onMouseDown} />} />
        <Route path="/Simulation" element={<SS onMouseDown={onMouseDown} />} />
        <Route path="/About" element={<About />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  const location = useLocation(); // هنا بنجيب ال URL الحالي
  const handleMouseDown = useCallback(() => {
    // This function will be called by both components
  }, []);

  // Toggle body class based on route
  useEffect(() => {
    if (location.pathname === "/About") {
      document.body.classList.add("about-page-active");
    } else {
      document.body.classList.remove("about-page-active");
    }

    // Cleanup
    return () => {
      document.body.classList.remove("about-page-active");
    };
  }, [location.pathname]);

  const isAboutPage = location.pathname === "/About";
  const isSimulationPage = location.pathname === "/Simulation";
  const isIntroPage = location.pathname === "/Intro";

  return (
    <TimingProvider>
      <div
        id="canvas-container"
        className="page-with-navbar"
        style={{
          position: "relative",
          width: "100vw",
          // reserve navbar height - Simulation page handles its own spacing
          paddingTop: isAboutPage || isSimulationPage ? 0 : "70px",

          height: isAboutPage
            ? "auto"
            : isSimulationPage || isIntroPage
            ? "100vh"
            : "calc(100vh - 70px)",
          minHeight: isAboutPage
            ? "100vh"
            : isSimulationPage
            ? "100vh"
            : "calc(100vh - 70px)",
          overflow: isAboutPage ? "visible" : "hidden",
        }}
      >
        <SceneContent onMouseDown={handleMouseDown} />
      </div>

      {/* IntroOverlay يظهر بس في صفحة Intro */}
      {location.pathname === "/Intro" && (
        <IntroOverlay onMouseDown={handleMouseDown} />
      )}
    </TimingProvider>
  );
}

export default App;
