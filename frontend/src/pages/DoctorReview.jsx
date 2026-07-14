import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import AnalysisCard from '../components/AnalysisCard.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { buildAnalysisDisplay } from '../utils/analysisDisplay.js';

const EMPTY_ROW = { medication: '', dosage: '', frequency: '', duration: '' };

export default function DoctorReview() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [ranges, setRanges] = useState(null);
  const [diagnosisText, setDiagnosisText] = useState('');
  const [rows, setRows] = useState([{ ...EMPTY_ROW }]);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');

  function load() {
    setError('');
    Promise.all([api.getPatient(id).then(setPatient), api.getRanges().then(setRanges)])
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, [id]);

  function setRowField(idx, key, val) {
    setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, [key]: val } : r)));
  }
  function addRow() {
    setRows((rs) => [...rs, { ...EMPTY_ROW }]);
  }
  function removeRow(idx) {
    setRows((rs) => rs.filter((_, i) => i !== idx));
  }

  const canConfirm = !!diagnosisText.trim();

  async function confirmDiagnosis() {
    if (!canConfirm) return;
    setSubmitError('');
    try {
      await api.addDiagnosis(id, { doctor: user?.name, text: diagnosisText, prescriptions: rows });
      setConfirmed(true);
    } catch (err) {
      setSubmitError(err.message);
    }
  }

  if (error) return <ErrorBanner message={error} onRetry={load} />;
  if (!patient || !ranges) return <div style={{ color: '#9CA3AF' }}>Загрузка…</div>;

  const analyses = patient.analyses.map((a) => buildAnalysisDisplay(a, ranges));
  const inputStyle = { padding: '8px 10px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13 };

  return (
    <div style={{ maxWidth: 1180 }}>
      <button onClick={() => navigate(`/patients/${id}`)} style={{ background: 'none', border: 'none', color: '#185FA5', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 12 }}>← К карте пациента</button>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 20 }}>Приём: {patient.name}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, alignItems: 'start' }}>
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EDF0EF', padding: '22px 24px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Результаты анализов</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {analyses.map((a) => <AnalysisCard key={a.id} a={a} compact />)}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EDF0EF', padding: '22px 24px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Диагноз и назначения</div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Диагноз</label>
          <textarea
            value={diagnosisText} onChange={(e) => setDiagnosisText(e.target.value)} rows={3} placeholder="Опишите диагноз…"
            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, resize: 'vertical', marginBottom: 16 }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Назначения</label>
            <button onClick={addRow} style={{ fontSize: 12.5, color: '#185FA5', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>+ Добавить препарат</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {rows.map((rx, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr auto', gap: 6, alignItems: 'center' }}>
                <input value={rx.medication} onChange={(e) => setRowField(i, 'medication', e.target.value)} placeholder="Препарат" style={inputStyle} />
                <input value={rx.dosage} onChange={(e) => setRowField(i, 'dosage', e.target.value)} placeholder="Дозировка" style={inputStyle} />
                <input value={rx.frequency} onChange={(e) => setRowField(i, 'frequency', e.target.value)} placeholder="Частота" style={inputStyle} />
                <input value={rx.duration} onChange={(e) => setRowField(i, 'duration', e.target.value)} placeholder="Длительность" style={inputStyle} />
                <button onClick={() => removeRow(i)} aria-label="Удалить препарат" style={{ width: 28, height: 28, border: 'none', background: '#FDECEC', color: '#C0392B', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>×</button>
              </div>
            ))}
          </div>

          <div style={{ background: '#FAFBFB', borderRadius: 10, padding: '12px 14px', fontSize: 12.5, color: '#6B7280', marginBottom: 16 }}>Финальный диагноз требует подтверждения врача.</div>

          <ErrorBanner message={submitError} />

          <button
            onClick={confirmDiagnosis}
            style={{ padding: '12px 22px', borderRadius: 10, fontSize: 14.5, fontWeight: 600, border: 'none', cursor: canConfirm ? 'pointer' : 'not-allowed', background: canConfirm ? '#1D9E75' : '#D1D5DB', color: 'white' }}
          >
            Подтвердить и подписать
          </button>
          {confirmed && (
            <>
              <span style={{ marginLeft: 14, fontSize: 13.5, color: '#1D7A57', fontWeight: 600 }}>Диагноз подписан ✓</span>
              <button
                onClick={() => navigate(`/patients/${id}`)}
                style={{ marginLeft: 14, background: 'none', border: 'none', color: '#185FA5', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Открыть карту пациента →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
