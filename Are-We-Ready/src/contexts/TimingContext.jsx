import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";

const TimingContext = createContext();

export const useTiming = () => {
  const context = useContext(TimingContext);
  if (!context) {
    throw new Error("useTiming must be used within a TimingProvider");
  }
  return context;
};

export const TimingProvider = ({ children }) => {
  const location = useLocation();
  const [timingState, setTimingState] = useState({
    canTransform: false, // Enable spaceship transform after 10s
    canSwitch: false, // Enable all interactions after 17s
    overlayVisible: true, // Overlay visibility state
    stage: "blur", // Current intro stage
    hasClicked: false, // Single click tracking
    ctaFadingOut: false, // CTA fade state
  });

  // Reset hasClicked when route changes
  useEffect(() => {
    setTimingState((prev) => ({
      ...prev,
      hasClicked: false,
      ctaFadingOut: false,
    }));
  }, [location.pathname]);

  // Centralized timing control
  useEffect(() => {
    const timers = [];

    // Stage 1: Blur with colors (4s)
    timers.push(
      setTimeout(() => {
        setTimingState((prev) => ({ ...prev, stage: "welcome" }));
      }, 4000)
    );

    // Enable spaceship transform after 10s
    timers.push(
      setTimeout(() => {
        setTimingState((prev) => ({ ...prev, canTransform: true }));
        console.log("Spaceship transform enabled");
      }, 10000)
    );

    // Start overlay fade after 10s (normal timing)
    timers.push(
      setTimeout(() => {
        setTimingState((prev) => ({ ...prev, overlayVisible: false }));
        console.log("Overlay fade started");
      }, 10000)
    );

    // Enable all interactions and show CTA after 17s
    timers.push(
      setTimeout(() => {
        setTimingState((prev) => ({
          ...prev,
          canSwitch: true,
          stage: "cta",
        }));
        console.log("All interactions enabled and CTA shown");
      }, 17000)
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  // Actions
  const handleClick = useCallback(() => {
    if (!timingState.canSwitch || timingState.hasClicked) {
      return false; // Click not allowed
    }

    setTimingState((prev) => ({
      ...prev,
      hasClicked: true,
      ctaFadingOut: true,
    }));

    // Complete intro after 1s
    setTimeout(() => {
      setTimingState((prev) => ({ ...prev, stage: "complete" }));
    }, 1000);

    return true; // Click processed
  }, [timingState.canSwitch, timingState.hasClicked]);

  const resetTiming = useCallback(() => {
    setTimingState({
      canTransform: false,
      canSwitch: false,
      overlayVisible: true,
      stage: "blur",
      hasClicked: false,
      ctaFadingOut: false,
    });
  }, []);

  const value = {
    ...timingState,
    handleClick,
    resetTiming,
  };

  return (
    <TimingContext.Provider value={value}>{children}</TimingContext.Provider>
  );
};
