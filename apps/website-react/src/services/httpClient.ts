/**
 * The original services/*.ts files (in apps/website) call `@repo/api-client`
 * and `@repo/models/*` — workspace packages that don't exist yet in
 * `packages/` (only `api-client`'s scaffold is there, `models` isn't).
 *
 * Until that package lands, this is a thin fetch-based stand-in with the
 * same method names/shapes as the real services, so pages don't need to
 * change when the real oRPC client is wired up — only these two files do.
 *
 * There is no real backend running at API_BASE yet, so every call here
 * will fail. request() below turns that failure into a clear message
 * ("No backend reachable...") instead of the cryptic native
 * "Unexpected token '<'... is not valid JSON" you'd otherwise see when a
 * dev server answers with an HTML page instead of JSON.
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8000);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      ...init,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(
        `Request to ${API_BASE}${path} timed out after 8s. Is the API running (cd apps/api && npm run dev)?`,
      );
    }
    throw new Error(
      `No backend reachable at ${API_BASE}${path}. This is expected for now — see MIGRATION.md ("services API") for why.`,
    );
  } finally {
    window.clearTimeout(timeoutId);
  }

  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (!contentType.includes("application/json")) {
      throw new Error(
        `Backend at ${API_BASE}${path} returned ${res.status} without JSON (likely no real API server yet — see MIGRATION.md).`,
      );
    }
    throw new Error(text || res.statusText);
  }

  if (res.status === 204) return undefined as T;

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Backend at ${API_BASE}${path} responded without JSON — no real API server is running there yet (see MIGRATION.md, "services API").`,
    );
  }

  return res.json() as Promise<T>;
}

export const apiGet = <T>(path: string) => request<T>(path, { method: "GET" });

export const apiPost = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined });

export const apiPut = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "PUT", body: body !== undefined ? JSON.stringify(body) : undefined });

export const apiDelete = <T>(path: string) => request<T>(path, { method: "DELETE" });
