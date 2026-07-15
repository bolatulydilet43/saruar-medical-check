import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import { fmtDate, CARD_STYLE, COMPACT_INPUT_STYLE, COMPACT_LABEL_STYLE, PRIMARY_BUTTON_STYLE, procedureStatusMeta } from '../theme.js';
import ErrorBanner from './ErrorBanner.jsx';
import Pill from './Pill.jsx';

const TYPE_SUGGESTIONS = ['Массаж', 'Физиотерапия', 'Грязелечение', 'Бассейн', 'ЛФК', 'Ингаляции', 'Электрофорез'];

const EMPTY_FORM = { type: '', date: '', time: '', notes: '' };

// The course-of-treatment plan for the whole stay — distinct from doctor appointments.
// Admins/doctors plan it; any staff (e.g. the nurse who ran the session) marks it done/missed.
export default function ProceduresTab({ patient, canPlan, onChange }) {
  const { t } = useTranslation();
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {canPlan && (
        <div>
          <button
            onClick={() => { setForm({ ...EMPTY_FORM, date: patient.checkIn }); setFormError(''); setShowForm((v) => !v); }}
            style={{ ...PRIMARY_BUTTON_STYLE, padding: '10px 16px', borderRadius: 10, fontSize: 13.5 }}
          >
            {showForm ? t('common.cancel') : t('procedures.addProcedure')}
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={submitForm} style={{ ...CARD_STYLE, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={COMPACT_LABEL_STYLE}>{t('procedures.fieldType')}</label>
            <input required list="procedure-types" value={form.type} onChange={(e) => setField('type', e.target.value)} placeholder={t('procedures.typePlaceholder')} style={COMPACT_INPUT_STYLE} />
            <datalist id="procedure-types">
              {TYPE_SUGGESTIONS.map((suggestion) => <option key={suggestion} value={suggestion} />)}
            </datalist>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={COMPACT_LABEL_STYLE}>{t('procedures.fieldDate')}</label>
              <input required type="date" min={patient.checkIn} max={patient.checkOut} value={form.date} onChange={(e) => setField('date', e.target.value)} style={COMPACT_INPUT_STYLE} />
            </div>
            <div>
              <label style={COMPACT_LABEL_STYLE}>{t('procedures.fieldTime')}</label>
              <input type="time" value={form.time} onChange={(e) => setField('time', e.target.value)} style={COMPACT_INPUT_STYLE} />
            </div>
          </div>
          <div>
            <label style={COMPACT_LABEL_STYLE}>{t('procedures.fieldNotes')}</label>
            <input value={form.notes} onChange={(e) => setField('notes', e.target.value)} style={COMPACT_INPUT_STYLE} />
          </div>
          <ErrorBanner message={formError} />
          <button type="submit" style={{ ...PRIMARY_BUTTON_STYLE, alignSelf: 'flex-start', padding: '9px 18px', borderRadius: 8, fontSize: 13.5 }}>
            {t('common.save')}
          </button>
        </form>
      )}

      <ErrorBanner message={rowError} />

      {sorted.map((pr) => {
        const meta = procedureStatusMeta(pr.status);
        return (
          <div key={pr.id} style={{ ...CARD_STYLE, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 700, color: '#111827', minWidth: 100 }}>{fmtDate(pr.date)}{pr.time ? ` · ${pr.time}` : ''}</div>
            <div style={{ color: '#374151', flex: 1, minWidth: 120 }}>{pr.type}</div>
            {pr.notes && <div style={{ color: '#9CA3AF', fontSize: 12.5 }}>{pr.notes}</div>}
            <Pill label={meta.label} bg={meta.bg} fg={meta.fg} />
            {pr.status === 'planned' && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setStatus(pr.id, 'done')}
                  disabled={busyId === pr.id}
                  style={{ padding: '6px 10px', background: '#F0F7F4', color: '#1D7A57', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  {t('procedures.markDone')}
                </button>
                <button
                  onClick={() => setStatus(pr.id, 'missed')}
                  disabled={busyId === pr.id}
                  style={{ padding: '6px 10px', background: '#FDECEC', color: '#C0392B', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  {t('procedures.markMissed')}
                </button>
              </div>
            )}
          </div>
        );
      })}
      {sorted.length === 0 && (
        <div style={{ ...CARD_STYLE, textAlign: 'center', padding: 40, color: '#9CA3AF', fontSize: 14 }}>
          {t('procedures.empty')}
        </div>
      )}
    </div>
  );
}
