import { LATIN_PASSWORD_RE, PHONE_RE } from '../utils/validators.js';
import { hashPassword } from '../utils/passwords.js';

// Never expose the password hash through the public staff listing.
export function serializeStaff(s) {
  const { passwordHash, ...safe } = s;
  return { ...safe, dutyLabel: s.onDuty ? 'На смене' : 'Не на смене' };
}

const ROLE_COLORS = { doctor: '#185FA5', nurse: '#1D9E75' };

export function createStaff({ name, role, specialty, phone, password }) {
  if (!name || !name.trim()) throw new Error('Имя обязательно');
  if (role !== 'doctor' && role !== 'nurse') throw new Error('Роль должна быть "doctor" или "nurse"');
  if (!specialty || !specialty.trim()) throw new Error('Специализация обязательна');
  if (phone && !PHONE_RE.test(phone)) throw new Error('Введите корректный номер телефона');
  if (password && !LATIN_PASSWORD_RE.test(password)) {
    throw new Error('Пароль должен быть на английском языке (латиница, без кириллицы)');
  }
  if ((phone && !password) || (password && !phone)) {
    throw new Error('Укажите и телефон, и пароль, либо оставьте оба поля пустыми');
  }

  return {
    id: (role === 'doctor' ? 'd' : 'n') + Date.now(),
    name: name.trim(),
    role,
    specialty: specialty.trim(),
    color: ROLE_COLORS[role],
    onDuty: true,
    ...(phone ? { phone, passwordHash: hashPassword(password) } : {}),
  };
}
