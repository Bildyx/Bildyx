import { useCallback, useEffect, useRef } from "react";

export function useDebouncedCallback(callback: () => void, delay = 350) {
  const timeoutRef = useRef<number>();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  return useCallback(() => {
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => callbackRef.current(), delay);
  }, [delay]);
}
