import { Router } from 'express';
import { store } from '../data/store.js';
import { createAppointment } from '../models/Appointment.js';

const router = Router();

router.get('/', (req, res) => {
  const { date } = req.query;
  let appts = store.getAppointmentsWeek();
  if (date) appts = appts.filter((a) => a.date === date);
  res.json(appts);
});

router.post('/', (req, res) => {
  try {
    const appt = createAppointment({ ...req.body, staff: store.getStaff() });
    store.addAppointment(appt);
    res.status(201).json(appt);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
