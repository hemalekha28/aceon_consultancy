import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="footer" style={{
      background: 'linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%)',
      color: '#fff',
      paddingTop: '2rem',
      paddingBottom: '2rem'
    }}>
      <div className="container" style={{ color: '#fff' }}>
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section">
            <h3 style={{ color: '#fff' }}>LuxeSleep</h3>
            <p style={{ color: '#fff' }}>Your destination for the ultimate sleep experience. Handcrafted premium mattresses for a life of comfort.</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <a href="#" aria-label="Facebook" style={{ color: '#fff' }}>
                <FiFacebook size={20} />
              </a>
              <a href="#" aria-label="Twitter" style={{ color: '#fff' }}>
                <FiTwitter size={20} />
              </a>
              <a href="#" aria-label="Instagram" style={{ color: '#fff' }}>
                <FiInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 style={{ color: '#fff' }}>Quick Links</h3>
            <ul style={{ color: '#fff' }}>
              <li><Link to="/" style={{ color: '#fff' }}>Home</Link></li>
              <li><Link to="/products" style={{ color: '#fff' }}>Shop All</Link></li>
              <li><Link to="/cart" style={{ color: '#fff' }}>My Cart</Link></li>
              <li><Link to="/wishlist" style={{ color: '#fff' }}>Wishlist</Link></li>
              <li><Link to="/dashboard" style={{ color: '#fff' }}>My Account</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-section">
            <h3 style={{ color: '#fff' }}>Collections</h3>
            <ul style={{ color: '#fff' }}>
              <li><Link to="/products?category=memory-foam" style={{ color: '#fff' }}>Memory Foam</Link></li>
              <li><Link to="/products?category=hybrid" style={{ color: '#fff' }}>Hybrid Mattresses</Link></li>
              <li><Link to="/products?category=orthopedic" style={{ color: '#fff' }}>Orthopedic Range</Link></li>
              <li><Link to="/products?category=bedding" style={{ color: '#fff' }}>Luxury Bedding</Link></li>
              <li><Link to="/products?category=accessories" style={{ color: '#fff' }}>Sleep Accessories</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="footer-section">
            <h3 style={{ color: '#fff' }}>Customer Service</h3>
            <ul style={{ color: '#fff' }}>
              <li><a href="#" style={{ color: '#fff' }}>Sleep Trial Info</a></li>
              <li><a href="#" style={{ color: '#fff' }}>Warranty Details</a></li>
              <li><a href="#" style={{ color: '#fff' }}>Shipping & Setup</a></li>
              <li><a href="#" style={{ color: '#fff' }}>Contact Support</a></li>
              <li><a href="#" style={{ color: '#fff' }}>Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h3 style={{ color: '#fff' }}>Contact Us</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                <FiMail size={16} color="#fff" />
                <span style={{ color: '#fff' }}>support@luxesleep.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                <FiPhone size={16} color="#fff" />
                <span style={{ color: '#fff' }}>+1 800 LUX SLEEP</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                <FiMapPin size={16} color="#fff" />
                <span style={{ color: '#fff' }}>123 Comfort Lane, Dream City, SL 45678</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom" style={{ color: '#fff', marginTop: '2rem' }}>
          <p style={{ color: '#fff' }}>&copy; 2024 LuxeSleep Premium Mattresses. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;