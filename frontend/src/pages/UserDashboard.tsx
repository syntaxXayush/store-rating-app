import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth';
import api from '../api';

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f3f4f6', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' },
  navbar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    background: '#ffffff',
    borderBottom: '1px solid rgba(148,163,184,0.35)',
    padding: '12px clamp(16px,4vw,32px)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navTitle: { fontSize: 18, fontWeight: 600 },
  navRight: { display: 'flex', alignItems: 'center', gap: 12 },
  logoutBtn: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: 999,
    padding: '8px 16px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13,
  },
  changePwBtn: {
    background: '#ffffff',
    color: '#111827',
    border: '1px solid #d1d5db',
    borderRadius: 999,
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  },
  content: { padding: '24px clamp(12px,4vw,32px) 32px' },
  pageTitle: { fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 },
  pageSubtitle: { color: '#6b7280', fontSize: 14, marginBottom: 24 },
  searchRow: { display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' as const },
  searchInput: {
    flex: '1 1 220px',
    padding: '11px 14px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    fontSize: 15,
    outline: 'none',
    background: '#ffffff',
    color: '#111827',
    caretColor: '#111827',
    transition: 'border 0.2s',
    colorScheme: 'light',
    WebkitTextFillColor: '#111827',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  storeCard: {
    background: '#ffffff',
    borderRadius: 16,
    padding: 20,
    border: '1px solid rgba(148,163,184,0.35)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
  },
  storeName: { fontSize: 16, fontWeight: 600, color: '#111827' },
  storeAddress: { fontSize: 13, color: '#6b7280' },
  ratingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  avgRating: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 },
  yourRating: { fontSize: 13, color: '#6b7280' },
  stars: { display: 'flex', gap: 4, marginTop: 8 },
  star: { fontSize: 24, cursor: 'pointer', userSelect: 'none' as const },
  submitBtn: {
    marginTop: 8,
    padding: '9px 0',
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: 999,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
  },
  editBtn: {
    marginTop: 8,
    padding: '9px 0',
    background: '#e5e7eb',
    color: '#111827',
    border: 'none',
    borderRadius: 999,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
  },
  emptyState: { textAlign: 'center' as const, color: '#9ca3af', padding: '60px 0', gridColumn: '1 / -1' },
  modalOverlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(15,23,42,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#ffffff',
    borderRadius: 16,
    padding: 24,
    minWidth: 320,
    maxWidth: 400,
    width: '100%',
    border: '1px solid rgba(148,163,184,0.35)',
  },
  modalTitle: { fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#111827' },
  formInput: {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    fontSize: 15,
    outline: 'none',
    transition: 'border 0.2s',
    background: '#ffffff',
    color: '#111827',
    caretColor: '#111827',
    colorScheme: 'light',
    WebkitTextFillColor: '#111827',
    boxSizing: 'border-box' as const,
    marginBottom: 8,
  },
  modalActions: { display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' },
  cancelBtn: {
    padding: '8px 16px',
    border: '1px solid #d1d5db',
    background: '#ffffff',
    borderRadius: 999,
    cursor: 'pointer',
    fontWeight: 500,
  },
  saveBtn: {
    padding: '8px 16px',
    background: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 700,
  },
  errText: { color: '#ef4444', fontSize: 13, marginBottom: 8 },
  successText: { color: '#059669', fontSize: 13, marginBottom: 8 },
  divider: { borderTop: '1px solid #e5e7eb', marginTop: 10, paddingTop: 10 },
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={styles.stars}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{ ...styles.star, color: n <= (hovered || value) ? '#f59e0b' : '#d1d5db' }}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}>★</span>
      ))}
    </div>
  );
}

