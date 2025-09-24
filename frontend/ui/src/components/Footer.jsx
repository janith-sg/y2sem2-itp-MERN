import React from "react";
import { FaFacebook, FaInstagram, FaTwitter, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaHeart, FaPaw } from "react-icons/fa";

const Footer = () => {
  return (
    <footer style={styles.footer}>
      {/* Main Footer Content */}
      <div style={styles.footerContainer}>
        
        {/* About Us */}
        <div style={styles.footerSection}>
          <div style={styles.sectionHeader}>
            <FaPaw style={styles.sectionIcon} />
            <h3 style={styles.heading}>About Us</h3>
          </div>
          <p style={styles.text}>
            Petcare+ is your trusted partner in pet health and happiness.
            We provide top-quality care and services to keep your pets healthy, active, and loved.
          </p>
          <div style={styles.brandHighlight}>
            <span style={styles.highlightText}>Quality Care</span>
            <span style={styles.highlightText}>Expert Team</span>
            <span style={styles.highlightText}>24/7 Support</span>
          </div>
        </div>

        {/* Contact Us */}
        <div style={styles.footerSection}>
          <div style={styles.sectionHeader}>
            <FaEnvelope style={styles.sectionIcon} />
            <h3 style={styles.heading}>Contact Us</h3>
          </div>
          <div style={styles.contactItem}>
            <FaPhoneAlt style={styles.contactIcon} />
            <p style={styles.text}>+94 71 123 4567</p>
          </div>
          <div style={styles.contactItem}>
            <FaEnvelope style={styles.contactIcon} />
            <p style={styles.text}>support@petcareplus.com</p>
          </div>
          <div style={styles.contactItem}>
            <FaMapMarkerAlt style={styles.contactIcon} />
            <p style={styles.text}>Colombo, Sri Lanka</p>
          </div>
        </div>

        {/* Follow Us */}
        <div style={styles.footerSection}>
          <div style={styles.sectionHeader}>
            <FaHeart style={styles.sectionIcon} />
            <h3 style={styles.heading}>Follow Us</h3>
          </div>
          <p style={styles.socialText}>Stay connected with our pet community</p>
          <div style={styles.socialIcons}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" style={styles.icon}>
              <FaFacebook />
              <span style={styles.socialLabel}>Facebook</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" style={styles.icon}>
              <FaInstagram />
              <span style={styles.socialLabel}>Instagram</span>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" style={styles.icon}>
              <FaTwitter />
              <span style={styles.socialLabel}>Twitter</span>
            </a>
          </div>
        </div>

        {/* Location */}
        <div style={styles.footerSection}>
          <div style={styles.sectionHeader}>
            <FaMapMarkerAlt style={styles.sectionIcon} />
            <h3 style={styles.heading}>Our Location</h3>
          </div>
          <div style={styles.mapContainer}>
            <iframe
              title="Petcare+ Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63316.12148235174!2d79.8211855!3d6.9270786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2594b7a7b7b4b%3A0x6c8b0b0e3b4!2sColombo!5e0!3m2!1sen!2slk!4v1700000000000"
              width="100%"
              height="140"
              style={styles.map}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div style={styles.footerBottom}>
        <div style={styles.footerBottomContent}>
          <p style={styles.copyright}>
            © {new Date().getFullYear()} Petcare+ | All Rights Reserved
          </p>
          <div style={styles.footerLinks}>
            <a href="/privacy" style={styles.footerLink}>Privacy Policy</a>
            <a href="/terms" style={styles.footerLink}>Terms of Service</a>
            <a href="/sitemap" style={styles.footerLink}>Sitemap</a>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div style={styles.footerDecoration}></div>
    </footer>
  );
};

// Premium Inline Styles
const styles = {
  footer: {
    backgroundColor: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
    background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
    color: "#f0f0f0",
    padding: "50px 20px 20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  footerContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "30px",
    maxWidth: "1200px",
    margin: "0 auto 30px",
    position: "relative",
    zIndex: 2,
  },
  footerSection: {
    marginBottom: "10px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
    borderLeft: "4px solid #4CAF50",
    paddingLeft: "12px",
  },
  sectionIcon: {
    color: "#4CAF50",
    fontSize: "18px",
    marginRight: "10px",
  },
  heading: {
    margin: "0",
    fontSize: "1.3rem",
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: "0.5px",
  },
  text: {
    margin: "12px 0",
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#cccccc",
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    margin: "12px 0",
  },
  contactIcon: {
    color: "#4CAF50",
    fontSize: "16px",
    marginRight: "10px",
    minWidth: "20px",
  },
  brandHighlight: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "15px",
  },
  highlightText: {
    background: "rgba(76, 175, 80, 0.1)",
    color: "#4CAF50",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  socialText: {
    fontSize: "14px",
    color: "#cccccc",
    marginBottom: "15px",
  },
  socialIcons: {
    display: "flex",
    gap: "15px",
  },
  icon: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "#cccccc",
    fontSize: "20px",
    transition: "all 0.3s ease",
    textDecoration: "none",
    padding: "8px",
    borderRadius: "8px",
    background: "rgba(255, 255, 255, 0.05)",
    width: "70px",
  },
  socialLabel: {
    fontSize: "10px",
    marginTop: "5px",
    opacity: "0.8",
  },
  mapContainer: {
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
  },
  map: {
    border: "0",
    borderRadius: "12px",
    filter: "grayscale(20%) contrast(1.1)",
  },
  footerBottom: {
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    paddingTop: "20px",
  },
  footerBottomContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
  },
  copyright: {
    margin: "0",
    fontSize: "14px",
    color: "#aaaaaa",
    fontWeight: "500",
  },
  footerLinks: {
    display: "flex",
    gap: "20px",
  },
  footerLink: {
    color: "#cccccc",
    textDecoration: "none",
    fontSize: "13px",
    transition: "color 0.3s ease",
  },
  footerDecoration: {
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
    height: "4px",
    background: "linear-gradient(90deg, #4CAF50, #2E7D32, #4CAF50)",
    backgroundSize: "200% 100%",
    animation: "gradientShift 3s ease infinite",
  },

  // Hover effects
  iconHover: {
    color: "#4CAF50",
    transform: "translateY(-3px)",
    background: "rgba(76, 175, 80, 0.1)",
  },
  footerLinkHover: {
    color: "#4CAF50",
  },
};

// Add hover effects via JavaScript
const addHoverEffects = () => {
  // This would be implemented with CSS-in-JS or className toggling
  // For inline styles, we can use onMouseEnter/onMouseLeave events
};

export default Footer;