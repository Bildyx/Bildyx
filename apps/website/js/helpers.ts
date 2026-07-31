// ─── Shared UI helpers used across auth-related pages ────────────────────────
// Imported by: auth.ts, verify-email.ts, forgot-password.ts, reset-password.ts

declare var Toastify: any;

// ─── DOM selectors ────────────────────────────────────────────────────────────
export const $ = (selector: string, root: Document | HTMLElement = document) =>
  root.querySelector(selector) as HTMLElement | null;

export const $$ = (selector: string, root: Document | HTMLElement = document) =>
  Array.from(root.querySelectorAll(selector)) as HTMLElement[];

// ─── Toastify loader ──────────────────────────────────────────────────────────
(function loadToastify() {
  if (!document.querySelector('link[href*="toastify-js"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = "https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css";
    document.head.appendChild(link);
  }
  if (typeof Toastify === "undefined") {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/toastify-js";
    script.async = false;
    document.head.appendChild(script);
  }
})();

// ─── Toast notifications ─────────────────────────────────────────────────────
function _toast(message: string, type = "info") {
  if (typeof Toastify === "undefined") {
    setTimeout(() => _toast(message, type), 100);
    return;
  }
  const colors: Record<string, string> = {
    info: "#2244ec",
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
  };
  Toastify({
    text: message,
    duration: 3500,
    close: true,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
    style: {
      background: colors[type] ?? colors.info,
      color: "#ffffff",
      fontFamily:
        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: "14px",
      fontWeight: "600",
      borderRadius: "12px",
      boxShadow:
        "0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -2px rgba(0,0,0,.05)",
      padding: "12px 20px",
    },
  }).showToast();
}

export const toast = Object.assign(_toast, {
  success: (m: string) => _toast(m, "success"),
  error: (m: string) => _toast(m, "error"),
  warning: (m: string) => _toast(m, "warning"),
  info: (m: string) => _toast(m, "info"),
});

// ─── Validation ───────────────────────────────────────────────────────────────
export function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function passwordScore(pwd: string) {
  return [
    pwd.length >= 8,
    /[A-Z]/.test(pwd),
    /[a-z]/.test(pwd),
    /\d/.test(pwd),
    /[^A-Za-z0-9]/.test(pwd),
  ].filter(Boolean).length;
}

export function sanitize(value: string) {
  return String(value || "").replace(
    /[<>'"&]/g,
    (c) =>
      (
        ({
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
          "&": "&amp;",
        }) as Record<string, string>
      )[c],
  );
}

// ─── Form error display ───────────────────────────────────────────────────────
export function setError(input: HTMLInputElement | null, message: string) {
  const field = input?.closest(".field");
  const wrap = input?.closest(".input-wrap");
  if (wrap) wrap.classList.toggle("invalid", Boolean(message));
  if (field) {
    const el = field.querySelector(".error") as HTMLElement | null;
    if (el) el.textContent = message || "";
  }
}

// ─── Button loading state ─────────────────────────────────────────────────────
export function startButtonLoading(button: HTMLButtonElement) {
  const originalText = button.textContent;
  let dots = 0;
  button.disabled = true;
  button.textContent = ".";
  const iv = setInterval(() => {
    dots = (dots + 1) % 4;
    button.textContent = ".".repeat(dots || 1);
  }, 350);
  return () => {
    clearInterval(iv);
    button.disabled = false;
    button.textContent = originalText;
  };
}

// ─── Captcha ──────────────────────────────────────────────────────────────────
export const captchaAnswers: Record<string, number> = {};

export function generateCaptcha(name: string) {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 2;
  captchaAnswers[name] = a + b;
  const box = document.querySelector(
    `[data-captcha="${name}"]`,
  ) as HTMLElement | null;
  if (!box) return;
  const q = box.querySelector(".captcha-question") as HTMLElement | null;
  if (q) q.textContent = `${a} + ${b} = ?`;
  const inp = box.querySelector(".captcha-answer") as HTMLInputElement | null;
  if (inp) inp.value = "";
  const err = box.nextElementSibling as HTMLElement | null;
  if (err) err.textContent = "";
}

export function checkCaptcha(name: string) {
  const box = document.querySelector(
    `[data-captcha="${name}"]`,
  ) as HTMLElement | null;
  if (!box) return true;
  const inp = box.querySelector(".captcha-answer") as HTMLInputElement | null;
  const ok = Number(inp?.value ?? 0) === captchaAnswers[name];
  const err = box.nextElementSibling as HTMLElement | null;
  if (err) err.textContent = ok ? "" : "Captcha is incorrect.";
  return ok;
}

export function getSession() {
  const raw = sessionStorage.getItem("bildyx_session");
  return raw ? JSON.parse(raw) : null;
}
