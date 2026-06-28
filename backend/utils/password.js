import bcrypt from 'bcryptjs';

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain, hash) {
  if (hash.startsWith('$2')) {
    return bcrypt.compare(plain, hash);
  }
  return plain === hash;
}
