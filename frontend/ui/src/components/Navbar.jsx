// Navbar.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { AuthContext } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar navbar-expand-lg navbar-premium">
      <div className="container-fluid">
        <Link className="navbar-brand premium-brand" to="/">
          <span className="brand-icon">🐾</span>
          <span className="brand-text">
            <span className="brand-name">PetCare+</span>
            <span className="brand-subtitle">Clinic</span>
          </span>
        </Link>

        <button
          className="navbar-toggler premium-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">

            <li className="nav-item">
              <Link className="nav-link premium-link" to="/">
                <i className="fas fa-home"></i> Home
              </Link>
            </li>
  

            <li className="nav-item">
              <Link className="nav-link premium-link" to="/about">
                <i className="fas fa-info-circle"></i> AboutUs
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link premium-link" to="/contact">
                <i className="fas fa-envelope"></i> Contact Us
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link premium-link" to="/feedback">
                <i className="fas fa-info-circle"></i> Feedbacks
              </Link>
            </li>

            {/* Admin link only for admin */}
            {user?.role === "admin" && (
              <li className="nav-item">
                <Link className="nav-link premium-link" to="/admindashboard">
                  <i className="fas fa-cogs"></i> Admin Dashboard
                </Link>
              </li>
            )}
          </ul>

          {/* Right side: login/logout */}
          <ul className="navbar-nav">
            {user ? (
              <>
                <li className="nav-item">
                  <span className="nav-link">Hi, {user.email}</span>
                </li>
                <li className="nav-item">
                  <button
                    className="btn premium-logout-btn"
                    type="button"
                    onClick={() => {
                      logout();
                      window.location = "/login";
                    }}
                  >
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="nav-link premium-link" to="/login">
                  <i className="fas fa-sign-in-alt"></i> Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
