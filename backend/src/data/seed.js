// Seed data for the in-memory store. Mirrors the original design mockup's dataset.
export const STAFF = [
  { id: 'd1', name: 'Др. Елена Соколова', role: 'doctor', specialty: 'Кардиолог', color: '#1D9E75', onDuty: true },
  { id: 'd2', name: 'Др. Игорь Петров', role: 'doctor', specialty: 'Терапевт', color: '#185FA5', onDuty: true },
  { id: 'd3', name: 'Др. Мария Волкова', role: 'doctor', specialty: 'Эндокринолог', color: '#B45FB4', onDuty: false },
  { id: 'n1', name: 'Анна Кузнецова', role: 'nurse', specialty: 'Процедурная медсестра', color: '#1D9E75', onDuty: true },
  { id: 'n2', name: 'Ольга Смирнова', role: 'nurse', specialty: 'Постовая медсестра', color: '#185FA5', onDuty: true },
  // Real credentials — this admin account requires an exact phone/password match to log in
  // (see auth.routes.js). Other staff below have no `phone`/`password` and stay in demo mode.
  { id: 'a1', name: 'Сергей Морозов', role: 'admin', specialty: 'Администратор', color: '#6B7280', onDuty: true,
    phone: '+77070060501', password: 'REDACTED-ROTATED' },
];

