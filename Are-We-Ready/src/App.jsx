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

  return (
    <TimingProvider>
      <div
        id="canvas-container"
        style={{
          position: "relative",
          width: "100vw",
          height: isAboutPage ? "auto" : "100vh",
          minHeight: isAboutPage ? "100vh" : "100vh",
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
