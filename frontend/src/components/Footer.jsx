import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiArrowRight } from 'react-icons/fi';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="footer-new">
      <div className="container">
        <div className="footer-grid">
          {/* Brand & Info */}
          <div className="footer-col brand-col">
            <Logo className="h-12 mb-4" />
            <p className="footer-description">
              Experience the pinnacle of comfort with ACEON. We combine advanced sleep technology with artisanal craftsmanship to deliver your best night's sleep.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Facebook"><FiFacebook /></a>
              <a href="#" aria-label="Twitter"><FiTwitter /></a>
              <a href="#" aria-label="Instagram"><FiInstagram /></a>
              <a href="#" aria-label="Youtube"><FiYoutube /></a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="footer-col">
            <h4>Shop ACEON</h4>
            <ul className="footer-links-new">
              <li><Link to="/products">All Mattresses</Link></li>
              <li><Link to="/products?category=memory-foam">Memory Foam</Link></li>
              <li><Link to="/products?category=hybrid">Hybrid Series</Link></li>
              <li><Link to="/products?category=adjustable">Adjustable Bases</Link></li>
              <li><Link to="/products?category=accessories">Sleep Accessories</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="footer-col">
            <h4>Support</h4>
            <ul className="footer-links-new">
              <li><Link to="/trial">100-Night Trial</Link></li>
              <li><Link to="/warranty">Warranty Info</Link></li>
              <li><Link to="/shipping">Shipping & Returns</Link></li>
              <li><Link to="/faq">Sleep FAQ</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-col newsletter-col">
            <h4>Join the ACEON Circle</h4>
            <p className="newsletter-text">Sign up for sleep tips, exclusive offers, and product launches.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Email address" required />
              <button type="submit">
                <FiArrowRight />
              </button>
            </form>
            <div className="footer-contact-info">
              <div className="contact-item">
                <FiPhone />
                <span>+1 800 ACEON SLEEP</span>
              </div>
              <div className="contact-item">
                <FiMail />
                <span>hello@aceoncomfort.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom-new">
          <div className="bottom-content">
            <p>&copy; {new Date().getFullYear()} ACEON Comfort. All rights reserved.</p>
            <div className="bottom-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/accessibility">Accessibility</Link>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .footer-new {
            background: #ffffff;
            color: #1e293b;
            padding: 5rem 0 2rem;
            border-top: 1px solid #f1f5f9;
            margin-top: 5rem;
          }
          
          .footer-grid {
            display: grid;
            grid-template-columns: 1.5fr 1fr 1fr 1.5fr;
            gap: 4rem;
            margin-bottom: 4rem;
          }
          
          .brand-col .footer-description {
            margin: 1.5rem 0;
            color: #64748b;
            font-size: 0.95rem;
            line-height: 1.7;
          }
          
          .social-links {
            display: flex;
            gap: 1.2rem;
          }
          
          .social-links a {
            color: #64748b;
            font-size: 1.2rem;
            transition: all 0.2s;
          }
          
          .social-links a:hover {
            color: #3b82f6;
            transform: translateY(-3px);
          }
          
          .footer-col h4 {
            font-size: 1.1rem;
            font-weight: 700;
            margin-bottom: 2rem;
            color: #0f172a;
          }
          
          .footer-links-new {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .footer-links-new li {
            margin-bottom: 1rem;
          }
          
          .footer-links-new a {
            text-decoration: none;
            color: #64748b;
            font-size: 0.95rem;
            transition: color 0.2s;
          }
          
          .footer-links-new a:hover {
            color: #000000;
            padding-left: 5px;
          }
          
          .newsletter-text {
            color: #64748b;
            font-size: 0.9rem;
            margin-bottom: 1.5rem;
          }
          
          .newsletter-form {
            display: flex;
            position: relative;
            margin-bottom: 2rem;
          }
          
          .newsletter-form input {
            flex: 1;
            padding: 0.8rem 3.5rem 0.8rem 1rem;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            font-size: 0.9rem;
          }
          
          .newsletter-form button {
            position: absolute;
            right: 0.5rem;
            top: 50%;
            transform: translateY(-50%);
            background: #000000;
            color: white;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.2s;
          }
          
          .newsletter-form button:hover {
            background: #334155;
          }
          
          .footer-contact-info {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            color: #475569;
            font-size: 0.9rem;
          }
          
          .footer-bottom-new {
            padding-top: 2rem;
            border-top: 1px solid #f1f5f9;
          }
          
          .bottom-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #94a3b8;
            font-size: 0.85rem;
          }
          
          .bottom-links {
            display: flex;
            gap: 2rem;
          }
          
          .bottom-links a {
            text-decoration: none;
            color: #94a3b8;
            transition: color 0.2s;
          }
          
          .bottom-links a:hover {
            color: #64748b;
          }
          
          @media (max-width: 1024px) {
            .footer-grid {
              grid-template-columns: 1fr 1fr;
              gap: 3rem;
            }
          }
          
          @media (max-width: 640px) {
            .footer-grid {
              grid-template-columns: 1fr;
            }
            .bottom-content {
              flex-direction: column;
              gap: 1.5rem;
              text-align: center;
            }
          }
        `}
      </style>
    </footer>
  );
};

export default Footer;
