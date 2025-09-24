import React from 'react';
import { FaHeart, FaAward, FaUsers, FaShieldAlt, FaStethoscope, FaClock } from 'react-icons/fa';
import './AboutUs.css';

const AboutUs = () => {
  const teamMembers = [
    {
      name: "Dr. Sarah Johnson",
      position: "Head Veterinarian",
      experience: "15+ years",
      specialty: "Surgery & Internal Medicine",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
      name: "Dr. Michael Chen",
      position: "Senior Veterinarian",
      experience: "12+ years",
      specialty: "Dermatology & Dentistry",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    
  ];

  const values = [
    {
      icon: <FaHeart />,
      title: "Compassionate Care",
      description: "We treat every pet with the love and respect they deserve."
    },
    {
      icon: <FaAward />,
      title: "Excellence",
      description: "Highest standards of veterinary medicine and patient care."
    },
    {
      icon: <FaShieldAlt />,
      title: "Trust & Safety",
      description: "Your pet's health and safety are our top priorities."
    },
    {
      icon: <FaUsers />,
      title: "Community",
      description: "Building lasting relationships with pets and their families."
    }
  ];

  const stats = [
    { number: "15,000+", label: "Happy Pets Treated" },
    { number: "98%", label: "Client Satisfaction" },
    { number: "24/7", label: "Emergency Service" },
    { number: "15+", label: "Years of Experience" }
  ];

  return (
    <div className="about-us-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About PetCare+</h1>
          <p>Your trusted partner in pet health and happiness since 2008</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="mission-container">
          <div className="mission-content">
            <h2>Our Mission</h2>
            <p>
              At PetCare+, we believe every pet deserves exceptional healthcare. Our mission is to provide 
              comprehensive, compassionate veterinary services that enhance the lives of pets and bring peace 
              of mind to their families.
            </p>
            <div className="mission-highlights">
              <div className="highlight">
                <FaStethoscope className="highlight-icon" />
                <span>Advanced Medical Care</span>
              </div>
              <div className="highlight">
                <FaHeart className="highlight-icon" />
                <span>Compassionate Approach</span>
              </div>
              <div className="highlight">
                <FaClock className="highlight-icon" />
                <span>24/7 Emergency Services</span>
              </div>
            </div>
          </div>
          <div className="mission-image">
            <img 
              src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
              alt="Veterinary Care" 
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="values-container">
          <h2>Our Values</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="team-container">
          <h2>Meet Our Expert Team</h2>
          <p className="team-description">
            Our dedicated team of veterinary professionals brings years of experience and a genuine love for animals.
          </p>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-image">
                  <img src={member.image} alt={member.name} />
                  <div className="team-overlay">
                    <span>{member.experience} Experience</span>
                  </div>
                </div>
                <div className="team-info">
                  <h3>{member.name}</h3>
                  <p className="position">{member.position}</p>
                  <p className="specialty">{member.specialty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="story-container">
          <div className="story-content">
            <h2>Our Story</h2>
            <p>
              Founded in 2008 by Dr. Sarah Johnson, PetCare+ started as a small neighborhood clinic with 
              a big vision: to revolutionize pet healthcare in Sri Lanka. What began with a single examination 
              room has grown into a state-of-the-art facility serving thousands of pets annually.
            </p>
            <p>
              Today, we're proud to be Colombo's most trusted animal clinic, combining cutting-edge technology 
              with old-fashioned compassion. Our journey continues as we expand our services and deepen our 
              commitment to the community we serve.
            </p>
            <div className="story-achievements">
              <div className="achievement">
                <strong>2008</strong>
                <span>Clinic Founded</span>
              </div>
              <div className="achievement">
                <strong>2015</strong>
                <span>24/7 Emergency Services</span>
              </div>
              <div className="achievement">
                <strong>2020</strong>
                <span>Digital Records System</span>
              </div>
              <div className="achievement">
                <strong>2023</strong>
                <span>PetCare+ Management System</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;