export const PATIENTS = [
  {
    id: 'p1', name: 'Виктор Андреевич Лебедев', age: 58, gender: 'М',
    checkIn: '2026-06-28', checkOut: '2026-07-19', allergies: 'Пенициллин',
    status: 'red', lastAnalysis: '2026-07-08',
    analyses: [
      { id: 'a1', date: '2026-07-08', type: 'Общий анализ крови', by: 'Анна Кузнецова',
        values: { hemoglobin: 104, leukocytes: 11.8, erythrocytes: 3.4, platelets: 410, esr: 28 } },
      { id: 'a2', date: '2026-07-05', type: 'ЭКГ', by: 'Ольга Смирнова',
        rhythm: 'Синусовая тахикардия', heartRate: 102, conclusion: 'Незначительная тахикардия, рекомендовано наблюдение.' },
      { id: 'a3', date: '2026-07-02', type: 'Артериальное давление', by: 'Ольга Смирнова',
        values: { systolic: 148, diastolic: 94, pulse: 88 } },
    ],
    diagnoses: [
      { id: 'dg1', date: '2026-07-08', doctor: 'Др. Елена Соколова', text: 'Гипертоническая болезнь II ст., анемия лёгкой степени.',
        confirmed: true,
        prescriptions: [
          { medication: 'Лизиноприл', dosage: '10 мг', frequency: '1 раз в день', duration: '14 дней' },
          { medication: 'Сорбифер Дурулес', dosage: '100 мг', frequency: '2 раза в день', duration: '30 дней' },
        ] },
    ],
    appointments: [
      { id: 'ap1', date: '2026-07-10', time: '09:30', doctor: 'Др. Елена Соколова', type: 'Осмотр кардиолога' },
    ],
  },
  {
    id: 'p2', name: 'Наталья Сергеевна Орлова', age: 45, gender: 'Ж',
    checkIn: '2026-07-01', checkOut: '2026-07-15', allergies: 'Нет',
    status: 'amber', lastAnalysis: '2026-07-07',
    analyses: [
      { id: 'a1', date: '2026-07-07', type: 'Общий анализ мочи', by: 'Анна Кузнецова',
        urine: { color: 'Соломенно-жёлтый', density: 1.028, protein: 0.2, glucose: 0.2, leukocytes: 7 } },
      { id: 'a2', date: '2026-07-03', type: 'Общий анализ крови', by: 'Анна Кузнецова',
        values: { hemoglobin: 132, leukocytes: 7.1, erythrocytes: 4.4, platelets: 260, esr: 9 } },
    ],
    diagnoses: [],
    appointments: [
      { id: 'ap1', date: '2026-07-10', time: '11:00', doctor: 'Др. Мария Волкова', type: 'Консультация эндокринолога' },
    ],
  },
  {
    id: 'p3', name: 'Дмитрий Олегович Титов', age: 62, gender: 'М',
    checkIn: '2026-06-20', checkOut: '2026-07-11', allergies: 'Аспирин, йод',
    status: 'green', lastAnalysis: '2026-07-06',
    analyses: [
      { id: 'a1', date: '2026-07-06', type: 'Артериальное давление', by: 'Ольга Смирнова',
        values: { systolic: 122, diastolic: 78, pulse: 72 } },
      { id: 'a2', date: '2026-07-01', type: 'ЭКГ', by: 'Анна Кузнецова',
        rhythm: 'Синусовый ритм', heartRate: 68, conclusion: 'Без патологий, ритм регулярный.' },
    ],
    diagnoses: [
      { id: 'dg1', date: '2026-07-01', doctor: 'Др. Игорь Петров', text: 'Здоров, показатели в пределах нормы.', confirmed: true, prescriptions: [] },
    ],
    appointments: [],
  },
  {
    id: 'p4', name: 'Мария Викторовна Крылова', age: 71, gender: 'Ж',
    checkIn: '2026-07-03', checkOut: '2026-07-24', allergies: 'Нет данных',
    status: 'red', lastAnalysis: '2026-07-09',
    analyses: [
      { id: 'a1', date: '2026-07-09', type: 'Общий анализ крови', by: 'Ольга Смирнова',
        values: { hemoglobin: 96, leukocytes: 13.5, erythrocytes: 3.1, platelets: 130, esr: 34 } },
    ],
    diagnoses: [],
    appointments: [
      { id: 'ap1', date: '2026-07-10', time: '10:00', doctor: 'Др. Елена Соколова', type: 'Первичный осмотр' },
    ],
  },
  {
    id: 'p5', name: 'Алексей Николаевич Фролов', age: 39, gender: 'М',
    checkIn: '2026-07-05', checkOut: '2026-07-12', allergies: 'Нет',
    status: 'green', lastAnalysis: '2026-07-06',
    analyses: [
      { id: 'a1', date: '2026-07-06', type: 'Артериальное давление', by: 'Анна Кузнецова',
        values: { systolic: 118, diastolic: 76, pulse: 66 } },
    ],
    diagnoses: [],
    appointments: [],
  },
  {
    id: 'p6', name: 'Екатерина Дмитриевна Зайцева', age: 54, gender: 'Ж',
    checkIn: '2026-06-30', checkOut: '2026-07-21', allergies: 'Латекс',
    status: 'amber', lastAnalysis: '2026-07-08',
    analyses: [
      { id: 'a1', date: '2026-07-08', type: 'УЗИ', by: 'Др. Мария Волкова',
        conclusion: 'Диффузные изменения паренхимы поджелудочной железы.' },
      { id: 'a2', date: '2026-07-04', type: 'Общий анализ мочи', by: 'Ольга Смирнова',
        urine: { color: 'Тёмно-жёлтый', density: 1.03, protein: 0.3, glucose: 1.2, leukocytes: 9 } },
    ],
    diagnoses: [
      { id: 'dg1', date: '2026-07-08', doctor: 'Др. Мария Волкова', text: 'Подозрение на хронический панкреатит, требуется контроль глюкозы.', confirmed: false,
        prescriptions: [
          { medication: 'Панкреатин', dosage: '25 000 ЕД', frequency: '3 раза в день', duration: '21 день' },
        ] },
    ],
    appointments: [
      { id: 'ap1', date: '2026-07-11', time: '14:30', doctor: 'Др. Мария Волкова', type: 'Повторная консультация' },
    ],
  },
  {
    id: 'p7', name: 'Юрий Романович Соловьёв', age: 66, gender: 'М',
    checkIn: '2026-06-25', checkOut: '2026-07-16', allergies: 'Нет',
    status: 'green', lastAnalysis: '2026-07-05',
    analyses: [
      { id: 'a1', date: '2026-07-05', type: 'ЭКГ', by: 'Анна Кузнецова',
        rhythm: 'Синусовый ритм', heartRate: 74, conclusion: 'Норма.' },
    ],
    diagnoses: [],
    appointments: [
      { id: 'ap1', date: '2026-07-13', time: '09:00', doctor: 'Др. Игорь Петров', type: 'Плановый осмотр' },
    ],
  },
  {
    id: 'p8', name: 'Ирина Павловна Никитина', age: 49, gender: 'Ж',
    checkIn: '2026-07-06', checkOut: '2026-07-20', allergies: 'Сульфаниламиды',
    status: 'amber', lastAnalysis: '2026-07-07',
    analyses: [
      { id: 'a1', date: '2026-07-07', type: 'Общий анализ крови', by: 'Ольга Смирнова',
        values: { hemoglobin: 118, leukocytes: 9.8, erythrocytes: 4.0, platelets: 410, esr: 19 } },
    ],
    diagnoses: [],
    appointments: [],
  },
  {
    id: 'p9', name: 'Павел Игоревич Новиков', age: 33, gender: 'М',
    checkIn: '2026-07-02', checkOut: '2026-07-09', allergies: 'Нет',
    status: 'green', lastAnalysis: '2026-07-08',
    analyses: [
      { id: 'a1', date: '2026-07-08', type: 'Артериальное давление', by: 'Анна Кузнецова',
        values: { systolic: 121, diastolic: 79, pulse: 70 } },
    ],
    diagnoses: [
      { id: 'dg1', date: '2026-07-08', doctor: 'Др. Игорь Петров', text: 'Здоров, рекомендован профилактический режим.', confirmed: true, prescriptions: [] },
    ],
    appointments: [],
  },
  {
    id: 'p10', name: 'Светлана Артёмовна Гусева', age: 60, gender: 'Ж',
    checkIn: '2026-06-29', checkOut: '2026-07-20', allergies: 'Нет данных',
    status: 'red', lastAnalysis: '2026-07-09',
    analyses: [
      { id: 'a1', date: '2026-07-09', type: 'ЭКГ', by: 'Ольга Смирнова',
        rhythm: 'Мерцательная аритмия', heartRate: 128, conclusion: 'Пароксизм фибрилляции предсердий, требуется срочная консультация кардиолога.' },
    ],
    diagnoses: [],
    appointments: [
      { id: 'ap1', date: '2026-07-10', time: '08:30', doctor: 'Др. Елена Соколова', type: 'Экстренная консультация' },
    ],
  },
];

