import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useCart } from '../context/cartContext';
import { useWishlist } from '../context/wishlistContext';
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiSearch, FiLogOut } from 'react-icons/fi';
import Logo from './Logo';

const Header = () => {
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const { wishlist } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className={`navbar-wrapper ${isScrolled ? 'scrolled' : ''}`}>
      {/* Main Navbar */}
      <div className="navbar">
        <div className="container">
          <div className="navbar-content">
            {/* Logo */}
            <Link to="/" className="navbar-brand-wrapper">
              <Logo className="h-10" />
            </Link>

            {/* Navigation Links */}
            <nav className="navbar-nav desktop-nav">
              <Link to="/" className={isActive('/') ? 'active' : ''}>
                Home
              </Link>
              <Link to="/products" className={isActive('/products') ? 'active' : ''}>
                Mattresses
              </Link>
              <Link to="/products?category=bedding" className={isActive('/products?category=bedding') ? 'active' : ''}>
                Bedding
              </Link>
            </nav>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="navbar-search-form">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Find your perfect sleep..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-submit">
                  <FiSearch />
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="navbar-actions">
              {/* Wishlist */}
              <Link to="/wishlist" className="action-icon-btn">
                <FiHeart />
                {wishlist.length > 0 && (
                  <span className="action-badge">{wishlist.length}</span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="action-icon-btn">
                <FiShoppingCart />
                {getCartItemsCount() > 0 && (
                  <span className="action-badge primary">{getCartItemsCount()}</span>
                )}
              </Link>

              {/* User Menu */}
              {user ? (
                <div ref={userMenuRef} className="user-menu-wrapper">
                  <button
                    className="user-profile-btn"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <div className="user-avatar">
                      {user.name.charAt(0)}
                    </div>
                    <span className="hidden lg:inline">{user.name.split(' ')[0]}</span>
                  </button>

                  {showUserMenu && (
                    <div className="user-dropdown-card">
                      <div className="dropdown-header">
                        <div className="dropdown-user-info">
                          <span className="name">{user.name}</span>
                          <span className="email">{user.email}</span>
                        </div>
                      </div>
                      <div className="dropdown-links">
                        <Link to="/dashboard" onClick={() => setShowUserMenu(false)}>
                          <FiUser /> My Profile
                        </Link>
                        <button onClick={handleLogout} className="logout-btn">
                          <FiLogOut /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link to="/login" className="btn-auth-primary">Login</Link>
                  <Link to="/register" className="btn-auth-gradient">Join</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .navbar-wrapper {
            position: sticky;
            top: 0;
            z-index: 1000;
            transition: all 0.3s ease;
            background: #ffffff;
          }
          
          .navbar-wrapper.scrolled {
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          }
          
          .navbar {
            padding: 0.5rem 0;
            border-bottom: 1px solid #f1f5f9;
          }
          
          .navbar-brand-wrapper {
            text-decoration: none;
            display: flex;
            align-items: center;
          }
          
          .navbar-nav.desktop-nav {
            display: flex;
            gap: 1.5rem;
            margin: 0 2rem;
          }
          
          .navbar-nav a {
            font-size: 0.95rem;
            font-weight: 500;
            color: #475569;
            transition: color 0.2s;
            position: relative;
            padding-bottom: 4px;
          }
          
          .navbar-nav a:hover, 
          .navbar-nav a.active {
            color: #000000;
          }
          
          .navbar-nav a.active::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: #3b82f6;
            border-radius: 2px;
          }
          
          .navbar-search-form {
            flex: 1;
            max-width: 400px;
            margin-right: auto;
          }
          
          .search-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }
          
          .search-input {
            width: 100%;
            padding: 0.6rem 1rem 0.6rem 2.5rem;
            border-radius: 50px;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            font-size: 0.9rem;
            transition: all 0.2s;
          }
          
          .search-input:focus {
            outline: none;
            border-color: #3b82f6;
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          
          .search-submit {
            position: absolute;
            left: 0.8rem;
            background: none;
            border: none;
            color: #64748b;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }
          
          .navbar-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          
          .action-icon-btn {
            position: relative;
            background: linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%);
            color: white;
            font-size: 1.4rem;
            display: flex;
            transition: all 0.2s;
            width: 40px;
            height: 40px;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            border: none;
          }
          
          .action-icon-btn:hover {
            box-shadow: 0 4px 12px rgba(54, 209, 196, 0.3);
            transform: translateY(-2px);
          }
          
          .action-badge {
            position: absolute;
            top: -6px;
            right: -8px;
            background: #ef4444;
            color: white;
            font-size: 0.65rem;
            font-weight: 700;
            min-width: 18px;
            height: 18px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2px;
            border: 2px solid #ffffff;
          }
          
          .action-badge.primary {
            background: #3b82f6;
          }
          
          .user-profile-btn {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            background: #f1f5f9;
            border: none;
            padding: 0.4rem 0.8rem;
            border-radius: 50px;
            cursor: pointer;
            transition: background 0.2s;
          }
          
          .user-profile-btn:hover {
            background: #e2e8f0;
          }
          
          .user-avatar {
            width: 24px;
            height: 24px;
            background: #3b82f6;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 700;
          }
          
          .user-dropdown-card {
            position: absolute;
            top: calc(100% + 10px);
            right: 0;
            width: 220px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            border: 1px solid #f1f5f9;
            overflow: hidden;
            animation: slideIn 0.2s ease-out;
          }
          
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .dropdown-header {
            padding: 1rem;
            background: #f8fafc;
            border-bottom: 1px solid #f1f5f9;
          }
          
          .dropdown-user-info .name {
            display: block;
            font-weight: 700;
            color: #0f172a;
            font-size: 0.95rem;
          }
          
          .dropdown-user-info .email {
            display: block;
            font-size: 0.75rem;
            color: #64748b;
          }
          
          .dropdown-links {
            display: flex;
            flex-direction: column;
          }
          
          .dropdown-links a, 
          .dropdown-links button {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            padding: 0.8rem 1rem;
            text-decoration: none;
            color: #475569;
            font-size: 0.9rem;
            text-align: left;
            border: none;
            background: none;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .dropdown-links a:hover, 
          .dropdown-links button:hover {
            background: #f1f5f9;
            color: #000000;
          }
          
          .logout-btn {
            border-top: 1px solid #f1f5f9 !important;
            color: #ef4444 !important;
          }
          
          .btn-auth-primary {
            font-weight: 600;
            font-size: 0.9rem;
            color: #475569;
            text-decoration: none;
            margin-right: 0.5rem;
            transition: color 0.2s;
          }
          
          .btn-auth-primary:hover {
            color: #36d1c4;
          }

          .btn-auth-gradient {
            font-weight: 600;
            font-size: 0.9rem;
            background: linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%);
            color: white;
            text-decoration: none;
            padding: 0.6rem 1.2rem;
            border-radius: 6px;
            transition: all 0.2s;
            display: inline-block;
            border: none;
            cursor: pointer;
          }
          
          .btn-auth-gradient:hover {
            box-shadow: 0 4px 12px rgba(54, 209, 196, 0.3);
            transform: translateY(-2px);
          }

          @media (max-width: 1024px) {
            .navbar-nav.desktop-nav { display: none; }
            .navbar-search-form { display: none; }
          }
        `}
      </style>
    </header>
  );
};

export default Header;