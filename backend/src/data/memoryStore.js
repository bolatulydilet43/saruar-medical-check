// In-memory data store. Resets to seed data on server restart — used automatically
// when SUPABASE_URL/SUPABASE_SERVICE_KEY are not set (see store.js), so local dev
// keeps working without a database.
import { STAFF, PATIENTS, APPOINTMENTS_WEEK } from './seed.js';

const state = {
  staff: structuredClone(STAFF),
  patients: structuredClone(PATIENTS),
  appointmentsWeek: structuredClone(APPOINTMENTS_WEEK),
};

export const memoryStore = {
  getStaff: () => state.staff,
  addStaff: (member) => {
    state.staff.push(member);
    return member;
  },
  updateStaff: (id, patch) => {
    const member = state.staff.find((s) => s.id === id);
    if (!member) return null;
    Object.assign(member, patch);
    return member;
  },
  deleteStaff: (id) => {
    const idx = state.staff.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    state.staff.splice(idx, 1);
    return true;
  },

  getPatients: () => state.patients,
  getPatient: (id) => state.patients.find((p) => p.id === id),

  addPatient: (patient) => {
    state.patients.unshift(patient);
    return patient;
  },
  updatePatient: (id, patch) => {
    const patient = state.patients.find((p) => p.id === id);
    if (!patient) return null;
    Object.assign(patient, patch);
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

  addProcedure: (patientId, procedure) => {
    const patient = state.patients.find((p) => p.id === patientId);
    if (!patient) return null;
    if (!patient.procedures) patient.procedures = [];
    patient.procedures.push(procedure);
    return patient;
  },
  updateProcedure: (patientId, procedureId, patch) => {
    const patient = state.patients.find((p) => p.id === patientId);
    if (!patient) return null;
    const procedure = (patient.procedures || []).find((pr) => pr.id === procedureId);
    if (!procedure) return null;
    Object.assign(procedure, patch);
    return procedure;
  },

  getAppointmentsWeek: () => state.appointmentsWeek,
  addAppointment: (appt) => {
    state.appointmentsWeek.push(appt);
    return appt;
  },
};
