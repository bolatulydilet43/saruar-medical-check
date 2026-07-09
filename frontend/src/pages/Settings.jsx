import { useEffect, useState } from 'react';
import { api } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Settings() {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    api.getStaff().then(setStaff);
  }, []);

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 20 }}>Настройки — Персонал</div>
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
    </div>
  );
}
