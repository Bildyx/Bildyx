import fs from "node:fs";
import { parse } from "csv-parse/sync";
import type { CsvRow } from "./types";

export interface LoadedCsv {
  header: string[];
  rows: CsvRow[];
}

// Reads the header separately from the data rows (rather than deriving it
// from Object.keys(rows[0])) so header validation still works on a file
// with zero data rows (e.g. organizations.xlsx today - see structure.md).
export function loadCsvFile(filePath: string): LoadedCsv {
  const csv = fs.readFileSync(filePath, "utf8");

  const [headerLine] = parse(csv, {
    delimiter: ";",
    columns: false,
    to_line: 1,
  }) as string[][];

  const rows = parse(csv, {
    delimiter: ";",
    columns: true,
    skip_empty_lines: true,
  }) as CsvRow[];

  return { header: headerLine ?? [], rows };
}
