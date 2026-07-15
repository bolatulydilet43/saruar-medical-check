import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import { CARD_STYLE, PRIMARY_BUTTON_STYLE, SECONDARY_BUTTON_STYLE } from '../theme.js';

// Lets admin/doctor see and change which room a patient is staying in for the
// remainder of their trip — mirrors PatientPortalLink's card layout on the same page.
export default function RoomAssignment({ patientId, roomId, onChange }) {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState([]);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(roomId || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getRooms().then(setRooms).catch(() => {});
  }, []);

  useEffect(() => {
    setSelected(roomId || '');
  }, [roomId]);

  const currentRoom = rooms.find((r) => r.id === roomId);

  async function save() {
    setBusy(true);
    setError('');
    try {
      const updated = await api.assignRoom(patientId, selected || null);
      onChange(updated.roomId);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ ...CARD_STYLE, padding: '18px 20px' }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', marginBottom: 10 }}>{t('rooms.fieldNumber')}</div>
      {!editing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, color: currentRoom ? '#111827' : '#9CA3AF' }}>
            {currentRoom ? `№ ${currentRoom.number}` : t('rooms.notAssigned')}
          </span>
          <button
            onClick={() => setEditing(true)}
            style={{ ...SECONDARY_BUTTON_STYLE, padding: '6px 12px', color: '#374151', borderRadius: 8, fontSize: 12.5, fontWeight: 600 }}
          >
            {t('common.edit')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            style={{ padding: '8px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13.5, outline: 'none', background: 'white' }}
          >
            <option value="">{t('common.noRoom')}</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>№ {r.number}</option>
            ))}
          </select>
          <button
            onClick={save}
            disabled={busy}
            style={{ ...PRIMARY_BUTTON_STYLE, padding: '7px 12px', borderRadius: 8, fontSize: 12.5, cursor: busy ? 'default' : 'pointer' }}
          >
            {busy ? t('common.saving') : t('common.save')}
          </button>
          <button
            onClick={() => { setEditing(false); setSelected(roomId || ''); setError(''); }}
            style={{ ...SECONDARY_BUTTON_STYLE, padding: '7px 12px', color: '#374151', borderRadius: 8, fontSize: 12.5, fontWeight: 600 }}
          >
            {t('common.cancel')}
          </button>
        </div>
      )}
      {error && <div style={{ color: '#C0392B', fontSize: 12.5, marginTop: 8 }}>{error}</div>}
    </div>
  );
}
