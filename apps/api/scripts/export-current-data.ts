#!/usr/bin/env -S npx tsx
// Reads the field spec produced by:
//   python3 generate_excel_templates.py --dump-spec ./template-spec.json
// and exports the CURRENT content of every reference-data model into one
// ";"-delimited CSV per model, using the exact column names/order the Excel
// templates expect - natural keys resolved instead of raw UUID foreign
// keys, ";"-joined values for list/M2M columns. No per-model field list is
// hardcoded here: everything is driven by the spec, so schema changes only
// ever need updating in one place (schema.prisma + the Python parser).
//
// Feed the output directory straight into:
//   python3 generate_excel_templates.py --populate-from-db ./data/exports
// to produce pre-filled, ready-to-download Excel templates.
//
// Usage:
//   tsx scripts/export-current-data.ts --spec ./template-spec.json --output ./data/exports

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const DELIMITER = ";";
const LIST_JOIN = ";";

interface FieldSpec {
  column: string; // CSV / template header
  fieldName: string; // Prisma field name on the model
  kind: "scalar" | "list" | "fk" | "m2m";
  targetNaturalKeyField?: string; // present for kind "fk" | "m2m"
}

interface ModelSpec {
  prismaModel: string; // e.g. "industry", "studyFields"
  tableName: string; // matches "<tableName>.csv"
  // null for a model with no soft-delete column in the live schema (see
  // ImportAdapter.deletedAtField) - every reference model except
  // StudyFields today.
  deletedAtField: string | null;
  fields: FieldSpec[];
}

type TemplateSpec = Record<string, ModelSpec>; // keyed by Prisma model name

function csvEscape(value: string): string {
  if (
    value.includes(DELIMITER) ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function scalarToCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "object") return JSON.stringify(value); // Json fields
  return String(value);
}

// Builds the Prisma `select` object for a model purely from its spec:
// scalars/lists select themselves directly; fk/m2m only ever pull the
// target's natural key, never the raw id - so a UUID can't accidentally
// leak into an exported CSV even if the spec were mis-generated.
function buildSelect(spec: ModelSpec): Record<string, unknown> {
  const select: Record<string, unknown> = {};
  for (const f of spec.fields) {
    if (f.kind === "scalar" || f.kind === "list") {
      select[f.fieldName] = true;
    } else {
      select[f.fieldName] = { select: { [f.targetNaturalKeyField!]: true } };
    }
  }
  return select;
}

function flattenRow(row: Record<string, any>, spec: ModelSpec): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of spec.fields) {
    const raw = row[f.fieldName];
    if (f.kind === "scalar") {
      out[f.column] = scalarToCsv(raw);
    } else if (f.kind === "list") {
      out[f.column] = (raw ?? []).map(scalarToCsv).join(LIST_JOIN);
    } else if (f.kind === "fk") {
      out[f.column] = raw ? scalarToCsv(raw[f.targetNaturalKeyField!]) : "";
    } else if (f.kind === "m2m") {
      out[f.column] = (raw ?? [])
        .map((r: Record<string, unknown>) => scalarToCsv(r[f.targetNaturalKeyField!]))
        .join(LIST_JOIN);
    }
  }
  return out;
}

function writeCsv(filePath: string, header: string[], rows: Record<string, string>[]) {
  const lines = [header.map(csvEscape).join(DELIMITER)];
  for (const row of rows) {
    lines.push(header.map((col) => csvEscape(row[col] ?? "")).join(DELIMITER));
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, lines.join("\n") + "\n", "utf-8");
}

function parseArgs(argv: string[]) {
  const args = { spec: "./template-spec.json", output: "./data/exports" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--spec") args.spec = argv[++i]!;
    else if (argv[i] === "--output") args.output = argv[++i]!;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const spec: TemplateSpec = JSON.parse(fs.readFileSync(args.spec, "utf-8"));
  const prisma = new PrismaClient();

  try {
    for (const [modelName, modelSpec] of Object.entries(spec)) {
      const delegate = (prisma as any)[modelSpec.prismaModel];
      if (!delegate) {
        console.warn(`Skipping ${modelName}: no Prisma delegate "${modelSpec.prismaModel}"`);
        continue;
      }

      const select = buildSelect(modelSpec);
      const where = modelSpec.deletedAtField ? { [modelSpec.deletedAtField]: null } : {};

      const rows = await delegate.findMany({ where, select });
      const header = modelSpec.fields.map((f) => f.column);
      const data = rows.map((r: Record<string, unknown>) => flattenRow(r, modelSpec));

      const outPath = path.join(args.output, `${modelSpec.tableName}.csv`);
      writeCsv(outPath, header, data);
      console.log(`${modelName} -> ${outPath} (${data.length} lignes)`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("Export échoué:", e);
  process.exit(1);
});
