import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import { fmtDate, CARD_STYLE, procedureStatusMeta } from '../theme.js';
import { brand } from '../brandConfig.js';
import Logo from '../components/Logo.jsx';
import AnalysisCard from '../components/AnalysisCard.jsx';
import Pill from '../components/Pill.jsx';
import { buildAnalysisDisplay } from '../utils/analysisDisplay.js';

// Public, unauthenticated read-only view — what a patient sees after scanning the QR at
// reception. No sidebar, no login, no write actions of any kind.
export default function PatientPortalView() {
  const { t } = useTranslation();
  const { token } = useParams();
  const [patient, setPatient] = useState(null);
  const [ranges, setRanges] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getPatientPortal(token), api.getRanges()])
      .then(([p, r]) => { setPatient(p); setRanges(r); })
      .catch((err) => setError(err.message));
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', background: '#F5F8F7', padding: '32px 16px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Logo size={32} />
          <div style={{ fontSize: 17, fontWeight: 800, color: '#111827' }}>{brand.fullName}</div>
        </div>

        {error && (
          <div style={{ ...CARD_STYLE, padding: '28px 24px', textAlign: 'center', color: '#C0392B' }}>
            {error}
          </div>
        )}

        {!error && !patient && (
          <div style={{ color: '#9CA3AF', textAlign: 'center', padding: 40 }}>{t('common.loading')}</div>
        )}

        {patient && ranges && (
          <>
            <div style={{ ...CARD_STYLE, borderRadius: 16, padding: '22px 24px', marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>{patient.name}</div>
              <div style={{ fontSize: 13.5, color: '#6B7280', marginTop: 4 }}>
                {t('patientProfile.stayInfo', { age: patient.age, gender: patient.gender, checkIn: fmtDate(patient.checkIn), checkOut: fmtDate(patient.checkOut) })}
              </div>
              {patient.allergies && patient.allergies !== 'Нет' && patient.allergies !== 'Нет данных' && (
                <div style={{ marginTop: 10, display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, background: '#FDECEC', color: '#C0392B' }}>
                  {t('patientPortal.allergiesLabel', { allergies: patient.allergies })}
                </div>
              )}
            </div>

            {patient.procedures?.length > 0 && (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>{t('patientPortal.proceduresTitle')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {[...patient.procedures]
                    .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
                    .map((pr) => {
                      const meta = procedureStatusMeta(pr.status);
                      return (
                        <div key={pr.id} style={{ ...CARD_STYLE, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: 14 }}>
                          <div style={{ fontWeight: 700, color: '#111827', minWidth: 100 }}>{fmtDate(pr.date)}{pr.time ? ` · ${pr.time}` : ''}</div>
                          <div style={{ color: '#374151', flex: 1, minWidth: 120 }}>{pr.type}</div>
                          <Pill label={meta.label} bg={meta.bg} fg={meta.fg} />
                        </div>
                      );
                    })}
                </div>
              </>
            )}

            <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>{t('patientPortal.analysesTitle')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {patient.analyses.map((a) => (
                <AnalysisCard key={a.id} a={buildAnalysisDisplay(a, ranges)} />
              ))}
              {patient.analyses.length === 0 && (
                <div style={{ ...CARD_STYLE, textAlign: 'center', padding: 24, color: '#9CA3AF', fontSize: 13.5 }}>
                  {t('patientProfile.noAnalyses')}
                </div>
              )}
            </div>

            <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>{t('patientPortal.diagnosesTitle')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {patient.diagnoses.map((d) => (
                <div key={d.id} style={{ ...CARD_STYLE, padding: '18px 20px' }}>
                  <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>{fmtDate(d.date)} · {d.doctor}</div>
                  <div style={{ fontSize: 14.5, color: '#111827', marginBottom: 10 }}>{d.text}</div>
                  {d.prescriptions?.length > 0 && (
                    <div style={{ borderTop: '1px solid #F3F5F4', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {d.prescriptions.map((rx, i) => (
                        <div key={i} style={{ display: 'flex', gap: 14, fontSize: 13, color: '#374151', flexWrap: 'wrap' }}>
                          <div style={{ fontWeight: 600, minWidth: 140 }}>{rx.medication}</div>
                          <div>{rx.dosage}</div>
                          <div>{rx.frequency}</div>
                          <div>{rx.duration}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {patient.diagnoses.length === 0 && (
                <div style={{ ...CARD_STYLE, textAlign: 'center', padding: 24, color: '#9CA3AF', fontSize: 13.5 }}>
                  {t('patientProfile.noDiagnoses')}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
