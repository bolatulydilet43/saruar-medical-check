import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { store } from '../data/store.js';
import { LATIN_PASSWORD_RE, PHONE_RE } from '../utils/validators.js';
import { verifyPassword } from '../utils/passwords.js';
import { signToken } from '../utils/jwt.js';

const router = Router();

const ROLE_LABELS = { admin: 'Администратор', doctor: 'Врач', nurse: 'Медсестра' };

// Throttles brute-force attempts per IP. Note: on Netlify Functions each warm instance
// keeps its own in-memory counter (no shared store across cold starts/instances), so this
// is a partial mitigation there, not a hard guarantee — still stops naive/sustained abuse.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много попыток входа. Попробуйте позже.' },
});

// Every login must match a staff member's exact phone + password hash. No fallback:
// staff without a configured passwordHash simply cannot log in.
router.post('/login', loginLimiter, async (req, res) => {
  const { role, phone, password } = req.body || {};
  if (!ROLE_LABELS[role]) return res.status(400).json({ error: 'Unknown role' });
  if (!phone || !PHONE_RE.test(phone)) return res.status(400).json({ error: 'Введите корректный номер телефона' });
  if (!password || !LATIN_PASSWORD_RE.test(password)) {
    return res.status(400).json({ error: 'Пароль должен быть на английском языке (латиница, без кириллицы)' });
  }

  const staff = await store.getStaff();
  const roleStaff = staff.filter((s) => s.role === role);
  const byPhone = roleStaff.find((s) => s.phone === phone);

  if (!byPhone || !byPhone.passwordHash || !verifyPassword(password, byPhone.passwordHash)) {
    return res.status(401).json({ error: 'Неверный номер телефона или пароль' });
  }
  const user = byPhone;

  const token = signToken({ sub: user.id, role });
  res.json({
    user: { id: user.id, name: user.name, role, roleLabel: ROLE_LABELS[role], phone },
    token,
  });
});

export default router;
