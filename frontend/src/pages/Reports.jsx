import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { fmtDate } from '../theme.js';
import { analysisSummaryText } from '../utils/analysisDisplay.js';
import Logo from '../components/Logo.jsx';

const TODAY_LABEL = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

export default function Reports() {
  const [patients, setPatients] = useState([]);
  const [ranges, setRanges] = useState(null);
  const [patientId, setPatientId] = useState('');
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    api.getPatients().then((list) => {
      setPatients(list);
      if (list[0]) setPatientId(list[0].id);
    });
    api.getRanges().then(setRanges);
  }, []);

  useEffect(() => {
    if (patientId) api.getPatient(patientId).then(setPatient);
  }, [patientId]);

  if (!patient || !ranges) return <div style={{ color: '#9CA3AF' }}>Загрузка…</div>;

  const latestDiagnosis = patient.diagnoses[0];
  const reportRows = patient.analyses.map((a) => ({ date: fmtDate(a.date), type: a.type, summary: analysisSummaryText(a, ranges) }));
  const prescriptions = latestDiagnosis?.prescriptions || [];

  return (
    <div style={{ maxWidth: 900 }}>
      <div data-noprint="1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>Отчёт</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={patientId} onChange={(e) => setPatientId(e.target.value)} style={{ padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13.5 }}>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={() => window.print()} style={{ padding: '9px 18px', background: '#1D9E75', color: 'white', border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Печать / PDF</button>
        </div>
      </div>

      <div data-printarea="1" style={{ background: 'white', borderRadius: 16, border: '1px solid #EDF0EF', padding: '40px 44px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 30, height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Logo size={30} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>Saruar Medical Check</div>
        </div>
        <div style={{ fontSize: 11.5, color: '#6B7280', lineHeight: 1.6, marginBottom: 18 }}>
          <div>Түркістан обл., Сарыағаш ауданы, Коктерек кенті, көш. Ы. Алтынсарин 33</div>
          <div>Туркестанская обл., Сарыагашский район, п. Коктерек, ул. Ы.Алтынсарина 33</div>
          <div>Тел.: +7 (725) 375-13-02 · Моб.: +7 (701) 038-15-15 (бронирование номеров)</div>
          <div>instagram: saruar_saryagash · e-mail: sansaruar@gmail.com</div>
        </div>
        <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 24, borderTop: '1px solid #EDF0EF', paddingTop: 14 }}>Медицинское заключение · сформировано {TODAY_LABEL}</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px 24px', fontSize: 13.5, color: '#374151', padding: '18px 20px', background: '#FAFBFB', borderRadius: 12, marginBottom: 26 }}>
          <div><span style={{ color: '#9CA3AF' }}>Пациент:</span> {patient.name}</div>
          <div><span style={{ color: '#9CA3AF' }}>Возраст/Пол:</span> {patient.age} лет, {patient.gender}</div>
          <div><span style={{ color: '#9CA3AF' }}>Заезд:</span> {fmtDate(patient.checkIn)}</div>
          <div><span style={{ color: '#9CA3AF' }}>Выезд:</span> {fmtDate(patient.checkOut)}</div>
          {patient.phone && <div><span style={{ color: '#9CA3AF' }}>Телефон:</span> {patient.phone}</div>}
          <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#9CA3AF' }}>Аллергии:</span> {patient.allergies}</div>
        </div>

        <div style={{ fontSize: 14.5, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Результаты анализов</div>
        <div style={{ border: '1px solid #EDF0EF', borderRadius: 10, overflow: 'hidden', marginBottom: 26 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 3fr', gap: 10, padding: '10px 14px', background: '#FAFBFB', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>
            <div>Дата</div><div>Тип</div><div>Результат</div>
          </div>
          {reportRows.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 3fr', gap: 10, padding: '11px 14px', borderTop: '1px solid #F3F5F4', fontSize: 13, color: '#374151' }}>
              <div>{row.date}</div><div>{row.type}</div><div>{row.summary}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 14.5, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Диагноз врача</div>
        <div style={{ fontSize: 13.5, color: '#374151', marginBottom: 6 }}>{latestDiagnosis ? latestDiagnosis.text : 'Диагноз ещё не внесён.'}</div>
        <div style={{ fontSize: 12.5, color: '#9CA3AF', marginBottom: 22 }}>{latestDiagnosis ? `${latestDiagnosis.doctor} · ${fmtDate(latestDiagnosis.date)}` : ''}</div>

        <div style={{ fontSize: 14.5, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Назначения</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 36 }}>
          {prescriptions.map((rx, i) => (
            <div key={i} style={{ display: 'flex', gap: 20, fontSize: 13.5, color: '#374151' }}>
              <div style={{ fontWeight: 600, minWidth: 160 }}>{rx.medication}</div>
              <div style={{ minWidth: 80 }}>{rx.dosage}</div>
              <div style={{ minWidth: 110 }}>{rx.frequency}</div>
              <div>{rx.duration}</div>
            </div>
          ))}
          {prescriptions.length === 0 && <div style={{ color: '#9CA3AF', fontSize: 13.5 }}>Назначений нет</div>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #EDF0EF', paddingTop: 20 }}>
          <div style={{ fontSize: 13, color: '#374151' }}>Подпись врача: <span style={{ display: 'inline-block', width: 180, borderBottom: '1px solid #9CA3AF' }}>&nbsp;</span></div>
          <div style={{ fontSize: 13, color: '#374151' }}>Дата: <span style={{ display: 'inline-block', width: 100, borderBottom: '1px solid #9CA3AF' }}>&nbsp;</span></div>
        </div>
      </div>
    </div>
  );
}
