export type AccountType = "company" | "seeker" | "";

export function normalizeAccountType(value: unknown): string {
  const raw = String(value || "").toLowerCase().replace(/[\s_-]/g, "");

  if (["company", "business", "employer", "organization", "organisation", "recruiter"].includes(raw)) return "company";
  if (["seeker", "jobseeker", "jobseekers", "candidate", "student", "user"].includes(raw)) return "seeker";

  return raw;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAuthUser(data: any): any {
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
  return sessionStorage.getItem("bildyx_pending_account_type") || localStorage.getItem("bildyx_pending_account_type") || "";
}

export function savePendingAccountType(accountType: string, userId?: string) {
  if (!accountType) return;
  sessionStorage.setItem("bildyx_pending_account_type", accountType);
  localStorage.setItem("bildyx_pending_account_type", accountType);
  if (userId) {
    sessionStorage.setItem(`bildyx_pending_account_type_${userId}`, accountType);
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAccountType(user: any): string {
  const accountType = normalizeAccountType(
    user?.accountType || user?.account_type || user?.userType || user?.user_type || user?.profileType || user?.profile_type || user?.role || user?.type,
  );
  if (accountType) return accountType;
  return normalizeAccountType(readPendingAccountType());
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getRedirectPath(user: any): string {
  return getAccountType(user) === "company" ? "/company-admin" : "/profile";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function saveBildyxSession(user: any, fallbackEmail = "") {
  const sessionInfo = {
    userId: user?.id || user?.userId || user?._id || null,
    email: user?.email || fallbackEmail || "",
    role: user?.role || null,
    accountType: getAccountType(user),
    profileId: user?.profileId || user?.profile_id || null,
    companyId: user?.companyId || user?.company_id || user?.organizationId || user?.organization_id || null,
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
  const rows = (attempts[key] || []).filter((t: number) => now - t < 10 * 60 * 1000);
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
