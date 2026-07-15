// Supabase-backed store. Each table keeps the record's id in its own column and the
// full record (same shape the routes/models already produce) in a `data` jsonb column —
// this mirrors the in-memory store's shape exactly, so routes and models never change.
import { supabase } from './supabaseClient.js';

function check(error) {
  if (error) throw new Error(`Supabase error: ${error.message}`);
}

export const supabaseStore = {
  async getStaff() {
    const { data, error } = await supabase.from('staff').select('data').order('created_at', { ascending: true });
    check(error);
    return data.map((row) => row.data);
  },
  async addStaff(member) {
    const { error } = await supabase.from('staff').insert({ id: member.id, data: member });
    check(error);
    return member;
  },
  async updateStaff(id, patch) {
    const { data, error } = await supabase.from('staff').select('data').eq('id', id).maybeSingle();
    check(error);
    if (!data) return null;
    const updated = { ...data.data, ...patch };
    const { error: updErr } = await supabase.from('staff').update({ data: updated }).eq('id', id);
    check(updErr);
    return updated;
  },
  async deleteStaff(id) {
    const { data, error } = await supabase.from('staff').delete().eq('id', id).select('id');
    check(error);
    return data.length > 0;
  },

  async getPatients() {
    const { data, error } = await supabase.from('patients').select('data').order('created_at', { ascending: false });
    check(error);
    return data.map((row) => row.data);
  },
  async getPatient(id) {
    const { data, error } = await supabase.from('patients').select('data').eq('id', id).maybeSingle();
    check(error);
    return data ? data.data : undefined;
  },
  async addPatient(patient) {
    const { error } = await supabase.from('patients').insert({ id: patient.id, data: patient });
    check(error);
    return patient;
  },
  async updatePatient(id, patch) {
    const patient = await this.getPatient(id);
    if (!patient) return null;
    const updated = { ...patient, ...patch };
    const { error } = await supabase.from('patients').update({ data: updated }).eq('id', id);
    check(error);
    return updated;
  },
  async deletePatient(id) {
    const { data, error } = await supabase.from('patients').delete().eq('id', id).select('id');
    check(error);
    return data.length > 0;
  },

  async addAnalysis(patientId, analysis) {
    const patient = await this.getPatient(patientId);
    if (!patient) return null;
    patient.analyses.unshift(analysis);
    patient.lastAnalysis = analysis.date;
    const { error } = await supabase.from('patients').update({ data: patient }).eq('id', patientId);
    check(error);
    return patient;
  },

  async addDiagnosis(patientId, diagnosis) {
    const patient = await this.getPatient(patientId);
    if (!patient) return null;
    patient.diagnoses.unshift(diagnosis);
    const { error } = await supabase.from('patients').update({ data: patient }).eq('id', patientId);
    check(error);
    return patient;
  },

  async addProcedure(patientId, procedure) {
    const patient = await this.getPatient(patientId);
    if (!patient) return null;
    if (!patient.procedures) patient.procedures = [];
    patient.procedures.push(procedure);
    const { error } = await supabase.from('patients').update({ data: patient }).eq('id', patientId);
    check(error);
    return patient;
  },
  async updateProcedure(patientId, procedureId, patch) {
    const patient = await this.getPatient(patientId);
    if (!patient) return null;
    const procedure = (patient.procedures || []).find((pr) => pr.id === procedureId);
    if (!procedure) return null;
    Object.assign(procedure, patch);
    const { error } = await supabase.from('patients').update({ data: patient }).eq('id', patientId);
    check(error);
    return procedure;
  },

  async getAppointmentsWeek() {
    const { data, error } = await supabase.from('appointments_week').select('data').order('created_at', { ascending: true });
    check(error);
    return data.map((row) => row.data);
  },
  async addAppointment(appt) {
    const { error } = await supabase.from('appointments_week').insert({ id: appt.id, data: appt });
    check(error);
    return appt;
  },

  async getRooms() {
    const { data, error } = await supabase.from('rooms').select('data').order('created_at', { ascending: true });
    check(error);
    return data.map((row) => row.data);
  },
  async addRoom(room) {
    const { error } = await supabase.from('rooms').insert({ id: room.id, data: room });
    check(error);
    return room;
  },
  async updateRoom(id, patch) {
    const { data, error } = await supabase.from('rooms').select('data').eq('id', id).maybeSingle();
    check(error);
    if (!data) return null;
    const updated = { ...data.data, ...patch };
    const { error: updErr } = await supabase.from('rooms').update({ data: updated }).eq('id', id);
    check(updErr);
    return updated;
  },
  async deleteRoom(id) {
    const { data, error } = await supabase.from('rooms').delete().eq('id', id).select('id');
    check(error);
    return data.length > 0;
  },
};
