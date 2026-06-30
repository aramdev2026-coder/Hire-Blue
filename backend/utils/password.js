import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12; // Production-grade: ~250ms per hash

export async function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain, hash) {
  // Always use bcrypt comparison — no plaintext fallback
  if (!hash || !hash.startsWith('$2')) {
    // If the stored hash is not a bcrypt hash, reject outright.
    // This prevents legacy plaintext passwords from being accepted.
    return false;
  }
  return bcrypt.compare(plain, hash);
}
