import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LATIN_PASSWORD_RE, NEW_PASSWORD_RE, PHONE_RE, assertMaxLength, assertNumeric } from '../src/utils/validators.js';

test('PHONE_RE accepts plausible phone numbers', () => {
  assert.ok(PHONE_RE.test('+77070060501'));
  assert.ok(PHONE_RE.test('+7 700 123 45 67'));
  assert.ok(!PHONE_RE.test('abc'));
  assert.ok(!PHONE_RE.test('12345'));
});

test('LATIN_PASSWORD_RE accepts any-length Latin charset, rejects Cyrillic', () => {
  assert.ok(LATIN_PASSWORD_RE.test('a'));
  assert.ok(LATIN_PASSWORD_RE.test('Doctor123!'));
  assert.ok(!LATIN_PASSWORD_RE.test('Пароль123'));
  assert.ok(!LATIN_PASSWORD_RE.test(''));
});

test('NEW_PASSWORD_RE additionally enforces an 8-character minimum', () => {
  assert.ok(!NEW_PASSWORD_RE.test('Ab1!'));
  assert.ok(!NEW_PASSWORD_RE.test('1234567'));
  assert.ok(NEW_PASSWORD_RE.test('12345678'));
  assert.ok(NEW_PASSWORD_RE.test('LongPass99'));
});

test('assertMaxLength throws only when the value exceeds the limit', () => {
  assert.doesNotThrow(() => assertMaxLength('short', 10, 'Field'));
  assert.doesNotThrow(() => assertMaxLength(undefined, 10, 'Field'));
  assert.throws(() => assertMaxLength('a'.repeat(11), 10, 'Field'), /Field/);
});

test('assertNumeric allows empty/undefined but rejects non-numeric strings', () => {
  assert.doesNotThrow(() => assertNumeric(undefined, 'x'));
  assert.doesNotThrow(() => assertNumeric('', 'x'));
  assert.doesNotThrow(() => assertNumeric(42, 'x'));
  assert.doesNotThrow(() => assertNumeric('42', 'x'));
  assert.throws(() => assertNumeric('abc', 'x'), /должно быть числом/);
});
