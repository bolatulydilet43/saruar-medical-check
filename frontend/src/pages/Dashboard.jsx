import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import { fmtDate } from '../theme.js';
import StatusBadge from '../components/StatusBadge.jsx';

const FIRST_NAMES = { admin: 'Сергей', doctor: 'Елена', nurse: 'Анна' };
const TODAY = new Date().toISOString().slice(0, 10);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    api.getPatients().then(setPatients);
    api.getStaff().then(setStaff);
    api.getAppointments({ date: TODAY }).then(setAppointments);
  }, []);

  const attentionCount = patients.filter((p) => p.status === 'red').length;
  const staffOnDuty = staff.filter((s) => s.onDuty);
  const awaitingPatients = patients
    .filter((p) => p.status === 'red' || p.status === 'amber')
    .sort((a, b) => (a.status === 'red' ? -1 : 1));

  const cardStyle = { background: 'white', borderRadius: 14, border: '1px solid #EDF0EF', padding: '18px 20px' };

  return (
    <div style={{ maxWidth: 1120 }}>
      <div style={{ marginBottom: 26 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>Добрый день, {FIRST_NAMES[user?.role] || ''}</div>
      </div>

      {user?.role === 'admin' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
            <div style={cardStyle}>
              <div style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 8 }}>Всего пациентов</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>{patients.length}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 8 }}>Персонал на смене</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>{staffOnDuty.length}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 8 }}>Приёмов сегодня</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>{appointments.length}</div>
            </div>
            <div style={{ ...cardStyle, border: '1px solid #FDECEC' }}>
              <div style={{ fontSize: 12.5, color: '#966F14', marginBottom: 8 }}>Требуют внимания</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#C0392B' }}>{attentionCount}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'start' }}>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EDF0EF', padding: '20px 22px' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Персонал на смене</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {staffOnDuty.map((s) => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #F5F7F6' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{s.name}</div>
                      <div style={{ fontSize: 12.5, color: '#6B7280' }}>{s.specialty}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EDF0EF', padding: '20px 22px' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Приёмы сегодня</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {appointments.sort((a, b) => a.time.localeCompare(b.time)).map((ap) => (
                  <div key={ap.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #F5F7F6', fontSize: 13.5 }}>
                    <div style={{ fontWeight: 700, color: '#111827', minWidth: 48 }}>{ap.time}</div>
                    <div style={{ color: '#374151' }}>{ap.patient}</div>
                    <div style={{ color: '#9CA3AF', marginLeft: 'auto' }}>{ap.doctor}</div>
                  </div>
                ))}
                {appointments.length === 0 && <div style={{ color: '#9CA3AF', fontSize: 13.5, padding: '6px 0' }}>Приёмов на сегодня нет</div>}
              </div>
            </div>
          </div>
        </>
      )}

      {user?.role === 'doctor' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginBottom: 24 }}>
            <div style={cardStyle}>
              <div style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 8 }}>Ожидают осмотра</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>{awaitingPatients.length}</div>
            </div>
            <div style={{ ...cardStyle, border: '1px solid #FDECEC' }}>
              <div style={{ fontSize: 12.5, color: '#966F14', marginBottom: 8 }}>Требуют внимания</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#C0392B' }}>{attentionCount}</div>
            </div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Пациенты, ожидающие осмотра</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {awaitingPatients.map((p) => (
              <div key={p.id} style={{ background: 'white', borderRadius: 14, border: '1px solid #EDF0EF', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: '#111827' }}>{p.name}</div>
                  <div style={{ fontSize: 12.5, color: '#6B7280', marginTop: 2 }}>{p.age} лет, {p.gender} · последний анализ {fmtDate(p.lastAnalysis)}</div>
                </div>
                <StatusBadge status={p.status} />
                <button onClick={() => navigate(`/patients/${p.id}`)} style={{ padding: '8px 14px', background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#374151', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Карта</button>
                <button onClick={() => navigate(`/review/${p.id}`)} style={{ padding: '8px 14px', background: '#1D9E75', border: 'none', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Начать приём</button>
              </div>
            ))}
          </div>
        </>
      )}

      {user?.role === 'nurse' && (
        <>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Пациенты для внесения результатов</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {patients.map((p) => (
              <div key={p.id} style={{ background: 'white', borderRadius: 14, border: '1px solid #EDF0EF', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: '#111827' }}>{p.name}</div>
                  <div style={{ fontSize: 12.5, color: '#6B7280', marginTop: 2 }}>последний анализ {fmtDate(p.lastAnalysis)}</div>
                </div>
                <StatusBadge status={p.status} />
                <button onClick={() => navigate(`/analysis-entry?patient=${p.id}`)} style={{ padding: '8px 14px', background: '#1D9E75', border: 'none', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Внести результат</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
