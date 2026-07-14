import { useEffect, useState } from 'react';
import { api } from '../api.js';
import ConfirmModal from './ConfirmModal.jsx';

// Read-only self-service link/QR a patient scans at reception — no login, valid through
// checkOut. qrcode is dynamically imported so it doesn't bloat the main bundle for staff
// who never open this panel.
export default function PatientPortalLink({ patientId, portalToken, onTokenChange }) {
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [confirmingRegen, setConfirmingRegen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const url = portalToken ? `${window.location.origin}/patient-view/${portalToken}` : null;

  useEffect(() => {
    setQrDataUrl(null);
    if (!url) return;
    let cancelled = false;
    import('qrcode').then((QRCode) => QRCode.toDataURL(url, { margin: 1, width: 160 })).then((dataUrl) => {
      if (!cancelled) setQrDataUrl(dataUrl);
    });
    return () => { cancelled = true; };
  }, [url]);

  async function regenerate() {
    setConfirmingRegen(false);
    setBusy(true);
    setError('');
    try {
      const { portalToken: fresh } = await api.regeneratePortalToken(patientId);
      onTokenChange(fresh);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ background: 'white', border: '1px solid #EDF0EF', borderRadius: 14, padding: '18px 20px', display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      {qrDataUrl && <img src={qrDataUrl} alt="QR-код для пациента" width={100} height={100} style={{ borderRadius: 8 }} />}
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Ссылка для пациента</div>
        <div style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 10 }}>
          Пациент сканирует QR или переходит по ссылке — видит свои анализы и назначения без входа в систему, до даты выезда.
        </div>
        {url && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={copyLink}
              style={{ padding: '7px 12px', background: '#F0F7F4', color: '#1D7A57', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
            >
              {copied ? 'Скопировано ✓' : 'Скопировать ссылку'}
            </button>
            <button
              onClick={() => setConfirmingRegen(true)}
              disabled={busy}
              style={{ padding: '7px 12px', background: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: busy ? 'default' : 'pointer' }}
            >
              Обновить ссылку
            </button>
          </div>
        )}
        {!url && (
          <button
            onClick={regenerate}
            disabled={busy}
            style={{ padding: '7px 12px', background: '#1D9E75', color: 'white', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: busy ? 'default' : 'pointer' }}
          >
            {busy ? 'Создание…' : 'Создать ссылку'}
          </button>
        )}
        {error && <div style={{ color: '#C0392B', fontSize: 12.5, marginTop: 8 }}>{error}</div>}
      </div>

      <ConfirmModal
        open={confirmingRegen}
        title="Обновить ссылку? Старая ссылка/QR перестанут работать — если уже выданы пациенту, их нужно будет заменить."
        confirmLabel="Обновить"
        onConfirm={regenerate}
        onCancel={() => setConfirmingRegen(false)}
      />
    </div>
  );
}
