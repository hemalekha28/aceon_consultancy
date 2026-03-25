import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('token');
    if (t) {
      setToken(t);
    } else {
      setError('Invalid or missing reset link.');
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!token) {
      setError('Invalid reset token.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await resetPassword(token, password);
    setLoading(false);

    if (result.success) {
      setMessage(result.message || 'Password reset successful. Redirecting to sign in...');
      setTimeout(() => navigate('/login'), 2500);
    } else {
      setError(result.message || 'Unable to reset password. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f3f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 380, background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginBottom: 24 }}>
          <img src="/assets/amazon-logo.png" alt="Logo" style={{ height: 36, marginBottom: 8 }} onError={e => { e.target.style.display = 'none'; }} />
          <h2 style={{ fontWeight: 700, fontSize: '1.4rem', color: '#232f3e', margin: 0 }}>Create new password</h2>
        </div>

        {message && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem', width: '100%' }}>
            {message}
          </div>
        )}
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem', width: '100%' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600, color: '#232f3e', fontSize: 14, marginBottom: 4, display: 'block' }}>New password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 4, border: '1px solid #a6a6a6', fontSize: 15, background: '#fff', color: '#232f3e' }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600, color: '#232f3e', fontSize: 14, marginBottom: 4, display: 'block' }}>Re-enter new password</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 4, border: '1px solid #a6a6a6', fontSize: 15, background: '#fff', color: '#232f3e' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: 'linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%)', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 4, padding: '10px 0', marginBottom: 16, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(54, 209, 196, 0.3)' }}
          >
            {loading ? 'Updating password...' : 'Save changes'}
          </button>
        </form>

        <div style={{ fontSize: 13, color: '#232f3e', width: '100%', textAlign: 'left' }}>
          <Link to="/login" style={{ color: '#0066c0' }}>Back to sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
