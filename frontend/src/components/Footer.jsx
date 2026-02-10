import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section">
            <h3>LuxeSleep</h3>
            <p>Your destination for the ultimate sleep experience. Handcrafted premium mattresses for a life of comfort.</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <a href="#" aria-label="Facebook">
                <FiFacebook size={20} />
              </a>
              <a href="#" aria-label="Twitter">
                <FiTwitter size={20} />
              </a>
              <a href="#" aria-label="Instagram">
                <FiInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Shop All</Link></li>
              <li><Link to="/cart">My Cart</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/dashboard">My Account</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-section">
            <h3>Collections</h3>
            <ul>
              <li><Link to="/products?category=memory-foam">Memory Foam</Link></li>
              <li><Link to="/products?category=hybrid">Hybrid Mattresses</Link></li>
              <li><Link to="/products?category=orthopedic">Orthopedic Range</Link></li>
              <li><Link to="/products?category=bedding">Luxury Bedding</Link></li>
              <li><Link to="/products?category=accessories">Sleep Accessories</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="footer-section">
            <h3>Customer Service</h3>
            <ul>
              <li><a href="#">Sleep Trial Info</a></li>
              <li><a href="#">Warranty Details</a></li>
              <li><a href="#">Shipping & Setup</a></li>
              <li><a href="#">Contact Support</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h3>Contact Us</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiMail size={16} />
                <span>support@luxesleep.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiPhone size={16} />
                <span>+1 800 LUX SLEEP</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiMapPin size={16} />
                <span>123 Comfort Lane, Dream City, SL 45678</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 LuxeSleep Premium Mattresses. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;