/**
 * Single-Admin Security Service
 * Restricts all affiliate link editing, deal publishing, and automation rules
 * exclusively to the single owner/administrator.
 */

const ADMIN_KEY_STORAGE = 'dealpulse_admin_secret_key';
const ADMIN_SESSION_STORAGE = 'dealpulse_admin_session';
export const DEFAULT_MASTER_KEY = 'dealpulse-admin';

export function getStoredAdminKey(): string {
  return localStorage.getItem(ADMIN_KEY_STORAGE) || DEFAULT_MASTER_KEY;
}

export function updateAdminMasterKey(newKey: string): boolean {
  if (!newKey || newKey.trim().length < 4) return false;
  localStorage.setItem(ADMIN_KEY_STORAGE, newKey.trim());
  return true;
}

export function verifyAdminKey(candidateKey: string): boolean {
  const currentKey = getStoredAdminKey();
  const isValid = candidateKey.trim() === currentKey;
  if (isValid) {
    localStorage.setItem(ADMIN_SESSION_STORAGE, 'true');
  }
  return isValid;
}

export function isAdminSessionValid(): boolean {
  return localStorage.getItem(ADMIN_SESSION_STORAGE) === 'true';
}

export function terminateAdminSession(): void {
  localStorage.removeItem(ADMIN_SESSION_STORAGE);
}
