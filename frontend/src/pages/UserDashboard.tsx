import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth';
import api from '../api';

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          className={`star ${n <= (hovered || value) ? 'active' : ''}`}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function DisplayStars({ value }: { value: number | null }) {
  if (!value) return <span className="text-muted">No ratings yet</span>;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{ color: n <= Math.round(value) ? 'var(--color-warning)' : '#d1d5db', fontSize: '1.2rem' }}>★</span>
      ))}
      <span style={{ marginLeft: '0.25rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-warning)' }}>{value.toFixed(1)}</span>
    </span>
  );
}

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stores, setStores] = useState<any[]>([]);
  const [myRatings, setMyRatings] = useState<Record<string, number>>({});
  const [pendingRatings, setPendingRatings] = useState<Record<string, number>>({});
  const [editingStore, setEditingStore] = useState<string | null>(null);
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [submitMsg, setSubmitMsg] = useState<Record<string, string>>({});

  // Change password modal
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ password: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const fetchStores = async () => {
    try {
      const res = await api.get('/stores');
      setStores(res.data);
      // Fetch my rating for each store
      const ratings: Record<string, number> = {};
      await Promise.all(res.data.map(async (s: any) => {
        try {
          const r = await api.get(`/ratings/${s.id}/my`);
          if (r.data) ratings[s.id] = r.data.value;
        } catch {}
      }));
      setMyRatings(ratings);
      setPendingRatings({ ...ratings });
    } catch (error) {
      console.error("Failed to fetch stores", error);
    }
  };

  useEffect(() => {
    fetchStores();
    const intervalId = window.setInterval(fetchStores, 15000);
    const handleFocus = () => fetchStores();
    window.addEventListener('focus', handleFocus);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleSubmitRating = async (storeId: string) => {
    const value = pendingRatings[storeId];
    if (!value) return;
    try {
      await api.post(`/ratings/${storeId}`, { value });
      setMyRatings(prev => ({ ...prev, [storeId]: value }));
      setEditingStore(null);
      setSubmitMsg(prev => ({ ...prev, [storeId]: '✅ Rating submitted!' }));
      setTimeout(() => setSubmitMsg(prev => ({ ...prev, [storeId]: '' })), 2500);
      fetchStores(); // refresh average
    } catch (err: any) {
      setSubmitMsg(prev => ({ ...prev, [storeId]: '❌ Failed to submit' }));
    }
  };

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

  const filtered = stores.filter(s =>
    s.name?.toLowerCase().includes(searchName.toLowerCase()) &&
    s.address?.toLowerCase().includes(searchAddress.toLowerCase())
  );

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">🏪 Store Ratings</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="text-muted">{user?.name}</span>
          <button className="btn btn-secondary" onClick={() => { setShowPwModal(true); setPwError(''); setPwSuccess(''); }}>
            Change Password
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className="main-content">
        <h1 className="heading-1" style={{ fontSize: '2.5rem' }}>Browse Stores</h1>
        <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>Discover stores and share your experience by rating them</p>

        {/* Search */}
        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input 
            className="form-input" 
            style={{ flex: '1 1 250px' }} 
            placeholder="🔍 Search by store name..."
            value={searchName} 
            onChange={e => setSearchName(e.target.value)} 
          />
          <input 
            className="form-input" 
            style={{ flex: '1 1 250px' }} 
            placeholder="📍 Search by address..."
            value={searchAddress} 
            onChange={e => setSearchAddress(e.target.value)} 
          />
        </div>

        {/* Store Grid */}
        <div className="store-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', gridColumn: '1 / -1' }} className="text-muted">
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🏪</div>
              <h3 className="heading-2" style={{ color: 'var(--text-muted)' }}>No stores found</h3>
              <p>Try changing your search terms</p>
            </div>
          ) : filtered.map(store => {
            const myRating = myRatings[store.id];
            const pending = pendingRatings[store.id] || 0;
            const isEditing = editingStore === store.id;

            return (
              <div key={store.id} className="store-card">
                <div className="store-card-header">
                  <h3 className="heading-2" style={{ marginBottom: '0.25rem', fontSize: '1.25rem' }}>{store.name}</h3>
                  <div className="text-muted" style={{ fontSize: '0.85rem' }}>📍 {store.address}</div>
                </div>

                <div className="store-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Rating</span>
                      <DisplayStars value={store.averageRating} />
                    </div>
                    <span className="badge" style={{ background: 'var(--bg-main)', color: 'var(--text-muted)', border: '1px solid var(--border-light)' }}>
                      {store.totalRatings} rating{store.totalRatings !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '1rem 0' }} />

                  {/* My Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span className="form-label" style={{ marginBottom: 0 }}>Your rating:</span>
                    {myRating ? (
                      <span style={{ display: 'flex', gap: '0.15rem' }}>
                        {[1,2,3,4,5].map(n => <span key={n} style={{ color: n <= myRating ? 'var(--color-warning)' : '#d1d5db', fontSize: '1.1rem' }}>★</span>)}
                      </span>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.9rem' }}>Not rated yet</span>
                    )}
                  </div>

                  {/* Rating interaction */}
                  {(!myRating || isEditing) ? (
                    <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                      <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        {isEditing ? 'Update your rating:' : 'Select a rating:'}
                      </div>
                      <StarRating value={pending} onChange={v => setPendingRatings(prev => ({ ...prev, [store.id]: v }))} />
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button 
                          className="btn btn-primary" 
                          style={{ flex: 1, padding: '0.5rem' }}
                          disabled={!pending}
                          onClick={() => handleSubmitRating(store.id)}
                        >
                          {isEditing ? 'Update' : 'Submit'}
                        </button>
                        {isEditing && (
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.5rem' }}
                            onClick={() => { setEditingStore(null); setPendingRatings(prev => ({ ...prev, [store.id]: myRating })); }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button 
                      className="btn btn-secondary" 
                      style={{ width: '100%', padding: '0.5rem' }}
                      onClick={() => { setEditingStore(store.id); setPendingRatings(prev => ({ ...prev, [store.id]: myRating })); }}
                    >
                      ✏️ Modify Rating
                    </button>
                  )}

                  {submitMsg[store.id] && (
                    <div className="form-error" style={{ color: submitMsg[store.id].startsWith('✅') ? 'var(--color-success)' : 'var(--color-danger)', marginTop: '0.5rem', textAlign: 'center' }}>
                      {submitMsg[store.id]}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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