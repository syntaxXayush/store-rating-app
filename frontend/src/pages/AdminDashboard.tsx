import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth';
import api from '../api';

type SortDir = 'asc' | 'desc';
function sortData<T>(data: T[], key: keyof T, dir: SortDir): T[] {
  return [...data].sort((a, b) => {
    const av = (a[key] ?? '') as string, bv = (b[key] ?? '') as string;
    return dir === 'asc' ? av.toString().localeCompare(bv.toString()) : bv.toString().localeCompare(av.toString());
  });
}

const SortIcon = ({ active, dir }: { active: boolean; dir: SortDir }) =>
  <span style={{ marginLeft: 4, opacity: active ? 1 : 0.3, display: 'inline-block', width: '12px' }}>{active && dir === 'desc' ? '▼' : '▲'}</span>;

const roleBadgeClass = (role: string) => {
  if (role === 'admin') return 'badge badge-admin';
  if (role === 'store_owner') return 'badge badge-owner';
  return 'badge badge-user';
};

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
      } else {
        await api.post('/stores', form);
      }
      refreshAll();
      setShowModal(null);
      setForm({});
      setSubmitMsg('');
    } catch (err: any) {
      setSubmitMsg(err.response?.data?.message || 'Error occurred');
    }
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">⚙️ Admin Panel</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="text-muted">Welcome, {user?.name}</span>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className="main-content">
        {/* Stats */}
        <div className="stats-grid animate-fade-in">
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--color-info)' }}>{stats.totalStores}</div>
            <div className="stat-label">Total Stores</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--color-success)' }}>{stats.totalRatings}</div>
            <div className="stat-label">Total Ratings</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {(['users', 'stores', 'add'] as const).map(t => (
            <button
              key={t}
              className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTab(t)}
            >
              {t === 'users' ? '👥 Users' : t === 'stores' ? '🏪 Stores' : '➕ Add New'}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="glass-card animate-fade-in">
            <h2 className="heading-2">All Users</h2>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {['name', 'email', 'address'].map(f => (
                <input
                  key={f}
                  className="form-input"
                  style={{ flex: 1, minWidth: '200px' }}
                  placeholder={`Filter by ${f}`}
                  value={(userFilters as any)[f]}
                  onChange={e => setUserFilters(prev => ({ ...prev, [f]: e.target.value }))}
                />
              ))}
              <select
                className="form-input"
                style={{ flex: 1, minWidth: '150px' }}
                value={userFilters.role}
                onChange={e => setUserFilters(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="">All roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="store_owner">Store Owner</option>
              </select>
            </div>
            
            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    {[['name', 'Name'], ['email', 'Email'], ['address', 'Address'], ['role', 'Role']].map(([k, l]) => (
                      <th key={k} onClick={() => handleUserSort(k)}>
                        {l} <SortIcon active={userSort.key === k} dir={userSort.dir} />
                      </th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center' }} className="text-muted">No users found</td></tr>
                  ) : filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.address}</td>
                      <td><span className={roleBadgeClass(u.role)}>{u.role.replace('_', ' ')}</span></td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => openUserDetails(u.id)}>
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stores Tab */}
        {tab === 'stores' && (
          <div className="glass-card animate-fade-in">
            <h2 className="heading-2">All Stores</h2>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {['name', 'email', 'address'].map(f => (
                <input
                  key={f}
                  className="form-input"
                  style={{ flex: 1, minWidth: '200px' }}
                  placeholder={`Filter by ${f}`}
                  value={(storeFilters as any)[f]}
                  onChange={e => setStoreFilters(prev => ({ ...prev, [f]: e.target.value }))}
                />
              ))}
            </div>
            
            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    {[['name', 'Name'], ['email', 'Email'], ['address', 'Address'], ['averageRating', 'Rating']].map(([k, l]) => (
                      <th key={k} onClick={() => handleStoreSort(k)}>
                        {l} <SortIcon active={storeSort.key === k} dir={storeSort.dir} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStores.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center' }} className="text-muted">No stores found</td></tr>
                  ) : filteredStores.map(s => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.email}</td>
                      <td>{s.address}</td>
                      <td>
                        {s.averageRating
                          ? <span style={{ fontWeight: 700, color: 'var(--color-warning)' }}>★ {s.averageRating}</span>
                          : <span className="text-muted">No ratings</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add New Tab */}
        {tab === 'add' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="glass-card animate-fade-in">
              <h2 className="heading-2">Add a new user</h2>
              <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Create admin, normal user, or store owner accounts.</p>
              <button className="btn btn-primary" onClick={() => { setForm({}); setFormErrors({}); setShowModal('user'); }}>
                + Add User
              </button>
            </div>
            <div className="glass-card animate-fade-in">
              <h2 className="heading-2">Add a new store</h2>
              <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Register a new store and optionally assign a store owner.</p>
              <button className="btn btn-primary" style={{ background: 'var(--color-info)' }} onClick={() => { setForm({ owner_id: '' }); setFormErrors({}); setShowModal('store'); }}>
                + Add Store
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-2" style={{ marginBottom: 0 }}>
                {showModal === 'user' ? 'Add New User' : showModal === 'store' ? 'Add New Store' : 'User Details'}
              </h3>
            </div>

            {showModal === 'user' && (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                {[
                  { key: 'name', label: 'Full Name', placeholder: 'Min 20, max 60 characters', type: 'text' },
                  { key: 'email', label: 'Email Address', placeholder: 'user@example.com', type: 'email' },
                  { key: 'address', label: 'Address', placeholder: 'Max 400 characters', type: 'text' },
                  { key: 'password', label: 'Password', placeholder: '8-16 chars, 1 uppercase, 1 special char', type: 'password' },
                ].map(f => (
                  <div key={f.key} className="form-group">
                    <label className="form-label">{f.label}</label>
                    <input
                      type={f.type}
                      className="form-input"
                      placeholder={f.placeholder}
                      value={form[f.key] || ''}
                      onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                      style={formErrors[f.key] ? { borderColor: 'var(--color-danger)' } : {}}
                    />
                    {formErrors[f.key] && <div className="form-error">{formErrors[f.key]}</div>}
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    className="form-input"
                    value={form.role || ''}
                    onChange={e => setForm((p: any) => ({ ...p, role: e.target.value }))}
                    style={formErrors.role ? { borderColor: 'var(--color-danger)' } : {}}
                  >
                    <option value="">Select role</option>
                    <option value="admin">Admin</option>
                    <option value="user">Normal User</option>
                    <option value="store_owner">Store Owner</option>
                  </select>
                  {formErrors.role && <div className="form-error">{formErrors.role}</div>}
                </div>
              </form>
            )}

            {showModal === 'store' && (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                {[
                  { key: 'name', label: 'Store Name', placeholder: 'Min 20, max 60 characters', type: 'text' },
                  { key: 'email', label: 'Store Email', placeholder: 'store@example.com', type: 'email' },
                  { key: 'address', label: 'Store Address', placeholder: 'Max 400 characters', type: 'text' },
                ].map(f => (
                  <div key={f.key} className="form-group">
                    <label className="form-label">{f.label}</label>
                    <input
                      type={f.type}
                      className="form-input"
                      placeholder={f.placeholder}
                      value={form[f.key] || ''}
                      onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                      style={formErrors[f.key] ? { borderColor: 'var(--color-danger)' } : {}}
                    />
                    {formErrors[f.key] && <div className="form-error">{formErrors[f.key]}</div>}
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Assign Store Owner (Optional)</label>
                  <select
                    className="form-input"
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
              </form>
            )}

            {showModal === 'details' && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {detailsLoading && <div className="text-muted">Loading details...</div>}
                {detailsError && <div className="form-error">{detailsError}</div>}
                {userDetails && (
                  <>
                    {[
                      ['Name', userDetails.name],
                      ['Email', userDetails.email],
                      ['Address', userDetails.address],
                      ['Role', userDetails.role],
                    ].map(([label, value]) => (
                      <div key={label as string}>
                        <div className="form-label" style={{ marginBottom: '0.25rem' }}>{label}</div>
                        <div style={{ color: 'var(--text-main)', fontSize: '1rem' }}>{value as string}</div>
                      </div>
                    ))}

                    {userDetails.role === 'store_owner' && (
                      <>
                        <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '0.5rem 0' }} />
                        <div>
                          <div className="form-label" style={{ marginBottom: '0.25rem' }}>Owner Store</div>
                          <div style={{ color: 'var(--text-main)', fontSize: '1rem' }}>
                            {userDetails.ownerStore ? `${userDetails.ownerStore.name} (${userDetails.ownerStore.email})` : <span className="text-muted">No linked store</span>}
                          </div>
                        </div>
                        <div>
                          <div className="form-label" style={{ marginBottom: '0.25rem' }}>Store Rating</div>
                          <div style={{ color: 'var(--text-main)', fontSize: '1rem' }}>
                            {userDetails.ownerRating === null || userDetails.ownerRating === undefined
                              ? <span className="text-muted">No ratings yet</span>
                              : <span style={{ fontWeight: 700, color: 'var(--color-warning)' }}>★ {userDetails.ownerRating} ({userDetails.ownerRatingCount} ratings)</span>}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {submitMsg && showModal !== 'details' && <div className="form-error" style={{ marginTop: '1rem' }}>{submitMsg}</div>}

            <div className="modal-actions">
              {showModal === 'details' ? (
                <button className="btn btn-secondary" onClick={() => setShowModal(null)}>Close</button>
              ) : (
                <>
                  <button className="btn btn-secondary" onClick={() => setShowModal(null)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}