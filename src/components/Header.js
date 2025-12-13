import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    document.body.style.overflow = menuOpen ? '' : 'hidden';
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = '';
  };

  const handleMouseEnter = () => {
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setDropdownOpen(false);
  };

  return (
    <>
      <header className="site-header">
        <div className="wrapper">
          <div className="nav">
            <Link to="/" className="nav-brand">
              <img src="/images/fulllogo_transparent.avif" alt="PilotCenter.net Logo" className="nav-logo" />
            </Link>

            <nav className="nav-links">
              <Link to="/about-us">About Us</Link>
              <Link to="/how-it-works">How It Works</Link>
              <div className="dropdown" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <Link to="/how-to-become-a-pilot" className="dropdown-btn">
                  Become a Pilot <span className="dropdown-arrow">▼</span>
                </Link>
                <div className={`dropdown-content ${dropdownOpen ? 'show' : ''}`}>
                  <Link to="/the-faa-route">FAA Route</Link>
                  <Link to="/the-easa-route">EASA Route</Link>
                  <Link to="/the-icao-route">ICAO Route</Link>
                </div>
              </div>
              <Link to="/cost-breakdown">Costs</Link>
              <Link to="/flightschools">Flight Schools</Link>
              <Link to="/latest-pilot-jobs">Pilot Jobs</Link>
              <Link to="/news-and-resources">News & Resources</Link>
            </nav>

            <div className="nav-cta">
              <Link to="/contact" className="btn btn-primary desktop-only">Contact Us</Link>
              <button className="mobile-hamburger" onClick={toggleMenu}>
                <div className="hamburger-line"></div>
                <div className="hamburger-line"></div>
                <div className="hamburger-line"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Right Side Menu */}
      <div className={`right-side-menu-overlay ${menuOpen ? 'active' : ''}`} onClick={closeMenu}></div>
      <div className={`right-side-menu ${menuOpen ? 'active' : ''}`}>
        <button className="close-menu-btn" onClick={closeMenu}>&times;</button>
        <ul>
          <li><Link to="/about-us" onClick={closeMenu}>About Us</Link></li>
          <li><Link to="/how-it-works" onClick={closeMenu}>How It Works</Link></li>
          <li className="mobile-dropdown">
            <span>Become a Pilot</span>
            <ul className="mobile-submenu">
              <li><Link to="/how-to-become-a-pilot" onClick={closeMenu}>Overview</Link></li>
              <li><Link to="/the-faa-route" onClick={closeMenu}>FAA Route</Link></li>
              <li><Link to="/the-easa-route" onClick={closeMenu}>EASA Route</Link></li>
              <li><Link to="/the-icao-route" onClick={closeMenu}>ICAO Route</Link></li>
            </ul>
          </li>
          <li><Link to="/cost-breakdown" onClick={closeMenu}>Costs</Link></li>
          <li><Link to="/flightschools" onClick={closeMenu}>Flight Schools</Link></li>
          <li><Link to="/latest-pilot-jobs" onClick={closeMenu}>Pilot Jobs</Link></li>
          <li><Link to="/news-and-resources" onClick={closeMenu}>News & Resources</Link></li>
        </ul>
        <Link to="/contact" className="btn btn-primary menu-consultation-btn" onClick={closeMenu}>Contact Us</Link>
      </div>
    </>
  );
}

export default Header;