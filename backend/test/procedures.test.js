import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp, apiRouter } from '../src/app.js';

let server;
let baseUrl;
let adminToken;
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

test('doctor/admin can plan a procedure; nurse cannot', async () => {
  const adminRes = await authed('/patients/p1/procedures', adminToken, {
    method: 'POST',
    body: JSON.stringify({ type: 'Массаж', date: '2026-07-15', time: '10:00' }),
  });
  assert.equal(adminRes.status, 201);
  const created = await adminRes.json();
  assert.equal(created.status, 'planned');

  const nurseRes = await authed('/patients/p1/procedures', nurseToken, {
    method: 'POST',
    body: JSON.stringify({ type: 'Массаж', date: '2026-07-15' }),
  });
  assert.equal(nurseRes.status, 403);
});

test('any authenticated staff (e.g. nurse) can mark a procedure done', async () => {
  const createRes = await authed('/patients/p1/procedures', adminToken, {
    method: 'POST',
    body: JSON.stringify({ type: 'Физиотерапия', date: '2026-07-16' }),
  });
  const { id } = await createRes.json();

  const markRes = await authed(`/patients/p1/procedures/${id}`, nurseToken, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'done' }),
  });
  assert.equal(markRes.status, 200);
  const updated = await markRes.json();
  assert.equal(updated.status, 'done');
});

test('an invalid status is rejected', async () => {
  const createRes = await authed('/patients/p1/procedures', adminToken, {
    method: 'POST',
    body: JSON.stringify({ type: 'Бассейн', date: '2026-07-17' }),
  });
  const { id } = await createRes.json();

  const res = await authed(`/patients/p1/procedures/${id}`, nurseToken, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'bogus' }),
  });
  assert.equal(res.status, 400);
});

test('the patient shows up with their planned procedures on the full record', async () => {
  const res = await authed('/patients/p1', adminToken);
  const patient = await res.json();
  assert.ok(Array.isArray(patient.procedures));
  assert.ok(patient.procedures.length > 0);
});
