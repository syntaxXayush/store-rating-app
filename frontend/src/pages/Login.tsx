import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../useAuth';
import api from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.access_token);
      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'store_owner') navigate('/owner');
      else navigate('/user');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    fontSize: 15,
    boxSizing: 'border-box',
    outline: 'none',
    background: '#ffffff',
    color: '#111827',
    caretColor: '#111827',
    colorScheme: 'light',
    WebkitTextFillColor: '#111827',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ background: '#ffffff', borderRadius: 16, padding: '36px 40px', width: '100%', maxWidth: 420, boxShadow: '0 10px 40px rgba(15,23,42,0.08)', border: '1px solid rgba(209,213,219,0.7)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏪</div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#1e293b' }}>Welcome back</h2>
          <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: 14 }}>Sign in to your account</p>
        </div>
        {error && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', color: '#991b1b', fontSize: 14, marginBottom: 18 }}>⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" style={inputStyle} />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: 13, background: loading ? '#818cf8' : '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: 14, color: '#64748b', marginTop: 20 }}>
          No account? <Link to="/signup" style={{ color: '#4f46e5', fontWeight: 600 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}