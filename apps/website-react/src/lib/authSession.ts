import { User } from "@repo/models/users";
import { OrganizationService } from "../services/organization.service";

export type AccountType = "company" | "seeker" | "";

export function getAuthUser(data: any) {
  return data?.user || data?.data?.user || data?.data || data || {};
}

export function readPendingAccountType(userId?: string): string {
  if (userId) {
    return (
      sessionStorage.getItem(`bildyx_pending_account_type_${userId}`) ||
      localStorage.getItem(`bildyx_pending_account_type_${userId}`) ||
      sessionStorage.getItem("bildyx_pending_account_type") ||
      localStorage.getItem("bildyx_pending_account_type") ||
      ""
    );
  }
  return (
    sessionStorage.getItem("bildyx_pending_account_type") ||
    localStorage.getItem("bildyx_pending_account_type") ||
    ""
  );
}

export function savePendingAccountType(accountType: string, userId?: string) {
  if (!accountType) return;
  sessionStorage.setItem("bildyx_pending_account_type", accountType);
  localStorage.setItem("bildyx_pending_account_type", accountType);
  if (userId) {
    sessionStorage.setItem(
      `bildyx_pending_account_type_${userId}`,
      accountType,
    );
    localStorage.setItem(`bildyx_pending_account_type_${userId}`, accountType);
  }
}

export function clearPendingAccountType(userId?: string) {
  sessionStorage.removeItem("bildyx_pending_account_type");
  localStorage.removeItem("bildyx_pending_account_type");
  if (userId) {
    sessionStorage.removeItem(`bildyx_pending_account_type_${userId}`);
    localStorage.removeItem(`bildyx_pending_account_type_${userId}`);
  }
}

export async function getRedirectPath(user: User): Promise<string> {
  if (user.organization_id) {
    const organizationService = new OrganizationService();
    const organization = await organizationService.getById(
      user.organization_id,
    );
    if (organization) {
      return `/${organization.profile_url}/admin`;
    }
  }
  return "/profile";
}

export function saveBildyxSession(user: any, fallbackEmail = "") {
  const sessionInfo = {
    userId: user.id,
    email: user.email || fallbackEmail || "",
    role: user.role || null,
    profileId: user.profile_id || null,
    companyId: user.organization_id || null,
  };

  sessionStorage.setItem("bildyx_session", JSON.stringify(sessionInfo));
  localStorage.setItem("bildyx_session", JSON.stringify(sessionInfo));
  localStorage.setItem("bildyx_user", JSON.stringify(user || {}));

  return sessionInfo;
}

// ─── Rate limiting (login attempts) ──────────────────────────
function readAttempts(): Record<string, number[]> {
  try {
    return JSON.parse(localStorage.getItem("bildyx_attempts") || "{}");
  } catch {
    return {};
  }
}

export function tooManyAttempts(email: string): boolean {
  const now = Date.now();
  const key = email.toLowerCase();
  const attempts = readAttempts();
  const rows = (attempts[key] || []).filter(
    (t: number) => now - t < 10 * 60 * 1000,
  );
  attempts[key] = rows;
  localStorage.setItem("bildyx_attempts", JSON.stringify(attempts));
  return rows.length >= 5;
}

export function addAttempt(email: string) {
  const key = email.toLowerCase();
  const attempts = readAttempts();
  attempts[key] = attempts[key] || [];
  attempts[key].push(Date.now());
  localStorage.setItem("bildyx_attempts", JSON.stringify(attempts));
}
