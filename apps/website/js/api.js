/*
 * Bildyx — API client partagé
 *
 * Ce module centralise tous les appels vers l'API REST (http://localhost:3000/api).
 * Il gère :
 *  - l'envoi du cookie de session httpOnly via credentials: 'include'
 *  - la sérialisation / désérialisation JSON
 *  - la gestion cohérente des erreurs API
 *  - les helpers de session (getSession / clearSession)
 *
 * Usage :
 *   import { apiFetch, getSession } from './api.js';
 *   const profile = await apiFetch('GET', '/users/me/profile');
 *
 * Note : dans les pages PHP qui chargent ce script via <script src="js/api.js">,
 * les fonctions sont exposées sur `window.BilydxAPI`.
 */

const API_BASE = 'http://localhost:3000/api';

/**
 * Wrapper principal pour tous les appels API.
 *
 * @param {string} method   - Méthode HTTP : 'GET', 'POST', 'PATCH', 'DELETE'
 * @param {string} path     - Chemin relatif à API_BASE, ex: '/users/me'
 * @param {object} [body]   - Corps de la requête (sera sérialisé en JSON)
 * @param {object} [params] - Paramètres de query string
 * @returns {Promise<any>}  - Réponse JSON parsée ou null si 204
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

  // 204 No Content — pas de corps à parser
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
 * Retourne les infos de session stockées en sessionStorage
 * (écrites par auth.js lors du login / verify-email).
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
 * Écrit les informations de session dans sessionStorage.
 *
 * @param {{ userId: string, profileId?: string, role: string, email: string }} info
 */
function setSession(info) {
  sessionStorage.setItem('bildyx_session', JSON.stringify(info));
}

/**
 * Supprime la session côté client et appelle /auth/logout pour
 * invalider le cookie httpOnly côté serveur.
 */
async function logout() {
  try {
    await apiFetch('POST', '/auth/logout', {});
  } catch (_) {
    // On ignore les erreurs réseau lors du logout
  } finally {
    sessionStorage.removeItem('bildyx_session');
    localStorage.removeItem('bildyx_profile_id');
    window.location.href = 'login.php';
  }
}

/**
 * Récupère (et met en cache dans sessionStorage) le profil de
 * l'utilisateur connecté. Renvoie null si non connecté.
 *
 * @returns {Promise<{userId,profileId,role,email}|null>}
 */
async function requireSession() {
  let session = getSession();
  if (session) return session;

  // Tentative de récupération depuis l'API (le cookie httpOnly est présent)
  try {
    const meResp = await apiFetch('GET', '/auth/me');
    if (meResp?.user) {
      const { id: userId, email, role } = meResp.user;
      // On essaie de récupérer le profileId
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
