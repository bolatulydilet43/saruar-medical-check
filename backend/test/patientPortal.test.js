import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp, apiRouter } from '../src/app.js';

let server;
let baseUrl;
let adminToken;

before(async () => {
  const app = createApp();
  app.use('/api', apiRouter);
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://localhost:${server.address().port}/api`;

  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'admin', phone: '+77070060501', password: '0NciOJLp91p0Y0B5' }),
  });
  adminToken = (await res.json()).token;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

function authed(path, options = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}`, ...options.headers },
  });
}

test('a freshly created patient gets a usable portal token', async () => {
  const createRes = await authed('/patients', {
    method: 'POST',
    body: JSON.stringify({ name: 'Portal Test Patient', checkIn: '2020-01-01', checkOut: '2099-12-31' }),
  });
  assert.equal(createRes.status, 201);
  const summary = await createRes.json();

  const fullRes = await authed(`/patients/${summary.id}`);
  const full = await fullRes.json();
  assert.ok(full.portalToken);

  const portalRes = await fetch(`${baseUrl}/patient-portal/${full.portalToken}`);
  assert.equal(portalRes.status, 200);
  const portalData = await portalRes.json();
  assert.equal(portalData.name, 'Portal Test Patient');
  assert.equal(portalData.phone, undefined);
  assert.equal(portalData.portalToken, undefined);
});

test('an unknown token is rejected with a generic 404', async () => {
  const res = await fetch(`${baseUrl}/patient-portal/not-a-real-token`);
  assert.equal(res.status, 404);
});

test('a token past checkOut is rejected the same way as an unknown one', async () => {
  const createRes = await authed('/patients', {
    method: 'POST',
    body: JSON.stringify({ name: 'Expired Stay Patient', checkIn: '2020-01-01', checkOut: '2020-01-02' }),
  });
  const summary = await createRes.json();
  const full = await (await authed(`/patients/${summary.id}`)).json();

  const res = await fetch(`${baseUrl}/patient-portal/${full.portalToken}`);
  assert.equal(res.status, 404);
});

test('regenerating the portal token invalidates the old one', async () => {
  const createRes = await authed('/patients', {
    method: 'POST',
    body: JSON.stringify({ name: 'Rotate Token Patient', checkIn: '2020-01-01', checkOut: '2099-12-31' }),
  });
  const summary = await createRes.json();
  const before = await (await authed(`/patients/${summary.id}`)).json();

  const regenRes = await authed(`/patients/${summary.id}/portal-token`, { method: 'POST' });
  assert.equal(regenRes.status, 200);
  const { portalToken: newToken } = await regenRes.json();
  assert.notEqual(newToken, before.portalToken);

  const oldRes = await fetch(`${baseUrl}/patient-portal/${before.portalToken}`);
  assert.equal(oldRes.status, 404);

  const newRes = await fetch(`${baseUrl}/patient-portal/${newToken}`);
  assert.equal(newRes.status, 200);
});

test('regenerating the portal token requires admin/doctor auth', async () => {
  const res = await fetch(`${baseUrl}/patients/p1/portal-token`, { method: 'POST' });
  assert.equal(res.status, 401);
});
