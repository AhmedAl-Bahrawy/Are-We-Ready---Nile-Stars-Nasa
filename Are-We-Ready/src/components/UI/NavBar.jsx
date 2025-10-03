import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/Intro">🚀 Are We Ready?</Link>
      </div>

      {/* Mobile menu button */}
      <button className="mobile-menu" onClick={() => setIsOpen(!isOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`nav-links ${isOpen ? "active" : ""}`}>
        <Link
          to="/Intro"
          className={location.pathname === "/Intro" ? "active" : ""}
        >
          Home
        </Link>
        <Link
          to="/Simulation"
          className={location.pathname === "/Simulation" ? "active" : ""}
        >
          Simulation
        </Link>
        <Link
          to="/about"
          className={location.pathname === "/about" ? "active" : ""}
        >
          About Us
        </Link>
        <Link
          to="/contact"
          className={location.pathname === "/contact" ? "active" : ""}
        >
          Contact
        </Link>
      </div>

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nav-brand {
          font-size: 1.5rem;
          font-weight: bold;
        }

        .nav-brand a {
          color: #fff;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
        }

        .nav-links a {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .nav-links a:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }

        .nav-links a.active {
          color: #fff;
          background: rgba(136, 68, 255, 0.3);
          box-shadow: 0 0 20px rgba(136, 68, 255, 0.2);
        }

        .mobile-menu {
          display: none;
          flex-direction: column;
          gap: 6px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px;
        }

        .mobile-menu span {
          display: block;
          width: 25px;
          height: 2px;
          background-color: white;
          transition: all 0.3s ease;
        }

        @media (max-width: 768px) {
          .mobile-menu {
            display: flex;
          }

          .nav-links {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            flex-direction: column;
            background: rgba(0, 0, 0, 0.95);
            padding: 1rem;
            gap: 0.5rem;
          }

          .nav-links.active {
            display: flex;
          }

          .nav-links a {
            padding: 1rem;
            text-align: center;
          }
        }
      `}</style>
    </nav>
  );
}

export default NavBar;
