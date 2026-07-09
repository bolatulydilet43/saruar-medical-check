import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import { statusForValue } from '../theme.js';

const TYPES = [
  { id: 'blood', label: 'Общий анализ крови' },
  { id: 'urine', label: 'Анализ мочи' },
  { id: 'ecg', label: 'ЭКГ' },
  { id: 'bp', label: 'Давление' },
  { id: 'us', label: 'УЗИ' },
];

const NUMERIC_FIELDS = {
  blood: ['hemoglobin', 'leukocytes', 'erythrocytes', 'platelets', 'esr'],
  urine: ['urineDensity', 'urineProtein', 'urineGlucose', 'urineLeukocytes'],
  bp: ['systolic', 'diastolic', 'pulse'],
  ecg: ['heartRate'],
  us: [],
};

const RHYTHMS = ['Синусовый ритм', 'Синусовая тахикардия', 'Синусовая брадикардия', 'Мерцательная аритмия', 'Другое'];

export default function AnalysisEntry() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [patients, setPatients] = useState([]);
  const [ranges, setRanges] = useState({});
  const [patientId, setPatientId] = useState(searchParams.get('patient') || '');
  const [type, setType] = useState('blood');
  const [values, setValues] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getPatients().then((list) => {
      setPatients(list);
      if (!patientId && list[0]) setPatientId(list[0].id);
    });
    api.getRanges().then(setRanges);
  }, []);

  function setValue(key, val) {
    setValues((v) => ({ ...v, [key]: val }));
    setSaved(false);
  }

  function changeType(t) {
    setType(t);
    setValues({});
    setSaved(false);
  }

  async function submit() {
    if (!patientId) return;
    const payload = { analysisType: type, by: user?.name };
    if (type === 'blood' || type === 'bp') payload.values = values;
    if (type === 'urine') payload.urine = { color: values.urineColorText, density: values.urineDensity, protein: values.urineProtein, glucose: values.urineGlucose, leukocytes: values.urineLeukocytes };
    if (type === 'ecg') { payload.rhythm = values.rhythm || 'Синусовый ритм'; payload.heartRate = values.heartRate; payload.conclusion = values.conclusion; }
    if (type === 'us') payload.conclusion = values.conclusion;

    await api.addAnalysis(patientId, payload);
    setValues({});
    setSaved(true);
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

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 };

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 6 }}>Внести результаты анализа</div>
      <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Значения вне нормы подсвечиваются автоматически</div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EDF0EF', padding: '24px 26px' }}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ ...labelStyle, fontWeight: 600 }}>Пациент</label>
          <select value={patientId} onChange={(e) => setPatientId(e.target.value)} style={{ ...inputStyle, background: 'white' }}>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ ...labelStyle, fontWeight: 600, marginBottom: 8 }}>Тип анализа</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TYPES.map((t) => (
              <button key={t.id} onClick={() => changeType(t.id)} style={typeBtnStyle(type === t.id)}>{t.label}</button>
            ))}
          </div>
        </div>

        {type === 'urine' && (
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Цвет</label>
            <input value={values.urineColorText || ''} onChange={(e) => setValue('urineColorText', e.target.value)} placeholder="Например, соломенно-жёлтый" style={inputStyle} />
          </div>
        )}

        {fieldsList.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 8 }}>
            {fieldsList.map((f) => (
              <div key={f.key}>
                <label style={labelStyle}>{f.r.label} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(норма {f.r.min}–{f.r.max} {f.r.unit})</span></label>
                <input value={f.val} onChange={(e) => setValue(f.key, e.target.value)} style={{ ...inputStyle, border: `1.5px solid ${f.borderColor}` }} />
              </div>
            ))}
          </div>
        )}

        {type === 'ecg' && (
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Ритм сердца</label>
            <select value={values.rhythm || RHYTHMS[0]} onChange={(e) => setValue('rhythm', e.target.value)} style={{ ...inputStyle, background: 'white' }}>
              {RHYTHMS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        )}

        {(type === 'ecg' || type === 'us') && (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Заключение</label>
              <textarea value={values.conclusion || ''} onChange={(e) => setValue('conclusion', e.target.value)} rows={3} placeholder="Введите текст заключения…" style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: 6 }}>
              <label style={labelStyle}>Файл / изображение</label>
              <input type="file" onChange={(e) => setValue('fileName', e.target.value)} style={{ width: '100%', fontSize: 13, color: '#6B7280' }} />
            </div>
          </>
        )}

        <div style={{ height: 1, background: '#EEF1F0', margin: '18px 0' }} />
        <button onClick={submit} style={{ padding: '12px 22px', background: '#1D9E75', color: 'white', border: 'none', borderRadius: 10, fontSize: 14.5, fontWeight: 600, cursor: 'pointer' }}>Сохранить результат</button>
        {saved && <span style={{ marginLeft: 14, fontSize: 13.5, color: '#1D7A57', fontWeight: 600 }}>Сохранено ✓</span>}
      </div>
    </div>
  );
}
