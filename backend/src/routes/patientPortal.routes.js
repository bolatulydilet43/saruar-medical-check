import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { store } from '../data/store.js';
import { serializePatientPortal } from '../models/Patient.js';

const router = Router();

// Public, unauthenticated — reachable via the QR/link a patient scans at reception.
// The 192-bit token is unguessable, but this still throttles scraping/scanning attempts.
const portalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много запросов. Попробуйте позже.' },
});

// Valid through the end of the patient's stay; same generic error whether the token is
// unknown or has expired, so the response never confirms a token once existed.
router.get('/:token', portalLimiter, async (req, res) => {
  const patients = await store.getPatients();
  const patient = patients.find((p) => p.portalToken && p.portalToken === req.params.token);
  const today = new Date().toISOString().slice(0, 10);
  if (!patient || today > patient.checkOut) {
    return res.status(404).json({ error: 'Ссылка недействительна или срок её действия истёк' });
  }
  res.json(serializePatientPortal(patient));
});

export default router;
