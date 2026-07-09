import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { fmtDate } from '../theme.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'green', label: 'Норма' },
  { id: 'amber', label: 'Отклонение' },
  { id: 'red', label: 'Внимание' },
];

const EMPTY_FORM = { name: '', age: '', gender: 'М', checkIn: '', checkOut: '', allergies: '' };
const GRID_COLUMNS = '2.2fr 1fr 1.4fr 1.2fr 1.2fr 1.6fr';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'doctor';

  function reload() {
    api.getPatients({ q: query, status: filter }).then(setPatients);
  }

  useEffect(() => {
    reload();
  }, [query, filter]);

  const filterBtnStyle = (active) => ({
    padding: '9px 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    border: active ? 'none' : '1px solid #E5E7EB',
    background: active ? '#1D9E75' : 'white',
    color: active ? 'white' : '#374151',
  });

  function setField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function submitForm(e) {
    e.preventDefault();
    setError('');
    try {
      await api.createPatient(form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(p) {
    if (!window.confirm(`Удалить пациента «${p.name}»? Это действие необратимо.`)) return;
    await api.deletePatient(p.id);
    reload();
  }

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 12.5, fontWeight: 500, color: '#374151', marginBottom: 6 };

  return (
    <div style={{ maxWidth: 1200 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>Пациенты</div>
        {canManage && (
          <button
            onClick={() => { setForm(EMPTY_FORM); setError(''); setShowForm(true); }}
            style={{ padding: '10px 16px', background: '#1D9E75', color: 'white', border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
          >
            + Добавить пациента
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <input
          placeholder="Поиск по имени…" value={query} onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, minWidth: 220, padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={filterBtnStyle(filter === f.id)}>{f.label}</button>
          ))}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EDF0EF', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: GRID_COLUMNS, gap: 12, padding: '14px 20px', background: '#FAFBFB', fontSize: 12.5, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #EDF0EF' }}>
          <div>ФИО</div><div>Возраст/Пол</div><div>Заезд – Выезд</div><div>Посл. анализ</div><div>Статус</div><div></div>
        </div>
        {patients.map((p) => (
          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: GRID_COLUMNS, gap: 12, padding: '16px 20px', borderBottom: '1px solid #F3F5F4', alignItems: 'center', fontSize: 14 }}>
            <div style={{ fontWeight: 600, color: '#111827' }}>{p.name}</div>
            <div style={{ color: '#6B7280' }}>{p.age} лет, {p.gender}</div>
            <div style={{ color: '#6B7280' }}>{fmtDate(p.checkIn)} – {fmtDate(p.checkOut)}</div>
            <div style={{ color: '#6B7280' }}>{fmtDate(p.lastAnalysis)}</div>
            <div><StatusBadge status={p.status} /></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => navigate(`/patients/${p.id}`)} style={{ padding: '7px 14px', background: '#F0F7F4', color: '#1D7A57', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Профиль</button>
              {canManage && (
                <button onClick={() => handleDelete(p)} style={{ padding: '7px 14px', background: '#FDECEC', color: '#C0392B', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Удалить</button>
              )}
            </div>
          </div>
        ))}
        {patients.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>Пациенты не найдены</div>}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <form onSubmit={submitForm} style={{ background: 'white', borderRadius: 16, padding: '26px 28px', width: 420, boxShadow: '0 24px 48px rgba(0,0,0,0.18)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Новый пациент</div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>ФИО</label>
              <input required value={form.name} onChange={(e) => setField('name', e.target.value)} style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Возраст</label>
                <input type="number" min="0" value={form.age} onChange={(e) => setField('age', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Пол</label>
                <select value={form.gender} onChange={(e) => setField('gender', e.target.value)} style={{ ...inputStyle, background: 'white' }}>
                  <option value="М">М</option>
                  <option value="Ж">Ж</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Заезд</label>
                <input required type="date" value={form.checkIn} onChange={(e) => setField('checkIn', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Выезд</label>
                <input required type="date" value={form.checkOut} onChange={(e) => setField('checkOut', e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Аллергии</label>
              <input value={form.allergies} onChange={(e) => setField('allergies', e.target.value)} placeholder="Нет данных" style={inputStyle} />
            </div>

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
