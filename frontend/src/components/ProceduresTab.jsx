import { useState } from 'react';
import { api } from '../api.js';
import { fmtDate } from '../theme.js';
import ErrorBanner from './ErrorBanner.jsx';

const TYPE_SUGGESTIONS = ['Массаж', 'Физиотерапия', 'Грязелечение', 'Бассейн', 'ЛФК', 'Ингаляции', 'Электрофорез'];

const STATUS_META = {
  planned: { label: 'Запланировано', bg: '#F0F7FE', fg: '#185FA5' },
  done: { label: 'Выполнено', bg: '#E6F5EE', fg: '#1D7A57' },
  missed: { label: 'Пропущено', bg: '#FDECEC', fg: '#C0392B' },
};

const EMPTY_FORM = { type: '', date: '', time: '', notes: '' };

// The course-of-treatment plan for the whole stay — distinct from doctor appointments.
// Admins/doctors plan it; any staff (e.g. the nurse who ran the session) marks it done/missed.
export default function ProceduresTab({ patient, canPlan, onChange }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM, date: patient.checkIn });
  const [formError, setFormError] = useState('');
  const [rowError, setRowError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const procedures = patient.procedures || [];
  const sorted = [...procedures].sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));

  function setField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function submitForm(e) {
    e.preventDefault();
    setFormError('');
    try {
      const created = await api.addProcedure(patient.id, form);
      onChange({ ...patient, procedures: [...procedures, created] });
      setForm({ ...EMPTY_FORM, date: patient.checkIn });
      setShowForm(false);
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function setStatus(procedureId, status) {
    setBusyId(procedureId);
    setRowError('');
    try {
      const updated = await api.updateProcedureStatus(patient.id, procedureId, status);
      onChange({ ...patient, procedures: procedures.map((pr) => (pr.id === procedureId ? updated : pr)) });
    } catch (err) {
      setRowError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13.5, outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {canPlan && (
        <div>
          <button
            onClick={() => { setForm({ ...EMPTY_FORM, date: patient.checkIn }); setFormError(''); setShowForm((v) => !v); }}
            style={{ padding: '10px 16px', background: '#1D9E75', color: 'white', border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
          >
            {showForm ? 'Отмена' : '+ Добавить процедуру'}
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={submitForm} style={{ background: 'white', borderRadius: 14, border: '1px solid #EDF0EF', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>Процедура</label>
            <input required list="procedure-types" value={form.type} onChange={(e) => setField('type', e.target.value)} placeholder="Например, Массаж" style={inputStyle} />
            <datalist id="procedure-types">
              {TYPE_SUGGESTIONS.map((t) => <option key={t} value={t} />)}
            </datalist>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Дата</label>
              <input required type="date" min={patient.checkIn} max={patient.checkOut} value={form.date} onChange={(e) => setField('date', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Время (необязательно)</label>
              <input type="time" value={form.time} onChange={(e) => setField('time', e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Заметка (необязательно)</label>
            <input value={form.notes} onChange={(e) => setField('notes', e.target.value)} style={inputStyle} />
          </div>
          <ErrorBanner message={formError} />
          <button type="submit" style={{ alignSelf: 'flex-start', padding: '9px 18px', background: '#1D9E75', color: 'white', border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
            Сохранить
          </button>
        </form>
      )}

      <ErrorBanner message={rowError} />

      {sorted.map((pr) => {
        const meta = STATUS_META[pr.status] || STATUS_META.planned;
        return (
          <div key={pr.id} style={{ background: 'white', borderRadius: 14, border: '1px solid #EDF0EF', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 700, color: '#111827', minWidth: 100 }}>{fmtDate(pr.date)}{pr.time ? ` · ${pr.time}` : ''}</div>
            <div style={{ color: '#374151', flex: 1, minWidth: 120 }}>{pr.type}</div>
            {pr.notes && <div style={{ color: '#9CA3AF', fontSize: 12.5 }}>{pr.notes}</div>}
            <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: meta.bg, color: meta.fg }}>{meta.label}</span>
            {pr.status === 'planned' && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setStatus(pr.id, 'done')}
                  disabled={busyId === pr.id}
                  style={{ padding: '6px 10px', background: '#F0F7F4', color: '#1D7A57', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  Выполнено
                </button>
                <button
                  onClick={() => setStatus(pr.id, 'missed')}
                  disabled={busyId === pr.id}
                  style={{ padding: '6px 10px', background: '#FDECEC', color: '#C0392B', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  Пропущено
                </button>
              </div>
            )}
          </div>
        );
      })}
      {sorted.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF', fontSize: 14, background: 'white', borderRadius: 14, border: '1px solid #EDF0EF' }}>
          Процедуры ещё не запланированы
        </div>
      )}
    </div>
  );
}
