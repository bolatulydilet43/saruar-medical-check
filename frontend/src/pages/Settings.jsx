import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CARD_STYLE, MODAL_OVERLAY_STYLE, INPUT_STYLE, LABEL_STYLE, PRIMARY_BUTTON_STYLE, SECONDARY_BUTTON_STYLE } from '../theme.js';
import StatusBadge from '../components/StatusBadge.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';

const EMPTY_FORM = { name: '', role: 'doctor', specialty: '', phone: '+77', password: '' };
const LATIN_PASSWORD_RE = /^[A-Za-z0-9!@#$%^&*()_\-+=.,:;'"~`<>?/\\|{}[\]]*$/;

export default function Settings() {
  const { t } = useTranslation();
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  function reload() {
    setLoadError('');
    api.getStaff().then(setStaff).catch((err) => setLoadError(err.message));
  }

  useEffect(() => {
    reload();
  }, []);

  async function toggleDuty(member) {
    try {
      await api.setStaffDuty(member.id, !member.onDuty);
      reload();
    } catch (err) {
      alert(err.message);
    }
  }

  async function confirmRemoveStaff() {
    const member = pendingDelete;
    setPendingDelete(null);
    try {
      await api.deleteStaff(member.id);
      reload();
    } catch (err) {
      alert(err.message);
    }
  }

  function setField(key, val) {
    if (key === 'password' && !LATIN_PASSWORD_RE.test(val)) {
      setError(t('login.errorPassword'));
      return;
    }
    setError('');
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function submitForm(e) {
    e.preventDefault();
    setError('');
    if (form.password && form.password.length < 8) {
      setError(t('settings.errorPasswordLength'));
      return;
    }
    try {
      await api.createStaff(form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>{t('settings.title')}</div>
        {isAdmin && (
          <button
            onClick={() => { setForm(EMPTY_FORM); setError(''); setShowForm(true); }}
            style={{ ...PRIMARY_BUTTON_STYLE, padding: '10px 16px', borderRadius: 10, fontSize: 13.5 }}
          >
            {t('settings.addStaff')}
          </button>
        )}
      </div>

      <ErrorBanner message={loadError} onRetry={reload} />

      <div style={{ ...CARD_STYLE, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '2fr 1.6fr 1fr 1.4fr' : '2fr 1.6fr 1fr', gap: 12, padding: '14px 20px', background: '#FAFBFB', fontSize: 12.5, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #EDF0EF' }}>
          <div>{t('settings.colName')}</div><div>{t('settings.colSpecialty')}</div><div>{t('settings.colStatus')}</div>{isAdmin && <div>{t('settings.colActions')}</div>}
        </div>
        {staff.map((s) => (
          <div key={s.id} style={{ display: 'grid', gridTemplateColumns: isAdmin ? '2fr 1.6fr 1fr 1.4fr' : '2fr 1.6fr 1fr', gap: 12, padding: '14px 20px', borderBottom: '1px solid #F3F5F4', alignItems: 'center', fontSize: 14 }}>
            <div style={{ fontWeight: 600, color: '#111827' }}>{s.name}</div>
            <div style={{ color: '#6B7280' }}>{s.specialty}</div>
            <div><StatusBadge status={s.onDuty ? 'green' : 'neutral'} label={s.onDuty ? t('settings.onDuty') : t('settings.offDuty')} /></div>
            {isAdmin && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => toggleDuty(s)}
                  style={{ ...SECONDARY_BUTTON_STYLE, padding: '6px 10px', borderRadius: 8, fontSize: 12.5, color: '#374151' }}
                >
                  {s.onDuty ? t('settings.toggleOff') : t('settings.toggleOn')}
                </button>
                {s.id !== user.id && (
                  <button
                    onClick={() => setPendingDelete(s)}
                    style={{ padding: '6px 10px', background: '#FDECEC', border: '1px solid #F3C7C4', borderRadius: 8, fontSize: 12.5, cursor: 'pointer', color: '#C0392B' }}
                  >
                    {t('common.delete')}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div style={MODAL_OVERLAY_STYLE}>
          <form onSubmit={submitForm} style={{ background: 'white', borderRadius: 16, padding: '26px 28px', width: 420, boxShadow: '0 24px 48px rgba(0,0,0,0.18)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>{t('settings.newStaffTitle')}</div>

            <div style={{ marginBottom: 12 }}>
              <label style={LABEL_STYLE}>{t('settings.fieldRole')}</label>
              <select value={form.role} onChange={(e) => setField('role', e.target.value)} style={{ ...INPUT_STYLE, background: 'white' }}>
                <option value="doctor">{t('role.doctor')}</option>
                <option value="nurse">{t('role.nurse')}</option>
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={LABEL_STYLE}>{t('settings.fieldName')}</label>
              <input required value={form.name} onChange={(e) => setField('name', e.target.value)} style={INPUT_STYLE} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={LABEL_STYLE}>{t('settings.fieldSpecialty')}</label>
              <input required value={form.specialty} onChange={(e) => setField('specialty', e.target.value)} placeholder={t('settings.specialtyPlaceholder')} style={INPUT_STYLE} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 6 }}>
              <div>
                <label style={LABEL_STYLE}>{t('settings.fieldPhone')}</label>
                <input type="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="+7 700 123 45 67" style={INPUT_STYLE} />
              </div>
              <div>
                <label style={LABEL_STYLE}>{t('settings.fieldPassword')}</label>
                <input value={form.password} onChange={(e) => setField('password', e.target.value)} placeholder="Doctor123" style={INPUT_STYLE} />
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: '#9CA3AF', marginBottom: 16 }}>{t('settings.passwordHint')}</div>

            {error && <div style={{ color: '#C0392B', fontSize: 13, marginBottom: 12 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ ...SECONDARY_BUTTON_STYLE, flex: 1, padding: 10, borderRadius: 8, fontSize: 13.5 }}>{t('common.cancel')}</button>
              <button type="submit" style={{ ...PRIMARY_BUTTON_STYLE, flex: 1, padding: 10, borderRadius: 8, fontSize: 13.5 }}>{t('settings.add')}</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={!!pendingDelete}
        title={t('settings.deleteConfirm', { name: pendingDelete?.name })}
        onConfirm={confirmRemoveStaff}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
