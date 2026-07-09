export function createAppointment({ date, time, patient, doctorId, staff }) {
  if (!date || !time || !patient || !doctorId) throw new Error('date, time, patient and doctorId are required');
  const doc = staff.find((s) => s.id === doctorId);
  return {
    id: 'w' + Date.now(),
    date,
    time,
    patient,
    doctor: doc ? doc.name : '',
    color: doc ? doc.color : '#1D9E75',
  };
}
