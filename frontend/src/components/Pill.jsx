export default function Pill({ label, bg, fg }) {
  return (
    <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: bg, color: fg }}>
      {label}
    </span>
  );
}
