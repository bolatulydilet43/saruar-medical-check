const BASE_URL = import.meta.env.VITE_API_URL || '/api';

let currentRole = null;
export function setAuthRole(role) {
  currentRole = role;
}

async function request(path, options = {}) {
  const res = await fetch(BASE_URL + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(currentRole ? { 'x-user-role': currentRole } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  login: (role, phone, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ role, phone, password }) }),

  getStaff: () => request('/staff'),
  createStaff: (payload) => request('/staff', { method: 'POST', body: JSON.stringify(payload) }),

  getPatients: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('/patients' + (qs ? `?${qs}` : ''));
  },
  getPatient: (id) => request(`/patients/${id}`),
  createPatient: (payload) => request('/patients', { method: 'POST', body: JSON.stringify(payload) }),
  deletePatient: (id) => request(`/patients/${id}`, { method: 'DELETE' }),
  addAnalysis: (patientId, payload) =>
    request(`/patients/${patientId}/analyses`, { method: 'POST', body: JSON.stringify(payload) }),
  addDiagnosis: (patientId, payload) =>
    request(`/patients/${patientId}/diagnoses`, { method: 'POST', body: JSON.stringify(payload) }),

  getAppointments: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('/appointments' + (qs ? `?${qs}` : ''));
  },
  addAppointment: (payload) => request('/appointments', { method: 'POST', body: JSON.stringify(payload) }),

  getRanges: () => request('/ranges'),
};
