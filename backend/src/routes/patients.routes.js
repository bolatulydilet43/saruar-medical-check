import { Router } from 'express';
import { store } from '../data/store.js';
import { serializePatientSummary, createPatient } from '../models/Patient.js';
import { createAnalysis } from '../models/Analysis.js';
import { createDiagnosis } from '../models/Diagnosis.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.get('/', (req, res) => {
  const { q, status } = req.query;
  let patients = store.getPatients();
  if (status && status !== 'all') patients = patients.filter((p) => p.status === status);
  if (q) {
    const needle = String(q).toLowerCase();
    patients = patients.filter((p) => p.name.toLowerCase().includes(needle));
  }
  res.json(patients.map(serializePatientSummary));
});

router.get('/:id', (req, res) => {
  const patient = store.getPatient(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  res.json(patient);
});

// Only admins and doctors may register or remove patients.
router.post('/', requireRole('admin', 'doctor'), (req, res) => {
  try {
    const patient = createPatient(req.body || {});
    store.addPatient(patient);
    res.status(201).json(serializePatientSummary(patient));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', requireRole('admin', 'doctor'), (req, res) => {
  const ok = store.deletePatient(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Patient not found' });
  res.status(204).end();
});

router.post('/:id/analyses', (req, res) => {
  const patient = store.getPatient(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  try {
    const analysis = createAnalysis(req.body || {});
    store.addAnalysis(patient.id, analysis);
    res.status(201).json(analysis);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/diagnoses', (req, res) => {
  const patient = store.getPatient(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  try {
    const diagnosis = createDiagnosis(req.body || {});
    store.addDiagnosis(patient.id, diagnosis);
    res.status(201).json(diagnosis);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
