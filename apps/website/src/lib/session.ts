export type BildyxSession = {
  userId?: string;
  profileId?: string;
  organizationId?: string;
  email?: string;
  accountType?: string;
  createdAt?: number;
  [key: string]: unknown;
} | null;

const SESSION_EXPIRATION_MS = 2 * 60 * 60 * 1000; // 2 hours

export function getSession(): BildyxSession {
  const raw =
    sessionStorage.getItem("bildyx_session") ||
    localStorage.getItem("bildyx_session") ||
    localStorage.getItem("bildyx_user");
  if (!raw) return null;

  try {
    const session = JSON.parse(raw);
    if (session && typeof session === "object") {
      const now = Date.now();
      if (session.createdAt) {
        if (now - Number(session.createdAt) > SESSION_EXPIRATION_MS) {
          // Expired, clear everything
          sessionStorage.removeItem("bildyx_session");
          localStorage.removeItem("bildyx_session");
          localStorage.removeItem("bildyx_user");
          return null;
        }
      }
      // Update/initialize the sliding expiration timestamp
      session.createdAt = now;
      
      // Save it back to keep the session alive
      const sessionStr = JSON.stringify(session);
      if (sessionStorage.getItem("bildyx_session")) {
        sessionStorage.setItem("bildyx_session", sessionStr);
      }
      if (localStorage.getItem("bildyx_session")) {
        localStorage.setItem("bildyx_session", sessionStr);
      }
      if (localStorage.getItem("bildyx_user") && session.id) { // If it was the raw user object
        localStorage.setItem("bildyx_user", sessionStr);
      }
    }
    return session;
  } catch (error) {
    console.error("Error reading session:", error);
    return null;
  }
}
