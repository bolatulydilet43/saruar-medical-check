import { fmtDate } from '../theme.js';

const CHIP_COLORS = {
  red: { bg: '#FDECEC', fg: '#C0392B' },
  amber: { bg: '#FDF3E0', fg: '#966F14' },
  green: { bg: '#E6F5EE', fg: '#1D7A57' },
  neutral: { bg: '#F3F4F6', fg: '#6B7280' },
};

export default function AnalysisCard({ a, compact = false }) {
  const pad = compact ? '14px 16px' : '18px 20px';
  const titleSize = compact ? 13.5 : 14.5;

  return (
    <div style={{ background: compact ? 'transparent' : 'white', border: compact ? '1px solid #F0F2F1' : '1px solid #EDF0EF', borderRadius: compact ? 12 : 14, padding: pad }}>
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontWeight: 700, color: '#111827', fontSize: titleSize }}>{a.type}</span>
        <span style={{ color: '#9CA3AF', fontSize: 13, marginLeft: 8 }}>{fmtDate(a.date)}{a.by ? ` · ${a.by}` : ''}</span>
      </div>
      {a.extraText && <div style={{ fontSize: 13.5, color: '#374151', marginBottom: 8 }}>{a.extraText}</div>}
      {a.rows && a.rows.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10 }}>
          {a.rows.map((r) => {
            const c = CHIP_COLORS[r.status] || CHIP_COLORS.neutral;
            return (
              <div key={r.key} style={{ background: c.bg, color: c.fg, padding: '10px 12px', borderRadius: 10 }}>
                <div style={{ fontSize: 11.5, opacity: 0.75 }}>{r.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{r.value} <span style={{ fontWeight: 400, fontSize: 11.5 }}>{r.unit}</span></div>
                {!compact && <div style={{ fontSize: 10.5, opacity: 0.7 }}>норма {r.range}</div>}
              </div>
            );
          })}
        </div>
      )}
      {a.conclusion && (
        <div style={{ fontSize: 13.5, color: '#374151', background: '#FAFBFB', borderRadius: 10, padding: '12px 14px', marginTop: 8 }}>{a.conclusion}</div>
      )}
    </div>
  );
}
