export type BildyxSession = {
  userId?: string;
  profileId?: string;
  email?: string;
  accountType?: string;
  [key: string]: unknown;
} | null;

export function getSession(): BildyxSession {
  const raw = sessionStorage.getItem("bildyx_session") || localStorage.getItem("bildyx_session") || localStorage.getItem("bildyx_user");
  return raw ? JSON.parse(raw) : null;
}
