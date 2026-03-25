import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useCart } from '../context/cartContext';
import { useWishlist } from '../context/wishlistContext';
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiSearch, FiLogOut, FiPhone, FiInfo, FiTag, FiStar, FiX } from 'react-icons/fi';
import { api } from '../utils/api';
import Logo from './Logo';
import { constructImageUrl } from '../utils/imageUtils';

/* ─── Smart Search Component ──────────────────────────────────────── */
function SmartSearch({ navigate }) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [intents, setIntents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);
  const wrapRef = useRef(null);
  const timerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setIntents([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/smart-search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.data.products || []);
        setIntents(data.data.intents || []);
        setOpen(true);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timerRef.current);
    if (val.trim().length >= 2) {
      timerRef.current = setTimeout(() => doSearch(val), 350);
    } else {
      setResults([]); setIntents([]); setOpen(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const goToProduct = (id) => { setOpen(false); setQuery(''); navigate(`/product/${id}`); };

  return (
    <div ref={wrapRef} className="smart-search-wrap">
      <form onSubmit={handleSubmit} className="smart-search-form">
        <div className="smart-search-inner">
          <FiSearch className="ss-icon-left" size={16} />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => { if (results.length > 0) setOpen(true); }}
            placeholder="Try: mattress for back pain…"
            className="ss-input"
            autoComplete="off"
          />
          {loading && <div className="ss-spinner" />}
          {query && !loading && (
            <button type="button" className="ss-clear" onClick={() => { setQuery(''); setResults([]); setOpen(false); }}>
              <FiX size={13} />
            </button>
          )}
        </div>
      </form>

      {open && (
        <div className="ss-dropdown">
          {/* Intent tags */}
          {intents.length > 0 && (
            <div className="ss-intents">
              {intents.map((tag, i) => (
                <span key={i} className="ss-intent-tag">{tag}</span>
              ))}
            </div>
          )}

          {results.length === 0 ? (
            <div className="ss-empty">No results found for &ldquo;{query}&rdquo;</div>
          ) : (
            <>
              <div className="ss-results-label">
                {intents.length > 0 ? 'AI Matched Results' : 'Search Results'} &mdash; {results.length} found
              </div>
              <ul className="ss-list">
                {results.map(p => (
                  <li key={p._id} className="ss-item" onClick={() => goToProduct(p._id)}>
                    <div className="ss-thumb">
                      <img src={constructImageUrl(p.image)} alt={p.name} onError={e => e.target.style.display='none'} />
                    </div>
                    <div className="ss-info">
                      <span className="ss-name">{p.name}</span>
                      <div className="ss-meta">
                        {p.category && <span className="ss-cat">{p.category}</span>}
                        {p.rating > 0 && (
                          <span className="ss-rating"><FiStar size={10} /> {p.rating.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                    <span className="ss-price">₹{(p.price || 0).toLocaleString('en-IN')}</span>
                  </li>
                ))}
              </ul>
              <button className="ss-view-all" onClick={() => { setOpen(false); navigate(`/products?search=${encodeURIComponent(query)}`); }}>
                View all results for &ldquo;{query}&rdquo; →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const Header = () => {
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const { wishlist } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const userMenuRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    const fetchCoupons = async () => {
      try {
        const coupons = await api.getActiveCoupons();
        setActiveCoupons(coupons || []);
      } catch (err) {
        console.error('Header coupon fetch error:', err);
      }
    };
    fetchCoupons();

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
      {/* Top Banner (now minimal, without marketing text/links) */}
      <div className="top-banner">
        <div className="container flex justify-between items-center py-1">
          <div />
          <div />
          <div />
        </div>
      </div>

      {/* Dynamic Promo Banner */}
      {activeCoupons.length > 0 && (
        <div style={{
          background: 'var(--primary)',
          color: 'white',
          padding: '0.6rem 0',
          textAlign: 'center',
          fontSize: '0.9rem',
          fontWeight: '600',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          position: 'relative',
          zIndex: 999,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div className="container flex justify-center items-center gap-3">
            <span className="flex items-center gap-2">
              <FiTag size={16} className="text-yellow-400" />
              Limited Offer: <strong>{activeCoupons[0].code}</strong>
            </span>
            <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
              ({activeCoupons[0].discountType === 'percentage' ? `${activeCoupons[0].discountValue}%` : `₹${activeCoupons[0].discountValue}`} OFF)
            </span>
            <Link
              to="/dashboard"
              style={{
                color: 'white',
                textDecoration: 'none',
                background: 'rgba(255,255,255,0.15)',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                marginLeft: '0.5rem',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              Copy Code
            </Link>
          </div>
        </div>
      )}
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
              <Link to="/customize" className={isActive('/customize') ? 'active' : ''}>
                Customize
              </Link>
            </nav>

            {/* Smart Search Bar */}
            <SmartSearch navigate={navigate} />


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
                  {location.pathname === '/' ? (
                    <>
                      <button className="btn-auth-gradient" type="button" onClick={() => window.openLoginModal && window.openLoginModal()}>Login</button>
                      <button className="btn-auth-gradient" type="button" onClick={() => window.openRegisterModal && window.openRegisterModal()}>Register</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="btn-auth-gradient">Login</Link>
                      <Link to="/register" className="btn-auth-gradient">Register</Link>
                    </>
                  )}
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
            margin-left: 0.5rem;
          }
          
          .btn-auth-gradient:hover {
            box-shadow: 0 4px 12px rgba(54, 209, 196, 0.3);
            transform: translateY(-2px);
          }

          @media (max-width: 1024px) {
            .navbar-nav.desktop-nav { display: none; }
            .navbar-search-form { display: none; }
          }

          /* ── Smart Search ── */
          .smart-search-wrap {
            position: relative;
            flex: 1;
            max-width: 400px;
            margin-right: auto;
          }
          .smart-search-form { width: 100%; }
          .smart-search-inner {
            position: relative;
            display: flex;
            align-items: center;
          }
          .ss-icon-left {
            position: absolute;
            left: 12px;
            color: #64748b;
            pointer-events: none;
            flex-shrink: 0;
          }
          .ss-input {
            width: 100%;
            padding: 0.6rem 2.2rem 0.6rem 2.4rem;
            border-radius: 50px;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            font-size: 0.875rem;
            transition: all 0.2s;
            font-family: inherit;
          }
          .ss-input:focus {
            outline: none;
            border-color: #6366f1;
            background: #fff;
            box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
          }
          .ss-clear {
            position: absolute;
            right: 10px;
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            padding: 2px;
            display: flex;
            align-items: center;
            border-radius: 50%;
          }
          .ss-clear:hover { color: #475569; background: #f1f5f9; }
          .ss-spinner {
            position: absolute;
            right: 12px;
            width: 14px; height: 14px;
            border: 2px solid #e2e8f0;
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: ssSpin 0.6s linear infinite;
          }
          @keyframes ssSpin { to { transform: rotate(360deg); } }

          .ss-dropdown {
            position: absolute;
            top: calc(100% + 8px);
            left: 0; right: 0;
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06);
            border: 1px solid #f1f5f9;
            z-index: 9999;
            overflow: hidden;
            animation: ssDropIn 0.18s ease-out;
          }
          @keyframes ssDropIn {
            from { opacity: 0; transform: translateY(-6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .ss-intents {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            padding: 12px 14px 8px;
            border-bottom: 1px solid #f8fafc;
          }
          .ss-intent-tag {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: linear-gradient(135deg, #ede9fe, #dbeafe);
            color: #4c1d95;
            font-size: 11px;
            font-weight: 700;
            padding: 3px 10px;
            border-radius: 999px;
            border: 1px solid #c4b5fd;
          }
          .ss-results-label {
            padding: 8px 14px 4px;
            font-size: 11px;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.06em;
          }
          .ss-list {
            list-style: none;
            margin: 0;
            padding: 4px 0;
            max-height: 320px;
            overflow-y: auto;
          }
          .ss-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 14px;
            cursor: pointer;
            transition: background 0.15s;
          }
          .ss-item:hover { background: #f8fafc; }
          .ss-thumb {
            width: 42px; height: 42px;
            border-radius: 8px;
            background: #f1f5f9;
            flex-shrink: 0;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .ss-thumb img { width: 100%; height: 100%; object-fit: cover; }
          .ss-info { flex: 1; min-width: 0; }
          .ss-name {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: #0f172a;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .ss-meta { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
          .ss-cat {
            font-size: 10px;
            font-weight: 600;
            text-transform: capitalize;
            color: #6366f1;
            background: #ede9fe;
            padding: 1px 6px;
            border-radius: 4px;
          }
          .ss-rating {
            display: flex;
            align-items: center;
            gap: 2px;
            font-size: 11px;
            color: #f59e0b;
            font-weight: 600;
          }
          .ss-price {
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
            flex-shrink: 0;
          }
          .ss-empty {
            padding: 20px;
            text-align: center;
            color: #94a3b8;
            font-size: 13px;
          }
          .ss-view-all {
            display: block;
            width: 100%;
            padding: 12px;
            border: none;
            background: #f8fafc;
            border-top: 1px solid #f1f5f9;
            color: #6366f1;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            text-align: center;
            transition: background 0.15s;
          }
          .ss-view-all:hover { background: #ede9fe; }

          @media (max-width: 1024px) {
            .navbar-nav.desktop-nav { display: none; }
            .smart-search-wrap { display: none; }
          }
        `}
      </style>
    </header>
  );
};

export default Header;