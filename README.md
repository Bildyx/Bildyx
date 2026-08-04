# Bildyx

## 0. Clone project (if necessary)

```bash
git clone https://github.com/Bildyx/Bildyx.git
cd Bildyx
```

## 1. Install dependencies

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install
```

## 2. Generate the prisma schema

```bash
npm run db:pull
npm run db:generate
```

## 3. Configure the environment

Copy the template `.env.example` to `apps/api/.env` and update the database and key configurations:

```bash
cp .env.example apps/api/.env
```

## 4. Run the applications concurrently (via Turborepo)

From the root of the project, you can now run both the backend API and the frontend website concurrently using Turborepo:

```bash
npm run dev
```

- API will start on: http://localhost:3000
- Website will start on: http://localhost:8000 (PHP server)

# 5. Database

All commands below run from `apps/api`, unless noted otherwise.

## 5.1 Schema & migrations

| Command                                       | Effect                                                                                                                                                                                            |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx prisma validate`                         | Checks `schema.prisma` is syntactically valid (offline)                                                                                                                                           |
| `npx prisma generate`                         | Regenerates the Prisma client in `node_modules/@prisma/client` — rerun after any schema change or `npm install`                                                                                   |
| `npx prisma migrate dev`                      | Creates a new migration from the schema diff and applies it (dev only)                                                                                                                            |
| `npx prisma migrate deploy`                   | Applies pending migrations without creating one — prod/CI usage                                                                                                                                   |
| `npx prisma migrate status`                   | Compares the database state against the available migrations                                                                                                                                      |
| `npx prisma migrate reset [--skip-seed] [-f]` | **Destructive**: drops the entire `public` schema, recreates it, replays every migration. `--skip-seed` skips `prisma/seed.ts` (partial, legacy ingestion path — `import` below is authoritative) |
| `npm run db:check-drift`                      | Offline check (PGlite, no real database) that the migrations produce exactly `schema.prisma` — run before any risky operation                                                                     |
| `npm run db:pull`                             | Introspects the real database and rewrites `schema.prisma` from it (reverse direction, rarely used here)                                                                                          |
| `npm run db:types`                            | Regenerates `src/db/types.ts` (Kysely types) from the real database — required after a schema change for the API layer to compile                                                                 |

## 5.2 CSV → database import (the authoritative path)

| Command                                                                              | Effect                                                                                                                             |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `npm run import -- --all`                                                            | Dry run over the 10 CSVs in `data/`, in dependency order. Nothing is written                                                       |
| `npm run import -- --all --commit`                                                   | Real import                                                                                                                        |
| `npm run import -- --model Country --file ../data/countries.csv [--commit]`          | Import a single model                                                                                                              |
| `npm run import -- --all --commit --allow-partial`                                   | Imports valid rows, quarantines the rest instead of rejecting the whole file                                                       |
| `npm run import -- --all --commit --prune`                                           | Soft-deletes (`deletedAt`) keys previously imported but now absent from the file — refused past 20% orphans unless `--force-prune` |
| `npm run db:export` (= `tsx scripts/export-current-data.ts --spec ... --output ...`) | Exports the database's current content to CSV — see the round-trip workflow below                                                  |

On a freshly reset (empty) database, run `--all --commit` directly rather than dry-running first: a pure dry run never writes between models, so cross-model foreign keys (e.g. `City.country_id`) will show as unresolved purely because the upstream model hasn't actually landed in the database yet — that's expected, not a bug.

## 5.3 Excel templates (generation and full round-trip with the database)

| Command                                                          | Effect                                                                                                                                               |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `python3 scripts/generate_excel_templates.py`                    | Generates one blank `.xlsx` per reference model into `data/excel_templates/`                                                                         |
| `python3 scripts/generate_excel_templates.py --force`            | Overwrites existing templates (wipes their data!)                                                                                                    |
| `python3 scripts/generate_excel_templates.py --protect-existing` | Re-applies protection/validation to already-filled templates, **without touching the data** — use after a minor schema change (new enum value, etc.) |
| `python3 scripts/excel_to_csv.py [--force]`                      | Converts `data/excel_templates/*.xlsx` → `data/*.csv`. Refuses by default if it would shrink an existing CSV (data-loss guardrail)                   |

**Download templates pre-filled with the database's current data**:

```bash
python3 scripts/generate_excel_templates.py --dump-spec ./template-spec.json
npx tsx scripts/export-current-data.ts --spec ./template-spec.json --output ./data/exports
python3 scripts/generate_excel_templates.py --populate-from-db ./data/exports
```

The third command implies `--force` and regenerates `data/excel_templates/*.xlsx` filled with the database's real content, ready to download/edit.

## 5.4 Misc

| Command                               | Effect                                                                                                           |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `npm run seed`                        | Minimal test seed (`src/seed.ts`) — 1 organization, 2 certifications. Not for reference data                     |
| `npm run seed:reference`              | Legacy seeder (`prisma/seed.ts`) — partial, superseded by `npm run import`                                       |
| `npm run seed:personality -- --check` | Offline validation of the personality-questionnaire JSON (`prisma/seeds/personality/*.json`), no database needed |
| `npm run seed:personality`            | Actually inserts the questionnaire content into the database                                                     |
| `npm test`                            | Full test suite (PGlite, offline)                                                                                |

## 5.5 Typical sequence for a fresh database

```bash
npm install && npx prisma generate
npm run db:check-drift
npx prisma migrate reset --skip-seed
npx prisma migrate status
npm run import -- --all --commit
npm run import -- --all              # should plan 0 creates (idempotence check)
npm run db:types
```
