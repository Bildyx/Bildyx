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

## 3. Start the API

```bash
cd apps/api
npm run dev
```

L'API sera accessible via l'url : http://localhost:3000/

## 4. Start the website

```bash
cd apps/website
php -S localhost:8000
```

Le site sera accessible via l'url : http://localhost:8000/

# Import script testing

1. Full dry run (no writes, just a report)
cd apps/api
npx tsx scripts/import.ts --all
This reads all the CSV files in `data/`, resolves foreign keys against your actual database (read-only), and displays for each model: how many rows would be created, updated, remain unchanged, or result in errors, plus any warnings (unrecognized enum values, unresolved foreign keys, etc.). Nothing is written to disk until you run `--commit`.

2. One model, one file
npx tsx scripts/import.ts --model Organization --file data/organizations.csv
Useful for verifying that the 4 restored rows (8kSec, ACI, Adobe, Adobe (Magento)) are correctly recognized.

3. For real (written to the database)
npx tsx scripts/import.ts --all --commit
This is where the critical fix (upsert instead of create) really matters: before, it would have crashed on the first unique key collision since `ImportRowHash` is empty in your database even though it already contains data. Now it should run smoothly.

4. Automated tests
npx tsx --test src/tests/import_diff.test.ts
17 tests, no database required (pure logic).

Useful options: --allow-partial to import valid rows and set aside those with errors rather than rejecting the entire file; --prune to mark as deleted keys that were imported previously but are now missing from the file (off by default; use with caution given the case-sensitivity bug on `Country` that we just fixed).
