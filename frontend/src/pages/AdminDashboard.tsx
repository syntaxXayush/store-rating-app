import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth';
import api from '../api';

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#f3f4f6',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    color: '#0f172a',
  },
  navbar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    background: '#ffffff',
    backdropFilter: 'blur(8px)',
    color: '#111827',
    padding: '14px clamp(16px,4vw,32px)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(148,163,184,0.35)',
  },
  navTitle: { fontSize: 18, fontWeight: 600, letterSpacing: 0.4 },
  logoutBtn: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: 999,
    padding: '8px 18px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13,
  },
  content: {
    padding: '24px clamp(12px,4vw,32px) 32px',
  },
  statsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: '1 1 220px',
    background: '#ffffff',
    borderRadius: 16,
    padding: '20px 22px',
    border: '1px solid rgba(148,163,184,0.35)',
  },
  statValue: { fontSize: 32, fontWeight: 700 },
  statLabel: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  tabs: {
    display: 'flex',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  tab: {
    padding: '9px 18px',
    borderRadius: 999,
    border: '1px solid transparent',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: 13,
    background: '#e5e7eb',
    color: '#111827',
  },
  activeTab: {
    background: '#111827',
    borderColor: '#111827',
    color: '#f9fafb',
  },
  card: {
    background: '#ffffff',
    borderRadius: 16,
    padding: 20,
    border: '1px solid rgba(148,163,184,0.35)',
  },
  filterRow: {
    display: 'flex',
    gap: 10,
    marginBottom: 18,
    flexWrap: 'wrap' as const,
  },
  input: {
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    background: '#ffffff',
    color: '#111827',
    borderRadius: 8,
    fontSize: 13,
    minWidth: 160,
  },
  select: {
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    background: '#ffffff',
    color: '#111827',
    borderRadius: 8,
    fontSize: 13,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 13,
  },
  th: {
    textAlign: 'left' as const,
    padding: '10px 10px',
    borderBottom: '1px solid #e5e7eb',
    color: '#6b7280',
    fontWeight: 500,
    cursor: 'pointer',
    userSelect: 'none' as const,
    whiteSpace: 'nowrap' as const,
  },
  td: {
    padding: '10px 10px',
    borderBottom: '1px solid #f3f4f6',
    color: '#111827',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
  },
  addBtn: {
    background: '#111827',
    color: '#f9fafb',
    border: 'none',
    borderRadius: 999,
    padding: '9px 18px',
    cursor: 'pointer',
    fontWeight: 600,
    marginBottom: 8,
    fontSize: 13,
  },
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
    padding: 28,
    minWidth: 320,
    maxWidth: 460,
    width: '100%',
    border: '1px solid rgba(148,163,184,0.35)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 18,
    color: '#111827',
  },
  formGroup: { marginBottom: 14 },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#475569',
    marginBottom: 6,
  },
  formInput: {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid #d1d5db',
    background: '#ffffff',
    color: '#111827',
    borderRadius: 8,
    fontSize: 15,
    outline: 'none',
    transition: 'border 0.2s',
    caretColor: '#111827',
    colorScheme: 'light',
    WebkitTextFillColor: '#111827',
    boxSizing: 'border-box' as const,
  },
  modalActions: {
    display: 'flex',
    gap: 10,
    marginTop: 22,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '8px 16px',
    border: '1px solid #d1d5db',
    background: '#ffffff',
    color: '#111827',
    borderRadius: 999,
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: 13,
  },
  submitBtn: {
    padding: '8px 18px',
    background: '#111827',
    color: '#f9fafb',
    border: 'none',
    borderRadius: 999,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13,
  },
  viewBtn: {
    padding: '6px 12px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#111827',
    borderRadius: 999,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 12,
  },
  detailsLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 3,
  },
  detailsValue: {
    color: '#111827',
    fontSize: 14,
    wordBreak: 'break-word' as const,
  },
  errText: { color: '#f97373', fontSize: 12, marginTop: 4 },
};

const roleBadge = (role: string) => {
  const map: Record<string, string> = { admin: '#7c3aed', user: '#0891b2', store_owner: '#059669' };
  return { ...styles.badge, background: map[role] + '20', color: map[role] };
};

type SortDir = 'asc' | 'desc';
function sortData<T>(data: T[], key: keyof T, dir: SortDir): T[] {
  return [...data].sort((a, b) => {
    const av = (a[key] ?? '') as string, bv = (b[key] ?? '') as string;
    return dir === 'asc' ? av.toString().localeCompare(bv.toString()) : bv.toString().localeCompare(av.toString());
  });
}

