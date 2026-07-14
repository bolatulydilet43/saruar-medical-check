import { useState } from 'react';
import { fmtDateShort } from '../theme.js';

const STATUS_COLOR = { green: '#1D9E75', amber: '#E0A72E', red: '#E0524A', neutral: '#9CA3AF' };
const W = 520;
const H = 120;
const PAD = { top: 14, right: 14, bottom: 22, left: 14 };

// Single-metric trend line: the connecting line is neutral (it's just the shape of change
// over time), each point is colored by clinical status (green/amber/red) — that's the
// actual information. A subtle band shows the normal range for visual context.
export default function TrendChart({ series }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const { label, unit, range, points } = series;

  const dates = points.map((p) => p.date);
  const values = points.map((p) => p.value);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const domainMin = Math.min(dataMin, range ? range.min : dataMin);
  const domainMax = Math.max(dataMax, range ? range.max : dataMax);
  const pad = (domainMax - domainMin) * 0.12 || 1;
  const yMin = domainMin - pad;
  const yMax = domainMax + pad;

  const t0 = new Date(dates[0]).getTime();
  const t1 = new Date(dates[dates.length - 1]).getTime();
  const tSpan = t1 - t0 || 1;

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const x = (date) => PAD.left + ((new Date(date).getTime() - t0) / tSpan) * plotW;
  const y = (v) => PAD.top + (1 - (v - yMin) / (yMax - yMin)) * plotH;

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.date).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ');
  const bandTop = range ? y(range.max) : null;
  const bandBottom = range ? y(range.min) : null;
  const last = points[points.length - 1];
  const hovered = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div style={{ background: 'white', border: '1px solid #EDF0EF', borderRadius: 14, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>{label}</div>
        <div style={{ fontSize: 12, color: '#9CA3AF' }}>{range ? `норма ${range.min}–${range.max} ${unit}` : unit}</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H, display: 'block', overflow: 'visible' }}>
        {range && (
          <rect x={PAD.left} y={bandTop} width={plotW} height={Math.max(bandBottom - bandTop, 0)} fill="#1D9E75" opacity={0.08} />
        )}
        <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="#EDF0EF" strokeWidth={1} />

        <path d={linePath} fill="none" stroke="#C4CBC9" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {points.map((p, i) => (
          <g key={i}>
            {/* generous invisible hit target, per interaction guidance (≥24px) */}
            <circle
              cx={x(p.date)} cy={y(p.value)} r={12} fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx((cur) => (cur === i ? null : cur))}
              onFocus={() => setHoverIdx(i)}
              onBlur={() => setHoverIdx((cur) => (cur === i ? null : cur))}
              tabIndex={0}
              role="img"
              aria-label={`${fmtDateShort(p.date)}: ${p.value} ${unit}`}
              style={{ cursor: 'pointer' }}
            />
            <circle cx={x(p.date)} cy={y(p.value)} r={5} fill={STATUS_COLOR[p.status]} stroke="white" strokeWidth={2} style={{ pointerEvents: 'none' }} />
          </g>
        ))}

        {/* endpoint value label — per spec, lines get a value at the end, not on every point */}
        <text x={x(last.date) + 8} y={y(last.value) + 4} fontSize={12} fontWeight={700} fill="#111827" style={{ pointerEvents: 'none' }}>
          {last.value}
        </text>

        {hovered && (
          <g>
            <line x1={x(hovered.date)} y1={PAD.top} x2={x(hovered.date)} y2={H - PAD.bottom} stroke="#D1D5DB" strokeWidth={1} strokeDasharray="2,2" />
          </g>
        )}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', marginTop: -4 }}>
        <span>{fmtDateShort(dates[0])}</span>
        <span>{fmtDateShort(dates[dates.length - 1])}</span>
      </div>
      {hovered && (
        <div style={{ marginTop: 6, fontSize: 12, color: '#374151', background: '#FAFBFB', borderRadius: 8, padding: '5px 10px', display: 'inline-block' }}>
          <strong style={{ color: '#111827' }}>{hovered.value} {unit}</strong> · {fmtDateShort(hovered.date)}
        </div>
      )}
    </div>
  );
}
