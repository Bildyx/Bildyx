import { Prisma } from "@prisma/client";
import { parse } from "csv-parse/sync";
import fs from "node:fs";

export function readCsv<T>(file: string): T[] {
  const csv = fs.readFileSync(`data/${file}`, "utf8");

  return parse(csv, {
    columns: true,
    delimiter: ";",
    skip_empty_lines: true,
  }) as T[];
}

export function toInt(v?: string): number | null {
  return v && v.trim() !== "" ? Number(v) : null;
}

// Like toInt, but tolerates text around the number (e.g. "1 (via Cairo Intl.
// Airport)", "20+", "30% Bachelor's..."). Takes the first integer found.
export function toIntLoose(v?: string): number | null {
  if (!v || v.trim() === "") return null;
  const match = v.match(/\d+/);
  return match ? Number(match[0]) : null;
}

export function toFloat(v?: string): number | null {
  return v && v.trim() !== "" ? Number(v) : null;
}

export function toBigInt(v?: string): bigint | null {
  return v && v.trim() !== "" ? BigInt(v) : null;
}

export function toBool(v?: string): boolean {
  if (!v) return false;
  return ["true", "1", "yes", "t"].includes(v.trim().toLowerCase());
}

// fallbackToNow=true -> returns new Date() if empty (useful for createdAt/updatedAt)
// fallbackToNow=false -> returns null if empty (useful for deletedAt)
export function toDate(v?: string, fallbackToNow = false): Date | null {
  if (v && v.trim() !== "") return new Date(v);
  return fallbackToNow ? new Date() : null;
}

export function toJson(
  v?: string,
): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  return v && v.trim() !== "" ? JSON.parse(v) : Prisma.JsonNull;
}

// Assumes a cell like "a,b,c" or a JSON array '["a","b","c"]'
export function toStringArray(v?: string): string[] {
  if (!v || v.trim() === "") return [];
  const trimmed = v.trim();

  if (trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // fall through to the classic split
    }
  }

  return trimmed
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// "Pekamix Global" -> "pekamix-global" - used to derive Organization.slug
// from name when the CSV's slug column is blank.
const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

export function slugify(v: string): string {
  return v
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Source cost_of_living/quality_of_life cells use two interchangeable
// vocabularies ("Medium"/"Moderate") and free-text compounds ("Low to
// Medium", "Moderate to High", and the reverse order "Moderate to Low") -
// canonicalised here to a single ordered "low medium"-style phrase that
// normalizeEnumKey then turns into the matching enum key (LOW_MEDIUM, etc.).
export function normalizeScaleValue(v: string): string {
  let s = v.trim().toLowerCase().replace(/moderate/g, "medium");
  s = s.replace(/\bto\b/g, " ").replace(/\s+/g, " ").trim();
  if (s === "medium low") s = "low medium";
  if (s === "high medium") s = "medium high";
  return s;
}

// Normalise "Project Management" / "project-management" / "5000+" -> "PROJECT_MANAGEMENT" / "5000_"
// Accents are folded first (e.g. "Māori" -> "MAORI") so they match the
// plain-ASCII enum members instead of being stripped as invalid characters.
export function normalizeEnumKey(v: string): string {
  return v
    .trim()
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .toUpperCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");
}

export function parseEnum<T extends object>(
  value: string | undefined,
  enumObj: T,
): T[keyof T] | null {
  if (!value || value.trim() === "") return null;
  const key = normalizeEnumKey(value);
  return (enumObj as any)[key] ?? null;
}

export function parseEnumArray<T extends object>(
  value: string | undefined,
  enumObj: T,
): T[keyof T][] {
  return toStringArray(value)
    .map((v) => parseEnum(v, enumObj))
    .filter((v): v is T[keyof T] => v !== null);
}

// Resolves a human-readable name (e.g. "Adobe") to the id generated in the
// database, for CSV rows that reference another table by name rather than by
// its real foreign key (which does not exist yet when the CSV is filled in).
// Returns null (without throwing) if there is no match.
export function buildNameLookup(rows: { id: string; name: string }[]) {
  const byName = new Map<string, string>();
  // Two rows sharing a name produced a Map where the last one overwrote the
  // previous: the reference was then resolved to an arbitrary row, silently
  // and with no way to notice. We record the ambiguous names so as to return
  // null instead - the caller (checkOptionalFk / checkRequiredFk) then
  // reports it as an unresolved reference.
  const ambiguous = new Set<string>();

  for (const r of rows) {
    const key = r.name.trim().toLowerCase();
    if (!key) continue;
    if (byName.has(key)) ambiguous.add(key);
    else byName.set(key, r.id);
  }

  return (rawName?: string): string | null => {
    if (!rawName || rawName.trim() === "") return null;
    const key = rawName.trim().toLowerCase();
    if (ambiguous.has(key)) return null;
    return byName.get(key) ?? null;
  };
}

// Resolves a "NameA;NameB" cell (many-to-many relation column, same
// ";"-separated convention as toStringArray) into ids via a lookup (typically
// buildNameLookup), silently ignoring unresolved names.
export function resolveNameList(
  value: string | undefined,
  resolve: (rawName?: string) => string | null,
): string[] {
  return toStringArray(value)
    .map((name) => resolve(name))
    .filter((id): id is string => id !== null);
}
