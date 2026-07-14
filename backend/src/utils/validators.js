// Shared login-credential rules: password must be Latin-only, phone must look like a phone number.
// LATIN_PASSWORD_RE checks charset only (used to validate a login attempt against an existing hash).
// NEW_PASSWORD_RE additionally enforces a minimum length — used whenever a password is being set.
export const LATIN_PASSWORD_RE = /^[A-Za-z0-9!@#$%^&*()_\-+=.,:;'"~`<>?/\\|{}[\]]+$/;
export const NEW_PASSWORD_RE = /^[A-Za-z0-9!@#$%^&*()_\-+=.,:;'"~`<>?/\\|{}[\]]{8,}$/;
export const PHONE_RE = /^\+?[0-9\s\-()]{7,}$/;

// Rejects free-text fields (diagnosis text, prescriptions, analysis notes) that exceed a
// sane length, instead of storing/rendering arbitrarily large blobs.
export function assertMaxLength(value, max, label) {
  if (value && String(value).length > max) {
    throw new Error(`${label}: не должно превышать ${max} символов`);
  }
}

// Analysis values are typed in from a form; reject anything that doesn't parse as a number
// instead of silently storing a string that would corrupt clinical data downstream.
export function assertNumeric(value, label) {
  if (value === undefined || value === null || value === '') return;
  if (!Number.isFinite(Number(value))) {
    throw new Error(`${label}: значение должно быть числом`);
  }
}
