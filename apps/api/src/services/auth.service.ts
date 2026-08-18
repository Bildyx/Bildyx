import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { FRONTEND_URL } from "../configuration";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const testHash = scryptSync(password, salt, 64).toString("hex");
    return timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(testHash, "hex"),
    );
  } catch (err) {
    return false;
  }
}

export function parseDbDate(dateInput: any): Date {
  const date = new Date(dateInput);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
}

export function getLoginUrl(tab?: string): string {
  return tab
    ? `${FRONTEND_URL}/login.html?tab=${tab}`
    : `${FRONTEND_URL}/login.html`;
}

export function getResetPasswordUrl(email: string, token: string): string {
  return `${FRONTEND_URL}/reset-password.php?token=${token}&email=${encodeURIComponent(email)}`;
}
