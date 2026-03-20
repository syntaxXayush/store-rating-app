import { Link } from 'react-router-dom';
import { useAuth } from '../useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: 12, borderBottom: '1px solid #eee', display: 'flex', gap: 12, alignItems: 'center' }}>
      <strong>Store Rating</strong>
      <div style={{ flex: 1 }} />
      {!user ? (
        <>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign up</Link>
        </>
      ) : (
        <>
          <span style={{ color: '#555' }}>{user?.email ?? user?.name ?? 'Signed in'}</span>
          <button onClick={logout} style={{ padding: '6px 10px' }}>
            Logout
          </button>
        </>
      )}
    </div>
  );
}

