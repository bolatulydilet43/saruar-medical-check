import { statusMeta } from '../theme.js';

export default function StatusBadge({ status, label }) {
  const meta = statusMeta(status);
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '5px 12px',
        borderRadius: '999px',
        fontSize: '12.5px',
        fontWeight: 600,
        background: meta.bg,
        color: meta.fg,
        whiteSpace: 'nowrap',
      }}
    >
      {label ?? meta.label}
    </span>
  );
}
