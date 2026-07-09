export const COLORS = {
  primary: '#1D9E75',
  primaryDark: '#1D7A57',
  blue: '#185FA5',
  text: '#111827',
  textMuted: '#6B7280',
  border: '#EDF0EF',
  bg: '#F5F8F7',
};

export function statusMeta(status) {
  if (status === 'red') return { label: 'Требует внимания', bg: '#FDECEC', fg: '#C0392B', dot: '#E0524A' };
  if (status === 'amber') return { label: 'Небольшое отклонение', bg: '#FDF3E0', fg: '#966F14', dot: '#E0A72E' };
  if (status === 'neutral') return { label: 'Не на смене', bg: '#F3F4F6', fg: '#6B7280', dot: '#9CA3AF' };
  return { label: 'Норма', bg: '#E6F5EE', fg: '#1D7A57', dot: '#1D9E75' };
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
