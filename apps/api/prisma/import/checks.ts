import { Prisma } from "@prisma/client";
import { normalizeScaleValue, parseEnum, toStringArray } from "../seed-utils";
import type { RowIssue } from "./types";

// Shared building blocks for adapters' mapRow(): every field-level check
// returns the resolved value plus an optional issue, and the adapter
// decides whether that issue lands in `errors` (row rejected) or
// `warnings` (row accepted, value stored as null) - required fields
// (values, FKs, enums) always error; optional ones always warn instead of
// disappearing into a silent null like the old seed scripts did.

// Source cells often annotate enum values with a trailing qualifier, e.g.
// "Vietnamese (official)" or "Persian (Farsi, official)" - stripped before
// matching so (a) the qualifier doesn't get glued into the enum key and (b)
// a comma inside the parens doesn't get treated as a list separator by
// checkEnumArray's tokenizer.
function stripParenthetical(raw: string): string {
  return raw.replace(/\([^)]*\)/g, " ");
}

// Numeric columns went straight through toInt()/toFloat(), which boil down
// to Number(): a cell like "Thousands" or "~6 million" (45 and 5 occurrences
// respectively in organizations.csv) produced NaN, passed as-is to Prisma -
// hence either an error at commit time or a silent null, in both cases
// without any warning in dry-run, unlike every other check in this file.
// checkInt/checkFloat make those cells visible as warnings and store null,
// just as checkEnum already does for an unknown enum value.
export function checkFloat(
  raw: string | undefined,
  column: string,
): { value: number | null; issue?: RowIssue } {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return { value: null };

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return {
      value: null,
      issue: {
        row: 0,
        column,
        message: `${column}: "${raw}" n'est pas un nombre (mis à null)`,
      },
    };
  }
  return { value: parsed };
}

export function checkInt(
  raw: string | undefined,
  column: string,
): { value: number | null; issue?: RowIssue } {
  const parsed = checkFloat(raw, column);
  if (parsed.issue || parsed.value === null) return parsed;

  if (!Number.isInteger(parsed.value)) {
    return {
      value: null,
      issue: {
        row: 0,
        column,
        message: `${column}: "${raw}" n'est pas un entier (mis à null)`,
      },
    };
  }
  return { value: parsed.value };
}

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

  const parsed = parseEnum(stripParenthetical(trimmed), enumObj);
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

// Same contract as checkEnum, but for the cost_of_living/quality_of_life
// scale fields whose source cells mix vocabularies ("Medium"/"Moderate")
// and word order ("Moderate to Low" vs "Low to Medium") - see
// normalizeScaleValue.
export function checkScaleEnum<T extends object>(
  raw: string | undefined,
  enumObj: T,
  column: string,
): { value: T[keyof T] | null; issue?: RowIssue } {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return { value: null };

  const parsed = parseEnum(normalizeScaleValue(trimmed), enumObj);
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

// Common source phrasings for Language that aren't just a formatting
// variant of the enum member (checked in checkEnumArray via its `aliases`
// param) - e.g. "Mandarin" alone rather than "Chinese Mandarin".
export const LANGUAGE_ALIASES: Record<string, string> = {
  azeri: "AZERBAIJANI",
  cantonese: "CHINESE_CANTONESE",
  chinese: "CHINESE_MANDARIN",
  gaelic: "SCOTTISH_GAELIC",
  mandarin: "CHINESE_MANDARIN",
  "mandarin chinese": "CHINESE_MANDARIN",
  slovene: "SLOVENIAN",
  "berber languages": "BERBER",
  "english widely spoken": "ENGLISH",
  "english widely used": "ENGLISH",
  "english commonly taught": "ENGLISH",
  "russian widely spoken": "RUSSIAN",
};

// List-enum fields (e.g. Country.officialLanguages): unmapped tokens are
// dropped from the resulting array but reported individually rather than
// disappearing silently. `aliases` maps a lowercased raw phrase (e.g.
// "mandarin") to the enum key that phrase should resolve to (e.g.
// "CHINESE_MANDARIN") for values that aren't just a formatting variant of
// the enum member's name.
export function checkEnumArray<T extends object>(
  raw: string | undefined,
  enumObj: T,
  column: string,
  aliases?: Record<string, string>,
): { value: T[keyof T][]; issues: RowIssue[] } {
  const tokens = toStringArray(raw ? stripParenthetical(raw) : raw);
  const value: T[keyof T][] = [];
  const issues: RowIssue[] = [];

  for (const token of tokens) {
    const aliased = aliases?.[token.trim().toLowerCase()] ?? token;
    const parsed = parseEnum(aliased, enumObj);
    if (parsed === null) {
      issues.push({
        row: 0,
        column,
        message: `${column}: valeur "${token}" non reconnue (ignorée)`,
      });
    } else if (!value.includes(parsed)) {
      // The same language listed twice in the source cell produced a
      // duplicate in the enum array stored in the database.
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

// Metadata cells are free-form JSON typed by hand in Excel - unlike every
// other field here, JSON.parse throws instead of returning a sentinel, so a
// single malformed cell must not be allowed to propagate an uncaught
// exception out of mapRow (it would abort the whole --all batch instead of
// rejecting just this value, unlike every other check in this file).
//
// DbNull and not JsonNull: on a Json? column, Prisma.JsonNull writes the
// JSON value `null` ('null'::jsonb), not a SQL NULL. Every row without
// metadata therefore ended up with 'null'::jsonb, invisible to a
// `WHERE metadata IS NULL`. DbNull does write a proper SQL NULL.
export function checkJson(
  raw: string | undefined,
  column: string,
): { value: Prisma.InputJsonValue | typeof Prisma.DbNull; issue?: RowIssue } {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return { value: Prisma.DbNull };

  try {
    return { value: JSON.parse(trimmed) };
  } catch {
    return {
      value: Prisma.DbNull,
      issue: { row: 0, column, message: `${column}: JSON invalide (mis à null)` },
    };
  }
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
