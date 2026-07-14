import { useTranslation } from 'react-i18next';
import { setLanguage } from '../i18n.js';

const LANGS = [
  { code: 'ru', label: 'РУ' },
  { code: 'kk', label: 'ҚАЗ' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div style={{ display: 'flex', gap: 4, background: '#F5F8F7', borderRadius: 8, padding: 3 }}>
      {LANGS.map((l) => {
        const active = i18n.language === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLanguage(l.code)}
            aria-pressed={active}
            style={{
              flex: 1, padding: '5px 0', borderRadius: 6, border: 'none', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
              background: active ? 'white' : 'transparent', color: active ? '#1D7A57' : '#6B7280',
              boxShadow: active ? '0 1px 2px rgba(16,24,32,0.08)' : 'none',
            }}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
