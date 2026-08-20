export function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function passwordScore(pwd: string) {
  return [/.{8,}/, /[A-Z]/, /[a-z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(pwd)).length;
}

/** Extracts a readable message from a thrown error whose .message may be a JSON blob (matches original try/catch pattern). */
export function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) {
    try {
      const parsed = JSON.parse(err.message);
      return parsed?.message || err.message || fallback;
    } catch {
      return err.message || fallback;
    }
  }
  return fallback;
}