const SortIcon = ({ active, dir }: { active: boolean; dir: SortDir }) =>
  <span style={{ marginLeft: 4, opacity: active ? 1 : 0.3 }}>{active && dir === 'desc' ? '▼' : '▲'}</span>;

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'users' | 'stores' | 'add'>('users');
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [userSort, setUserSort] = useState<{ key: string; dir: SortDir }>({ key: 'name', dir: 'asc' });

  // Stores state
  const [stores, setStores] = useState<any[]>([]);
  const [storeFilters, setStoreFilters] = useState({ name: '', email: '', address: '' });
  const [storeSort, setStoreSort] = useState<{ key: string; dir: SortDir }>({ key: 'name', dir: 'asc' });

  // Modal state
  const [showModal, setShowModal] = useState<null | 'user' | 'store' | 'details'>(null);
  const [form, setForm] = useState<any>({});
  const [formErrors, setFormErrors] = useState<any>({});
  const [submitMsg, setSubmitMsg] = useState('');
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  const fetchStats = () => api.get('/admin/dashboard').then(r => setStats(r.data));
  const fetchUsers = () => api.get('/users').then(r => setUsers(r.data));
  const fetchStores = () => api.get('/stores').then(r => setStores(r.data));
  const refreshAll = () => {
    fetchStats();
    fetchUsers();
    fetchStores();
  };

  useEffect(() => {
    refreshAll();

    const intervalId = window.setInterval(refreshAll, 10000);
    const handleFocus = () => refreshAll();
    window.addEventListener('focus', handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleUserSort = (key: string) => {
    setUserSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };
  const handleStoreSort = (key: string) => {
    setStoreSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const openUserDetails = async (id: string) => {
    setDetailsError('');
    setDetailsLoading(true);
    setUserDetails(null);
    setShowModal('details');
    try {
      const res = await api.get(`/users/${id}`);
      setUserDetails(res.data);
    } catch (err: any) {
      setDetailsError(err.response?.data?.message || 'Failed to fetch user details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredUsers = sortData(
    users.filter(u =>
      u.name?.toLowerCase().includes(userFilters.name.toLowerCase()) &&
      u.email?.toLowerCase().includes(userFilters.email.toLowerCase()) &&
      u.address?.toLowerCase().includes(userFilters.address.toLowerCase()) &&
      (userFilters.role === '' || u.role === userFilters.role)
    ),
    userSort.key as any, userSort.dir
  );

  const filteredStores = sortData(
    stores.filter(s =>
      s.name?.toLowerCase().includes(storeFilters.name.toLowerCase()) &&
      s.email?.toLowerCase().includes(storeFilters.email.toLowerCase()) &&
      s.address?.toLowerCase().includes(storeFilters.address.toLowerCase())
    ),
    storeSort.key as any, storeSort.dir
  );
  const assignableOwners = users.filter(
    u => u.role === 'store_owner' && !stores.some(s => s.owner_id === u.id),
  );

  // Validate form
  const validateUser = () => {
    const e: any = {};
    if (!form.name || form.name.length < 20 || form.name.length > 60) e.name = 'Name must be 20–60 characters';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.address || form.address.length > 400) e.address = 'Address required (max 400 chars)';
    if (!form.password || form.password.length < 8 || form.password.length > 16 ||
      !/[A-Z]/.test(form.password) || !/[!@#$%^&*]/.test(form.password))
      e.password = 'Password: 8-16 chars, 1 uppercase, 1 special char (!@#$%^&*)';
    if (!form.role) e.role = 'Role is required';
    return e;
  };

  const validateStore = () => {
    const e: any = {};
    if (!form.name || form.name.length < 20 || form.name.length > 60) e.name = 'Name must be 20–60 characters';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.address || form.address.length > 400) e.address = 'Address required (max 400 chars)';
    return e;
  };

  const handleSubmit = async () => {
    setSubmitMsg('');
    const errors = showModal === 'user' ? validateUser() : validateStore();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setFormErrors({});
    try {
      if (showModal === 'user') {
        await api.post('/users', form);
        fetchUsers();
        api.get('/admin/dashboard').then(r => setStats(r.data));
      } else {
        await api.post('/stores', form);
        fetchStores();
        api.get('/admin/dashboard').then(r => setStats(r.data));
      }
      setShowModal(null);
      setForm({});
      setSubmitMsg('');
    } catch (err: any) {
      setSubmitMsg(err.response?.data?.message || 'Error occurred');
    }
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <span style={styles.navTitle}>⚙️ Admin Panel</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14, color: '#94a3b8' }}>Welcome, {user?.name}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        {/* Stats */}
        <div style={styles.statsRow}>
          {[
            { label: 'Total Users', value: stats.totalUsers, color: '#4f46e5' },
            { label: 'Total Stores', value: stats.totalStores, color: '#0891b2' },
            { label: 'Total Ratings', value: stats.totalRatings, color: '#059669' },
          ].map(s => (
            <div key={s.label} style={styles.statCard}>
              <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {(['users', 'stores', 'add'] as const).map(t => (
            <button key={t} style={{ ...styles.tab, ...(tab === t ? styles.activeTab : {}) }} onClick={() => setTab(t)}>
              {t === 'users' ? '👥 Users' : t === 'stores' ? '🏪 Stores' : '➕ Add New'}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {tab === 'users' && (
          <div style={styles.card}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>All Users</h3>
            <div style={styles.filterRow}>
              {['name', 'email', 'address'].map(f => (
                <input key={f} style={styles.input} placeholder={`Filter by ${f}`}
                  value={(userFilters as any)[f]}
                  onChange={e => setUserFilters(prev => ({ ...prev, [f]: e.target.value }))} />
              ))}
              <select style={styles.select} value={userFilters.role}
                onChange={e => setUserFilters(prev => ({ ...prev, role: e.target.value }))}>
                <option value="">All roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="store_owner">Store Owner</option>
              </select>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  {[['name', 'Name'], ['email', 'Email'], ['address', 'Address'], ['role', 'Role']].map(([k, l]) => (
                    <th key={k} style={styles.th} onClick={() => handleUserSort(k)}>
                      {l} <SortIcon active={userSort.key === k} dir={userSort.dir} />
                    </th>
                  ))}
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: '#94a3b8' }}>No users found</td></tr>
                ) : filteredUsers.map(u => (
                  <tr key={u.id} style={{ transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={styles.td}>{u.name}</td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>{u.address}</td>
                    <td style={styles.td}><span style={roleBadge(u.role)}>{u.role}</span></td>
                    <td style={styles.td}>
                      <button style={styles.viewBtn} onClick={() => openUserDetails(u.id)}>View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stores Tab */}
        {tab === 'stores' && (
          <div style={styles.card}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>All Stores</h3>
            <div style={styles.filterRow}>
              {['name', 'email', 'address'].map(f => (
                <input key={f} style={styles.input} placeholder={`Filter by ${f}`}
                  value={(storeFilters as any)[f]}
                  onChange={e => setStoreFilters(prev => ({ ...prev, [f]: e.target.value }))} />
              ))}
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  {[['name', 'Name'], ['email', 'Email'], ['address', 'Address'], ['averageRating', 'Rating']].map(([k, l]) => (
                    <th key={k} style={styles.th} onClick={() => handleStoreSort(k)}>
                      {l} <SortIcon active={storeSort.key === k} dir={storeSort.dir} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStores.length === 0 ? (
                  <tr><td colSpan={4} style={{ ...styles.td, textAlign: 'center', color: '#94a3b8' }}>No stores found</td></tr>
                ) : filteredStores.map(s => (
                  <tr key={s.id}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={styles.td}>{s.name}</td>
                    <td style={styles.td}>{s.email}</td>
                    <td style={styles.td}>{s.address}</td>
                    <td style={styles.td}>
                      {s.averageRating
                        ? <span style={{ fontWeight: 700, color: '#f59e0b' }}>★ {s.averageRating}</span>
                        : <span style={{ color: '#94a3b8' }}>No ratings yet</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add New Tab */}
        {tab === 'add' && (
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ ...styles.card, flex: 1 }}>
              <h3 style={{ marginTop: 0 }}>Add a new user</h3>
              <p style={{ color: '#64748b', fontSize: 14 }}>Create admin, normal user, or store owner accounts.</p>
              <button style={styles.addBtn} onClick={() => { setForm({}); setFormErrors({}); setShowModal('user'); }}>
                + Add User
              </button>
            </div>
            <div style={{ ...styles.card, flex: 1 }}>
              <h3 style={{ marginTop: 0 }}>Add a new store</h3>
              <p style={{ color: '#64748b', fontSize: 14 }}>Register a new store and optionally assign a store owner.</p>
              <button style={{ ...styles.addBtn, background: '#0891b2' }}
                onClick={() => { setForm({ owner_id: '' }); setFormErrors({}); setShowModal('store'); }}>
                + Add Store
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>
              {showModal === 'user' ? 'Add New User' : showModal === 'store' ? 'Add New Store' : 'User Details'}
            </h3>

            {showModal === 'user' && (
              <>
                {[
                  { key: 'name', label: 'Full Name', placeholder: 'Min 20, max 60 characters', type: 'text' },
                  { key: 'email', label: 'Email Address', placeholder: 'user@example.com', type: 'email' },
                  { key: 'address', label: 'Address', placeholder: 'Max 400 characters', type: 'text' },
                  { key: 'password', label: 'Password', placeholder: '8-16 chars, 1 uppercase, 1 special char', type: 'password' },
                ].map(f => (
                  <div key={f.key} style={styles.formGroup}>
                    <label style={styles.label}>{f.label}</label>
                    <input type={f.type} style={styles.formInput} placeholder={f.placeholder}
                      value={form[f.key] || ''}
                      onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))} />
                    {formErrors[f.key] && <div style={styles.errText}>{formErrors[f.key]}</div>}
                  </div>
                ))}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Role</label>
                  <select style={{ ...styles.formInput }} value={form.role || ''}
                    onChange={e => setForm((p: any) => ({ ...p, role: e.target.value }))}>
                    <option value="">Select role</option>
                    <option value="admin">Admin</option>
                    <option value="user">Normal User</option>
                    <option value="store_owner">Store Owner</option>
                  </select>
                  {formErrors.role && <div style={styles.errText}>{formErrors.role}</div>}
                </div>
              </>
            )}

            {showModal === 'store' && (
              <>
                {[
                  { key: 'name', label: 'Store Name', placeholder: 'Min 20, max 60 characters', type: 'text' },
                  { key: 'email', label: 'Store Email', placeholder: 'store@example.com', type: 'email' },
                  { key: 'address', label: 'Store Address', placeholder: 'Max 400 characters', type: 'text' },
                ].map(f => (
                  <div key={f.key} style={styles.formGroup}>
                    <label style={styles.label}>{f.label}</label>
                    <input type={f.type} style={styles.formInput} placeholder={f.placeholder}
                      value={form[f.key] || ''}
                      onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))} />
                    {formErrors[f.key] && <div style={styles.errText}>{formErrors[f.key]}</div>}
                  </div>
                ))}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Assign Store Owner (Optional)</label>
                  <select
                    style={{ ...styles.formInput }}
                    value={form.owner_id || ''}
                    onChange={e => setForm((p: any) => ({ ...p, owner_id: e.target.value }))}
                  >
                    <option value="">No owner assigned</option>
                    {assignableOwners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name} ({owner.email})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {showModal === 'details' && (
              <>
                {detailsLoading && <div style={{ color: '#64748b', fontSize: 13 }}>Loading details...</div>}
                {detailsError && <div style={styles.errText}>{detailsError}</div>}
                {userDetails && (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {[
                      ['Name', userDetails.name],
                      ['Email', userDetails.email],
                      ['Address', userDetails.address],
                      ['Role', userDetails.role],
                    ].map(([label, value]) => (
                      <div key={label as string}>
                        <div style={styles.detailsLabel}>{label}</div>
                        <div style={styles.detailsValue}>{value as string}</div>
                      </div>
                    ))}

                    {userDetails.role === 'store_owner' && (
                      <>
                        <div>
                          <div style={styles.detailsLabel}>Owner Store</div>
                          <div style={styles.detailsValue}>
                            {userDetails.ownerStore ? `${userDetails.ownerStore.name} (${userDetails.ownerStore.email})` : 'No linked store'}
                          </div>
                        </div>
                        <div>
                          <div style={styles.detailsLabel}>Store Rating</div>
                          <div style={styles.detailsValue}>
                            {userDetails.ownerRating === null || userDetails.ownerRating === undefined
                              ? 'No ratings yet'
                              : `${userDetails.ownerRating} (${userDetails.ownerRatingCount} ratings)`}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {submitMsg && showModal !== 'details' && <div style={styles.errText}>{submitMsg}</div>}

            {showModal === 'details' ? (
              <div style={styles.modalActions}>
                <button style={styles.cancelBtn} onClick={() => setShowModal(null)}>Close</button>
              </div>
            ) : (
              <div style={styles.modalActions}>
                <button style={styles.cancelBtn} onClick={() => setShowModal(null)}>Cancel</button>
                <button style={styles.submitBtn} onClick={handleSubmit}>Save</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}