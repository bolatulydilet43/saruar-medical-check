// Reference ranges used for live validation in the analysis entry form.
export const RANGES = {
  hemoglobin: { label: 'Гемоглобин', unit: 'г/л', min: 120, max: 160 },
  leukocytes: { label: 'Лейкоциты', unit: '×10⁹/л', min: 4, max: 9 },
  erythrocytes: { label: 'Эритроциты', unit: '×10¹²/л', min: 3.8, max: 5.1 },
  platelets: { label: 'Тромбоциты', unit: '×10⁹/л', min: 150, max: 400 },
  esr: { label: 'СОЭ', unit: 'мм/ч', min: 2, max: 15 },
  urineProtein: { label: 'Белок', unit: 'г/л', min: 0, max: 0.14 },
  urineGlucose: { label: 'Глюкоза', unit: 'ммоль/л', min: 0, max: 0.8 },
  urineLeukocytes: { label: 'Лейкоциты', unit: 'в п/з', min: 0, max: 5 },
  urineDensity: { label: 'Плотность', unit: 'г/мл', min: 1.01, max: 1.025 },
  heartRate: { label: 'ЧСС', unit: 'уд/мин', min: 60, max: 90 },
  systolic: { label: 'Систолическое', unit: 'мм рт.ст.', min: 100, max: 130 },
  diastolic: { label: 'Диастолическое', unit: 'мм рт.ст.', min: 60, max: 85 },
  pulse: { label: 'Пульс', unit: 'уд/мин', min: 60, max: 90 },
  glucose: { label: 'Сахар (глюкоза)', unit: 'ммоль/л', min: 3.9, max: 5.5 },
  tsh: { label: 'ТТГ', unit: 'мЕд/л', min: 0.4, max: 4 },
  t3: { label: 'Т3 свободный', unit: 'пмоль/л', min: 3.5, max: 6.5 },
  t4: { label: 'Т4 свободный', unit: 'пмоль/л', min: 9, max: 22 },
  prolactin: { label: 'Пролактин', unit: 'нг/мл', min: 4, max: 23.3 },
  totalProtein: { label: 'Общий белок', unit: 'г/л', min: 64, max: 83 },
  creatinine: { label: 'Креатинин', unit: 'мкмоль/л', min: 62, max: 115 },
  alt: { label: 'АЛТ', unit: 'Ед/л', min: 7, max: 40 },
  ast: { label: 'АСТ', unit: 'Ед/л', min: 8, max: 40 },
};

export function statusForValue(key, value) {
  const r = RANGES[key];
  if (!r || value === '' || value === null || value === undefined || isNaN(value)) return 'neutral';
  const v = parseFloat(value);
  if (v < r.min * 0.85 || v > r.max * 1.15) return 'red';
  if (v < r.min || v > r.max) return 'amber';
  return 'green';
}

export function statusMeta(status) {
  if (status === 'red') return { label: 'Требует внимания', bg: '#FDECEC', fg: '#C0392B', dot: '#E0524A' };
  if (status === 'amber') return { label: 'Небольшое отклонение', bg: '#FDF3E0', fg: '#966F14', dot: '#E0A72E' };
  return { label: 'Норма', bg: '#E6F5EE', fg: '#1D7A57', dot: '#1D9E75' };
}
