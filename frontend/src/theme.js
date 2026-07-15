import i18n from './i18n.js';

export const COLORS = {
  primary: '#1D9E75',
  primaryDark: '#1D7A57',
  blue: '#185FA5',
  text: '#111827',
  textBody: '#374151',
  textMuted: '#6B7280',
  border: '#EDF0EF',
  inputBorder: '#E5E7EB',
  grayBg: '#F9FAFB',
  bg: '#F5F8F7',
};

// Shared building blocks for the inline-style objects every page/component assembles by
// hand — kept as plain objects (not factory functions) so call sites spread and override
// individual properties the same way they already do for one-off variations (e.g. a
// different borderRadius or an extra `background: 'white'` on a <select>).
export const CARD_STYLE = { background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 14 };

export const MODAL_OVERLAY_STYLE = {
  position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.35)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
};

// Regular form fields (patient/room/staff creation modals).
export const INPUT_STYLE = { width: '100%', padding: '10px 12px', border: `1.5px solid ${COLORS.inputBorder}`, borderRadius: 10, fontSize: 14, outline: 'none' };
export const LABEL_STYLE = { display: 'block', fontSize: 12.5, fontWeight: 500, color: COLORS.textBody, marginBottom: 6 };

// Smaller fields used inside in-page tab panels (procedures, room quick-forms).
export const COMPACT_INPUT_STYLE = { width: '100%', padding: '9px 12px', border: `1.5px solid ${COLORS.inputBorder}`, borderRadius: 10, fontSize: 13.5, outline: 'none' };
export const COMPACT_LABEL_STYLE = { display: 'block', fontSize: 12, fontWeight: 500, color: COLORS.textBody, marginBottom: 5 };

// Common subset shared by every "primary" (green) and "secondary" (gray/bordered) button —
// padding/borderRadius/fontSize differ by context (header action vs. modal footer vs. row
// action) and stay local at each call site via spread, e.g. `{ ...PRIMARY_BUTTON_STYLE,
// padding: '10px 16px', borderRadius: 10 }`.
export const PRIMARY_BUTTON_STYLE = { background: COLORS.primary, color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' };
export const SECONDARY_BUTTON_STYLE = { background: COLORS.grayBg, border: `1px solid ${COLORS.inputBorder}`, cursor: 'pointer' };

// Procedure status (planned/done/missed) → pill colors, shared between the staff-facing
// procedures tab and the read-only patient portal view. Same i18n.t() pattern as statusMeta.
export function procedureStatusMeta(status) {
  if (status === 'done') return { label: i18n.t('procedures.statusDone'), bg: '#E6F5EE', fg: '#1D7A57' };
  if (status === 'missed') return { label: i18n.t('procedures.statusMissed'), bg: '#FDECEC', fg: '#C0392B' };
  return { label: i18n.t('procedures.statusPlanned'), bg: '#F0F7FE', fg: '#185FA5' };
}

// statusMeta is called from plain JS (models, not just components), so it reads the
// i18next instance directly rather than the useTranslation() hook.
export function statusMeta(status) {
  if (status === 'red') return { label: i18n.t('status.red'), bg: '#FDECEC', fg: '#C0392B', dot: '#E0524A' };
  if (status === 'amber') return { label: i18n.t('status.amber'), bg: '#FDF3E0', fg: '#966F14', dot: '#E0A72E' };
  if (status === 'neutral') return { label: i18n.t('status.neutral'), bg: '#F3F4F6', fg: '#6B7280', dot: '#9CA3AF' };
  return { label: i18n.t('status.green'), bg: '#E6F5EE', fg: '#1D7A57', dot: '#1D9E75' };
}

export function statusForValue(range, value) {
  if (!range || value === '' || value === null || value === undefined || isNaN(value)) return 'neutral';
  const v = parseFloat(value);
  if (v < range.min * 0.85 || v > range.max * 1.15) return 'red';
  if (v < range.min || v > range.max) return 'amber';
  return 'green';
}

export function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

export function fmtDateShort(iso) {
  if (!iso) return '';
  const [, m, d] = iso.split('-');
  return `${d}.${m}`;
}
