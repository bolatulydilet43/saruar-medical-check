import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import { fmtDate, CARD_STYLE, PRIMARY_BUTTON_STYLE, SECONDARY_BUTTON_STYLE } from '../theme.js';
import StatusBadge from '../components/StatusBadge.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';

const TODAY = new Date().toISOString().slice(0, 10);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    Promise.all([
      api.getPatients().then(setPatients),
      api.getStaff().then(setStaff),
      api.getAppointments({ date: TODAY }).then(setAppointments),
    ]).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const attentionCount = patients.filter((p) => p.status === 'red').length;
  const staffOnDuty = staff.filter((s) => s.onDuty);
  const awaitingPatients = patients
    .filter((p) => p.status === 'red' || p.status === 'amber')
    .sort((a, b) => (a.status === 'red' ? -1 : 1));

  const cardStyle = { ...CARD_STYLE, padding: '18px 20px' };

  return (
    <div style={{ maxWidth: 1120 }}>
      <div style={{ marginBottom: 26 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>{t('dashboard.greeting', { name: (user?.name || '').replace(/^Др\.\s*/, '') })}</div>
      </div>

      <ErrorBanner message={error} onRetry={load} />

      {user?.role === 'admin' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
            <div style={cardStyle}>
              <div style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 8 }}>{t('dashboard.totalPatients')}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>{patients.length}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 8 }}>{t('dashboard.staffOnDuty')}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>{staffOnDuty.length}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 8 }}>{t('dashboard.appointmentsToday')}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>{appointments.length}</div>
            </div>
            <div style={{ ...cardStyle, border: '1px solid #FDECEC' }}>
              <div style={{ fontSize: 12.5, color: '#966F14', marginBottom: 8 }}>{t('dashboard.attentionNeeded')}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#C0392B' }}>{attentionCount}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'start' }}>
            <div style={{ ...CARD_STYLE, borderRadius: 16, padding: '20px 22px' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 14 }}>{t('dashboard.staffOnDuty')}</div>
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
            <div style={{ ...CARD_STYLE, borderRadius: 16, padding: '20px 22px' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 14 }}>{t('dashboard.todaysAppointments')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {appointments.sort((a, b) => a.time.localeCompare(b.time)).map((ap) => (
                  <div key={ap.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #F5F7F6', fontSize: 13.5 }}>
                    <div style={{ fontWeight: 700, color: '#111827', minWidth: 48 }}>{ap.time}</div>
                    <div style={{ color: '#374151' }}>{ap.patient}</div>
                    <div style={{ color: '#9CA3AF', marginLeft: 'auto' }}>{ap.doctor}</div>
                  </div>
                ))}
                {appointments.length === 0 && <div style={{ color: '#9CA3AF', fontSize: 13.5, padding: '6px 0' }}>{t('dashboard.noAppointmentsToday')}</div>}
              </div>
            </div>
          </div>
        </>
      )}

      {user?.role === 'doctor' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginBottom: 24 }}>
            <div style={cardStyle}>
              <div style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 8 }}>{t('dashboard.awaitingCheckup')}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>{awaitingPatients.length}</div>
            </div>
            <div style={{ ...cardStyle, border: '1px solid #FDECEC' }}>
              <div style={{ fontSize: 12.5, color: '#966F14', marginBottom: 8 }}>{t('dashboard.attentionNeeded')}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#C0392B' }}>{attentionCount}</div>
            </div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 14 }}>{t('dashboard.patientsAwaitingCheckup')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {awaitingPatients.map((p) => (
              <div key={p.id} style={{ ...CARD_STYLE, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: '#111827' }}>{p.name}</div>
                  <div style={{ fontSize: 12.5, color: '#6B7280', marginTop: 2 }}>{t('common.ageGender', { age: p.age, gender: p.gender })} · {t('common.lastAnalysis', { date: fmtDate(p.lastAnalysis) })}</div>
                </div>
                <StatusBadge status={p.status} />
                <button onClick={() => navigate(`/patients/${p.id}`)} style={{ ...SECONDARY_BUTTON_STYLE, padding: '8px 14px', color: '#374151', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>{t('dashboard.chart')}</button>
                <button onClick={() => navigate(`/review/${p.id}`)} style={{ ...PRIMARY_BUTTON_STYLE, padding: '8px 14px', borderRadius: 8, fontSize: 13 }}>{t('dashboard.startVisit')}</button>
              </div>
            ))}
          </div>
        </>
      )}

      {user?.role === 'nurse' && (
        <>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 14 }}>{t('dashboard.patientsForResults')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {patients.map((p) => (
              <div key={p.id} style={{ ...CARD_STYLE, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: '#111827' }}>{p.name}</div>
                  <div style={{ fontSize: 12.5, color: '#6B7280', marginTop: 2 }}>{t('common.lastAnalysis', { date: fmtDate(p.lastAnalysis) })}</div>
                </div>
                <StatusBadge status={p.status} />
                <button onClick={() => navigate(`/analysis-entry?patient=${p.id}`)} style={{ ...PRIMARY_BUTTON_STYLE, padding: '8px 14px', borderRadius: 8, fontSize: 13 }}>{t('dashboard.enterResult')}</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
