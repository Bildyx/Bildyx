import { useEffect } from "react";

/**
 * Replaces the PHP pattern:
 *   $pageTitle = '...'; $pageDescription = '...';
 *   require __DIR__ . '/includes/header.php';
 */
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);
  }, [title, description]);
}
