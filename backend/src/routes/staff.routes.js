import { Router } from 'express';
import { store } from '../data/store.js';
import { serializeStaff, createStaff } from '../models/Staff.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const staff = await store.getStaff();
  res.json(staff.map(serializeStaff));
});

// Only admins may add doctors or nurses.
router.post('/', requireRole('admin'), async (req, res) => {
  try {
    const member = createStaff(req.body || {});
    await store.addStaff(member);
    res.status(201).json(serializeStaff(member));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Only admins may change on-duty status.
router.patch('/:id', requireRole('admin'), async (req, res) => {
  const { onDuty } = req.body || {};
  if (typeof onDuty !== 'boolean') return res.status(400).json({ error: 'onDuty must be a boolean' });
  const member = await store.updateStaff(req.params.id, { onDuty });
  if (!member) return res.status(404).json({ error: 'Staff not found' });
  res.json(serializeStaff(member));
});

// Only admins may remove staff, and never their own account (would lock out the admin panel).
router.delete('/:id', requireRole('admin'), async (req, res) => {
  if (req.user.sub === req.params.id) {
    return res.status(400).json({ error: 'Нельзя удалить самого себя' });
  }
  const ok = await store.deleteStaff(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Staff not found' });
  res.status(204).end();
});

export default router;
