import { statusForValue } from '../theme.js';

const FIELD_SPECS = {
  'Общий анализ крови': [['hemoglobin', 'hemoglobin'], ['leukocytes', 'leukocytes'], ['erythrocytes', 'erythrocytes'], ['platelets', 'platelets'], ['esr', 'esr']],
  'Артериальное давление': [['systolic', 'systolic'], ['diastolic', 'diastolic'], ['pulse', 'pulse']],
  'Общий анализ мочи': [['density', 'urineDensity'], ['protein', 'urineProtein'], ['glucose', 'urineGlucose'], ['leukocytes', 'urineLeukocytes']],
};

function buildRows(type, values, ranges) {
  const specs = FIELD_SPECS[type] || [];
  if (!values) return [];
  return specs.map(([valueKey, rangeKey]) => {
    const r = ranges[rangeKey];
    const val = values[valueKey];
    const status = statusForValue(r, val);
    return {
      key: valueKey,
      label: r ? r.label : valueKey,
      unit: r ? r.unit : '',
      value: val === undefined || val === null ? '—' : val,
      range: r ? `${r.min}–${r.max}` : '',
      status,
    };
  });
}

// Builds display rows/extra text/conclusion for one analysis record, given the ranges map.
export function buildAnalysisDisplay(a, ranges) {
  let rows = [], extraText = null, conclusion = null;
  if (a.type === 'Общий анализ крови') {
    rows = buildRows(a.type, a.values, ranges);
  } else if (a.type === 'Артериальное давление') {
    rows = buildRows(a.type, a.values, ranges);
  } else if (a.type === 'Общий анализ мочи') {
    rows = buildRows(a.type, a.urine, ranges);
    extraText = 'Цвет: ' + (a.urine ? a.urine.color : '—');
  } else if (a.type === 'ЭКГ') {
    const r = ranges.heartRate;
    const status = statusForValue(r, a.heartRate);
    rows = [{ key: 'heartRate', label: 'ЧСС', unit: r ? r.unit : '', value: a.heartRate ?? '—', range: r ? `${r.min}–${r.max}` : '', status }];
    extraText = 'Ритм: ' + (a.rhythm || '—');
    conclusion = a.conclusion || '';
  } else if (a.type === 'УЗИ') {
    conclusion = a.conclusion || '';
  }
  return { ...a, rows, extraText, conclusion };
}

export function analysisSummaryText(a, ranges) {
  if (a.type === 'Общий анализ крови' || a.type === 'Артериальное давление') {
    return buildRows(a.type, a.values, ranges).map((r) => `${r.label}: ${r.value} ${r.unit}`).join(', ');
  }
  if (a.type === 'Общий анализ мочи') {
    const rows = buildRows(a.type, a.urine, ranges);
    return 'Цвет: ' + (a.urine ? a.urine.color : '—') + '; ' + rows.map((r) => `${r.label}: ${r.value} ${r.unit}`).join(', ');
  }
  if (a.type === 'ЭКГ') return `Ритм: ${a.rhythm || '—'}, ЧСС: ${a.heartRate || '—'} уд/мин — ${a.conclusion || ''}`;
  if (a.type === 'УЗИ') return a.conclusion || '';
  return '';
}
