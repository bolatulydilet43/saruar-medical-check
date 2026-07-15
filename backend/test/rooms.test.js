import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp, apiRouter } from '../src/app.js';

let server;
let baseUrl;
let adminToken;
let doctorToken;
let nurseToken;

before(async () => {
  const app = createApp();
  app.use('/api', apiRouter);
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://localhost:${server.address().port}/api`;

  const login = async (phone, password, role) => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, phone, password }),
    });
    return (await res.json()).token;
  };
  adminToken = await login('+77070060501', '0NciOJLp91p0Y0B5', 'admin');
  doctorToken = await login('+70000000001', 'DevOnly2026', 'doctor');
  nurseToken = await login('+70000000004', 'DevOnly2026', 'nurse');
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

function authed(path, token, options = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
  });
}

test('admin can create a room; doctor cannot', async () => {
  const adminRes = await authed('/rooms', adminToken, {
    method: 'POST',
    body: JSON.stringify({ number: 'T-1', capacity: 1 }),
  });
  assert.equal(adminRes.status, 201);
  const room = await adminRes.json();
  assert.equal(room.number, 'T-1');

  const doctorRes = await authed('/rooms', doctorToken, {
    method: 'POST',
    body: JSON.stringify({ number: 'T-2' }),
  });
  assert.equal(doctorRes.status, 403);
});

test('creating a room with a duplicate number is rejected', async () => {
  await authed('/rooms', adminToken, { method: 'POST', body: JSON.stringify({ number: 'T-dup' }) });
  const res = await authed('/rooms', adminToken, { method: 'POST', body: JSON.stringify({ number: 'T-dup' }) });
  assert.equal(res.status, 400);
});

test('a patient can be registered into a free room', async () => {
  const roomRes = await authed('/rooms', adminToken, { method: 'POST', body: JSON.stringify({ number: 'T-3' }) });
  const room = await roomRes.json();

  const patientRes = await authed('/patients', doctorToken, {
    method: 'POST',
    body: JSON.stringify({ name: 'Test Patient A', checkIn: '2026-08-01', checkOut: '2026-08-10', roomId: room.id }),
  });
  assert.equal(patientRes.status, 201);
  const patient = await patientRes.json();
  assert.equal(patient.roomId, room.id);
});

test('registering a second overlapping patient into the same room is rejected', async () => {
  const roomRes = await authed('/rooms', adminToken, { method: 'POST', body: JSON.stringify({ number: 'T-4' }) });
  const room = await roomRes.json();

  const first = await authed('/patients', doctorToken, {
    method: 'POST',
    body: JSON.stringify({ name: 'Test Patient B', checkIn: '2026-09-01', checkOut: '2026-09-10', roomId: room.id }),
  });
  assert.equal(first.status, 201);

  const second = await authed('/patients', doctorToken, {
    method: 'POST',
    body: JSON.stringify({ name: 'Test Patient C', checkIn: '2026-09-05', checkOut: '2026-09-15', roomId: room.id }),
  });
  assert.equal(second.status, 400);
});

test('a patient can be registered into the same room once the previous stay has ended', async () => {
  const roomRes = await authed('/rooms', adminToken, { method: 'POST', body: JSON.stringify({ number: 'T-5' }) });
  const room = await roomRes.json();

  await authed('/patients', doctorToken, {
    method: 'POST',
    body: JSON.stringify({ name: 'Test Patient D', checkIn: '2026-10-01', checkOut: '2026-10-10', roomId: room.id }),
  });
  const next = await authed('/patients', doctorToken, {
    method: 'POST',
    body: JSON.stringify({ name: 'Test Patient E', checkIn: '2026-10-10', checkOut: '2026-10-15', roomId: room.id }),
  });
  assert.equal(next.status, 201);
});

test('reassigning a patient to an occupied room is rejected; nurse cannot reassign', async () => {
  const roomRes = await authed('/rooms', adminToken, { method: 'POST', body: JSON.stringify({ number: 'T-6' }) });
  const room = await roomRes.json();
  await authed('/patients', doctorToken, {
    method: 'POST',
    body: JSON.stringify({ name: 'Test Patient F', checkIn: '2026-11-01', checkOut: '2026-11-10', roomId: room.id }),
  });

  const freeRoomRes = await authed('/rooms', adminToken, { method: 'POST', body: JSON.stringify({ number: 'T-7' }) });
  const freeRoom = await freeRoomRes.json();
  const otherPatientRes = await authed('/patients', doctorToken, {
    method: 'POST',
    body: JSON.stringify({ name: 'Test Patient G', checkIn: '2026-11-02', checkOut: '2026-11-09' }),
  });
  const otherPatient = await otherPatientRes.json();

  const nurseRes = await authed(`/patients/${otherPatient.id}/room`, nurseToken, {
    method: 'PATCH',
    body: JSON.stringify({ roomId: freeRoom.id }),
  });
  assert.equal(nurseRes.status, 403);

  const conflictRes = await authed(`/patients/${otherPatient.id}/room`, doctorToken, {
    method: 'PATCH',
    body: JSON.stringify({ roomId: room.id }),
  });
  assert.equal(conflictRes.status, 400);

  const okRes = await authed(`/patients/${otherPatient.id}/room`, doctorToken, {
    method: 'PATCH',
    body: JSON.stringify({ roomId: freeRoom.id }),
  });
  assert.equal(okRes.status, 200);
  const updated = await okRes.json();
  assert.equal(updated.roomId, freeRoom.id);
});

test('a room with a current/future patient cannot be deleted', async () => {
  const roomRes = await authed('/rooms', adminToken, { method: 'POST', body: JSON.stringify({ number: 'T-8' }) });
  const room = await roomRes.json();
  await authed('/patients', doctorToken, {
    method: 'POST',
    body: JSON.stringify({ name: 'Test Patient H', checkIn: '2026-12-01', checkOut: '2026-12-10', roomId: room.id }),
  });

  const res = await authed(`/rooms/${room.id}`, adminToken, { method: 'DELETE' });
  assert.equal(res.status, 409);
});

test('an empty room can be deleted', async () => {
  const roomRes = await authed('/rooms', adminToken, { method: 'POST', body: JSON.stringify({ number: 'T-9' }) });
  const room = await roomRes.json();
  const res = await authed(`/rooms/${room.id}`, adminToken, { method: 'DELETE' });
  assert.equal(res.status, 204);
});
