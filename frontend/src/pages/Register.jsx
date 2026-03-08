import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const Register = ({ isModal, onSwitchToLogin }) => {
  const navigate = useNavigate();
  const { register, loginWithGoogle, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userRole] = useState(localStorage.getItem('userRole') || 'user');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      await register({ ...formData, role: userRole });
      navigate('/');
    } catch {
      // handle error (could show toast or set error state)
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        navigate('/');
      } else {
        alert(result.message || 'Google sign-up failed');
      }
    } catch (error) {
      console.error('Google sign-up error:', error);
      alert('Google sign-up failed. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f3f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 500, minHeight: 600, background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Logo or heading */}
        <div style={{ marginBottom: 24 }}>
          <img src="/assets/amazon-logo.png" alt="Logo" style={{ height: 36, marginBottom: 8 }} onError={e => { e.target.style.display = 'none'; }} />
          <h2 style={{ fontWeight: 700, fontSize: '1.5rem', color: '#232f3e', margin: 0 }}>Create account</h2>
        </div>
        <button
          type="button"
          onClick={handleGoogleSignUp}
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
          Sign up with Google
        </button>
        <div style={{ fontSize: 12, color: '#555', marginBottom: 16, width: '100%', textAlign: 'center' }}>OR</div>
        <form onSubmit={handleSubmit} style={{ width: '100%' }} autoComplete="on">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ fontWeight: 600, color: '#232f3e', fontSize: 14, marginBottom: 4, display: 'block' }}>Your name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 4, border: '1px solid #a6a6a6', fontSize: 15, background: '#fff', color: '#232f3e' }}
              />
            </div>
            <div>
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
            <div>
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
              <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>Passwords must be at least 6 characters.</div>
            </div>
            <div>
              <label style={{ fontWeight: 600, color: '#232f3e', fontSize: 14, marginBottom: 4, display: 'block' }}>Re-enter password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  style={{ width: '100%', padding: '10px 36px 10px 12px', borderRadius: 4, border: '1px solid #a6a6a6', fontSize: 15, background: '#fff', color: '#232f3e' }}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: 8, top: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: 'linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%)', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', borderRadius: 4, padding: '10px 0', marginBottom: 16, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(54, 209, 196, 0.3)' }}
          >
            {loading ? 'Creating Account...' : 'Create your account'}
          </button>
        </form>
        <div style={{ fontSize: 12, color: '#555', marginBottom: 16, textAlign: 'left', width: '100%' }}>
          By creating an account, you agree to Amazon's <a href="#" style={{ color: '#0066c0' }}>Conditions of Use</a> and <a href="#" style={{ color: '#0066c0' }}>Privacy Notice</a>.
        </div>
        <div style={{ fontSize: 14, color: '#232f3e', marginBottom: 8, width: '100%', textAlign: 'left' }}>
          Already have an account?{' '}
          {isModal ? (
            <button onClick={onSwitchToLogin} style={{ color: '#0066c0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}>Sign in</button>
          ) : (
            <Link to="/login" style={{ color: '#0066c0' }}>Sign in</Link>
          )}
        </div>
        <div style={{ borderTop: '1px solid #e6e6e6', margin: '16px 0', width: '100%' }} />
        <div style={{ fontSize: 12, color: '#555', width: '100%', textAlign: 'left' }}>
          Want to register as {userRole === 'user' ? 'admin' : 'user'}?{' '}
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

export default Register;