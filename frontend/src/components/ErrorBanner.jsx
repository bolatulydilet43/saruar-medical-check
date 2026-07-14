import { useTranslation } from 'react-i18next';

export default function ErrorBanner({ message, onRetry }) {
  const { t } = useTranslation();
  if (!message) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      padding: '12px 16px', background: '#FDECEC', color: '#C0392B', borderRadius: 10,
      fontSize: 13.5, marginBottom: 18,
    }}>
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{ background: 'none', border: 'none', color: '#C0392B', fontWeight: 600, cursor: 'pointer', fontSize: 13, textDecoration: 'underline', flexShrink: 0 }}
        >
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}
