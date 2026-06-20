import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      await api.post('/auth/signup', form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your full name (20–60 characters)', hint: `${form.name.length}/60 characters` },
    { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', hint: null },
    { key: 'address', label: 'Address', type: 'text', placeholder: 'Your full address (max 400 characters)', hint: `${form.address.length}/400 characters` },
    { key: 'password', label: 'Password', type: 'password', placeholder: '8–16 chars, uppercase + special char', hint: 'e.g. MyPass@1' },
  ];

  return (
    <div className="app-container" style={{ alignItems: 'center', justifyItems: 'center', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', margin: 'auto', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 className="heading-1" style={{ fontSize: '2rem' }}>Create Account</h2>
          <p className="text-muted">Join the platform to discover and rate stores</p>
        </div>

        {success && (
          <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', padding: '1rem', color: '#166534', marginBottom: '1.5rem', textAlign: 'center', animation: 'fadeIn 0.3s' }}>
            ✅ Registered successfully! Redirecting to login...
          </div>
        )}
        
        {serverError && (
          <div className="form-error" style={{ background: '#fee2e2', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', color: '#991b1b', border: '1px solid #fca5a5' }}>
            ⚠️ {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {fields.map(f => (
            <div key={f.key} className="form-group">
              <label className="form-label">{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={e => handleChange(f.key, e.target.value)}
                onBlur={() => handleBlur(f.key)}
                className="form-input"
                style={errors[f.key] && touched[f.key] ? { borderColor: 'var(--color-danger)', boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)' } : {}}
              />
              {errors[f.key] && touched[f.key] ? (
                <div className="form-error">⚠ {errors[f.key]}</div>
              ) : (
                f.hint && <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.8 }}>{f.hint}</div>
              )}
            </div>
          ))}
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', marginTop: '1rem' }}
            disabled={loading || success}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <span className="text-muted">Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}