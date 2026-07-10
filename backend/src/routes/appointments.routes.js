import { Router } from 'express';
import { store } from '../data/store.js';
import { createAppointment } from '../models/Appointment.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const { date } = req.query;
  let appts = await store.getAppointmentsWeek();
  if (date) appts = appts.filter((a) => a.date === date);
  res.json(appts);
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const staff = await store.getStaff();
    const appt = createAppointment({ ...req.body, staff });
    await store.addAppointment(appt);
    res.status(201).json(appt);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
