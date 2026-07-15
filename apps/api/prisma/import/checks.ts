import { parseEnum, toStringArray } from "../seed-utils";
import type { RowIssue } from "./types";

// Shared building blocks for adapters' mapRow(): every field-level check
// returns the resolved value plus an optional issue, and the adapter
// decides whether that issue lands in `errors` (row rejected) or
// `warnings` (row accepted, value stored as null) - required fields
// (values, FKs, enums) always error; optional ones always warn instead of
// disappearing into a silent null like the old seed scripts did.

export function checkRequiredText(
  raw: string | undefined,
  column: string,
): { value: string; issue?: RowIssue } {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) {
    return { value: "", issue: { row: 0, column, message: `${column}: valeur requise manquante` } };
  }
  return { value: trimmed };
}

export function checkEnum<T extends object>(
  raw: string | undefined,
  enumObj: T,
  column: string,
  required: boolean,
): { value: T[keyof T] | null; issue?: RowIssue } {
  const trimmed = (raw ?? "").trim();

  if (!trimmed) {
    if (required) {
      return {
        value: null,
        issue: { row: 0, column, message: `${column}: valeur requise manquante` },
      };
    }
    return { value: null };
  }

  const parsed = parseEnum(raw, enumObj);
  if (parsed === null) {
    return {
      value: null,
      issue: {
        row: 0,
        column,
        message: `${column}: valeur "${raw}" non reconnue (aucune correspondance dans l'enum)`,
      },
    };
  }

  return { value: parsed };
}

// List-enum fields (e.g. Country.officialLanguages): unmapped tokens are
// dropped from the resulting array but reported individually rather than
// disappearing silently.
export function checkEnumArray<T extends object>(
  raw: string | undefined,
  enumObj: T,
  column: string,
): { value: T[keyof T][]; issues: RowIssue[] } {
  const tokens = toStringArray(raw);
  const value: T[keyof T][] = [];
  const issues: RowIssue[] = [];

  for (const token of tokens) {
    const parsed = parseEnum(token, enumObj);
    if (parsed === null) {
      issues.push({
        row: 0,
        column,
        message: `${column}: valeur "${token}" non reconnue (ignorée)`,
      });
    } else {
      value.push(parsed);
    }
  }

  return { value, issues };
}

export function checkRequiredFk(
  raw: string | undefined,
  resolve: (raw?: string) => string | null,
  column: string,
): { value: string | null; issue?: RowIssue } {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) {
    return {
      value: null,
      issue: { row: 0, column, message: `${column}: référence requise manquante` },
    };
  }

  const resolved = resolve(raw);
  if (!resolved) {
    return {
      value: null,
      issue: { row: 0, column, message: `${column}: référence "${raw}" introuvable` },
    };
  }

  return { value: resolved };
}

export function checkOptionalFk(
  raw: string | undefined,
  resolve: (raw?: string) => string | null,
  column: string,
): { value: string | null; issue?: RowIssue } {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return { value: null };

  const resolved = resolve(raw);
  if (!resolved) {
    return {
      value: null,
      issue: {
        row: 0,
        column,
        message: `${column}: référence "${raw}" non résolue (mise à null)`,
      },
    };
  }

  return { value: resolved };
}
