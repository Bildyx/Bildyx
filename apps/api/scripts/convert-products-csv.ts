#!/usr/bin/env -S npx tsx
// Converts a raw "products" export (comma-delimited, human-readable
// headers - see the sample this was built from) into the ";"-delimited,
// schema-column-named CSV that prisma/import/adapters/subjects.ts expects
// (see EXPECTED_COLUMNS there). Pure file transform: no database access,
// no FK resolution - organization_name/industries/category are copied
// through as-is and only get resolved when the converted file is actually
// imported (`npm run import -- --model Subject --file <output>`).
//
// Usage:
//   tsx scripts/convert-products-csv.ts --input ./products.csv --output ./data/subjects-converted.csv

import fs from "node:fs";
import { parse } from "csv-parse/sync";

const DELIMITER = ";";

// Subject's full CSV shape (prisma/import/adapters/subjects.ts's
// EXPECTED_COLUMNS) - every one of these must be present as a header in the
// output, even when left empty, or header validation rejects the whole file.
const TARGET_COLUMNS = [
  "name",
  "serial_number",
  "type",
  "description",
  "short_description",
  "category",
  "competitors",
  "vendors",
  "fun_fact",
  "organization_name",
  "website_url",
  "logo_url",
  "tags",
  "score",
  "industries",
];

// Raw column name -> target column name. Only covers the headers seen in
// the sample file; run with --map-only first if your source has different
// headers and this needs adjusting.
const COLUMN_MAP: Record<string, string> = {
  "Name of product": "name",
  "Serial Number": "serial_number",
  "Product Type": "type",
  Description: "description",
  Competitors: "competitors",
  "Fun Fact": "fun_fact",
  Company: "organization_name",
  Industries: "industries",
};

// Raw headers with no equivalent column on Subject today - dropped, but
// flagged so the data isn't silently lost without a trace.
const KNOWN_UNMAPPED = new Set(["Type"]);

function csvEscape(value: string): string {
  if (value.includes(DELIMITER) || value.includes('"') || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseArgs(argv: string[]) {
  const args: { input?: string; output?: string } = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--input") args.input = argv[++i];
    else if (argv[i] === "--output") args.output = argv[++i];
  }
  if (!args.input || !args.output) {
    throw new Error("Usage: tsx scripts/convert-products-csv.ts --input <fichier.csv> --output <fichier.csv>");
  }
  return args as { input: string; output: string };
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  const raw = fs.readFileSync(args.input, "utf8");
  const rows: Record<string, string>[] = parse(raw, { columns: true, bom: true, skip_empty_lines: true });
  if (rows.length === 0) {
    console.log("Fichier source vide, rien à convertir.");
    return;
  }

  const sourceColumns = Object.keys(rows[0]!);
  const unrecognized = sourceColumns.filter((c) => !COLUMN_MAP[c] && !KNOWN_UNMAPPED.has(c));
  if (unrecognized.length > 0) {
    console.warn(
      `Colonnes source non reconnues (ignorées - ajouter à COLUMN_MAP si besoin): ${unrecognized.join(", ")}`,
    );
  }
  const dropped = sourceColumns.filter((c) => KNOWN_UNMAPPED.has(c));
  if (dropped.length > 0) {
    console.warn(`Colonnes sans équivalent sur Subject (ignorées): ${dropped.join(", ")}`);
  }

  const lines = [TARGET_COLUMNS.map(csvEscape).join(DELIMITER)];
  for (const row of rows) {
    const out: Record<string, string> = Object.fromEntries(TARGET_COLUMNS.map((c) => [c, ""]));
    for (const [sourceCol, value] of Object.entries(row)) {
      const targetCol = COLUMN_MAP[sourceCol];
      if (targetCol) out[targetCol] = (value ?? "").trim();
    }
    lines.push(TARGET_COLUMNS.map((c) => csvEscape(out[c] ?? "")).join(DELIMITER));
  }

  fs.writeFileSync(args.output, lines.join("\n") + "\n", "utf-8");
  console.log(`${rows.length} ligne(s) converties -> ${args.output}`);
  console.log(
    `Rappel: "category" n'a pas de source dans le fichier brut - laissé vide (classé dans OTHER à l'import). ` +
      `Vérifier aussi les valeurs de "industries"/"organization_name" contre la base avant --commit.`,
  );
}

main();
