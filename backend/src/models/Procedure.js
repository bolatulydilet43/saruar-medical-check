import { randomUUID } from 'node:crypto';
import { assertMaxLength } from '../utils/validators.js';

export const PROCEDURE_STATUSES = ['planned', 'done', 'missed'];

// A course-of-treatment item (massage, physiotherapy, mud bath, etc.) scheduled somewhere
// within the patient's stay — distinct from a doctor's appointment.
export function createProcedure({ type, date, time, notes, by }) {
  if (!type || !type.trim()) throw new Error('Тип процедуры обязателен');
  if (!date) throw new Error('Дата обязательна');
  assertMaxLength(type, 100, 'Тип процедуры');
  assertMaxLength(notes, 500, 'Заметка');
  return {
    id: 'pr-' + randomUUID(),
    type: type.trim(),
    date,
    time: time || null,
    notes: notes && notes.trim() ? notes.trim() : '',
    by: by || null,
    status: 'planned',
  };
}

export function assertValidStatus(status) {
  if (!PROCEDURE_STATUSES.includes(status)) throw new Error('Недопустимый статус процедуры');
}
