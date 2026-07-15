const BASE_URL = import.meta.env.VITE_API_URL || '/api';

let authToken = null;
export function setAuthToken(token) {
  authToken = token;
}

let unauthorizedHandler = null;
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

async function request(path, options = {}) {
  const res = await fetch(BASE_URL + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    ...options,
  });
  if (res.status === 401 && unauthorizedHandler) unauthorizedHandler();
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
  setStaffDuty: (id, onDuty) => request(`/staff/${id}`, { method: 'PATCH', body: JSON.stringify({ onDuty }) }),
  deleteStaff: (id) => request(`/staff/${id}`, { method: 'DELETE' }),

  getPatients: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('/patients' + (qs ? `?${qs}` : ''));
  },
  getPatient: (id) => request(`/patients/${id}`),
  createPatient: (payload) => request('/patients', { method: 'POST', body: JSON.stringify(payload) }),
  deletePatient: (id) => request(`/patients/${id}`, { method: 'DELETE' }),
  regeneratePortalToken: (id) => request(`/patients/${id}/portal-token`, { method: 'POST' }),
  getPatientPortal: (token) => request(`/patient-portal/${token}`),
  addAnalysis: (patientId, payload) =>
    request(`/patients/${patientId}/analyses`, { method: 'POST', body: JSON.stringify(payload) }),
  addDiagnosis: (patientId, payload) =>
    request(`/patients/${patientId}/diagnoses`, { method: 'POST', body: JSON.stringify(payload) }),
  addProcedure: (patientId, payload) =>
    request(`/patients/${patientId}/procedures`, { method: 'POST', body: JSON.stringify(payload) }),
  updateProcedureStatus: (patientId, procedureId, status) =>
    request(`/patients/${patientId}/procedures/${procedureId}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  getAppointments: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('/appointments' + (qs ? `?${qs}` : ''));
  },
  addAppointment: (payload) => request('/appointments', { method: 'POST', body: JSON.stringify(payload) }),

  getRanges: () => request('/ranges'),

  getRooms: () => request('/rooms'),
  createRoom: (payload) => request('/rooms', { method: 'POST', body: JSON.stringify(payload) }),
  updateRoom: (id, payload) => request(`/rooms/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteRoom: (id) => request(`/rooms/${id}`, { method: 'DELETE' }),
  assignRoom: (patientId, roomId) =>
    request(`/patients/${patientId}/room`, { method: 'PATCH', body: JSON.stringify({ roomId }) }),
};
