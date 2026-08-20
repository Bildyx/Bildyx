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
//
// legacyColumns is the one deliberate exception: a column tolerated whether
// present or absent, counted as neither missing nor extra. Without it, a
// column some real files carry but the live schema doesn't have yet (see
// ImportAdapter.legacyColumns) would force a choice between rejecting those
// files ("extra") or rejecting a freshly generated, schema-driven template
// that lacks the same column ("missing") - it can't satisfy an exact-set
// check against both at once.
export function validateHeader(
  rawHeader: string[],
  expectedColumns: string[],
  legacyColumns: string[] = [],
): HeaderValidation {
  const actual = new Set(parseHeaderColumns(rawHeader));
  const expected = new Set(expectedColumns);
  const legacy = new Set(legacyColumns);

  const missing = expectedColumns.filter((c) => !actual.has(c));
  const extra = [...actual].filter((c) => !expected.has(c) && !legacy.has(c));

  return { ok: missing.length === 0 && extra.length === 0, missing, extra };
}

// Maps each natural key value that appears more than once in the file to
// the (1-based) row numbers it appears on. `normalize` must match whatever
// the adapter's mapRow does to the same raw value (see normalizeNaturalKey
// in types.ts), or two rows differing only by e.g. casing won't be caught
// here and will instead crash on the DB's own unique constraint at commit.
export function findDuplicateNaturalKeys(
  rows: CsvRow[],
  naturalKeyColumn: string,
  normalize: (raw: string) => string = (raw) => raw,
): Map<string, number[]> {
  const seen = new Map<string, number[]>();

  rows.forEach((row, index) => {
    const key = normalize((row[naturalKeyColumn] ?? "").trim());
    if (!key) return;
    seen.set(key, [...(seen.get(key) ?? []), index + 1]);
  });

  const duplicates = new Map<string, number[]>();
  for (const [key, rowNumbers] of seen) {
    if (rowNumbers.length > 1) duplicates.set(key, rowNumbers);
  }

  return duplicates;
}
