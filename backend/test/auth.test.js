import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp, apiRouter } from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  const app = createApp();
  app.use('/api', apiRouter);
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://localhost:${server.address().port}/api`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

function login(body) {
  return fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('login succeeds with the correct dev credentials (seeded, in-memory store)', async () => {
  const res = await login({ role: 'doctor', phone: '+70000000001', password: 'DevOnly2026' });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.token);
  assert.equal(body.user.id, 'd1');
});

test('login rejects a wrong password for a known account', async () => {
  const res = await login({ role: 'doctor', phone: '+70000000001', password: 'WrongPass1' });
  assert.equal(res.status, 401);
});

test('login rejects any password for a phone with no configured credentials (no demo fallback)', async () => {
  const res = await login({ role: 'doctor', phone: '+79990000000', password: 'AnyPass123' });
  assert.equal(res.status, 401);
});

test('protected routes reject requests without a token', async () => {
  const res = await fetch(`${baseUrl}/patients`);
  assert.equal(res.status, 401);
});
