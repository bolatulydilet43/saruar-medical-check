import { randomUUID } from 'node:crypto';
import { statusForValue } from '../data/ranges.js';
import { assertMaxLength, assertNumeric } from '../utils/validators.js';

const TYPE_LABELS = {
  blood: 'Общий анализ крови',
  urine: 'Общий анализ мочи',
  ecg: 'ЭКГ',
  bp: 'Артериальное давление',
  us: 'УЗИ',
  sugar: 'Сахар',
  biochem: 'Биохимия',
  hormones: 'Гормоны',
};

// Builds a stored analysis record from a raw analysis-entry-form payload.
export function createAnalysis({ analysisType, by, values = {}, urine, rhythm, heartRate, conclusion }) {
  const type = TYPE_LABELS[analysisType];
  if (!type) throw new Error(`Unknown analysis type: ${analysisType}`);

  const record = {
    id: 'a-' + randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    type,
    by,
  };

  if (analysisType === 'blood') {
    ['hemoglobin', 'leukocytes', 'erythrocytes', 'platelets', 'esr'].forEach((k) => assertNumeric(values[k], k));
    record.values = {
      hemoglobin: values.hemoglobin, leukocytes: values.leukocytes,
      erythrocytes: values.erythrocytes, platelets: values.platelets, esr: values.esr,
    };
  } else if (analysisType === 'bp') {
    ['systolic', 'diastolic', 'pulse'].forEach((k) => assertNumeric(values[k], k));
    record.values = { systolic: values.systolic, diastolic: values.diastolic, pulse: values.pulse };
  } else if (analysisType === 'urine') {
    ['density', 'protein', 'glucose', 'leukocytes'].forEach((k) => assertNumeric(urine?.[k], k));
    assertMaxLength(urine?.color, 200, 'Цвет мочи');
    record.urine = {
      color: urine?.color || '—', density: urine?.density,
      protein: urine?.protein, glucose: urine?.glucose, leukocytes: urine?.leukocytes,
    };
  } else if (analysisType === 'ecg') {
    assertNumeric(heartRate, 'heartRate');
    assertMaxLength(conclusion, 2000, 'Заключение');
    record.rhythm = rhythm || 'Синусовый ритм';
    record.heartRate = heartRate;
    record.conclusion = conclusion || '';
  } else if (analysisType === 'us') {
    assertMaxLength(conclusion, 2000, 'Заключение');
    record.conclusion = conclusion || '';
  } else if (analysisType === 'sugar') {
    assertNumeric(values.glucose, 'glucose');
    record.values = { glucose: values.glucose };
  } else if (analysisType === 'biochem') {
    ['totalProtein', 'creatinine', 'alt', 'ast'].forEach((k) => assertNumeric(values[k], k));
    record.values = { totalProtein: values.totalProtein, creatinine: values.creatinine, alt: values.alt, ast: values.ast };
  } else if (analysisType === 'hormones') {
    ['tsh', 't3', 't4', 'prolactin'].forEach((k) => assertNumeric(values[k], k));
    record.values = { tsh: values.tsh, t3: values.t3, t4: values.t4, prolactin: values.prolactin };
  }

  return record;
}

// Attaches normal/borderline/abnormal status to each numeric field for display.
export function annotateAnalysis(a) {
  const withStatus = (values) =>
    values && Object.fromEntries(Object.entries(values).map(([k, v]) => [k, { value: v, status: statusForValue(k, v) }]));

  if (a.values) return { ...a, values: withStatus(a.values) };
  if (a.urine) return { ...a, urine: withStatus(a.urine) };
  if (a.heartRate !== undefined) return { ...a, heartRateStatus: statusForValue('heartRate', a.heartRate) };
  return a;
}
