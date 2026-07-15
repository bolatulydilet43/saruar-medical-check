import { Router } from 'express';
import { store } from '../data/store.js';
import { serializePatientSummary, createPatient, generatePortalToken } from '../models/Patient.js';
import { createAnalysis } from '../models/Analysis.js';
import { createDiagnosis } from '../models/Diagnosis.js';
import { createProcedure, assertValidStatus } from '../models/Procedure.js';
import { roomIsFree } from '../models/Room.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const { q, status } = req.query;
  let patients = await store.getPatients();
  if (status && status !== 'all') patients = patients.filter((p) => p.status === status);
  if (q) {
    const needle = String(q).toLowerCase();
    patients = patients.filter((p) => p.name.toLowerCase().includes(needle));
  }
  res.json(patients.map(serializePatientSummary));
});

router.get('/:id', requireAuth, async (req, res) => {
  const patient = await store.getPatient(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  res.json(patient);
});

// Only admins and doctors may register or remove patients.
router.post('/', requireRole('admin', 'doctor'), async (req, res) => {
  try {
    const patient = createPatient(req.body || {});
    if (patient.roomId) {
      const patients = await store.getPatients();
      if (!roomIsFree(patients, patient.roomId, patient.checkIn, patient.checkOut)) {
        return res.status(400).json({ error: 'Номер занят на эти даты' });
      }
    }
    await store.addPatient(patient);
    res.status(201).json(serializePatientSummary(patient));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reassigns (or clears, with roomId: null) a patient's room for the remainder of their stay.
router.patch('/:id/room', requireRole('admin', 'doctor'), async (req, res) => {
  const patient = await store.getPatient(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  const { roomId } = req.body || {};
  if (roomId) {
    const patients = await store.getPatients();
    if (!roomIsFree(patients, roomId, patient.checkIn, patient.checkOut, patient.id)) {
      return res.status(400).json({ error: 'Номер занят на эти даты' });
    }
  }
  const updated = await store.updatePatient(patient.id, { roomId: roomId || null });
  res.json(serializePatientSummary(updated));
});

// Regenerates the patient's self-service portal link/QR token — also serves as a revoke,
// since the old token stops working immediately once overwritten.
router.post('/:id/portal-token', requireRole('admin', 'doctor'), async (req, res) => {
  const patient = await store.updatePatient(req.params.id, { portalToken: generatePortalToken() });
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  res.json({ portalToken: patient.portalToken });
});

router.delete('/:id', requireRole('admin', 'doctor'), async (req, res) => {
  const ok = await store.deletePatient(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Patient not found' });
  res.status(204).end();
});

router.post('/:id/analyses', requireAuth, async (req, res) => {
  const patient = await store.getPatient(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  try {
    const analysis = createAnalysis(req.body || {});
    await store.addAnalysis(patient.id, analysis);
    res.status(201).json(analysis);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/diagnoses', requireAuth, async (req, res) => {
  const patient = await store.getPatient(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  try {
    const diagnosis = createDiagnosis(req.body || {});
    await store.addDiagnosis(patient.id, diagnosis);
    res.status(201).json(diagnosis);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Only admins and doctors plan the course of procedures for a stay.
router.post('/:id/procedures', requireRole('admin', 'doctor'), async (req, res) => {
  const patient = await store.getPatient(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  try {
    const procedure = createProcedure(req.body || {});
    await store.addProcedure(patient.id, procedure);
    res.status(201).json(procedure);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Any authenticated staff member (e.g. the nurse who actually administered it) can mark a
// planned procedure done/missed.
router.patch('/:id/procedures/:procedureId', requireAuth, async (req, res) => {
  try {
    const { status } = req.body || {};
    assertValidStatus(status);
    const procedure = await store.updateProcedure(req.params.id, req.params.procedureId, { status });
    if (!procedure) return res.status(404).json({ error: 'Procedure not found' });
    res.json(procedure);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
