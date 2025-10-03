import React, { useEffect } from "react";
import { useTiming } from "../../contexts/TimingContext";
import "./IntroOverlay.css";

function IntroOverlay({ onComplete, onMouseDown }) {
  // Get timing state from context
  const { stage, overlayVisible, ctaFadingOut, handleClick } = useTiming();

  // Handle intro completion when stage changes to complete
  useEffect(() => {
    if (stage === "complete") {
      console.log("Intro sequence complete");
      if (onComplete) onComplete();
    }
  }, [stage, onComplete]);

  useEffect(() => {
    const handleMouseDownEvent = (e) => {
      if (e.button === 0) {
        const clickProcessed = handleClick();
        if (clickProcessed) {
          // Click was processed by timing context
          console.log("CTA click processed");
        }

        // Call the parent's onMouseDown if provided
        if (onMouseDown) {
          onMouseDown(e);
        }
      }
    };

    window.addEventListener("mousedown", handleMouseDownEvent);
    return () => window.removeEventListener("mousedown", handleMouseDownEvent);
  }, [handleClick, onMouseDown]);

  return (
    <div className="intro-overlay-container">
      {/* Main Overlay - Shows during blur and welcome, fades out during CTA */}
      <div className={`intro-overlay ${!overlayVisible ? "fade-out" : ""}`}>
        {/* Animated Background with Stars */}
        <div className="space-background">
          <div className="stars-layer stars-small"></div>
          <div className="stars-layer stars-medium"></div>
          <div className="stars-layer stars-large"></div>

          <div className="color-orb orb-1"></div>
          <div className="color-orb orb-2"></div>
          <div className="color-orb orb-3"></div>
          <div className="color-orb orb-4"></div>
          <div className="color-orb orb-5"></div>
          <div className="color-orb orb-6"></div>

          <div className="nebula-effect nebula-1"></div>
          <div className="nebula-effect nebula-2"></div>
          <div className="nebula-effect nebula-3"></div>
        </div>

        {/* Scanline Effect */}
        <div className="scanlines"></div>

        {/* Welcome Text Stage */}
        {stage === "welcome" && (
          <div className="welcome-container" style={{}}>
            <div className="logo-container">
              <div className="logo-ring ring-1"></div>
              <div className="logo-ring ring-2"></div>
              <div className="logo-ring ring-3"></div>
              <div className="logo-center">🚀</div>
            </div>

            <h1 className="welcome-title">
              <span className="glitch-text" data-text="WELCOME">
                WELCOME
              </span>
            </h1>

            <div className="subtitle-container">
              <div className="line-decorator"></div>
              <p className="subtitle">TO THE COSMIC JOURNEY</p>
              <div className="line-decorator"></div>
            </div>

            <p className="tagline">
              <span className="tagline-word word-1">BEYOND</span>
              <span className="tagline-word word-2">THE</span>
              <span className="tagline-word word-3">STARS</span>
            </p>
          </div>
        )}

        {/* Particle Effects */}
        <div className="particles">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* CTA Stage - Separate, no overlay, shows with Canvas */}
      {stage === "cta" && (
        <div className={`cta-standalone ${ctaFadingOut ? "cta-fade-out" : ""}`}>
          <div className="cta-wrapper">
            <div className="mouse-icon">
              <div className="mouse-body">
                <div className="mouse-wheel"></div>
              </div>
            </div>
            <p className="cta-text-main">CLICK TO BEGIN YOUR JOURNEY</p>
          </div>
          <div className="cta-indicator">
            <div className="indicator-dot"></div>
            <div className="indicator-dot"></div>
            <div className="indicator-dot"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IntroOverlay;
