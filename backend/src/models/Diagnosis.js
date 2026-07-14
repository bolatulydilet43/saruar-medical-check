import { randomUUID } from 'node:crypto';
import { assertMaxLength } from '../utils/validators.js';

export function createDiagnosis({ doctor, text, prescriptions = [] }) {
  if (!text || !text.trim()) throw new Error('Diagnosis text is required');
  assertMaxLength(text, 3000, 'Текст диагноза');

  const cleanPrescriptions = prescriptions.filter((r) => r.medication && r.medication.trim());
  for (const rx of cleanPrescriptions) {
    assertMaxLength(rx.medication, 200, 'Название препарата');
    assertMaxLength(rx.dosage, 100, 'Дозировка');
    assertMaxLength(rx.frequency, 100, 'Частота приёма');
    assertMaxLength(rx.duration, 100, 'Длительность приёма');
  }

  return {
    id: 'dg-' + randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    doctor,
    text,
    confirmed: true,
    prescriptions: cleanPrescriptions,
  };
}
