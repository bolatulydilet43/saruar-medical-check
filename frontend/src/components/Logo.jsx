// Renders the real Saruar Medical Check logo file.
// Place the logo image at frontend/public/logo.png (any square PNG/SVG works).
export default function Logo({ size = 34 }) {
  return (
    <img
      src="/logo.png"
      alt="Saruar Medical Check"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }}
    />
  );
}
