import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import { statusForValue, CARD_STYLE, INPUT_STYLE, LABEL_STYLE, PRIMARY_BUTTON_STYLE } from '../theme.js';
import ErrorBanner from '../components/ErrorBanner.jsx';

const NUMERIC_FIELDS = {
  blood: ['hemoglobin', 'leukocytes', 'erythrocytes', 'platelets', 'esr'],
  urine: ['urineDensity', 'urineProtein', 'urineGlucose', 'urineLeukocytes'],
  bp: ['systolic', 'diastolic', 'pulse'],
  ecg: ['heartRate'],
  us: [],
  sugar: ['glucose'],
  biochem: ['totalProtein', 'creatinine', 'alt', 'ast'],
  hormones: ['tsh', 't3', 't4', 'prolactin'],
};

// Types that submit their numeric fields straight through as payload.values.
const DIRECT_VALUE_TYPES = ['blood', 'bp', 'sugar', 'biochem', 'hormones'];

const RHYTHMS = ['Синусовый ритм', 'Синусовая тахикардия', 'Синусовая брадикардия', 'Мерцательная аритмия', 'Другое'];

// Example value shown as a placeholder — midpoint of the normal range, trimmed of trailing zeros.
function exampleValue(min, max) {
  return ((min + max) / 2).toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

export default function AnalysisEntry() {
  const { t } = useTranslation();
  const TYPES = [
    { id: 'blood', label: t('analysisEntry.types.blood') },
    { id: 'urine', label: t('analysisEntry.types.urine') },
    { id: 'ecg', label: t('analysisEntry.types.ecg') },
    { id: 'bp', label: t('analysisEntry.types.bp') },
    { id: 'us', label: t('analysisEntry.types.us') },
    { id: 'sugar', label: t('analysisEntry.types.sugar') },
    { id: 'biochem', label: t('analysisEntry.types.biochem') },
    { id: 'hormones', label: t('analysisEntry.types.hormones') },
  ];
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [patients, setPatients] = useState([]);
  const [ranges, setRanges] = useState({});
  const [patientId, setPatientId] = useState(searchParams.get('patient') || '');
  const [type, setType] = useState('blood');
  const [values, setValues] = useState({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setError('');
    Promise.all([
      api.getPatients().then((list) => {
        setPatients(list);
        if (!patientId && list[0]) setPatientId(list[0].id);
      }),
      api.getRanges().then(setRanges),
    ]).catch((err) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, []);

  function setValue(key, val) {
    setValues((v) => ({ ...v, [key]: val }));
    setSaved(false);
  }

  function changeType(newType) {
    setType(newType);
    setValues({});
    setSaved(false);
  }

  async function submit() {
    if (!patientId) return;
    setError('');
    const payload = { analysisType: type, by: user?.name };
    if (DIRECT_VALUE_TYPES.includes(type)) payload.values = values;
    if (type === 'urine') payload.urine = { color: values.urineColorText, density: values.urineDensity, protein: values.urineProtein, glucose: values.urineGlucose, leukocytes: values.urineLeukocytes };
    if (type === 'ecg') { payload.rhythm = values.rhythm || 'Синусовый ритм'; payload.heartRate = values.heartRate; payload.conclusion = values.conclusion; }
    if (type === 'us') payload.conclusion = values.conclusion;

    try {
      await api.addAnalysis(patientId, payload);
      setValues({});
      setSaved(true);
    } catch (err) {
      setError(err.message);
    }
  }

  const typeBtnStyle = (active) => ({
    padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    border: active ? 'none' : '1px solid #E5E7EB',
    background: active ? '#185FA5' : 'white', color: active ? 'white' : '#374151',
  });

  const fieldsList = (NUMERIC_FIELDS[type] || []).map((key) => {
    const r = ranges[key] || { label: key, unit: '', min: 0, max: 0 };
    const val = values[key] ?? '';
    const status = statusForValue(r, val);
    const borderColor = val === '' ? '#E5E7EB' : status === 'red' ? '#E0524A' : status === 'amber' ? '#E0A72E' : '#1D9E75';
    return { key, r, val, borderColor };
  });

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 6 }}>{t('analysisEntry.title')}</div>
      <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>{t('analysisEntry.subtitle')}</div>

      <ErrorBanner message={error} />

      <div style={{ ...CARD_STYLE, borderRadius: 16, padding: '24px 26px' }}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ ...LABEL_STYLE, fontWeight: 600 }}>{t('analysisEntry.fieldPatient')}</label>
          <select value={patientId} onChange={(e) => setPatientId(e.target.value)} style={{ ...INPUT_STYLE, background: 'white' }}>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ ...LABEL_STYLE, fontWeight: 600, marginBottom: 8 }}>{t('analysisEntry.fieldAnalysisType')}</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TYPES.map((tp) => (
              <button key={tp.id} onClick={() => changeType(tp.id)} style={typeBtnStyle(type === tp.id)}>{tp.label}</button>
            ))}
          </div>
        </div>

        {type === 'urine' && (
          <div style={{ marginBottom: 14 }}>
            <label style={LABEL_STYLE}>{t('analysisEntry.fieldColor')}</label>
            <input value={values.urineColorText || ''} onChange={(e) => setValue('urineColorText', e.target.value)} placeholder={t('analysisEntry.colorPlaceholder')} style={INPUT_STYLE} />
          </div>
        )}

        {fieldsList.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 8 }}>
            {fieldsList.map((f) => (
              <div key={f.key}>
                <label style={LABEL_STYLE}>{f.r.label} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>{t('analysisEntry.normalRange', { min: f.r.min, max: f.r.max, unit: f.r.unit })}</span></label>
                <input
                  value={f.val} onChange={(e) => setValue(f.key, e.target.value)}
                  placeholder={t('analysisEntry.examplePlaceholder', { value: exampleValue(f.r.min, f.r.max) })}
                  style={{ ...INPUT_STYLE, border: `1.5px solid ${f.borderColor}` }}
                />
              </div>
            ))}
          </div>
        )}

        {type === 'ecg' && (
          <div style={{ marginBottom: 14 }}>
            <label style={LABEL_STYLE}>{t('analysisEntry.fieldRhythm')}</label>
            <select value={values.rhythm || RHYTHMS[0]} onChange={(e) => setValue('rhythm', e.target.value)} style={{ ...INPUT_STYLE, background: 'white' }}>
              {RHYTHMS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        )}

        {(type === 'ecg' || type === 'us') && (
          <div style={{ marginBottom: 14 }}>
            <label style={LABEL_STYLE}>{t('analysisEntry.fieldConclusion')}</label>
            <textarea value={values.conclusion || ''} onChange={(e) => setValue('conclusion', e.target.value)} rows={3} placeholder={t('analysisEntry.conclusionPlaceholder')} style={{ ...INPUT_STYLE, resize: 'vertical' }} />
          </div>
        )}

        <div style={{ height: 1, background: '#EEF1F0', margin: '18px 0' }} />
        <button onClick={submit} style={{ ...PRIMARY_BUTTON_STYLE, padding: '12px 22px', borderRadius: 10, fontSize: 14.5 }}>{t('analysisEntry.save')}</button>
        {saved && <span style={{ marginLeft: 14, fontSize: 13.5, color: '#1D7A57', fontWeight: 600 }}>{t('analysisEntry.saved')}</span>}
      </div>
    </div>
  );
}
