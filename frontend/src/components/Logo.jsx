import { brand } from '../brandConfig.js';

// Renders the client's logo file — place it at frontend/public/logo.png
// (any square PNG/SVG works, same filename for every client deployment).
export default function Logo({ size = 34 }) {
  return (
    <img
      src="/logo.png"
      alt={brand.fullName}
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }}
    />
  );
}
