import { verifyToken } from '../utils/jwt.js';

// Requires a valid signed session token (issued by /api/auth/login) in
// `Authorization: Bearer <token>`. Attaches the decoded payload as req.user.
export function requireAuth(req, res, next) {
  const header = req.header('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Сессия истекла, войдите снова' });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    requireAuth(req, res, () => {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Недостаточно прав для этого действия' });
      }
      next();
    });
  };
}
