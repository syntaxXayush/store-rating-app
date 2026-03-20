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
  topRow: { display: 'flex', gap: 20, marginBottom: 32 },
  statCard: {
    flex: 1,
    background: '#ffffff',
    borderRadius: 16,
    padding: '20px 22px',
    border: '1px solid rgba(148,163,184,0.35)',
  },
  statValue: { fontSize: 36, fontWeight: 700 },
  statLabel: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  starsRow: { display: 'flex', gap: 4, marginTop: 8 },
  card: {
    background: '#ffffff',
    borderRadius: 16,
    padding: 20,
    border: '1px solid rgba(148,163,184,0.35)',
  },
  cardTitle: { fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 18, marginTop: 0 },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: 14 },
  th: { textAlign: 'left' as const, padding: '10px 10px', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontWeight: 500, cursor: 'pointer', userSelect: 'none' as const },
  td: { padding: '10px 10px', borderBottom: '1px solid #f3f4f6', color: '#111827' },
  emptyRow: { textAlign: 'center' as const, color: '#94a3b8', padding: '40px 0' },
  sortIcon: { marginLeft: 4, opacity: 0.4 },
  activeSortIcon: { marginLeft: 4, opacity: 1 },
  modalOverlay: { position: 'fixed' as const, inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: 16, padding: 24, minWidth: 320, maxWidth: 400, border: '1px solid rgba(148,163,184,0.35)' },
  modalTitle: { fontSize: 18, fontWeight: 700, marginBottom: 18, color: '#111827' },
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
  cancelBtn: { padding: '8px 16px', border: '1px solid #d1d5db', background: '#fff', borderRadius: 999, cursor: 'pointer', fontWeight: 500 },
  saveBtn: { padding: '8px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 },
  errText: { color: '#ef4444', fontSize: 13, marginBottom: 8 },
  successText: { color: '#059669', fontSize: 13, marginBottom: 8 },
};

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
    ? [1,2,3,4,5].map(n => <span key={n} style={{ color: n <= Math.round(val) ? '#f59e0b' : '#d1d5db', fontSize: 18 }}>★</span>)
    : <span style={{ color: '#94a3b8' }}>No ratings</span>;

  const SortIcon = ({ k }: { k: string }) => (
    <span style={sort.key === k ? styles.activeSortIcon : styles.sortIcon}>
      {sort.key === k && sort.dir === 'desc' ? '▼' : '▲'}
    </span>
  );

  return (
    <div style={styles.page}>
      <div style={styles.navbar}>
        <span style={styles.navTitle}>🏪 Store Owner Panel</span>
        <div style={styles.navRight}>
          <span style={{ fontSize: 14, color: '#94a3b8' }}>{user?.name}</span>
          <button style={styles.changePwBtn} onClick={() => { setShowPwModal(true); setPwError(''); setPwSuccess(''); }}>
            Change Password
          </button>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        {!data ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏪</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>No store assigned yet</div>
            <div style={{ fontSize: 14, marginTop: 6 }}>Contact the admin to link your account to a store</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>{data.store?.name}</div>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>📍 {data.store?.address}</div>

            {/* Stats */}
            <div style={styles.topRow}>
              <div style={styles.statCard}>
                <div style={{ ...styles.statValue, color: '#f59e0b' }}>
                  {data.averageRating ?? '–'}
                </div>
                <div style={styles.starsRow}>{stars(data.averageRating)}</div>
                <div style={styles.statLabel}>Average Rating</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statValue, color: '#4f46e5' }}>{data.ratings?.length ?? 0}</div>
                <div style={styles.statLabel}>Total Ratings Received</div>
              </div>
            </div>

            {/* Ratings Table */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Users Who Rated Your Store</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {[['userName', 'Customer Name'], ['userEmail', 'Email'], ['value', 'Rating'], ['date', 'Date']].map(([k, l]) => (
                      <th key={k} style={styles.th} onClick={() => handleSort(k)}>
                        {l} <SortIcon k={k} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedRatings.length === 0 ? (
                    <tr><td colSpan={4} style={styles.emptyRow}>No ratings received yet</td></tr>
                  ) : sortedRatings.map((r: any, i: number) => (
                    <tr key={i}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={styles.td}>{r.userName || '—'}</td>
                      <td style={styles.td}>{r.userEmail || '—'}</td>
                      <td style={styles.td}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {[1,2,3,4,5].map(n => <span key={n} style={{ color: n <= r.value ? '#f59e0b' : '#d1d5db', fontSize: 15 }}>★</span>)}
                          <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: 13 }}>{r.value}/5</span>
                        </span>
                      </td>
                      <td style={styles.td}>{new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
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