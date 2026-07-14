import { useTranslation } from 'react-i18next';

// Custom confirm dialog, styled consistently with the app's other modals — replaces window.confirm.
export default function ConfirmModal({ open, title, confirmLabel, onConfirm, onCancel }) {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}
    >
      <div style={{ background: 'white', borderRadius: 16, padding: '26px 28px', width: 380, boxShadow: '0 24px 48px rgba(0,0,0,0.18)' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20, lineHeight: 1.5 }}>{title}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button" onClick={onCancel}
            style={{ flex: 1, padding: 10, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13.5, cursor: 'pointer' }}
          >
            {t('common.cancel')}
          </button>
          <button
            type="button" onClick={onConfirm}
            style={{ flex: 1, padding: 10, background: '#C0392B', color: 'white', border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
          >
            {confirmLabel || t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
