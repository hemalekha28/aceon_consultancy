import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import { useAuth } from '../context/useAuth';
import { useCart } from '../context/cartContext';
import { useWishlist } from '../context/wishlistContext';
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiSearch, FiLogOut } from 'react-icons/fi';
import aceon from'../assets/aceon-logo.png';

const Header = () => {
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const { wishlist } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

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
    <header className="navbar">
      <div className="container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img 
              src={aceon} 
              alt="ACEON Logo" 
              style={{
                height: '54px', // Increased size
                width: '84px', // Increased size
                position: 'absolute',
                top: '0',
                left: '0',
                background: 'white',
                borderRadius: '20%', // Make the logo round
                objectFit: 'cover',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }} 
            />
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center" style={{ flex: 1, maxWidth: '400px', margin: '0 2rem' }}>
            <div className="flex w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              >
                <FiSearch />
              </button>
            </div>
          </form>

          {/* Navigation */}
          <nav className="navbar-nav">
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              Home
            </Link>
            <Link to="/products" className={isActive('/products') ? 'active' : ''}>
              Products
            </Link>
          </nav>

          {/* Actions */}
          <div className="navbar-actions">
            {/* Wishlist */}
            <Link to="/wishlist" className="btn btn-secondary" style={{
              position: 'relative',
              background: 'linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%)',
              color: '#FFFFFF',
              border: 'none'
            }}>
              <FiHeart />
              {wishlist.length > 0 && (
                <span
                  className="badge badge-danger"
                  style={{ position: 'absolute', top: '-8px', right: '-8px', fontSize: '10px', padding: '2px 6px' }}
                >
                  {wishlist.length}
                </span>
              )}
            </Link>
            {/* Cart */}
            <Link to="/cart" className="btn btn-secondary" style={{
              position: 'relative',
              background: 'linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%)',
              color: '#FFFFFF',
              border: 'none'
            }}>
              <FiShoppingCart />
              {getCartItemsCount() > 0 && (
                <span
                  className="badge badge-danger"
                  style={{ position: 'absolute', top: '-8px', right: '-8px', fontSize: '10px', padding: '2px 6px' }}
                >
                  {getCartItemsCount()}
                </span>
              )}
            </Link>
            {/* User */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowUserMenu((v) => !v)} className="btn btn-secondary" style={{ background: 'linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%)', color: '#fff', border: 'none' }}>
                  <FiUser />
                </button>
                {showUserMenu && (
                  <div ref={userMenuRef} style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: '8px', minWidth: '120px', zIndex: 10 }}>
                    <button onClick={handleLogout} style={{ width: '100%', padding: '8px 16px', background: 'none', border: 'none', color: '#1e3c72', textAlign: 'left', cursor: 'pointer' }}>
                      <FiLogOut style={{ marginRight: '8px' }} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="btn btn-login" style={{ background: 'linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%)', color: '#fff', border: 'none', marginRight: 8 }} onClick={() => { setShowLogin(true); setShowRegister(false); }}>Login</button>
                <button className="btn btn-register" style={{ background: 'linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%)', color: '#fff', border: 'none' }} onClick={() => { setShowRegister(true); setShowLogin(false); }}>Register</button>
                <LoginModal open={showLogin} onClose={() => setShowLogin(false)} onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }} />
                <RegisterModal open={showRegister} onClose={() => setShowRegister(false)} onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;