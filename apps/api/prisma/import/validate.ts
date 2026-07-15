import type { CsvRow } from "./types";

export interface HeaderValidation {
  ok: boolean;
  missing: string[];
  extra: string[];
}

// Real converted CSVs can have trailing blank-named columns from trailing
// ";" in the source Excel (cosmetic - excel_to_csv.py doesn't strip them).
// Those carry no data and aren't "real" columns, so they're dropped before
// comparing against the expected set instead of being reported as a bogus
// extra column.
export function parseHeaderColumns(rawHeader: string[]): string[] {
  return rawHeader.map((c) => c.trim()).filter((c) => c.length > 0);
}

// Exact-set comparison (order doesn't matter): a mismatch means the file
// structurally disagrees with what the current schema expects - reject the
// whole file rather than silently importing a subset (this is the exact
// organizations.xlsx/skills.xlsx trap the new engine must catch cleanly).
export function validateHeader(
  rawHeader: string[],
  expectedColumns: string[],
): HeaderValidation {
  const actual = new Set(parseHeaderColumns(rawHeader));
  const expected = new Set(expectedColumns);

  const missing = expectedColumns.filter((c) => !actual.has(c));
  const extra = [...actual].filter((c) => !expected.has(c));

  return { ok: missing.length === 0 && extra.length === 0, missing, extra };
}

// Maps each natural key value that appears more than once in the file to
// the (1-based) row numbers it appears on.
export function findDuplicateNaturalKeys(
  rows: CsvRow[],
  naturalKeyColumn: string,
): Map<string, number[]> {
  const seen = new Map<string, number[]>();

  rows.forEach((row, index) => {
    const key = (row[naturalKeyColumn] ?? "").trim();
    if (!key) return;
    seen.set(key, [...(seen.get(key) ?? []), index + 1]);
  });

  const duplicates = new Map<string, number[]>();
  for (const [key, rowNumbers] of seen) {
    if (rowNumbers.length > 1) duplicates.set(key, rowNumbers);
  }

  return duplicates;
}
