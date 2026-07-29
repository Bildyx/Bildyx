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
// Deux pièges silencieux corrigés ici :
//   - `bom: true` : un CSV réenregistré à la main depuis Excel commence par
//     un BOM UTF-8, qui se collait au nom de la première colonne. La
//     validation d'en-tête rejetait alors le fichier entier pour une
//     colonne "manquante" pourtant présente.
//   - les noms de colonnes sont trimés à la source. validateHeader trimait
//     déjà de son côté, mais csv-parse indexait les lignes sur les noms
//     BRUTS : un en-tête " name" passait la validation, puis row["name"]
//     valait undefined et toute la colonne partait à null sans le moindre
//     avertissement.
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
