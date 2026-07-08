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

// Comme toInt, mais tolère du texte autour du nombre (ex: "1 (via Cairo Intl.
// Airport)", "20+", "30% Bachelor's..."). Prend le premier entier trouvé.
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

// fallbackToNow=true -> renvoie new Date() si vide (utile pour createdAt/updatedAt)
// fallbackToNow=false -> renvoie null si vide (utile pour deletedAt)
export function toDate(v?: string, fallbackToNow = false): Date | null {
  if (v && v.trim() !== "") return new Date(v);
  return fallbackToNow ? new Date() : null;
}

export function toJson(
  v?: string,
): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  return v && v.trim() !== "" ? JSON.parse(v) : Prisma.JsonNull;
}

// Assume une cellule du type "a,b,c" ou un tableau JSON '["a","b","c"]'
export function toStringArray(v?: string): string[] {
  if (!v || v.trim() === "") return [];
  const trimmed = v.trim();

  if (trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // fall through vers le split classique
    }
  }

  return trimmed
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Normalise "Project Management" / "project-management" / "5000+" -> "PROJECT_MANAGEMENT" / "5000_"
export function normalizeEnumKey(v: string): string {
  return v
    .trim()
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

// Resout un nom lisible (ex: "Adobe") vers l'id genere en base pour des
// lignes CSV qui referencent une autre table par nom plutot que par sa vraie
// cle etrangere (laquelle n'existe pas encore au moment ou le CSV a ete
// rempli). Retourne null (sans lever d'erreur) si aucune correspondance.
export function buildNameLookup(rows: { id: string; name: string }[]) {
  const byName = new Map(rows.map((r) => [r.name.trim().toLowerCase(), r.id]));

  return (rawName?: string): string | null => {
    if (!rawName || rawName.trim() === "") return null;
    return byName.get(rawName.trim().toLowerCase()) ?? null;
  };
}
