import { Router } from 'express';
import { store } from '../data/store.js';
import { LATIN_PASSWORD_RE, PHONE_RE } from '../utils/validators.js';
import { verifyPassword } from '../utils/passwords.js';
import { signToken } from '../utils/jwt.js';
import { isSupabaseConfigured } from '../data/supabaseClient.js';

const router = Router();

const ROLE_LABELS = { admin: 'Администратор', doctor: 'Врач', nurse: 'Медсестра' };

// If the entered phone belongs to a staff member with a configured password hash, that
// exact password is required. Any other phone falls back to demo mode (picking an
// on-duty staff member of the chosen role with no configured credentials) — but only
// on the in-memory store; once Supabase is configured every login must be a real match.
router.post('/login', async (req, res) => {
  const { role, phone, password } = req.body || {};
  if (!ROLE_LABELS[role]) return res.status(400).json({ error: 'Unknown role' });
  if (!phone || !PHONE_RE.test(phone)) return res.status(400).json({ error: 'Введите корректный номер телефона' });
  if (!password || !LATIN_PASSWORD_RE.test(password)) {
    return res.status(400).json({ error: 'Пароль должен быть на английском языке (латиница, без кириллицы)' });
  }

  const staff = await store.getStaff();
  const roleStaff = staff.filter((s) => s.role === role);
  const byPhone = roleStaff.find((s) => s.phone === phone);

  let user;
  if (byPhone && byPhone.passwordHash) {
    if (!verifyPassword(password, byPhone.passwordHash)) {
      return res.status(401).json({ error: 'Неверный номер телефона или пароль' });
    }
    user = byPhone;
  } else if (!isSupabaseConfigured) {
    const demoEligible = roleStaff.filter((s) => !s.passwordHash);
    user = demoEligible.find((s) => s.onDuty) || demoEligible[0] || { id: null, name: ROLE_LABELS[role] };
  } else {
    return res.status(401).json({ error: 'Неверный номер телефона или пароль' });
  }

  const token = signToken({ sub: user.id, role });
  res.json({
    user: { id: user.id, name: user.name, role, roleLabel: ROLE_LABELS[role], phone },
    token,
  });
});

export default router;
