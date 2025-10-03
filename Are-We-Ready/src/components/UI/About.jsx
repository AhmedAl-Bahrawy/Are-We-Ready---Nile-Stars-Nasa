import { Link } from "react-router-dom";
import "./About.css";

function About() {
  return (
    <div className="about-page">
      {/* Animated Background */}
      <div className="about-background">
        <div className="about-stars"></div>
        <div className="about-orb about-orb-1"></div>
        <div className="about-orb about-orb-2"></div>
        <div className="about-orb about-orb-3"></div>
      </div>

      {/* Main Content */}
      <div className="about-content">
        {/* Hero Section */}
        <div className="about-hero">
          <h1 className="about-title">ABOUT COSMIC</h1>
          <p className="about-subtitle">
            Exploring the Universe, One Simulation at a Time
          </p>
        </div>

        {/* Mission Section */}
        <section className="about-section">
          <h2 className="section-title">Our Mission</h2>
          <p className="section-text">
            Welcome to Cosmic, an immersive space exploration platform that
            brings the wonders of the universe to your fingertips. Our mission
            is to make space science accessible, engaging, and educational for
            everyone.
          </p>
          <p className="section-text">
            Through cutting-edge 3D visualizations and real-time simulations, we
            provide an interactive journey through meteor impacts, celestial
            mechanics, and the vast mysteries of space. Whether you're a
            student, educator, or space enthusiast, Cosmic offers an
            unparalleled experience in understanding our universe.
          </p>
        </section>

        {/* Features Grid */}
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🌌</span>
            <h3 className="feature-title">Real-Time Simulations</h3>
            <p className="feature-description">
              Experience accurate physics-based simulations of meteor impacts,
              orbital mechanics, and celestial phenomena in stunning 3D
              graphics.
            </p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">🎓</span>
            <h3 className="feature-title">Educational Content</h3>
            <p className="feature-description">
              Learn about space science through interactive visualizations and
              detailed information about astronomical events and their effects.
            </p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">🚀</span>
            <h3 className="feature-title">Interactive Experience</h3>
            <p className="feature-description">
              Control simulations, adjust parameters, and explore different
              scenarios to understand the dynamics of space in an engaging way.
            </p>
          </div>
        </div>

        {/* Technology Section */}
        <section className="about-section">
          <h2 className="section-title">Powered by Modern Technology</h2>
          <p className="section-text">
            Cosmic is built using cutting-edge web technologies including React,
            Three.js, and WebGL to deliver smooth, responsive, and visually
            stunning experiences across all devices.
          </p>
          <p className="section-text">
            Our platform leverages real astronomical data and physics
            calculations to ensure accuracy while maintaining an intuitive and
            beautiful user interface.
          </p>
        </section>

        {/* Team Section */}
        <section className="team-section">
          <h2 className="section-title">Built with Passion</h2>
          <div className="team-info">
            <p>
              Cosmic is developed by a team passionate about space exploration
              and education. We believe that understanding our universe should
              be accessible to everyone, and we're committed to creating tools
              that inspire curiosity and learning.
            </p>
          </div>
        </section>

        {/* Call to Action */}
        <div className="about-cta">
          <Link to="/Intro" className="cta-button">
            Start Your Journey
          </Link>
        </div>
      </div>
    </div>
  );
}

export default About;
