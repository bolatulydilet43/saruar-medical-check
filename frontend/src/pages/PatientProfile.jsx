import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import { fmtDate, CARD_STYLE, PRIMARY_BUTTON_STYLE } from '../theme.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import AnalysisCard from '../components/AnalysisCard.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import TrendChart from '../components/TrendChart.jsx';
import PatientPortalLink from '../components/PatientPortalLink.jsx';
import RoomAssignment from '../components/RoomAssignment.jsx';
import ProceduresTab from '../components/ProceduresTab.jsx';
import { buildAnalysisDisplay, buildTrendSeries } from '../utils/analysisDisplay.js';

export default function PatientProfile() {
  const { t } = useTranslation();
  const TABS = [
    { id: 'history', label: t('patientProfile.tabHistory') },
    { id: 'diagnoses', label: t('patientProfile.tabDiagnoses') },
    { id: 'procedures', label: t('patientProfile.tabProcedures') },
    { id: 'appointments', label: t('patientProfile.tabAppointments') },
  ];
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'doctor';
  const canDiagnose = user?.role === 'doctor';
  const [patient, setPatient] = useState(null);
  const [ranges, setRanges] = useState(null);
  const [tab, setTab] = useState('history');
  const [error, setError] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function load() {
    setError('');
    Promise.all([api.getPatient(id).then(setPatient), api.getRanges().then(setRanges)])
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, [id]);

  if (error) return <ErrorBanner message={error} onRetry={load} />;
  if (!patient || !ranges) return <div style={{ color: '#9CA3AF' }}>{t('common.loading')}</div>;

  const trendSeries = buildTrendSeries(patient.analyses, ranges);

  async function handleDelete() {
    setConfirmingDelete(false);
    try {
      await api.deletePatient(patient.id);
      navigate('/patients');
    } catch (err) {
      alert(err.message);
    }
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
        <button onClick={() => navigate('/patients')} style={{ background: 'none', border: 'none', color: '#185FA5', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: 0 }}>{t('patientProfile.backToList')}</button>
        {canManage && (
          <button onClick={() => setConfirmingDelete(true)} style={{ padding: '7px 14px', background: '#FDECEC', color: '#C0392B', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>{t('patientProfile.deletePatient')}</button>
        )}
      </div>

      <div style={{ ...CARD_STYLE, borderRadius: 16, padding: '24px 28px', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>{patient.name}</div>
            <div style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
              {t('patientProfile.stayInfo', { age: patient.age, gender: patient.gender, checkIn: fmtDate(patient.checkIn), checkOut: fmtDate(patient.checkOut) })}
            </div>
            {patient.phone && <div style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>{t('patientProfile.phoneLabel', { phone: patient.phone })}</div>}
          </div>
          <StatusBadge status={patient.status} />
        </div>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#6B7280' }}>{t('patientProfile.allergiesLabel')}</span>
          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, background: hasAllergies ? '#FDECEC' : '#F3F4F6', color: hasAllergies ? '#C0392B' : '#6B7280' }}>
            {patient.allergies}
          </span>
        </div>
      </div>

      {canManage && (
        <div style={{ marginBottom: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <RoomAssignment
            patientId={patient.id}
            roomId={patient.roomId}
            onChange={(roomId) => setPatient((p) => ({ ...p, roomId }))}
          />
          <PatientPortalLink
            patientId={patient.id}
            portalToken={patient.portalToken}
            onTokenChange={(token) => setPatient((p) => ({ ...p, portalToken: token }))}
          />
        </div>
      )}

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #EDF0EF', marginBottom: 20 }}>
        {TABS.map((t2) => (
          <button key={t2.id} onClick={() => setTab(t2.id)} style={tabStyle(tab === t2.id)}>{t2.label}</button>
        ))}
      </div>

      {tab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {trendSeries.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14, marginBottom: 4 }}>
              {trendSeries.map((s) => <TrendChart key={s.key} series={s} />)}
            </div>
          )}
          {patient.analyses.map((a) => (
            <AnalysisCard key={a.id} a={buildAnalysisDisplay(a, ranges)} />
          ))}
          {patient.analyses.length === 0 && <EmptyState text={t('patientProfile.noAnalyses')} />}
        </div>
      )}

      {tab === 'diagnoses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {canDiagnose && (
            <button
              onClick={() => navigate(`/review/${patient.id}`)}
              style={{ ...PRIMARY_BUTTON_STYLE, alignSelf: 'flex-start', padding: '10px 16px', borderRadius: 10, fontSize: 13.5 }}
            >
              {t('patientProfile.writeDiagnosis')}
            </button>
          )}
          {patient.diagnoses.map((d) => (
            <div key={d.id} style={{ ...CARD_STYLE, padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 13, color: '#9CA3AF' }}>{fmtDate(d.date)} · {d.doctor}</div>
                <StatusBadge status={d.confirmed ? 'green' : 'amber'} label={d.confirmed ? t('patientProfile.confirmed') : t('patientProfile.draft')} />
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
          {patient.diagnoses.length === 0 && <EmptyState text={t('patientProfile.noDiagnoses')} />}
        </div>
      )}

      {tab === 'procedures' && (
        <ProceduresTab patient={patient} canPlan={canManage} onChange={setPatient} />
      )}

      {tab === 'appointments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {patient.appointments.map((ap) => (
            <div key={ap.id} style={{ ...CARD_STYLE, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, fontSize: 14 }}>
              <div style={{ fontWeight: 700, color: '#111827', minWidth: 100 }}>{fmtDate(ap.date)} {ap.time}</div>
              <div style={{ color: '#374151' }}>{ap.type}</div>
              <div style={{ color: '#9CA3AF', marginLeft: 'auto' }}>{ap.doctor}</div>
            </div>
          ))}
          {patient.appointments.length === 0 && <EmptyState text={t('patientProfile.noAppointments')} />}
        </div>
      )}

      <ConfirmModal
        open={confirmingDelete}
        title={t('patientProfile.deleteConfirm', { name: patient.name })}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ ...CARD_STYLE, textAlign: 'center', padding: 40, color: '#9CA3AF', fontSize: 14 }}>
      {text}
    </div>
  );
}
