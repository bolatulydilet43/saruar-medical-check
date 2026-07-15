import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';
import { brand } from '../brandConfig.js';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import { SECONDARY_BUTTON_STYLE } from '../theme.js';

const NAV_ITEMS = [
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: 'grid', matches: ['/dashboard'] },
  // Doctor review (/review/:id) is launched from a patient's record, so it counts as "Пациенты" too.
  { to: '/patients', labelKey: 'nav.patients', icon: 'users', matches: ['/patients', '/review'] },
  { to: '/analysis-entry', labelKey: 'nav.analysisEntry', icon: 'droplet', matches: ['/analysis-entry'] },
  { to: '/appointments', labelKey: 'nav.appointments', icon: 'calendar', matches: ['/appointments'] },
  { to: '/rooms', labelKey: 'nav.rooms', icon: 'bed', matches: ['/rooms'] },
  { to: '/reports', labelKey: 'nav.reports', icon: 'doc', matches: ['/reports'] },
  { to: '/settings', labelKey: 'nav.settings', icon: 'sliders', matches: ['/settings'] },
];

const ICONS = {
  grid: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 20c0-3.6 3.1-6.4 7-6.4s7 2.8 7 6.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  droplet: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 3c3.5 4.2 6 7.6 6 10.5a6 6 0 1 1-12 0C6 10.6 8.5 7.2 12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
  calendar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.8" />
      <line x1="8" y1="3" x2="8" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="16" y1="3" x2="16" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  bed: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 19v-8a2 2 0 0 1 2-2h4v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 15h18v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 13h10v-2a2 2 0 0 0-2-2h-8v4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <line x1="3" y1="19" x2="3" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="21" y1="19" x2="21" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  doc: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <line x1="8.5" y1="8" x2="15.5" y2="8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="8.5" y1="12" x2="15.5" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="8.5" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  sliders: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <line x1="4" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="9" cy="7" r="2" fill="white" stroke="currentColor" strokeWidth="1.8" />
      <line x1="4" y1="14" x2="20" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="16" cy="14" r="2" fill="white" stroke="currentColor" strokeWidth="1.8" />
      <line x1="4" y1="19" x2="20" y2="19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="11" cy="19" r="2" fill="white" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
};

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const roleLabel = user?.role ? t(`role.${user.role}`) : '';

  const navStyle = (active) => ({
    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', border: 'none',
    cursor: 'pointer', fontSize: '14px', fontWeight: 600, textAlign: 'left', width: '100%', textDecoration: 'none',
    justifyContent: expanded ? 'flex-start' : 'center',
    background: active ? '#E6F5EE' : 'transparent', color: active ? '#1D7A57' : '#4B5563',
  });

  return (
    <div
      data-noprint="1"
      style={{
        width: expanded ? '236px' : '76px', background: '#FFFFFF', borderRight: '1px solid #EAEDEC',
        display: 'flex', flexDirection: 'column', transition: 'width .18s ease', flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '22px 18px' }}>
        <div style={{ width: 34, height: 34, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Logo size={34} />
        </div>
        {expanded && (
          <div style={{ minWidth: 0, lineHeight: 1.15 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#111827', whiteSpace: 'nowrap' }}>{brand.shortName}</div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: '#6B7280', whiteSpace: 'nowrap' }}>{brand.fullName.replace(brand.shortName, '').trim()}</div>
          </div>
        )}
      </div>

      <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
        {NAV_ITEMS.map((item) => {
          const active = item.matches.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'));
          return (
            <Link key={item.to} to={item.to} style={navStyle(active)}>
              <span style={{ flexShrink: 0 }}>{ICONS[item.icon]}</span>
              {expanded && <span>{t(item.labelKey)}</span>}
            </Link>
          );
        })}
      </div>

      <button
        onClick={() => setExpanded((e) => !e)}
        aria-label={expanded ? t('sidebar.collapse') : t('sidebar.expand')}
        aria-expanded={expanded}
        style={{ ...SECONDARY_BUTTON_STYLE, margin: '8px 12px', padding: '8px', borderRadius: 8, fontSize: 12, color: '#6B7280' }}
      >
        {expanded ? `‹ ${t('sidebar.collapse')}` : '›'}
      </button>

      {expanded && (
        <div style={{ padding: '0 12px', marginBottom: 4 }}>
          <LanguageSwitcher />
        </div>
      )}

      <div style={{ marginTop: 'auto', padding: '16px 18px', borderTop: '1px solid #EDF0EF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E6F5EE', color: '#1D7A57', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
            {(roleLabel || '?').slice(0, 1)}
          </div>
          {expanded && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{roleLabel}</div>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          style={{ ...SECONDARY_BUTTON_STYLE, marginTop: 12, width: '100%', padding: 8, borderRadius: 8, fontSize: 12.5, color: '#6B7280' }}
        >
          {t('sidebar.logout')}
        </button>
      </div>
    </div>
  );
}
