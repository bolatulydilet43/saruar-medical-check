import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPatient } from '../src/models/Patient.js';
import { createStaff } from '../src/models/Staff.js';
import { createDiagnosis } from '../src/models/Diagnosis.js';
import { createAnalysis } from '../src/models/Analysis.js';
import { createAppointment } from '../src/models/Appointment.js';
import { createProcedure, assertValidStatus } from '../src/models/Procedure.js';

const UUID_BODY = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

test('createPatient generates a collision-resistant UUID-based id', () => {
  const p = createPatient({ name: 'Test Patient', checkIn: '2026-01-01', checkOut: '2026-01-10' });
  assert.match(p.id, new RegExp(`^p-${UUID_BODY}$`));
});

test('createPatient rejects allergies text over 500 characters', () => {
  assert.throws(
    () => createPatient({ name: 'X', checkIn: '2026-01-01', checkOut: '2026-01-10', allergies: 'a'.repeat(501) }),
    /Аллергии/,
  );
});

test('createStaff generates a UUID id prefixed by role and rejects short passwords', () => {
  const doc = createStaff({ name: 'Dr Test', role: 'doctor', specialty: 'Test', phone: '+70000000010', password: 'LongPass99' });
  assert.match(doc.id, new RegExp(`^d-${UUID_BODY}$`));
  assert.throws(
    () => createStaff({ name: 'Dr Short', role: 'doctor', specialty: 'Test', phone: '+70000000011', password: 'Ab1!' }),
    /8 символов/,
  );
});

test('createDiagnosis rejects text/prescription fields over their length limits', () => {
  assert.throws(() => createDiagnosis({ doctor: 'X', text: 'a'.repeat(3001) }), /Текст диагноза/);
  assert.throws(
    () => createDiagnosis({ doctor: 'X', text: 'ok', prescriptions: [{ medication: 'a'.repeat(201) }] }),
    /Название препарата/,
  );
  const d = createDiagnosis({ doctor: 'X', text: 'ok' });
  assert.match(d.id, new RegExp(`^dg-${UUID_BODY}$`));
});

test('createAnalysis rejects non-numeric values and accepts valid numeric input', () => {
  assert.throws(
    () => createAnalysis({ analysisType: 'blood', by: 'X', values: { hemoglobin: 'abc' } }),
    /hemoglobin/,
  );
  const a = createAnalysis({ analysisType: 'blood', by: 'X', values: { hemoglobin: 140, leukocytes: 7 } });
  assert.match(a.id, new RegExp(`^a-${UUID_BODY}$`));
  assert.equal(a.values.hemoglobin, 140);
});

test('createAppointment generates a UUID id', () => {
  const ap = createAppointment({ date: '2026-01-01', time: '10:00', patient: 'X', doctorId: 'd1', staff: [{ id: 'd1', name: 'Dr X', color: '#000' }] });
  assert.match(ap.id, new RegExp(`^w-${UUID_BODY}$`));
});

test('createProcedure requires type and date, generates a UUID id, defaults to planned', () => {
  assert.throws(() => createProcedure({ date: '2026-01-01' }), /Тип процедуры/);
  assert.throws(() => createProcedure({ type: 'Массаж' }), /Дата/);
  const pr = createProcedure({ type: 'Массаж', date: '2026-01-01', time: '10:00' });
  assert.match(pr.id, new RegExp(`^pr-${UUID_BODY}$`));
  assert.equal(pr.status, 'planned');
});

test('createProcedure enforces length limits on type and notes', () => {
  assert.throws(() => createProcedure({ type: 'a'.repeat(101), date: '2026-01-01' }), /Тип процедуры/);
  assert.throws(() => createProcedure({ type: 'Массаж', date: '2026-01-01', notes: 'a'.repeat(501) }), /Заметка/);
});

test('assertValidStatus only accepts planned/done/missed', () => {
  assert.doesNotThrow(() => assertValidStatus('done'));
  assert.throws(() => assertValidStatus('bogus'));
});
