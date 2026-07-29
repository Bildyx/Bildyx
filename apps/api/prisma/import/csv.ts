import fs from "node:fs";
import { parse } from "csv-parse/sync";
import type { CsvRow } from "./types";

export interface LoadedCsv {
  header: string[];
  rows: CsvRow[];
}

// Reads the header separately from the data rows (rather than deriving it
// from Object.keys(rows[0])) so header validation still works on a file
// with zero data rows (e.g. subjects.csv today - see structure.md).
//
// Two silent traps fixed here:
//   - `bom: true`: a CSV re-saved by hand from Excel starts with a UTF-8 BOM,
//     which got glued onto the first column's name. Header validation then
//     rejected the whole file over a "missing" column that was in fact
//     present.
//   - column names are trimmed at the source. validateHeader already trimmed
//     on its side, but csv-parse indexed rows on the RAW names: a " name"
//     header passed validation, then row["name"] was undefined and the whole
//     column went to null without any warning.
const PARSE_OPTIONS = {
  delimiter: ";",
  bom: true,
  skip_empty_lines: true,
} as const;

function trimColumnNames(header: string[]): string[] {
  return header.map((c) => c.trim());
}

export function loadCsvFile(filePath: string): LoadedCsv {
  const csv = fs.readFileSync(filePath, "utf8");

  const [headerLine] = parse(csv, {
    ...PARSE_OPTIONS,
    columns: false,
    to_line: 1,
  }) as string[][];

  const rows = parse(csv, {
    ...PARSE_OPTIONS,
    columns: trimColumnNames,
  }) as CsvRow[];

  return { header: headerLine ? trimColumnNames(headerLine) : [], rows };
}
