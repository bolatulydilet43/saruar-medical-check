import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { fmtDate, CARD_STYLE, MODAL_OVERLAY_STYLE, COMPACT_INPUT_STYLE, COMPACT_LABEL_STYLE, PRIMARY_BUTTON_STYLE, SECONDARY_BUTTON_STYLE } from '../theme.js';
import ErrorBanner from '../components/ErrorBanner.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Pill from '../components/Pill.jsx';

const EMPTY_FORM = { number: '', capacity: 1, notes: '' };

export default function Rooms() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const today = new Date().toISOString().slice(0, 10);

  function reload() {
    setLoadError('');
    Promise.all([api.getRooms(), api.getPatients()])
      .then(([roomsRes, patientsRes]) => {
        setRooms(roomsRes);
        setPatients(patientsRes);
      })
      .catch((err) => setLoadError(err.message));
  }

  useEffect(() => {
    reload();
  }, []);

  function occupantsOf(roomId) {
    return patients
      .filter((p) => p.roomId === roomId && p.checkOut >= today)
      .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  }

  function openEdit(room) {
    setEditing(room);
    setForm({ number: room.number, capacity: room.capacity, notes: room.notes });
    setFormError('');
    setShowForm(true);
  }

  function setField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function submitForm(e) {
    e.preventDefault();
    setFormError('');
    try {
      if (editing) {
        await api.updateRoom(editing.id, form);
      } else {
        await api.createRoom(form);
      }
      setShowForm(false);
      reload();
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function confirmDeleteRoom() {
    const room = pendingDelete;
    setPendingDelete(null);
    setDeleteError('');
    try {
      await api.deleteRoom(room.id);
      reload();
    } catch (err) {
      setDeleteError(err.message);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>{t('rooms.title')}</div>
        {isAdmin && (
          <button
            onClick={openCreate}
            style={{ ...PRIMARY_BUTTON_STYLE, padding: '10px 16px', borderRadius: 10, fontSize: 13.5 }}
          >
            {t('rooms.addRoom')}
          </button>
        )}
      </div>

      <ErrorBanner message={loadError} onRetry={reload} />
      <ErrorBanner message={deleteError} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {rooms.map((room) => {
          const occupants = occupantsOf(room.id);
          const free = occupants.length === 0;
          return (
            <div key={room.id} style={{ ...CARD_STYLE, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>№ {room.number}</div>
                <Pill label={free ? t('rooms.free') : t('rooms.occupied')} bg={free ? '#E6F5EE' : '#FDF3E0'} fg={free ? '#1D7A57' : '#966F14'} />
              </div>
              <div style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 10 }}>
                {t('rooms.capacity', { capacity: room.capacity })}{room.notes ? ` · ${room.notes}` : ''}
              </div>

              {occupants.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                  {occupants.map((p) => (
                    <Link
                      key={p.id}
                      to={`/patients/${p.id}`}
                      style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, color: '#374151', textDecoration: 'none' }}
                    >
                      <span style={{ fontWeight: 600, color: '#111827' }}>{p.name}</span>
                      <span style={{ color: '#9CA3AF', flexShrink: 0 }}>{fmtDate(p.checkIn)}–{fmtDate(p.checkOut)}</span>
                    </Link>
                  ))}
                </div>
              )}

              {isAdmin && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => openEdit(room)}
                    style={{ ...SECONDARY_BUTTON_STYLE, padding: '6px 10px', borderRadius: 8, fontSize: 12.5, color: '#374151' }}
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    onClick={() => setPendingDelete(room)}
                    style={{ padding: '6px 10px', background: '#FDECEC', border: '1px solid #F3C7C4', borderRadius: 8, fontSize: 12.5, cursor: 'pointer', color: '#C0392B' }}
                  >
                    {t('common.delete')}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {rooms.length === 0 && !loadError && (
        <div style={{ ...CARD_STYLE, textAlign: 'center', padding: 40, color: '#9CA3AF', fontSize: 14 }}>
          {t('rooms.empty')}
        </div>
      )}

      {showForm && (
        <div style={MODAL_OVERLAY_STYLE}>
          <form onSubmit={submitForm} style={{ background: 'white', borderRadius: 16, padding: '26px 28px', width: 380, boxShadow: '0 24px 48px rgba(0,0,0,0.18)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>{editing ? t('rooms.editTitle') : t('rooms.newTitle')}</div>

            <div style={{ marginBottom: 12 }}>
              <label style={COMPACT_LABEL_STYLE}>{t('rooms.fieldNumber')}</label>
              <input required value={form.number} onChange={(e) => setField('number', e.target.value)} placeholder={t('rooms.numberPlaceholder')} style={COMPACT_INPUT_STYLE} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={COMPACT_LABEL_STYLE}>{t('rooms.fieldCapacity')}</label>
              <input type="number" min="1" value={form.capacity} onChange={(e) => setField('capacity', e.target.value)} style={COMPACT_INPUT_STYLE} />
            </div>
            <div style={{ marginBottom: 6 }}>
              <label style={COMPACT_LABEL_STYLE}>{t('rooms.fieldNotes')}</label>
              <input value={form.notes} onChange={(e) => setField('notes', e.target.value)} style={COMPACT_INPUT_STYLE} />
            </div>

            <ErrorBanner message={formError} />

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ ...SECONDARY_BUTTON_STYLE, flex: 1, padding: 10, borderRadius: 8, fontSize: 13.5 }}>{t('common.cancel')}</button>
              <button type="submit" style={{ ...PRIMARY_BUTTON_STYLE, flex: 1, padding: 10, borderRadius: 8, fontSize: 13.5 }}>{t('common.save')}</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={!!pendingDelete}
        title={t('rooms.deleteConfirm', { number: pendingDelete?.number })}
        onConfirm={confirmDeleteRoom}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
