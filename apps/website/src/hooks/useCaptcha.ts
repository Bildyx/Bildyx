import { useCallback, useState } from "react";

function randomOperands() {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 2;
  return { a, b, answer: a + b };
}

/**
 * React port of the generateCaptcha/checkCaptcha pair in js/helpers.ts.
 * Usage: const captcha = useCaptcha(); ... captcha.verify(userInput)
 */
export function useCaptcha() {
  const [{ a, b, answer }, setOperands] = useState(randomOperands);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(() => {
    setOperands(randomOperands());
    setValue("");
    setError("");
  }, []);

  const verify = useCallback(() => {
    const ok = Number(value) === answer;
    setError(ok ? "" : "Captcha is incorrect.");
    return ok;
  }, [value, answer]);

  return {
    question: `${a} + ${b} = ?`,
    value,
    setValue,
    error,
    refresh,
    verify,
  };
}
