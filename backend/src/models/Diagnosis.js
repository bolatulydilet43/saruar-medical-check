export function createDiagnosis({ doctor, text, prescriptions = [] }) {
  if (!text || !text.trim()) throw new Error('Diagnosis text is required');
  return {
    id: 'dg' + Date.now(),
    date: new Date().toISOString().slice(0, 10),
    doctor,
    text,
    confirmed: true,
    prescriptions: prescriptions.filter((r) => r.medication && r.medication.trim()),
  };
}
