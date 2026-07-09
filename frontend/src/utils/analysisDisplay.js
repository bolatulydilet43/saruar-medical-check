import { statusForValue } from '../theme.js';

// Types whose values live directly on a.values, keyed the same way as RANGES.
const VALUE_FIELD_SPECS = {
  'Общий анализ крови': [['hemoglobin', 'hemoglobin'], ['leukocytes', 'leukocytes'], ['erythrocytes', 'erythrocytes'], ['platelets', 'platelets'], ['esr', 'esr']],
  'Артериальное давление': [['systolic', 'systolic'], ['diastolic', 'diastolic'], ['pulse', 'pulse']],
  'Сахар': [['glucose', 'glucose']],
  'Биохимия': [['totalProtein', 'totalProtein'], ['creatinine', 'creatinine'], ['alt', 'alt'], ['ast', 'ast']],
  'Гормоны': [['tsh', 'tsh'], ['t3', 't3'], ['t4', 't4'], ['prolactin', 'prolactin']],
};

const URINE_FIELD_SPECS = [['density', 'urineDensity'], ['protein', 'urineProtein'], ['glucose', 'urineGlucose'], ['leukocytes', 'urineLeukocytes']];

function buildRows(specs, values, ranges) {
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
  if (VALUE_FIELD_SPECS[a.type]) {
    rows = buildRows(VALUE_FIELD_SPECS[a.type], a.values, ranges);
  } else if (a.type === 'Общий анализ мочи') {
    rows = buildRows(URINE_FIELD_SPECS, a.urine, ranges);
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
  if (VALUE_FIELD_SPECS[a.type]) {
    return buildRows(VALUE_FIELD_SPECS[a.type], a.values, ranges).map((r) => `${r.label}: ${r.value} ${r.unit}`).join(', ');
  }
  if (a.type === 'Общий анализ мочи') {
    const rows = buildRows(URINE_FIELD_SPECS, a.urine, ranges);
    return 'Цвет: ' + (a.urine ? a.urine.color : '—') + '; ' + rows.map((r) => `${r.label}: ${r.value} ${r.unit}`).join(', ');
  }
  if (a.type === 'ЭКГ') return `Ритм: ${a.rhythm || '—'}, ЧСС: ${a.heartRate || '—'} уд/мин — ${a.conclusion || ''}`;
  if (a.type === 'УЗИ') return a.conclusion || '';
  return '';
}
