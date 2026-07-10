import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me';

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set — using an insecure default. Set JWT_SECRET before deploying.');
}

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '12h' });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
