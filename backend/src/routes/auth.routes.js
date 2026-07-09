import { Router } from 'express';
import { store } from '../data/store.js';
import { LATIN_PASSWORD_RE, PHONE_RE } from '../utils/validators.js';

const router = Router();

const ROLE_LABELS = { admin: 'Администратор', doctor: 'Врач', nurse: 'Медсестра' };

// If the entered phone belongs to a staff member with a configured password, that
// exact password is required. Any other phone falls back to demo mode, picking an
// on-duty staff member of the chosen role that has no configured credentials.
router.post('/login', (req, res) => {
  const { role, phone, password } = req.body || {};
  if (!ROLE_LABELS[role]) return res.status(400).json({ error: 'Unknown role' });
  if (!phone || !PHONE_RE.test(phone)) return res.status(400).json({ error: 'Введите корректный номер телефона' });
  if (!password || !LATIN_PASSWORD_RE.test(password)) {
    return res.status(400).json({ error: 'Пароль должен быть на английском языке (латиница, без кириллицы)' });
  }

  const roleStaff = store.getStaff().filter((s) => s.role === role);
  const byPhone = roleStaff.find((s) => s.phone === phone);

  let user;
  if (byPhone && byPhone.password) {
    if (byPhone.password !== password) return res.status(401).json({ error: 'Неверный номер телефона или пароль' });
    user = byPhone;
  } else {
    const demoEligible = roleStaff.filter((s) => !s.password);
    user = demoEligible.find((s) => s.onDuty) || demoEligible[0] || { id: null, name: ROLE_LABELS[role] };
  }

  res.json({
    user: { id: user.id, name: user.name, role, roleLabel: ROLE_LABELS[role], phone },
    // Demo-only token; replace with a real session/JWT before going to production.
    token: 'demo-' + role + '-' + Date.now(),
  });
});

export default router;
