import { useTranslation } from 'react-i18next';
import { MODAL_OVERLAY_STYLE, SECONDARY_BUTTON_STYLE } from '../theme.js';

// Custom confirm dialog, styled consistently with the app's other modals — replaces window.confirm.
export default function ConfirmModal({ open, title, confirmLabel, onConfirm, onCancel }) {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      style={{ ...MODAL_OVERLAY_STYLE, zIndex: 60 }}
    >
      <div style={{ background: 'white', borderRadius: 16, padding: '26px 28px', width: 380, boxShadow: '0 24px 48px rgba(0,0,0,0.18)' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20, lineHeight: 1.5 }}>{title}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button" onClick={onCancel}
            style={{ ...SECONDARY_BUTTON_STYLE, flex: 1, padding: 10, borderRadius: 8, fontSize: 13.5 }}
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
