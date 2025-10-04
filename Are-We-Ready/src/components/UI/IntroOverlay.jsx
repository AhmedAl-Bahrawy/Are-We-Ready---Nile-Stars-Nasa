// IntroOverlay.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTiming } from "../../contexts/TimingContext"; // safe if you already have this context
import "./IntroOverlay.css";

/**
 * IntroOverlay component compatible with provided CSS.
 *
 * Props:
 *  - onComplete: function called when overlay reaches "complete" stage
 *  - onMouseDown: optional forwarded mouse down handler
 *
 * Behavior:
 *  - If TimingContext (useTiming) is present and returns a stage, the component follows it.
 *  - Otherwise it manages its own stages: "welcome" -> "cta" -> "complete".
 *
 * Stages:
 *  - "welcome": display welcome hero
 *  - "cta": display bottom CTA
 *  - "complete": hide component (returns null)
 */

function IntroOverlay({ onComplete, onMouseDown }) {
  // Defensive attempt to use timing context. If the context provider exists,
  // use its API. If not, we'll use internal state.
  let timing = null;
  try {
    timing = useTiming ? useTiming() : null;
  } catch (err) {
    timing = null;
  }

  // If timing context provides a stage, use it; otherwise use internal state.
  const [internalStage, setInternalStage] = useState("welcome"); // welcome -> cta -> complete
  const stage = (timing && timing.stage) || internalStage;

  // overlayVisible & ctaFadingOut can come from timing context, otherwise defaults
  const overlayVisible = (timing && typeof timing.overlayVisible !== "undefined")
    ? timing.overlayVisible
    : true;
  const ctaFadingOut = (timing && typeof timing.ctaFadingOut !== "undefined")
    ? timing.ctaFadingOut
    : false;

  // handleClick: if timing provides one, use it; otherwise use internal advance
  const handleClickFromTiming = timing && typeof timing.handleClick === "function"
    ? timing.handleClick
    : null;

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // onComplete callback when stage becomes complete
  useEffect(() => {
    if (stage === "complete" && typeof onComplete === "function") {
      onComplete();
    }
  }, [stage, onComplete]);

  // Generate deterministic particles once
  const particles = useMemo(() => {
    const arr = [];
    const count = 28;
    for (let i = 0; i < count; i++) {
      arr.push({
        id: i,
        left: ((i * 37) % 97) + 1, // deterministic distribution across width (1..98)
        top: ((i * 53) % 93) + 1,  // deterministic distribution across height (1..94)
        delay: (i % 7) * 0.18,
        dur: 5 + (i % 5) * 0.7,
      });
    }
    return arr;
  }, []);

  // Local advancement when no timing context
  const advanceInternalStage = () => {
    if (handleClickFromTiming) {
      // Let timing context handle click/advance
      try {
        handleClickFromTiming();
      } catch (e) {
        // ignore errors from timing handler
      }
      return;
    }

    // fallback progression: welcome -> cta -> complete
    setInternalStage((s) => {
      if (s === "welcome") return "cta";
      if (s === "cta") return "complete";
      return s;
    });
  };

  // Click handler for the whole overlay (for forwarding to parent + timing)
  const rootMouseDown = (e) => {
    if (typeof onMouseDown === "function") {
      try { onMouseDown(e); } catch (err) { /* ignore parent errors */ }
    }
  };

  // CTA activation via click or keyboard
  const activateCTA = () => {
    advanceInternalStage();
  };

  const onCTAKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activateCTA();
    }
  };

  // If overlay already complete, render nothing (keeps DOM clean)
  if (stage === "complete") return null;

  return (
    <div
      className="intro-overlay-container"
      onMouseDown={rootMouseDown}
      aria-hidden={stage === "complete"}
      role="region"
      aria-label="Intro overlay for Nile Stars"
    >
      <div className={`intro-overlay ${!overlayVisible ? "fade-out" : ""}`}>
        {/* Space background layers */}
        <div className="space-background" aria-hidden="true">
          <div className="stars-layer stars-small" />
          <div className="stars-layer stars-medium" />
          <div className="stars-layer stars-large" />

          <div className="color-orb orb-1" />
          <div className="color-orb orb-2" />
          <div className="color-orb orb-3" />
          <div className="color-orb orb-4" />
          <div className="color-orb orb-5" />
          <div className="color-orb orb-6" />

          <div className="nebula-effect nebula-1" />
          <div className="nebula-effect nebula-2" />
          <div className="nebula-effect nebula-3" />
        </div>

        <div className="scanlines" aria-hidden="true" />

        {/* Welcome container */}
        {stage === "welcome" && (
          <div
            className="welcome-container"
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
          >
            <div className="logo-container" aria-hidden="true">
              <div className="logo-ring ring-1" />
              <div className="logo-ring ring-2" />
              <div className="logo-ring ring-3" />
              <div className="logo-center">🛰️</div>
            </div>

            <h1 id="welcome-title" className="welcome-title glitch-text" data-text="ARE WE READY?">
              ARE WE READY?
            </h1>

            <div className="subtitle-container" aria-hidden="false">
              <div className="line-decorator" />
              <div className="subtitle">Nile Stars — Near-Earth Asteroids Simulator</div>
              <div className="line-decorator" />
            </div>

            <div className="welcome-copy">
                <p className="welcome-paragraph">
                  Near-Earth objects can threaten life and infrastructure on Earth.
                  Most people never see the data or simulations researchers use.
                  Nile Stars brings real NASA data, accurate simulations, and
                  hands-on scenarios together so students, teachers, researchers,
                  and the public can learn, prepare, and explore.
                </p>

                <div className="tagline" aria-hidden="false">
                  <span className="tagline-word word-1">Learn</span>
                  <span className="tagline-word word-2">Simulate</span>
                  <span className="tagline-word word-3">Prepare</span>
                </div>
              </div>

          </div>
        )}

        {/* CTA stage - bottom bar */}
        {stage === "cta" && (
          <div
            className={`cta-standalone ${ctaFadingOut ? "cta-fade-out" : ""}`}
            role="button"
            tabIndex={0}
            onClick={activateCTA}
            onKeyDown={onCTAKeyDown}
            aria-label="Click to start the simulator"
          >
            <div className="cta-wrapper" aria-hidden="false" style={{ pointerEvents: "none" }}>
              <div className="mouse-icon">
                <div className="mouse-body">
                  <div className="mouse-wheel" />
                </div>
              </div>

              <div className="cta-text">
                <p className="cta-text-main">CLICK TO START THE SIMULATOR</p>
                <p className="cta-sub">Explore scenarios • See real NASA data • Learn how we prepare</p>
              </div>
            </div>

            <div className="cta-indicator" aria-hidden="true">
              <div className="indicator-dot" />
              <div className="indicator-dot" />
              <div className="indicator-dot" />
            </div>
          </div>
        )}

        {/* Particles (deterministic) */}
        <div className="particles" aria-hidden="true">
          {particles.map((p) => (
            <span
              key={p.id}
              className="particle"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.dur}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default IntroOverlay;
