/**
 * Momen Password Utilities
 * Password hashing, validation, and comparison
 */

import bcrypt from 'bcryptjs';

// ============================================
// CONFIGURATION
// ============================================
const SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

// ============================================
// HASH PASSWORD
// ============================================
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// ============================================
// COMPARE PASSWORD
// ============================================
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// ============================================
// VALIDATE PASSWORD STRENGTH
// ============================================
export interface PasswordValidationResult {
  valid: boolean;
  strength: number; // 0-100
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let strength = 0;

  // Length check
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  } else {
    strength += 20;
  }

  // Contains lowercase
  if (/[a-z]/.test(password)) {
    strength += 15;
  } else {
    errors.push('Password must contain a lowercase letter');
  }

  // Contains uppercase
  if (/[A-Z]/.test(password)) {
    strength += 15;
  } else {
    errors.push('Password must contain an uppercase letter');
  }

  // Contains number
  if (/[0-9]/.test(password)) {
    strength += 15;
  } else {
    errors.push('Password must contain a number');
  }

  // Contains special character
  if (/[^a-zA-Z0-9]/.test(password)) {
    strength += 20;
  } else {
    errors.push('Password must contain a special character');
  }

  // Bonus for length > 12
  if (password.length > 12) {
    strength += 15;
  }

  return {
    valid: errors.length === 0,
    strength: Math.min(strength, 100),
    errors,
  };
}

// ============================================
// COMMON PASSWORDS CHECK
// ============================================
// Top 100 common passwords (subset for brevity)
const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123',
  'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
  'baseball', '111111', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123',
  '654321', 'superman', 'qazwsx', 'michael', 'football',
  // ... add more as needed
]);

export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase());
}

// ============================================
// PATTERN CHECKS (for weak passwords)
// ============================================
export function hasWeakPatterns(password: string): boolean {
  // Sequential patterns (123, abc, qwerty)
  const sequential = /(?:012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i;

  // Keyboard patterns (qwerty, asdf)
  const keyboard = /(?:qwerty|asdfgh|zxcvbn)/i;

  // Repeated characters (aaa, 111)
  const repeated = /(.)\1{2,}/;

  return (
    sequential.test(password) ||
    keyboard.test(password) ||
    repeated.test(password)
  );
}
