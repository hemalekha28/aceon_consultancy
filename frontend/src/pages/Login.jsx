import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import axios from "axios";
const Login = ({ isModal, onSwitchToRegister }) => {
  const { login, loginWithGoogle, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password, userRole);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Google sign-in failed. Please try again.');
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: isModal ? 'auto' : '100vh', background: isModal ? 'transparent' : '#f3f3f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 350, background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginBottom: 24 }}>
          <img src="/assets/amazon-logo.png" alt="Logo" style={{ height: 36, marginBottom: 8 }} onError={e => { e.target.style.display = 'none'; }} />
          <h2 style={{ fontWeight: 700, fontSize: '1.5rem', color: '#232f3e', margin: 0 }}>Sign in</h2>
        </div>
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem', width: '100%' }}>
            {error}
          </div>
        )}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%',
            background: 'linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            border: 'none',
            borderRadius: 4,
            padding: '10px 0',
            marginBottom: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(30, 60, 114, 0.3)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285f4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34a853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fbbc05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ea4335"/>
          </svg>
          Sign in with Google
        </button>
        <div style={{ fontSize: 12, color: '#555', marginBottom: 16, width: '100%', textAlign: 'center' }}>OR</div>
        <form onSubmit={handleSubmit} style={{ width: '100%' }} autoComplete="on">
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600, color: '#232f3e', fontSize: 14, marginBottom: 4, display: 'block' }}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: 4, border: '1px solid #a6a6a6', fontSize: 15, background: '#fff', color: '#232f3e' }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600, color: '#232f3e', fontSize: 14, marginBottom: 4, display: 'block' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                style={{ width: '100%', padding: '10px 36px 10px 12px', borderRadius: 4, border: '1px solid #a6a6a6', fontSize: 15, background: '#fff', color: '#232f3e' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 8, top: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: 'linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%)', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', borderRadius: 4, padding: '10px 0', marginBottom: 16, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(54, 209, 196, 0.3)' }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div style={{ fontSize: 14, color: '#232f3e', marginBottom: 8, width: '100%', textAlign: 'left' }}>
          Don't have an account?{' '}
          {isModal ? (
            <button onClick={onSwitchToRegister} style={{ color: '#0066c0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}>Sign up</button>
          ) : (
            <Link to="/register" style={{ color: '#0066c0', fontWeight: '500' }}>Sign up</Link>
          )}
        </div>
        <div style={{ borderTop: '1px solid #e6e6e6', margin: '16px 0', width: '100%' }} />
        <div style={{ fontSize: 12, color: '#555', width: '100%', textAlign: 'left' }}>
          Want to switch to {userRole === 'user' ? 'admin' : 'user'} mode?{' '}
          <button
            onClick={() => {
              localStorage.removeItem('userRole');
              window.location.reload();
            }}
            style={{ background: 'none', border: 'none', color: '#0066c0', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
          >
            Switch Role
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;