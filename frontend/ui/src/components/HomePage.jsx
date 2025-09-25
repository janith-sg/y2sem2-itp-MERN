// src/components/HomePage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Slideshow images (you can replace these with your actual images)
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      title: "Professional Pet Care",
      description: "Expert veterinary care for your beloved companions"
    },
    {
      image: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      title: "Comprehensive Health Services",
      description: "From routine checkups to emergency care"
    },
    {
      image: "https://images.unsplash.com/photo-1560743641-3914f2c45636?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      title: "State-of-the-Art Facility",
      description: "Modern equipment for accurate diagnosis and treatment"
    },
    {
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      title: "Caring Professionals",
      description: "Our team loves animals as much as you do"
    }
  ];

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="home-container">
      
      {/* Slideshow Section */}
      <section className="slideshow-container">
        <div className="slideshow">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`slide ${index === currentSlide ? "active" : ""}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="slide-content">
                <h2>{slide.title}</h2>
                <p>{slide.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Slideshow Controls */}
        <button className="slide-control prev" onClick={prevSlide}>‹</button>
        <button className="slide-control next" onClick={nextSlide}>›</button>
        
        {/* Slideshow Indicators */}
        <div className="slide-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="welcome-content">
          <h1>Welcome to PetCare+ </h1>
          <p>Streamline your clinic operations with our comprehensive animal care management solution. Manage appointments, medical records, inventory, and more with ease.</p>
        </div>
      </section>

      {/* Main Buttons Grid */}
      <section className="features-section">
        <div className="features-grid">
          <Link to="/employees" className="feature-card">
            <div className="card-icon">👥</div>
            <h3>View Users</h3>
            <p>Manage staff and user accounts</p>
          </Link>

          <Link to="/pets" className="feature-card">
            <div className="card-icon">🐕</div>
            <h3>View Pets</h3>
            <p>Access pet profiles and records</p>
          </Link>

          {/* Team Member 1 Cards */}
          <Link to="/appointments" className="feature-card">
            <div className="card-icon">📅</div>
            <h3>View Appointments</h3>
            <p>Check and manage appointments</p>
          </Link>

          <Link to="/add-appointment" className="feature-card">
            <div className="card-icon">➕</div>
            <h3>Create Appointment</h3>
            <p>Schedule new appointments</p>
          </Link>

          <Link to="/doctor-sessions" className="feature-card">
            <div className="card-icon">👨‍⚕️</div>
            <h3>View Sessions</h3>
            <p>View Doctor sessions</p>
          </Link>

          <Link to="/inventory" className="feature-card">
            <div className="card-icon">📦</div>
            <h3>Inventory</h3>
            <p>Manage medical supplies and stock</p>
          </Link>

          <Link to="/medical-records" className="feature-card">
            <div className="card-icon">🏥</div>
            <h3>Medical Records</h3>
            <p>View patient medical history</p>
          </Link>

          <Link to="/doctorsession" className="feature-card">
            <div className="card-icon">👨‍⚕️</div>
            <h3>Veiw Sessions</h3>
            <p>View Doctor sessions </p>
          </Link>

          <Link to="/payments" className="feature-card">
            <div className="card-icon">💳</div>
            <h3>View Payments</h3>
            <p>Track financial transactions</p>
          </Link>

          <Link to="/feedback" className="feature-card">
            <div className="card-icon">💬</div>
            <h3>Add Feedback</h3>
            <p>Share your experience with us</p>
          </Link>

          
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">1,200+</div>
            <div className="stat-label">Happy Pets</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">15+</div>
            <div className="stat-label">Years Experience</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Emergency Care</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">98%</div>
            <div className="stat-label">Client Satisfaction</div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;