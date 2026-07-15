import { randomUUID, randomBytes } from 'node:crypto';
import { statusMeta } from '../data/ranges.js';
import { PHONE_RE, assertMaxLength } from '../utils/validators.js';

// High-entropy (192-bit) capability token for the patient self-service portal link/QR —
// random enough that it needs no separate hashing the way a user-chosen password would.
export function generatePortalToken() {
  return randomBytes(24).toString('base64url');
}

// Adds display-ready fields (status label/colors) on top of a raw patient record.
export function serializePatient(p) {
  return {
    ...p,
    ...statusMeta(p.status) && { statusMeta: statusMeta(p.status) },
  };
}

export function serializePatientSummary(p) {
  const { id, name, age, gender, phone, checkIn, checkOut, allergies, status, lastAnalysis, roomId } = p;
  return { id, name, age, gender, phone, checkIn, checkOut, allergies, status, lastAnalysis, roomId: roomId || null, statusMeta: statusMeta(status) };
}

// Read-only view served through the public, unauthenticated patient-portal link — deliberately
// narrow: no phone, no portalToken itself, no staff names beyond what's already on a diagnosis.
export function serializePatientPortal(p) {
  const { name, age, gender, checkIn, checkOut, allergies, analyses, diagnoses, procedures } = p;
  return { name, age, gender, checkIn, checkOut, allergies, analyses, diagnoses, procedures: procedures || [] };
}

export function createPatient({ name, age, gender, phone, checkIn, checkOut, allergies, roomId }) {
  if (!name || !name.trim()) throw new Error('Patient name is required');
  if (!checkIn || !checkOut) throw new Error('checkIn and checkOut are required');
  if (phone && !PHONE_RE.test(phone)) throw new Error('Введите корректный номер телефона');
  assertMaxLength(allergies, 500, 'Аллергии');
  return {
    id: 'p-' + randomUUID(),
    name: name.trim(),
    age: age ? parseInt(age, 10) : null,
    gender: gender || 'М',
    phone: phone || null,
    checkIn,
    checkOut,
    allergies: allergies && allergies.trim() ? allergies.trim() : 'Нет данных',
    status: 'green',
    lastAnalysis: null,
    portalToken: generatePortalToken(),
    roomId: roomId || null,
    analyses: [],
    diagnoses: [],
    appointments: [],
    procedures: [],
  };
}
