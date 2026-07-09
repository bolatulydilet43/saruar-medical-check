import { Router } from 'express';
import { store } from '../data/store.js';

const router = Router();

const ROLE_LABELS = { admin: 'Администратор', doctor: 'Врач', nurse: 'Медсестра' };

// Same rule for every role: password must be typed in English/Latin characters.
const LATIN_PASSWORD_RE = /^[A-Za-z0-9!@#$%^&*()_\-+=.,:;'"~`<>?/\\|{}[\]]+$/;
const PHONE_RE = /^\+?[0-9\s\-()]{7,}$/;

// Staff with a `phone`/`password` set in seed data require an exact credential match.
// Staff without one stay in demo mode: any correctly-formatted phone/password logs in.
router.post('/login', (req, res) => {
  const { role, phone, password } = req.body || {};
  if (!ROLE_LABELS[role]) return res.status(400).json({ error: 'Unknown role' });
  if (!phone || !PHONE_RE.test(phone)) return res.status(400).json({ error: 'Введите корректный номер телефона' });
  if (!password || !LATIN_PASSWORD_RE.test(password)) {
    return res.status(400).json({ error: 'Пароль должен быть на английском языке (латиница, без кириллицы)' });
  }

  const staff = store.getStaff();
  const roleStaff = staff.filter((s) => s.role === role);
  const withCredentials = roleStaff.filter((s) => s.password);

  let user;
  if (withCredentials.length > 0) {
    user = withCredentials.find((s) => s.phone === phone && s.password === password);
    if (!user) return res.status(401).json({ error: 'Неверный номер телефона или пароль' });
  } else {
    user = roleStaff.find((s) => s.onDuty) || roleStaff[0] || { id: null, name: ROLE_LABELS[role] };
  }

  res.json({
    user: { id: user.id, name: user.name, role, roleLabel: ROLE_LABELS[role], phone },
    // Demo-only token; replace with a real session/JWT before going to production.
    token: 'demo-' + role + '-' + Date.now(),
  });
});

export default router;
