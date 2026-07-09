import { statusForValue } from '../data/ranges.js';

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
    id: 'a' + Date.now(),
    date: new Date().toISOString().slice(0, 10),
    type,
    by,
  };

  if (analysisType === 'blood') {
    record.values = {
      hemoglobin: values.hemoglobin, leukocytes: values.leukocytes,
      erythrocytes: values.erythrocytes, platelets: values.platelets, esr: values.esr,
    };
  } else if (analysisType === 'bp') {
    record.values = { systolic: values.systolic, diastolic: values.diastolic, pulse: values.pulse };
  } else if (analysisType === 'urine') {
    record.urine = {
      color: urine?.color || '—', density: urine?.density,
      protein: urine?.protein, glucose: urine?.glucose, leukocytes: urine?.leukocytes,
    };
  } else if (analysisType === 'ecg') {
    record.rhythm = rhythm || 'Синусовый ритм';
    record.heartRate = heartRate;
    record.conclusion = conclusion || '';
  } else if (analysisType === 'us') {
    record.conclusion = conclusion || '';
  } else if (analysisType === 'sugar') {
    record.values = { glucose: values.glucose };
  } else if (analysisType === 'biochem') {
    record.values = { totalProtein: values.totalProtein, creatinine: values.creatinine, alt: values.alt, ast: values.ast };
  } else if (analysisType === 'hormones') {
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
