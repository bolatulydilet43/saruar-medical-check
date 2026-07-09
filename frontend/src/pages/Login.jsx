import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ROLES = [
  { id: 'admin', label: 'Администратор' },
  { id: 'doctor', label: 'Врач' },
  { id: 'nurse', label: 'Медсестра' },
];

// Password must be typed in English/Latin characters (no Cyrillic), same rule for every role.
const LATIN_PASSWORD_RE = /^[A-Za-z0-9!@#$%^&*()_\-+=.,:;'"~`<>?/\\|{}[\]]*$/;
const PHONE_RE = /^\+?[0-9\s\-()]{7,}$/;

export default function Login() {
  const [role, setRole] = useState('doctor');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function handlePasswordChange(e) {
    const value = e.target.value;
    if (!LATIN_PASSWORD_RE.test(value)) {
      setError('Пароль должен быть на английском языке (латиница, без кириллицы)');
      return;
    }
    setError('');
    setPassword(value);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!LATIN_PASSWORD_RE.test(password) || !password) {
      setError('Пароль должен быть на английском языке (латиница, без кириллицы)');
      return;
    }
    if (!PHONE_RE.test(phone)) {
      setError('Введите корректный номер телефона');
      return;
    }
    setError('');
    try {
      await login(role, phone, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  }

  const roleBtnStyle = (id) => ({
    flex: 1, padding: '10px 8px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    border: role === id ? 'none' : '1.5px solid #E5E7EB',
    background: role === id ? '#1D9E75' : 'white',
    color: role === id ? 'white' : '#374151',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F8F7', padding: 24 }}>
      <form
        onSubmit={handleSubmit}
        style={{ width: 430, maxWidth: '100%', background: '#FFFFFF', borderRadius: 20, boxShadow: '0 1px 3px rgba(16,24,32,0.06), 0 24px 48px rgba(16,24,32,0.07)', padding: '40px 36px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <polyline points="2,13 7,13 9,7 13,18 15,13 22,13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 21, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>Saruar Medical Check</div>
            <div style={{ fontSize: 12.5, color: '#6B7280' }}>Санаторно-курортный медицинский центр</div>
          </div>
        </div>

        <div style={{ height: 1, background: '#EEF1F0', margin: '24px 0' }} />

        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Выберите роль</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
          {ROLES.map((r) => (
            <button key={r.id} type="button" onClick={() => setRole(r.id)} style={roleBtnStyle(r.id)}>
              {r.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Номер телефона</label>
            <input
              type="tel" placeholder="+7 700 123 45 67" value={phone} onChange={(e) => setPhone(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14.5, outline: 'none', color: '#111827' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Пароль (на английском)</label>
            <input
              type="password" placeholder="Doctor123" value={password} onChange={handlePasswordChange}
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14.5, outline: 'none', color: '#111827' }}
            />
          </div>
        </div>

        {error && <div style={{ marginTop: 12, fontSize: 13, color: '#C0392B' }}>{error}</div>}

        <button
          type="submit"
          style={{ width: '100%', marginTop: 22, padding: 13, background: '#1D9E75', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
        >
          Войти как «{ROLES.find((r) => r.id === role).label}»
        </button>

        <div style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 18 }}>Демо-режим — введите любые данные для входа</div>
      </form>
    </div>
  );
}
