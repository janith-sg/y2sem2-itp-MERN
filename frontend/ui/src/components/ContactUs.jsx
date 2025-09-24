import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane } from 'react-icons/fa';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-us-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1>Get in Touch</h1>
          <p>We're here to help you and your pets. Reach out to us with any questions or concerns.</p>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="contact-content">
        <div className="contact-container">
          {/* Contact Information */}
          <div className="contact-info">
            <h2>Contact Information</h2>
            <p className="contact-description">
              Feel free to contact us through any of the following methods. Our team is always ready to assist you and your furry friends.
            </p>

            <div className="contact-methods">
              <div className="contact-method">
                <div className="contact-icon">
                  <FaPhone />
                </div>
                <div className="contact-details">
                  <h3>Phone</h3>
                  <p>+94 71 123 4567</p>
                  <span>Mon-Sun: 6:00 AM - 10:00 PM</span>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon">
                  <FaEnvelope />
                </div>
                <div className="contact-details">
                  <h3>Email</h3>
                  <p>support@petcareplus.com</p>
                  <span>We'll respond within 24 hours</span>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="contact-details">
                  <h3>Address</h3>
                  <p>123 Pet Care Avenue</p>
                  <p>Colombo 00500, Sri Lanka</p>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon">
                  <FaClock />
                </div>
                <div className="contact-details">
                  <h3>Clinic Hours</h3>
                  <p>Monday - Friday: 8:00 AM - 8:00 PM</p>
                  <p>Saturday - Sunday: 9:00 AM - 6:00 PM</p>
                  <p>Emergency Services: 24/7</p>
                </div>
              </div>
            </div>

            {/* Emergency Banner */}
            <div className="emergency-banner">
              <h3>🐾 Emergency Services Available 24/7</h3>
              <p>For urgent pet care needs, call our emergency line: <strong>+94 71 911 9119</strong></p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-container">
            <h2>Send us a Message</h2>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+94 71 123 4567"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="appointment">Book an Appointment</option>
                  <option value="general">General Inquiry</option>
                  <option value="emergency">Emergency Service</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Tell us how we can help you and your pet..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Send Message
                  </>
                )}
              </button>

              {submitStatus === 'success' && (
                <div className="success-message">
                  ✅ Thank you! Your message has been sent successfully.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="error-message">
                  ❌ Sorry, there was an error sending your message. Please try again.
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section">
        <div className="map-container">
          <h2>Find Our Clinic</h2>
          <div className="map-wrapper">
            <iframe
              title="PetCare+ Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.798511757705!2d79.86115541476997!3d6.927069195003806!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2593d4b7a7b4b%3A0x6c8b0b0e3b4b5b6c!2sColombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2slk!4v1620000000000!5m2!1sen!2slk"
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: '10px' }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;