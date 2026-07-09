import { statusMeta } from '../data/ranges.js';

// Adds display-ready fields (status label/colors) on top of a raw patient record.
export function serializePatient(p) {
  return {
    ...p,
    ...statusMeta(p.status) && { statusMeta: statusMeta(p.status) },
  };
}

export function serializePatientSummary(p) {
  const { id, name, age, gender, checkIn, checkOut, allergies, status, lastAnalysis } = p;
  return { id, name, age, gender, checkIn, checkOut, allergies, status, lastAnalysis, statusMeta: statusMeta(status) };
}

export function createPatient({ name, age, gender, checkIn, checkOut, allergies }) {
  if (!name || !name.trim()) throw new Error('Patient name is required');
  if (!checkIn || !checkOut) throw new Error('checkIn and checkOut are required');
  return {
    id: 'p' + Date.now(),
    name: name.trim(),
    age: age ? parseInt(age, 10) : null,
    gender: gender || 'М',
    checkIn,
    checkOut,
    allergies: allergies && allergies.trim() ? allergies.trim() : 'Нет данных',
    status: 'green',
    lastAnalysis: null,
    analyses: [],
    diagnoses: [],
    appointments: [],
  };
}
