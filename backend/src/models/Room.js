import { randomUUID } from 'node:crypto';
import { assertMaxLength, assertNumeric } from '../utils/validators.js';

function normalizeRoomFields({ number, capacity, notes }) {
  if (!number || !String(number).trim()) throw new Error('Номер обязателен');
  assertMaxLength(number, 20, 'Номер');
  assertNumeric(capacity, 'Вместимость');
  assertMaxLength(notes, 500, 'Заметка');
  return {
    number: String(number).trim(),
    capacity: capacity ? parseInt(capacity, 10) : 1,
    notes: notes && notes.trim() ? notes.trim() : '',
  };
}

export function createRoom(fields) {
  return { id: 'rm-' + randomUUID(), ...normalizeRoomFields(fields) };
}

export { normalizeRoomFields };

// Two stays in the same room conflict only if their date ranges actually overlap —
// a checkout on day X and a new check-in on day X for the same room is fine.
export function roomIsFree(patients, roomId, checkIn, checkOut, excludePatientId) {
  return !patients.some(
    (p) =>
      p.roomId === roomId &&
      p.id !== excludePatientId &&
      checkIn < p.checkOut &&
      checkOut > p.checkIn
  );
}
