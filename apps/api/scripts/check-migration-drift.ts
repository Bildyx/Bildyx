#!/usr/bin/env -S npx tsx
// Checks that the migration chain produces exactly the database described by
// schema.prisma.
//
// Until now nothing guaranteed it: src/tests/setup.ts generates its
// schema.sql via `prisma migrate diff --from-empty --to-schema-datamodel`,
// so the tests run against the *datamodel* and never touch the hand-written
// migrations. A wrong or forgotten migration went unnoticed until
// deployment.
//
// Runs 100% offline via PGlite (already used by the test suite), so it is
// executable in CI without a Postgres service:
//   A = database obtained by replaying prisma/migrations/ in order
//   B = database obtained by applying the DDL derived from schema.prisma
// then a comparison of information_schema (columns, types, nullability,
// defaults) and of the indexes/constraints.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.resolve(__dirname, "..");
const migrationsDir = path.join(apiDir, "prisma", "migrations");

interface ColumnRow {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

interface IndexRow {
  tablename: string;
  indexname: string;
  indexdef: string;
}

async function applySql(db: PGlite, sql: string, label: string): Promise<void> {
  try {
    await db.exec(sql);
  } catch (e) {
    throw new Error(`Échec de ${label}: ${(e as Error).message}`);
  }
}

async function buildFromMigrations(): Promise<PGlite> {
  const db = new PGlite();
  const dirs = fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  for (const dir of dirs) {
    const file = path.join(migrationsDir, dir, "migration.sql");
    if (!fs.existsSync(file)) continue;
    await applySql(db, fs.readFileSync(file, "utf8"), `la migration ${dir}`);
  }
  return db;
}

async function buildFromDatamodel(): Promise<PGlite> {
  const sql = execFileSync(
    "npx",
    [
      "prisma",
      "migrate",
      "diff",
      "--from-empty",
      "--to-schema-datamodel",
      "prisma/schema.prisma",
      "--script",
    ],
    { cwd: apiDir, encoding: "utf-8", env: { ...process.env, CHECKPOINT_DISABLE: "1" } },
  );

  const db = new PGlite();
  await applySql(db, sql, "le DDL dérivé de schema.prisma");
  return db;
}

async function readColumns(db: PGlite): Promise<Map<string, ColumnRow>> {
  const res = await db.query<ColumnRow>(`
    SELECT table_name, column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, column_name
  `);
  return new Map(res.rows.map((r) => [`${r.table_name}.${r.column_name}`, r]));
}

async function readIndexes(db: PGlite): Promise<Map<string, string>> {
  const res = await db.query<IndexRow>(`
    SELECT tablename, indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname
  `);
  return new Map(res.rows.map((r) => [r.indexname, r.indexdef]));
}

async function readForeignKeys(db: PGlite): Promise<Set<string>> {
  const res = await db.query<{ def: string }>(`
    SELECT conrelid::regclass || ' ' || conname || ' ' || pg_get_constraintdef(oid) AS def
    FROM pg_constraint
    WHERE connamespace = 'public'::regnamespace AND contype = 'f'
    ORDER BY 1
  `);
  return new Set(res.rows.map((r) => r.def));
}

function reportSetDiff(label: string, fromMig: Set<string>, fromModel: Set<string>): number {
  const onlyMig = [...fromMig].filter((x) => !fromModel.has(x));
  const onlyModel = [...fromModel].filter((x) => !fromMig.has(x));
  for (const x of onlyMig) console.error(`  ${label} présent après migrations mais absent du datamodel: ${x}`);
  for (const x of onlyModel) console.error(`  ${label} attendu par le datamodel mais absent des migrations: ${x}`);
  return onlyMig.length + onlyModel.length;
}

async function main() {
  console.log("Rejeu des migrations…");
  const migDb = await buildFromMigrations();
  console.log("Construction depuis schema.prisma…");
  const modelDb = await buildFromDatamodel();

  let problems = 0;

  const migCols = await readColumns(migDb);
  const modelCols = await readColumns(modelDb);
  problems += reportSetDiff("Colonne", new Set(migCols.keys()), new Set(modelCols.keys()));

  for (const [key, a] of migCols) {
    const b = modelCols.get(key);
    if (!b) continue;
    const diffs: string[] = [];
    if (a.data_type !== b.data_type) diffs.push(`type ${a.data_type} vs ${b.data_type}`);
    if (a.is_nullable !== b.is_nullable) diffs.push(`nullable ${a.is_nullable} vs ${b.is_nullable}`);
    if ((a.column_default ?? "") !== (b.column_default ?? "")) {
      diffs.push(`défaut ${a.column_default ?? "∅"} vs ${b.column_default ?? "∅"}`);
    }
    if (diffs.length) {
      console.error(`  Colonne ${key} diverge (migrations vs datamodel): ${diffs.join(", ")}`);
      problems += diffs.length;
    }
  }

  const migIdx = await readIndexes(migDb);
  const modelIdx = await readIndexes(modelDb);
  problems += reportSetDiff("Index", new Set(migIdx.keys()), new Set(modelIdx.keys()));
  for (const [name, def] of migIdx) {
    const other = modelIdx.get(name);
    if (other && other !== def) {
      console.error(`  Index ${name} diverge:\n    migrations: ${def}\n    datamodel : ${other}`);
      problems++;
    }
  }

  problems += reportSetDiff("Clé étrangère", await readForeignKeys(migDb), await readForeignKeys(modelDb));

  await migDb.close();
  await modelDb.close();

  if (problems > 0) {
    console.error(`\n${problems} divergence(s) entre prisma/migrations/ et prisma/schema.prisma.`);
    process.exit(1);
  }
  console.log("\nAucune dérive : les migrations reproduisent exactement schema.prisma.");
}

main().catch((e) => {
  console.error("Contrôle de dérive échoué:", e);
  process.exit(1);
});
