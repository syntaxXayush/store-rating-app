import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f4f6fb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' },
  card: { background: '#fff', borderRadius: 12, padding: '36px 40px', width: '100%', maxWidth: 460, boxShadow: '0 4px 24px rgba(0,0,0,0.09)' },
  title: { fontSize: 26, fontWeight: 800, color: '#1e293b', marginBottom: 6, textAlign: 'center' as const },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center' as const, marginBottom: 28 },
  group: { marginBottom: 18 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 7, fontSize: 14, boxSizing: 'border-box' as const, outline: 'none', transition: 'border 0.2s', background: '#ffffff', color: '#111827', caretColor: '#111827', colorScheme: 'light', WebkitTextFillColor: '#111827' },
  inputErr: { borderColor: '#ef4444' },
  errText: { color: '#ef4444', fontSize: 12, marginTop: 4 },
  hintText: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  btn: { width: '100%', padding: 12, background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
  link: { textAlign: 'center' as const, fontSize: 14, color: '#64748b', marginTop: 18 },
  successBox: { background: '#dcfce7', border: '1px solid #86efac', borderRadius: 8, padding: '12px 16px', color: '#166534', fontSize: 14, marginBottom: 16, textAlign: 'center' as const },
  errorBox: { background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', color: '#991b1b', fontSize: 14, marginBottom: 16, textAlign: 'center' as const },
};

function validate(form: any) {
  const errors: any = {};
  if (!form.name || form.name.length < 20 || form.name.length > 60)
    errors.name = 'Name must be between 20 and 60 characters';
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = 'Enter a valid email address';
  if (!form.address || form.address.length === 0)
    errors.address = 'Address is required';
  if (form.address && form.address.length > 400)
    errors.address = 'Address must be max 400 characters';
  if (!form.password)
    errors.password = 'Password is required';
  else if (form.password.length < 8 || form.password.length > 16)
    errors.password = 'Password must be 8–16 characters';
  else if (!/[A-Z]/.test(form.password))
    errors.password = 'Password must contain at least one uppercase letter';
  else if (!/[!@#$%^&*]/.test(form.password))
    errors.password = 'Password must contain at least one special character (!@#$%^&*)';
  return errors;
}

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<any>({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (touched[field]) {
      const e = validate(updated);
      setErrors(e);
    }
  };

  const handleBlur = (field: string) => {
    setTouched((p: any) => ({ ...p, [field]: true }));
    const e = validate(form);
    setErrors(e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, address: true, password: true });
    const e2 = validate(form);
    setErrors(e2);
    if (Object.keys(e2).length > 0) return;
    setServerError('');
    try {
      await api.post('/auth/signup', form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Registration failed');
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your full name (20–60 characters)', hint: `${form.name.length}/60 characters` },
    { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', hint: null },
    { key: 'address', label: 'Address', type: 'text', placeholder: 'Your full address (max 400 characters)', hint: `${form.address.length}/400 characters` },
    { key: 'password', label: 'Password', type: 'password', placeholder: '8–16 chars, uppercase + special char', hint: 'e.g. MyPass@1' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.title}>Create Account</div>
        <div style={styles.subtitle}>Join the platform to discover and rate stores</div>

        {success && <div style={styles.successBox}>✅ Registered successfully! Redirecting to login...</div>}
        {serverError && <div style={styles.errorBox}>⚠️ {serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {fields.map(f => (
            <div key={f.key} style={styles.group}>
              <label style={styles.label}>{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={e => handleChange(f.key, e.target.value)}
                onBlur={() => handleBlur(f.key)}
                style={{ ...styles.input, ...(errors[f.key] && touched[f.key] ? styles.inputErr : {}) }}
              />
              {errors[f.key] && touched[f.key]
                ? <div style={styles.errText}>⚠ {errors[f.key]}</div>
                : f.hint && <div style={styles.hintText}>{f.hint}</div>}
            </div>
          ))}
          <button type="submit" style={styles.btn}>Create Account</button>
        </form>
        <div style={styles.link}>Already have an account? <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600 }}>Sign in</Link></div>
      </div>
    </div>
  );
}