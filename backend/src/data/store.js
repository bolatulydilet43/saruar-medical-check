// In-memory data store. Resets to seed data on server restart — swap this
// module for a real database layer without changing the route handlers.
import { STAFF, PATIENTS, APPOINTMENTS_WEEK } from './seed.js';

const state = {
  staff: structuredClone(STAFF),
  patients: structuredClone(PATIENTS),
  appointmentsWeek: structuredClone(APPOINTMENTS_WEEK),
};

export const store = {
  getStaff: () => state.staff,

  getPatients: () => state.patients,
  getPatient: (id) => state.patients.find((p) => p.id === id),

  addPatient: (patient) => {
    state.patients.unshift(patient);
    return patient;
  },
  deletePatient: (id) => {
    const idx = state.patients.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    state.patients.splice(idx, 1);
    return true;
  },

  addAnalysis: (patientId, analysis) => {
    const patient = state.patients.find((p) => p.id === patientId);
    if (!patient) return null;
    patient.analyses.unshift(analysis);
    patient.lastAnalysis = analysis.date;
    return patient;
  },

  addDiagnosis: (patientId, diagnosis) => {
    const patient = state.patients.find((p) => p.id === patientId);
    if (!patient) return null;
    patient.diagnoses.unshift(diagnosis);
    return patient;
  },

  getAppointmentsWeek: () => state.appointmentsWeek,
  addAppointment: (appt) => {
    state.appointmentsWeek.push(appt);
    return appt;
  },
};
