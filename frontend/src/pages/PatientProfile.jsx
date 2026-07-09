import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { fmtDate } from '../theme.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import AnalysisCard from '../components/AnalysisCard.jsx';
import { buildAnalysisDisplay } from '../utils/analysisDisplay.js';

const TABS = [
  { id: 'history', label: 'Анализы' },
  { id: 'diagnoses', label: 'Диагнозы и назначения' },
  { id: 'appointments', label: 'Записи на приём' },
];

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'doctor';
  const [patient, setPatient] = useState(null);
  const [ranges, setRanges] = useState(null);
  const [tab, setTab] = useState('history');

  useEffect(() => {
    api.getPatient(id).then(setPatient);
    api.getRanges().then(setRanges);
  }, [id]);

  if (!patient || !ranges) return <div style={{ color: '#9CA3AF' }}>Загрузка…</div>;

  async function handleDelete() {
    if (!window.confirm(`Удалить пациента «${patient.name}»? Это действие необратимо.`)) return;
    await api.deletePatient(patient.id);
    navigate('/patients');
  }

  const hasAllergies = patient.allergies && patient.allergies !== 'Нет' && patient.allergies !== 'Нет данных';
  const tabStyle = (active) => ({
    padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none',
    borderBottom: active ? '2.5px solid #1D9E75' : '2.5px solid transparent',
    color: active ? '#1D7A57' : '#6B7280', marginBottom: -1,
  });

  return (
    <div style={{ maxWidth: 1080 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={() => navigate('/patients')} style={{ background: 'none', border: 'none', color: '#185FA5', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: 0 }}>← К списку пациентов</button>
        {canManage && (
          <button onClick={handleDelete} style={{ padding: '7px 14px', background: '#FDECEC', color: '#C0392B', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Удалить пациента</button>
        )}
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EDF0EF', padding: '24px 28px', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>{patient.name}</div>
            <div style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>{patient.age} лет, {patient.gender} · Заезд {fmtDate(patient.checkIn)} → Выезд {fmtDate(patient.checkOut)}</div>
          </div>
          <StatusBadge status={patient.status} />
        </div>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#6B7280' }}>Аллергии:</span>
          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, background: hasAllergies ? '#FDECEC' : '#F3F4F6', color: hasAllergies ? '#C0392B' : '#6B7280' }}>
            {patient.allergies}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #EDF0EF', marginBottom: 20 }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={tabStyle(tab === t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {patient.analyses.map((a) => (
            <AnalysisCard key={a.id} a={buildAnalysisDisplay(a, ranges)} />
          ))}
          {patient.analyses.length === 0 && <EmptyState text="Анализов ещё нет" />}
        </div>
      )}

      {tab === 'diagnoses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {patient.diagnoses.map((d) => (
            <div key={d.id} style={{ background: 'white', borderRadius: 14, border: '1px solid #EDF0EF', padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 13, color: '#9CA3AF' }}>{fmtDate(d.date)} · {d.doctor}</div>
                <StatusBadge status={d.confirmed ? 'green' : 'amber'} label={d.confirmed ? 'Подтверждено' : 'Черновик'} />
              </div>
              <div style={{ fontSize: 14.5, color: '#111827', marginBottom: 12 }}>{d.text}</div>
              {d.prescriptions?.length > 0 && (
                <div style={{ borderTop: '1px solid #F3F5F4', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {d.prescriptions.map((rx, i) => (
                    <div key={i} style={{ display: 'flex', gap: 16, fontSize: 13.5, color: '#374151', flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 600, minWidth: 150 }}>{rx.medication}</div>
                      <div style={{ minWidth: 80 }}>{rx.dosage}</div>
                      <div style={{ minWidth: 110 }}>{rx.frequency}</div>
                      <div>{rx.duration}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {patient.diagnoses.length === 0 && <EmptyState text="Диагнозы ещё не внесены" />}
        </div>
      )}

      {tab === 'appointments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {patient.appointments.map((ap) => (
            <div key={ap.id} style={{ background: 'white', borderRadius: 14, border: '1px solid #EDF0EF', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, fontSize: 14 }}>
              <div style={{ fontWeight: 700, color: '#111827', minWidth: 100 }}>{fmtDate(ap.date)} {ap.time}</div>
              <div style={{ color: '#374151' }}>{ap.type}</div>
              <div style={{ color: '#9CA3AF', marginLeft: 'auto' }}>{ap.doctor}</div>
            </div>
          ))}
          {patient.appointments.length === 0 && <EmptyState text="Записей на приём нет" />}
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF', fontSize: 14, background: 'white', borderRadius: 14, border: '1px solid #EDF0EF' }}>
      {text}
    </div>
  );
}
