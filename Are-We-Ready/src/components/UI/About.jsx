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
          <h1 className="about-title">ABOUT – ARE WE READY?</h1>
          <p className="about-subtitle">
            Presented by Nile Stars – Making Space Science Accessible
          </p>
        </div>

        {/* Mission Section */}
        <section className="about-section">
          <h2 className="section-title">Our Mission</h2>
          <p className="section-text">
            Near-Earth asteroids are a real risk, yet most people know very
            little about them. Scientific data often stays limited to experts,
            creating a gap between research and public awareness. 
            Our mission is to close this gap by making asteroid science and
            planetary defense simple, engaging, and accessible to everyone.
          </p>
        </section>

        {/* The Challenge & Our Solution */}
        <section className="about-section">
          <h2 className="section-title">The Challenge</h2>
          <p className="section-text">
            People are not fully aware of the danger posed by near-Earth
            asteroids. These objects can cause real damage to life on Earth,
            yet information often feels distant and hard to understand.
          </p>
          <h2 className="section-title">Our Solution</h2>
          <p className="section-text">
            We created an interactive simulator designed for all audiences –
            students, teachers, researchers, and the general public. Using real
            NASA data, visual storytelling, and hands-on experiments, the
            platform transforms complex science into an exciting and practical
            experience.
          </p>
        </section>

        {/* Features Grid */}
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🎮</span>
            <h3 className="feature-title">For Students</h3>
            <p className="feature-description">
              Learn through fun games, animations, and stories that make
              asteroid science exciting and easy to understand.
            </p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">👩‍🏫</span>
            <h3 className="feature-title">For Teachers & Researchers</h3>
            <p className="feature-description">
              Access real NASA data, accurate simulations, and analysis tools
              for education, research, and science communication.
            </p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">🌍</span>
            <h3 className="feature-title">For Everyone</h3>
            <p className="feature-description">
              Enjoy a simple interface with clear visuals and experiments that
              make asteroid science accessible to all.
            </p>
          </div>
        </div>

        {/* Recommendations Section */}
        <section className="about-section">
          <h2 className="section-title">Future Recommendations</h2>
          <ul className="section-text">
            <li>⚡ Automated Alerts – Connect to real-time NASA NEO APIs to notify users about hazardous objects.</li>
            <li>🌐 Multilingual Support – Provide interface and explanations in multiple languages (e.g., English, Arabic).</li>
            <li>🔬 Energy Calculator – Allow users to calculate the energy needed to stop a meteor based on its size, density, and speed.</li>
            <li>📊 Integration – Use NASA Planetary Data, USGS Earthquake, and Tsunami data for advanced real-world scenarios.</li>
          </ul>
        </section>

        {/* Team Section */}
        <section className="team-section">
          <h2 className="section-title">About Nile Stars</h2>
          <div className="team-info">
            <p>
              This project is developed by Nile Stars, a passionate team of
              innovators dedicated to bridging the gap between science and
              society. We believe that knowledge about our universe should be
              open, engaging, and useful to everyone.
            </p>
          </div>
        </section>

        {/* Call to Action */}
        <div className="about-cta">
          <Link to="/Intro" className="cta-button">
            Explore the Simulator
          </Link>
        </div>
      </div>
    </div>
  );
}

export default About;
