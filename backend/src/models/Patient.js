import { statusMeta } from '../data/ranges.js';
import { PHONE_RE } from '../utils/validators.js';

// Adds display-ready fields (status label/colors) on top of a raw patient record.
export function serializePatient(p) {
  return {
    ...p,
    ...statusMeta(p.status) && { statusMeta: statusMeta(p.status) },
  };
}

export function serializePatientSummary(p) {
  const { id, name, age, gender, phone, checkIn, checkOut, allergies, status, lastAnalysis } = p;
  return { id, name, age, gender, phone, checkIn, checkOut, allergies, status, lastAnalysis, statusMeta: statusMeta(status) };
}

export function createPatient({ name, age, gender, phone, checkIn, checkOut, allergies }) {
  if (!name || !name.trim()) throw new Error('Patient name is required');
  if (!checkIn || !checkOut) throw new Error('checkIn and checkOut are required');
  if (phone && !PHONE_RE.test(phone)) throw new Error('Введите корректный номер телефона');
  return {
    id: 'p' + Date.now(),
    name: name.trim(),
    age: age ? parseInt(age, 10) : null,
    gender: gender || 'М',
    phone: phone || null,
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