function DisplayStars({ value }: { value: number | null }) {
  if (!value) return <span style={{ color: '#94a3b8', fontSize: 13 }}>No ratings yet</span>;
  return (
    <span>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{ color: n <= Math.round(value) ? '#f59e0b' : '#d1d5db', fontSize: 16 }}>★</span>
      ))}
      <span style={{ marginLeft: 6, fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>{value}</span>
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

  const fetchStores = async () => {
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
  };

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
    <div style={styles.page}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <span style={styles.navTitle}>🏪 Store Ratings</span>
        <div style={styles.navRight}>
          <span style={{ fontSize: 14, color: '#94a3b8' }}>{user?.name}</span>
          <button style={styles.changePwBtn} onClick={() => { setShowPwModal(true); setPwError(''); setPwSuccess(''); }}>
            Change Password
          </button>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.pageTitle}>Browse Stores</div>
        <div style={styles.pageSubtitle}>Discover stores and share your experience by rating them</div>

        {/* Search */}
        <div style={styles.searchRow}>
          <input style={styles.searchInput} placeholder="🔍 Search by store name..."
            value={searchName} onChange={e => setSearchName(e.target.value)} />
          <input style={styles.searchInput} placeholder="📍 Search by address..."
            value={searchAddress} onChange={e => setSearchAddress(e.target.value)} />
        </div>

        {/* Store Grid */}
        <div style={styles.grid}>
          {filtered.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏪</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>No stores found</div>
              <div style={{ fontSize: 14, marginTop: 6 }}>Try changing your search terms</div>
            </div>
          ) : filtered.map(store => {
            const myRating = myRatings[store.id];
            const pending = pendingRatings[store.id] || 0;
            const isEditing = editingStore === store.id;

            return (
              <div key={store.id} style={styles.storeCard}>
                <div style={styles.storeName}>{store.name}</div>
                <div style={styles.storeAddress}>📍 {store.address}</div>

                <div style={styles.divider} />

                <div style={styles.ratingRow}>
                  <div style={styles.avgRating}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#475569' }}>Overall:</span>
                    <DisplayStars value={store.averageRating} />
                  </div>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{store.totalRatings} rating{store.totalRatings !== 1 ? 's' : ''}</span>
                </div>

                {/* My Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Your rating:</span>
                  {myRating
                    ? <span>{[1,2,3,4,5].map(n => <span key={n} style={{ color: n <= myRating ? '#f59e0b' : '#d1d5db', fontSize: 15 }}>★</span>)}</span>
                    : <span style={{ fontSize: 13, color: '#94a3b8' }}>Not rated yet</span>}
                </div>

                {/* Rating interaction */}
                {(!myRating || isEditing) ? (
                  <>
                    <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                      {isEditing ? 'Update your rating:' : 'Select a rating:'}
                    </div>
                    <StarRating value={pending} onChange={v => setPendingRatings(prev => ({ ...prev, [store.id]: v }))} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{ ...styles.submitBtn, flex: 1, opacity: pending ? 1 : 0.5 }}
                        disabled={!pending}
                        onClick={() => handleSubmitRating(store.id)}>
                        {isEditing ? 'Update Rating' : 'Submit Rating'}
                      </button>
                      {isEditing && (
                        <button style={{ ...styles.cancelBtn, marginTop: 8 }}
                          onClick={() => { setEditingStore(null); setPendingRatings(prev => ({ ...prev, [store.id]: myRating })); }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <button style={styles.editBtn} onClick={() => { setEditingStore(store.id); setPendingRatings(prev => ({ ...prev, [store.id]: myRating })); }}>
                    ✏️ Modify Rating
                  </button>
                )}

                {submitMsg[store.id] && (
                  <div style={{ fontSize: 13, color: submitMsg[store.id].startsWith('✅') ? '#059669' : '#ef4444', marginTop: 4 }}>
                    {submitMsg[store.id]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Change Password Modal */}
      {showPwModal && (
        <div style={styles.modalOverlay} onClick={() => setShowPwModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>🔒 Change Password</div>
            {pwError && <div style={styles.errText}>⚠ {pwError}</div>}
            {pwSuccess && <div style={styles.successText}>✅ {pwSuccess}</div>}
            <input type="password" style={styles.formInput} placeholder="New password (8–16 chars)"
              value={pwForm.password} onChange={e => setPwForm(p => ({ ...p, password: e.target.value }))} />
            <input type="password" style={styles.formInput} placeholder="Confirm new password"
              value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} />
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>Must include 1 uppercase letter and 1 special character (!@#$%^&*)</div>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowPwModal(false)}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleChangePassword}>Update Password</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}