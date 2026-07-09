import { Router } from 'express';
import { store } from '../data/store.js';
import { serializeStaff } from '../models/Staff.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(store.getStaff().map(serializeStaff));
});

export default router;
