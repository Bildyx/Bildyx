import { createHash } from "node:crypto";
import type { CsvRow } from "./types";

// Canonical JSON of the row's business columns (raw CSV strings, sorted
// keys, trimmed values) - stable regardless of column order in the source
// file and independent of any later FK/enum resolution, so the hash never
// moves just because a UUID lookup resolved differently on a later import.
export function canonicalizeRow(row: CsvRow, columns: string[]): string {
  const sortedColumns = [...columns].sort();
  const normalized: Record<string, string> = {};
  for (const column of sortedColumns) {
    normalized[column] = (row[column] ?? "").trim();
  }
  return JSON.stringify(normalized);
}

export function computeRowHash(row: CsvRow, columns: string[]): string {
  return createHash("sha256")
    .update(canonicalizeRow(row, columns))
    .digest("hex");
}
