import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavBar.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">COSMIC</span>
        </Link>

        {/* Hamburger Menu */}
        <button
          className={`hamburger ${isOpen ? "active" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <ul className={`nav-menu ${isOpen ? "active" : ""}`}>
          <li className="nav-item">
            <Link
              to="/Intro"
              className={`nav-link ${isActive("/Intro") ? "active" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/Simulation"
              className={`nav-link ${isActive("/Simulation") ? "active" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              Simulation
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/About"
              className={`nav-link ${isActive("/About") ? "active" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
