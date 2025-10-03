import React, { useEffect } from "react";
import { useTiming } from "../../contexts/TimingContext";

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

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
          .intro-overlay-container{
          width: 100vw;
            height: 100vh;
          }

        @keyframes fadeOutScale {
          from { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
          to { 
            opacity: 0; 
            transform: translateY(50px) scale(0.8); 
          }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @keyframes float-up {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }

        @keyframes nebula-flow {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.3; }
          33% { transform: translate(50px, -50px) scale(1.2) rotate(120deg); opacity: 0.5; }
          66% { transform: translate(-50px, 50px) scale(0.9) rotate(240deg); opacity: 0.4; }
        }

        @keyframes colorShift {
          0% { filter: hue-rotate(0deg) brightness(1); }
          50% { filter: hue-rotate(180deg) brightness(1.2); }
          100% { filter: hue-rotate(360deg) brightness(1); }
        }

        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }

        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.8) translateY(30px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* Opacity-only to avoid overriding centering transform */
        @keyframes fadeInOpacity {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInBottom {
          from { opacity: 0; transform: translateY(100px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        @keyframes rotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes blink-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.8); }
        }

        @keyframes scroll-wheel {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(8px); opacity: 0; }
        }

        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }

        .intro-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999;
          overflow: hidden;
          background: radial-gradient(ellipse at center, #0a0015 0%, #000000 100%);
          transition: opacity 0.8s ease-out;
        }

        .intro-overlay.fade-out {
          opacity: 0;
          pointer-events: none;
          transition: opacity 1s ease-out;
        }

        /* Space Background */
        .space-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        /* Stars Layers */
        .stars-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(2px 2px at 20px 30px, white, transparent),
            radial-gradient(2px 2px at 60px 70px, white, transparent),
            radial-gradient(1px 1px at 50px 50px, white, transparent),
            radial-gradient(1px 1px at 130px 80px, white, transparent),
            radial-gradient(2px 2px at 90px 10px, white, transparent);
          background-size: 200px 200px;
          animation: twinkle 3s infinite;
        }

        .stars-small {
          background-size: 250px 250px;
          opacity: 0.7;
        }

        .stars-medium {
          background-size: 350px 350px;
          opacity: 0.5;
          animation-delay: -1s;
        }

        .stars-large {
          background-size: 450px 450px;
          opacity: 0.3;
          animation-delay: -2s;
        }

        /* Color Orbs - Enhanced */
        .color-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.4;
          animation: nebula-flow 25s infinite ease-in-out, colorShift 20s infinite linear;
          pointer-events: none;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, #8844ff, transparent);
          top: 5%;
          left: 5%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, #ff44aa, transparent);
          top: 50%;
          right: 10%;
          animation-delay: -8s;
        }

        .orb-3 {
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, #44ccff, transparent);
          bottom: 15%;
          left: 25%;
          animation-delay: -16s;
        }

        .orb-4 {
          width: 550px;
          height: 550px;
          background: radial-gradient(circle, #44ffaa, transparent);
          top: 30%;
          right: 35%;
          animation-delay: -12s;
        }

        .orb-5 {
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, #ffaa44, transparent);
          bottom: 5%;
          right: 15%;
          animation-delay: -4s;
        }

        .orb-6 {
          width: 520px;
          height: 520px;
          background: radial-gradient(circle, #aa44ff, transparent);
          top: 60%;
          left: 40%;
          animation-delay: -20s;
        }

        /* Nebula Effects */
        .nebula-effect {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.2;
          mix-blend-mode: screen;
          animation: nebula-flow 30s infinite ease-in-out;
        }

        .nebula-1 {
          width: 800px;
          height: 400px;
          background: linear-gradient(45deg, #8844ff, #ff44aa);
          top: 20%;
          left: -10%;
          animation-delay: -5s;
        }

        .nebula-2 {
          width: 600px;
          height: 600px;
          background: linear-gradient(135deg, #44ccff, #44ffaa);
          bottom: 10%;
          right: -15%;
          animation-delay: -15s;
        }

        .nebula-3 {
          width: 700px;
          height: 350px;
          background: linear-gradient(90deg, #ff44aa, #ffaa44);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -25s;
        }

        /* Scanline Effect */
        .scanlines {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, 0.02) 2px,
            rgba(255, 255, 255, 0.02) 4px
          );
          pointer-events: none;
          animation: scan 8s linear infinite;
          opacity: 0.3;
        }

        /* Particles */
        .particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
          animation: float-up 7s infinite linear;
        }

        /* Welcome Container */
        .welcome-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          z-index: 10;
          animation: fadeInOpacity 1.2s ease-out;
        }

        /* Logo */
        .logo-container {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto 3rem;
          animation: fadeInScale 1s ease-out;
        }

        .logo-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border: 2px solid;
          border-radius: 50%;
          animation: pulse-ring 2s infinite;
        }

        .ring-1 {
          width: 80px;
          height: 80px;
          border-color: rgba(136, 68, 255, 0.8);
          animation-delay: 0s;
        }

        .ring-2 {
          width: 100px;
          height: 100px;
          border-color: rgba(255, 68, 170, 0.6);
          animation-delay: 0.5s;
        }

        .ring-3 {
          width: 120px;
          height: 120px;
          border-color: rgba(68, 204, 255, 0.4);
          animation-delay: 1s;
        }

        .logo-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 3rem;
          animation: rotate 20s linear infinite;
          filter: drop-shadow(0 0 20px rgba(136, 68, 255, 0.8));
        }

        /* Welcome Title */
        .welcome-title {
          font-size: 6rem;
          font-weight: 900;
          margin: 0 0 2rem 0;
          letter-spacing: 0.3em;
          animation: fadeInScale 1s ease-out 0.5s backwards;
        }

        .glitch-text {
          position: relative;
          color: white;
          text-shadow: 
            0 0 10px rgba(136, 68, 255, 1),
            0 0 20px rgba(136, 68, 255, 0.8),
            0 0 40px rgba(255, 68, 170, 0.6),
            0 0 80px rgba(68, 204, 255, 0.4),
            0 0 120px rgba(68, 204, 255, 0.2);
          animation: glitch 3s infinite;
        }

        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .glitch-text::before {
          animation: glitch 2.5s infinite;
          color: rgba(136, 68, 255, 0.8);
          z-index: -1;
        }

        .glitch-text::after {
          animation: glitch 2s reverse infinite;
          color: rgba(255, 68, 170, 0.8);
          z-index: -2;
        }

        /* Subtitle */
        .subtitle-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 2rem;
          animation: fadeInScale 1s ease-out 1s backwards;
        }

        .line-decorator {
          width: 100px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #8844ff, transparent);
          box-shadow: 0 0 10px rgba(136, 68, 255, 0.8);
        }

        .subtitle {
          font-size: 1.5rem;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.9);
          letter-spacing: 0.4em;
          text-transform: uppercase;
        }

        /* Tagline */
        .tagline {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          margin-top: 2rem;
        }

        .tagline-word {
          display: inline-block;
          background: linear-gradient(135deg, #8844ff, #ff44aa, #44ccff);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 30px rgba(136, 68, 255, 0.5);
          filter: drop-shadow(0 0 20px rgba(136, 68, 255, 0.5));
        }

        .word-1 {
          animation: fadeInScale 1s ease-out 1.5s backwards;
        }

        .word-2 {
          animation: fadeInScale 1s ease-out 2s backwards;
        }

        .word-3 {
          animation: fadeInScale 1s ease-out 2.5s backwards;
        }

        /* CTA Standalone - NO OVERLAY, shows with Canvas */
        .cta-standalone {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 4rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          z-index: 9998;
          pointer-events: all;
          cursor: pointer;
          animation: slideInBottom 1.2s ease-out;
          transition: opacity 1s ease-out, transform 1s ease-out;
        }

        .cta-standalone.cta-fade-out {
          animation: fadeOutScale 1s ease-out forwards;
        }

        .cta-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          pointer-events: none;
        }

        /* Mouse Icon */
        .mouse-icon {
          width: 32px;
          height: 50px;
          display: flex;
          justify-content: center;
          padding-top: 10px;
          animation: fadeInScale 1s ease-out;
        }

        .mouse-body {
          width: 32px;
          height: 50px;
          border: 3px solid rgba(255, 255, 255, 0.8);
          border-radius: 16px;
          position: relative;
          box-shadow: 
            0 0 20px rgba(136, 68, 255, 0.6),
            inset 0 0 10px rgba(136, 68, 255, 0.3);
        }

        .mouse-wheel {
          width: 4px;
          height: 10px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 2px;
          margin: 0 auto;
          animation: scroll-wheel 2s infinite;
          box-shadow: 0 0 10px rgba(136, 68, 255, 0.8);
        }

        /* CTA Text */
        .cta-text-main {
          font-size: 1.8rem;
          font-weight: 600;
          color: white;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          text-shadow: 
            0 0 10px rgba(136, 68, 255, 0.8),
            0 0 20px rgba(255, 68, 170, 0.6),
            0 0 30px rgba(68, 204, 255, 0.4);
          animation: fadeInScale 1s ease-out 0.3s backwards;
          margin: 0;
        }

        /* Indicator Dots */
        .cta-indicator {
          display: flex;
          gap: 1rem;
          animation: fadeInScale 1s ease-out 0.6s backwards;
          pointer-events: none;
        }

        .indicator-dot {
          width: 12px;
          height: 12px;
          background: rgba(136, 68, 255, 0.8);
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(136, 68, 255, 0.8);
        }

        .indicator-dot:nth-child(1) {
          animation: blink-dot 1.5s infinite;
        }

        .indicator-dot:nth-child(2) {
          animation: blink-dot 1.5s infinite 0.5s;
        }

        .indicator-dot:nth-child(3) {
          animation: blink-dot 1.5s infinite 1s;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .welcome-title {
            font-size: 3.5rem;
          }
          
          .subtitle {
            font-size: 1rem;
          }
          
          .tagline {
            font-size: 1.3rem;
            gap: 1rem;
          }
          
          .cta-text-main {
            font-size: 1.2rem;
            letter-spacing: 0.2em;
          }
          
          .line-decorator {
            width: 50px;
          }
        }

        @media (max-width: 480px) {
          .welcome-title {
            font-size: 2.5rem;
            letter-spacing: 0.2em;
          }
          
          .subtitle {
            font-size: 0.8rem;
          }
          
          .tagline {
            font-size: 1rem;
          }
          
          .cta-text-main {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default IntroOverlay;
