/**
 * Centralized Bangladesh Mobile Number Normalization & Validation Utility
 */

/**
 * Normalizes Bangladesh mobile numbers to canonical format (01XXXXXXXXX).
 * Accepts:
 * - 01XXXXXXXXX (11 digits starting with 01)
 * - +8801XXXXXXXXX
 * - 8801XXXXXXXXX
 * Strips whitespace, hyphens, parentheses, and leading country code.
 */
export function normalizeBDPhone(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.trim().replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+8801')) {
    cleaned = '01' + cleaned.slice(5);
  } else if (cleaned.startsWith('8801')) {
    cleaned = '01' + cleaned.slice(4);
  }
  return cleaned;
}

/**
 * Validates whether a given string is a valid Bangladesh mobile number.
 * Ensures the normalized format contains exactly 11 numeric digits starting with 01
 * and a valid operator prefix (013-019).
 */
export function isValidBDPhone(phone: string): boolean {
  if (!phone) return false;
  const normalized = normalizeBDPhone(phone);
  return /^01[3-9]\d{8}$/.test(normalized);
}
