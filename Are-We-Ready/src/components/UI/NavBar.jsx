import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavBar.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" aria-label="Nile Stars - Home">
          <span className="logo-icon" aria-hidden="true">🛰️</span>
          <span className="logo-text">NILE STARS</span>
          <span className="logo-tag">— Are We Ready?</span>
        </Link>

        {/* Hamburger Menu */}
        <button
          className={`hamburger ${isOpen ? "active" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="main-navigation"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <ul
          id="main-navigation"
          className={`nav-menu ${isOpen ? "active" : ""}`}
          role="menubar"
        >
          <li className="nav-item" role="none">
            <Link
              to="/Intro"
              role="menuitem"
              className={`nav-link ${isActive("/Intro") ? "active" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
          </li>

          <li className="nav-item" role="none">
            <Link
              to="/Simulation"
              role="menuitem"
              className={`nav-link ${isActive("/Simulation") ? "active" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              Simulator
            </Link>
          </li>

          <li className="nav-item" role="none">
            <Link
              to="/About"
              role="menuitem"
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
