// Shared login-credential rules: password must be Latin-only, phone must look like a phone number.
export const LATIN_PASSWORD_RE = /^[A-Za-z0-9!@#$%^&*()_\-+=.,:;'"~`<>?/\\|{}[\]]+$/;
export const PHONE_RE = /^\+?[0-9\s\-()]{7,}$/;
