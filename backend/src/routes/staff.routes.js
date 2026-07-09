import { Router } from 'express';
import { store } from '../data/store.js';
import { serializeStaff, createStaff } from '../models/Staff.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(store.getStaff().map(serializeStaff));
});

// Only admins may add doctors or nurses.
router.post('/', requireRole('admin'), (req, res) => {
  try {
    const member = createStaff(req.body || {});
    store.addStaff(member);
    res.status(201).json(serializeStaff(member));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