export const APPOINTMENTS_WEEK = [
  { id: 'w1', date: '2026-07-06', time: '09:00', patient: 'Виктор Лебедев', doctor: 'Др. Елена Соколова', color: '#1D9E75' },
  { id: 'w2', date: '2026-07-06', time: '11:00', patient: 'Наталья Орлова', doctor: 'Др. Мария Волкова', color: '#B45FB4' },
  { id: 'w3', date: '2026-07-07', time: '10:00', patient: 'Мария Крылова', doctor: 'Др. Елена Соколова', color: '#1D9E75' },
  { id: 'w4', date: '2026-07-08', time: '14:00', patient: 'Екатерина Зайцева', doctor: 'Др. Мария Волкова', color: '#B45FB4' },
  { id: 'w5', date: '2026-07-09', time: '09:30', patient: 'Юрий Соловьёв', doctor: 'Др. Игорь Петров', color: '#185FA5' },
  { id: 'w6', date: '2026-07-09', time: '13:00', patient: 'Ирина Никитина', doctor: 'Др. Игорь Петров', color: '#185FA5' },
  { id: 'w7', date: '2026-07-10', time: '08:30', patient: 'Светлана Гусева', doctor: 'Др. Елена Соколова', color: '#1D9E75' },
  { id: 'w8', date: '2026-07-10', time: '09:30', patient: 'Виктор Лебедев', doctor: 'Др. Елена Соколова', color: '#1D9E75' },
  { id: 'w9', date: '2026-07-10', time: '10:00', patient: 'Мария Крылова', doctor: 'Др. Елена Соколова', color: '#1D9E75' },
  { id: 'w10', date: '2026-07-10', time: '11:00', patient: 'Наталья Орлова', doctor: 'Др. Мария Волкова', color: '#B45FB4' },
  { id: 'w11', date: '2026-07-11', time: '14:30', patient: 'Екатерина Зайцева', doctor: 'Др. Мария Волкова', color: '#B45FB4' },
  { id: 'w12', date: '2026-07-13', time: '09:00', patient: 'Юрий Соловьёв', doctor: 'Др. Игорь Петров', color: '#185FA5' },
];
