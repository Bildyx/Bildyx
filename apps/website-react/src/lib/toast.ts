declare global {
  interface Window {
    Toastify: any;
  }
}

// ─── Toastify loader (same CDN approach as the original helpers.ts) ─────────
(function loadToastify() {
  if (typeof document === "undefined") return;

  if (!document.querySelector('link[href*="toastify-js"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = "https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css";
    document.head.appendChild(link);
  }

  if (typeof window.Toastify === "undefined") {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/toastify-js";
    script.async = false;
    document.head.appendChild(script);
  }
})();

type ToastType = "info" | "success" | "error" | "warning";

function _toast(message: string, type: ToastType = "info") {
  if (typeof window.Toastify === "undefined") {
    setTimeout(() => _toast(message, type), 100);
    return;
  }

  const colors: Record<ToastType, string> = {
    info: "#2244ec",
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
  };

  window
    .Toastify({
      text: message,
      duration: 3500,
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: colors[type] ?? colors.info,
        color: "#ffffff",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: "14px",
        fontWeight: "600",
        borderRadius: "12px",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -2px rgba(0,0,0,.05)",
        padding: "12px 20px",
      },
    })
    .showToast();
}

export const toast = Object.assign(_toast, {
  success: (m: string) => _toast(m, "success"),
  error: (m: string) => _toast(m, "error"),
  warning: (m: string) => _toast(m, "warning"),
  info: (m: string) => _toast(m, "info"),
});
