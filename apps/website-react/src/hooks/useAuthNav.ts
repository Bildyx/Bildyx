import { useCallback, useEffect, useState } from "react";

export type AccountType = "company" | "seeker" | "";
type Session = Record<string, unknown> | null;

function parseJSON(value: string | null): Session {
  try {
    return value ? (JSON.parse(value) as Session) : null;
  } catch {
    return null;
  }
}

function normalizeType(value: unknown): AccountType {
  const raw = String(value || "").toLowerCase().replace(/[\s_-]/g, "");
  if (["company", "business", "employer", "organization", "organisation", "recruiter"].includes(raw)) return "company";
  if (["seeker", "jobseeker", "jobseekers", "candidate", "student", "user"].includes(raw)) return "seeker";
  return "";
}

function readSession(): Session {
  const session =
    parseJSON(sessionStorage.getItem("bildyx_session")) ||
    parseJSON(localStorage.getItem("bildyx_session")) ||
    parseJSON(localStorage.getItem("bildyx_user"));
  if (!session) return null;
  if (!sessionStorage.getItem("bildyx_session")) sessionStorage.setItem("bildyx_session", JSON.stringify(session));
  if (!localStorage.getItem("bildyx_session")) localStorage.setItem("bildyx_session", JSON.stringify(session));
  return session;
}

function hasActiveSession(session: Session): boolean {
  if (!session) return false;
  return Boolean(
    session.userId || session.id || session._id || session.email || session.accountType || session.account_type || session.role,
  );
}

function getAccountType(session: Session): AccountType {
  if (!session) return "";
  return normalizeType(
    session.accountType || session.account_type || session.userType || session.user_type || session.role || session.type,
  );
}

export function clearAuthSession() {
  [
    "bildyx_session",
    "bildyx_user",
    "bildyx_pending_account_type",
    "token",
    "auth_token",
    "accessToken",
    "refreshToken",
    "bildyx_access_token",
    "bildyx_refresh_token",
  ].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

/** Ported from includes/header.php inline <script>. */
export function useAuthNav() {
  const [session, setSession] = useState<Session>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const refresh = useCallback(() => setSession(readSession()), []);

  useEffect(() => {
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [refresh]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const close = () => setIsMenuOpen(false);
    const closeOnEsc = (e: KeyboardEvent) => e.key === "Escape" && setIsMenuOpen(false);
    document.addEventListener("click", close);
    document.addEventListener("keydown", closeOnEsc);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", closeOnEsc);
    };
  }, [isMenuOpen]);

  const isLoggedIn = hasActiveSession(session);
  const accountType = getAccountType(session);

  const signOut = useCallback((navigate: (path: string) => void, redirectPath: string) => {
    clearAuthSession();
    navigate(redirectPath);
  }, []);

  return { isLoggedIn, accountType, isMenuOpen, setIsMenuOpen, signOut, refresh };
}
