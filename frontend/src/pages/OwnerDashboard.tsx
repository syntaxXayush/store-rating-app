import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth';
import api from '../api';

type SortDir = 'asc' | 'desc';

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [sort, setSort] = useState<{ key: string; dir: SortDir }>({ key: 'userName', dir: 'asc' });
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ password: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const fetchOwnerDashboard = () => {
    api.get('/stores/owner/dashboard')
      .then(r => setData(r.data))
      .catch(() => setData(null));
  };

  useEffect(() => {
    fetchOwnerDashboard();
    const intervalId = window.setInterval(fetchOwnerDashboard, 10000);
    const handleFocus = () => fetchOwnerDashboard();
    window.addEventListener('focus', handleFocus);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleSort = (key: string) => {
    setSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const sortedRatings = data?.ratings ? [...data.ratings].sort((a: any, b: any) => {
    const av = (a[sort.key] ?? '').toString();
    const bv = (b[sort.key] ?? '').toString();
    return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  }) : [];

  const validatePassword = (pw: string) => {
    if (pw.length < 8 || pw.length > 16) return 'Password must be 8–16 characters';
    if (!/[A-Z]/.test(pw)) return 'Must contain at least one uppercase letter';
    if (!/[!@#$%^&*]/.test(pw)) return 'Must contain at least one special character (!@#$%^&*)';
    return '';
  };

  const handleChangePassword = async () => {
    setPwError(''); setPwSuccess('');
    const err = validatePassword(pwForm.password);
    if (err) { setPwError(err); return; }
    if (pwForm.password !== pwForm.confirm) { setPwError('Passwords do not match'); return; }
    try {
      await api.patch('/users/change-password', { password: pwForm.password });
      setPwSuccess('Password changed successfully!');
      setPwForm({ password: '', confirm: '' });
      setTimeout(() => setShowPwModal(false), 1500);
    } catch (err: any) {
      setPwError(err.response?.data?.message || 'Failed to update password');
    }
  };

  const stars = (val: number | null) => val
    ? (
        <span style={{ display: 'inline-flex', gap: '0.25rem' }}>
          {[1,2,3,4,5].map(n => (
            <span key={n} style={{ color: n <= Math.round(val) ? 'var(--color-warning)' : '#d1d5db', fontSize: '1.5rem' }}>★</span>
          ))}
        </span>
      )
    : <span className="text-muted" style={{ fontSize: '1rem' }}>No ratings</span>;

  const SortIcon = ({ k }: { k: string }) => (
    <span style={{ marginLeft: 4, opacity: sort.key === k ? 1 : 0.3, display: 'inline-block', width: '12px' }}>
      {sort.key === k && sort.dir === 'desc' ? '▼' : '▲'}
    </span>
  );

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand">🏪 Store Owner Panel</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="text-muted">{user?.name}</span>
          <button className="btn btn-secondary" onClick={() => { setShowPwModal(true); setPwError(''); setPwSuccess(''); }}>
            Change Password
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className="main-content">
        {!data ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }} className="text-muted animate-fade-in">
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>🏪</div>
            <h2 className="heading-2" style={{ color: 'var(--text-muted)' }}>No store assigned yet</h2>
            <p>Contact the admin to link your account to a store</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div style={{ marginBottom: '2.5rem' }}>
              <h1 className="heading-1" style={{ fontSize: '2.5rem' }}>{data.store?.name}</h1>
              <p className="text-muted" style={{ fontSize: '1.1rem' }}>📍 {data.store?.address}</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--color-warning)' }}>
                  {data.averageRating ?? '–'}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>{stars(data.averageRating)}</div>
                <div className="stat-label">Average Rating</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{data.ratings?.length ?? 0}</div>
                <div className="stat-label">Total Ratings Received</div>
              </div>
            </div>

            {/* Ratings Table */}
            <div className="glass-card" style={{ marginTop: '2rem' }}>
              <h3 className="heading-2">Users Who Rated Your Store</h3>
              <div className="table-container">
                <table className="modern-table">
                  <thead>
                    <tr>
                      {[['userName', 'Customer Name'], ['userEmail', 'Email'], ['value', 'Rating'], ['date', 'Date']].map(([k, l]) => (
                        <th key={k} onClick={() => handleSort(k)}>
                          {l} <SortIcon k={k} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRatings.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center' }} className="text-muted">No ratings received yet</td></tr>
                    ) : sortedRatings.map((r: any, i: number) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 500 }}>{r.userName || '—'}</td>
                        <td className="text-muted">{r.userEmail || '—'}</td>
                        <td>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ display: 'flex', gap: '0.15rem' }}>
                              {[1,2,3,4,5].map(n => <span key={n} style={{ color: n <= r.value ? 'var(--color-warning)' : '#d1d5db', fontSize: '1.1rem' }}>★</span>)}
                            </span>
                            <span style={{ fontWeight: 700, color: 'var(--color-warning)' }}>{r.value}/5</span>
                          </span>
                        </td>
                        <td className="text-muted">{new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Change Password Modal */}
      {showPwModal && (
        <div className="modal-overlay" onClick={() => setShowPwModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-2" style={{ marginBottom: 0 }}>🔒 Change Password</h3>
            </div>
            
            {pwError && <div className="form-error" style={{ background: '#fee2e2', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>⚠ {pwError}</div>}
            {pwSuccess && <div className="form-error" style={{ background: '#dcfce7', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', color: '#166534' }}>✅ {pwSuccess}</div>}
            
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="8–16 chars, 1 uppercase, 1 special char"
                value={pwForm.password} 
                onChange={e => setPwForm(p => ({ ...p, password: e.target.value }))} 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Confirm new password"
                value={pwForm.confirm} 
                onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} 
              />
            </div>
            
            <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '-0.5rem', marginBottom: '1.5rem' }}>
              Must include 1 uppercase letter and 1 special character (!@#$%^&*)
            </div>
            
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowPwModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleChangePassword}>Update Password</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}