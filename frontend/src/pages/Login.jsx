import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import { brand } from '../brandConfig.js';

const ROLES = ['admin', 'doctor', 'nurse'];

// Password must be typed in English/Latin characters (no Cyrillic), same rule for every role.
const LATIN_PASSWORD_RE = /^[A-Za-z0-9!@#$%^&*()_\-+=.,:;'"~`<>?/\\|{}[\]]*$/;
const PHONE_RE = /^\+?[0-9\s\-()]{7,}$/;

export default function Login() {
  const { t } = useTranslation();
  const [role, setRole] = useState('doctor');
  const [phone, setPhone] = useState('+77');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function handlePasswordChange(e) {
    const value = e.target.value;
    if (!LATIN_PASSWORD_RE.test(value)) {
      setError(t('login.errorPassword'));
      return;
    }
    setError('');
    setPassword(value);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!LATIN_PASSWORD_RE.test(password) || !password) {
      setError(t('login.errorPassword'));
      return;
    }
    if (!PHONE_RE.test(phone)) {
      setError(t('login.errorPhone'));
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
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Logo size={42} />
            </div>
            <div>
              <div style={{ fontSize: 21, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>{brand.fullName}</div>
              <div style={{ fontSize: 12.5, color: '#6B7280' }}>{brand.tagline}</div>
            </div>
          </div>
          <div style={{ width: 88, flexShrink: 0 }}>
            <LanguageSwitcher />
          </div>
        </div>

        <div style={{ height: 1, background: '#EEF1F0', margin: '24px 0' }} />

        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>{t('login.chooseRole')}</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
          {ROLES.map((r) => (
            <button key={r} type="button" onClick={() => setRole(r)} style={roleBtnStyle(r)}>
              {t(`role.${r}`)}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{t('login.phone')}</label>
            <input
              type="tel" placeholder="+7 700 123 45 67" value={phone} onChange={(e) => setPhone(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14.5, outline: 'none', color: '#111827' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{t('login.password')}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'} placeholder="Doctor123" value={password} onChange={handlePasswordChange}
                style={{ width: '100%', padding: '11px 40px 11px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14.5, outline: 'none', color: '#111827', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t('login.hide') : t('login.show')}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', padding: 4, color: '#6B7280', fontSize: 13, fontWeight: 600 }}
              >
                {showPassword ? t('login.hide') : t('login.show')}
              </button>
            </div>
          </div>
        </div>

        {error && <div style={{ marginTop: 12, fontSize: 13, color: '#C0392B' }}>{error}</div>}

        <button
          type="submit"
          style={{ width: '100%', marginTop: 22, padding: 13, background: '#1D9E75', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
        >
          {t('login.submit', { role: t(`role.${role}`) })}
        </button>

        <div style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 18 }}>{t('login.footer')}</div>
      </form>
    </div>
  );
}
