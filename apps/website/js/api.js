/*
 * Bildyx — Shared API client
 *
 * Ce module centralise tous les appels vers l'API REST (http://localhost:3000/api).
 * It handles:
 *  - l'envoi du cookie de session httpOnly via credentials: 'include'
 *  - JSON serialization / deserialization
 *  - consistent API error handling
 *  - les helpers de session (getSession / clearSession)
 *
 * Usage :
 *   import { apiFetch, getSession } from './api.js';
 *   const profile = await apiFetch('GET', '/users/me/profile');
 *
 * Note : dans les pages PHP qui chargent ce script via <script src="js/api.js">,
 * functions are exposed on `window.BilydxAPI`.
 */

const API_BASE = 'http://localhost:3000/api';

/**
 * Wrapper principal pour tous les appels API.
 *
 * @param {string} method   - HTTP method: 'GET', 'POST', 'PATCH', 'DELETE'
 * @param {string} path     - Path relative to API_BASE, e.g. '/users/me'
 * @param {object} [body]   - Request body (will be serialized as JSON)
 * @param {object} [params] - Query string parameters
 * @returns {Promise<any>}  - Parsed JSON response or null if 204
 * @throws  {ApiError}      - Objet { status, message, data }
 */
async function apiFetch(method, path, body = null, params = null) {
  let url = `${API_BASE}${path}`;

  if (params && Object.keys(params).length > 0) {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== null && v !== undefined)
          .map(([k, v]) => [k, String(v)])
      )
    );
    url += `?${qs}`;
  }

  const options = {
    method,
    credentials: 'include',
    headers: {},
  };

  if (body !== null) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const resp = await fetch(url, options);

  // 204 No Content — no body to parse
  if (resp.status === 204) return null;

  const text = await resp.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { message: text };
  }

  if (!resp.ok) {
    const err = new Error(data?.message || `HTTP ${resp.status}`);
    err.status = resp.status;
    err.data = data;
    throw err;
  }

  return data;
}

/* ─────────────────────────────────────────────
   Helpers de session
   ─────────────────────────────────────────── */

/**
 * Returns session info stored in sessionStorage
 * (written by auth.js during login / verify-email).
 *
 * @returns {{ userId: string, profileId: string|null, role: string, email: string }|null}
 */
function getSession() {
  try {
    const raw = sessionStorage.getItem('bildyx_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Writes session information to sessionStorage.
 *
 * @param {{ userId: string, profileId?: string, role: string, email: string }} info
 */
function setSession(info) {
  sessionStorage.setItem('bildyx_session', JSON.stringify(info));
}

/**
 * Removes the client-side session and calls /auth/logout to
 * invalidate the httpOnly cookie server-side.
 */
async function logout() {
  try {
    await apiFetch('POST', '/auth/logout', {});
  } catch (_) {
    // Ignore network errors during logout
  } finally {
    sessionStorage.removeItem('bildyx_session');
    localStorage.removeItem('bildyx_profile_id');
    window.location.href = 'login.php';
  }
}

/**
 * Fetches (and caches in sessionStorage) the profile of
 * the logged-in user. Returns null if not logged in.
 *
 * @returns {Promise<{userId,profileId,role,email}|null>}
 */
async function requireSession() {
  let session = getSession();
  if (session) return session;

  // Attempt to fetch from the API (httpOnly cookie is present)
  try {
    const meResp = await apiFetch('GET', '/auth/me');
    if (meResp?.user) {
      const { id: userId, email, role } = meResp.user;
      // Try to get the profileId
      let profileId = null;
      try {
        const profile = await apiFetch('GET', `/users/${userId}/profile`);
        profileId = profile?.id ?? null;
      } catch (_) {}

      session = { userId, email, role, profileId };
      setSession(session);
      return session;
    }
  } catch (_) {}

  return null;
}

/* ─────────────────────────────────────────────
   Export : window.BilydxAPI (pour les pages PHP)
   ─────────────────────────────────────────── */
window.BildyxAPI = {
  apiFetch,
  getSession,
  setSession,
  logout,
  requireSession,
  API_BASE,
};
