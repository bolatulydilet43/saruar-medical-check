import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const EMPTY_FORM = { name: '', role: 'doctor', specialty: '', phone: '', password: '' };
const LATIN_PASSWORD_RE = /^[A-Za-z0-9!@#$%^&*()_\-+=.,:;'"~`<>?/\\|{}[\]]*$/;

export default function Settings() {
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  function reload() {
    api.getStaff().then(setStaff);
  }

  useEffect(() => {
    reload();
  }, []);

  function setField(key, val) {
    if (key === 'password' && !LATIN_PASSWORD_RE.test(val)) {
      setError('Пароль должен быть на английском языке (латиница, без кириллицы)');
      return;
    }
    setError('');
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function submitForm(e) {
    e.preventDefault();
    setError('');
    try {
      await api.createStaff(form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 12.5, fontWeight: 500, color: '#374151', marginBottom: 6 };

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>Настройки — Персонал</div>
        {isAdmin && (
          <button
            onClick={() => { setForm(EMPTY_FORM); setError(''); setShowForm(true); }}
            style={{ padding: '10px 16px', background: '#1D9E75', color: 'white', border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
          >
            + Добавить врача / медсестру
          </button>
        )}
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EDF0EF', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.6fr 1fr', gap: 12, padding: '14px 20px', background: '#FAFBFB', fontSize: 12.5, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #EDF0EF' }}>
          <div>Имя</div><div>Специализация</div><div>Статус</div>
        </div>
        {staff.map((s) => (
          <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.6fr 1fr', gap: 12, padding: '14px 20px', borderBottom: '1px solid #F3F5F4', alignItems: 'center', fontSize: 14 }}>
            <div style={{ fontWeight: 600, color: '#111827' }}>{s.name}</div>
            <div style={{ color: '#6B7280' }}>{s.specialty}</div>
            <div><StatusBadge status={s.onDuty ? 'green' : 'neutral'} label={s.onDuty ? 'На смене' : 'Не на смене'} /></div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <form onSubmit={submitForm} style={{ background: 'white', borderRadius: 16, padding: '26px 28px', width: 420, boxShadow: '0 24px 48px rgba(0,0,0,0.18)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Новый сотрудник</div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Роль</label>
              <select value={form.role} onChange={(e) => setField('role', e.target.value)} style={{ ...inputStyle, background: 'white' }}>
                <option value="doctor">Врач</option>
                <option value="nurse">Медсестра</option>
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>ФИО</label>
              <input required value={form.name} onChange={(e) => setField('name', e.target.value)} style={inputStyle} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Специализация</label>
              <input required value={form.specialty} onChange={(e) => setField('specialty', e.target.value)} placeholder="Например, Терапевт" style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 6 }}>
              <div>
                <label style={labelStyle}>Телефон (необязательно)</label>
                <input type="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="+7 700 123 45 67" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Пароль (на английском)</label>
                <input value={form.password} onChange={(e) => setField('password', e.target.value)} placeholder="Doctor123" style={inputStyle} />
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: '#9CA3AF', marginBottom: 16 }}>Если оставить пустыми, сотрудник сможет входить в демо-режиме (любой телефон/пароль).</div>

            {error && <div style={{ color: '#C0392B', fontSize: 13, marginBottom: 12 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: 10, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13.5, cursor: 'pointer' }}>Отмена</button>
              <button type="submit" style={{ flex: 1, padding: 10, background: '#1D9E75', color: 'white', border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Добавить</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
