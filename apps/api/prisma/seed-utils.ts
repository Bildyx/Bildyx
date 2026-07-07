import { Prisma } from "@prisma/client";
import { parse } from "csv-parse/sync";
import fs from "node:fs";

export function readCsv<T>(file: string): T[] {
  const csv = fs.readFileSync(`data/${file}`, "utf8");

  return parse(csv, {
    columns: true,
    delimiter: ",",
    skip_empty_lines: true,
  }) as T[];
}

export function toInt(v?: string): number | null {
  return v && v.trim() !== "" ? Number(v) : null;
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

export function toJson(v?: string): Prisma.InputJsonValue | typeof Prisma.JsonNull {
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
  enumObj: T
): T[keyof T] | null {
  if (!value || value.trim() === "") return null;
  const key = normalizeEnumKey(value);
  return (enumObj as any)[key] ?? null;
}

export function parseEnumArray<T extends object>(
  value: string | undefined,
  enumObj: T
): T[keyof T][] {
  return toStringArray(value)
    .map((v) => parseEnum(v, enumObj))
    .filter((v): v is T[keyof T] => v !== null);
}
