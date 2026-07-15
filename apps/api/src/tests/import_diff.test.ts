import { test, describe } from "node:test";
import assert from "node:assert";

import { computeRowHash } from "../../prisma/import/hash";
import { validateHeader, findDuplicateNaturalKeys } from "../../prisma/import/validate";
import { classifyRow } from "../../prisma/import/diff";
import { checkRequiredFk } from "../../prisma/import/checks";
import { planImport } from "../../prisma/import/plan";
import type { CsvRow, ImportAdapter, MappedRow } from "../../prisma/import/types";

// Minimal synthetic adapter (no PrismaClient involved) exercising the same
// contract every real adapter (apps/api/prisma/import/adapters/*.ts)
// implements: a required FK, an optional business column, and a natural
// key. This is what makes the whole diff/validation engine testable
// without a live database - only run.ts (the thin Prisma execution layer)
// actually needs one.
const EXPECTED_COLUMNS = ["code", "name", "category_id"];

interface WidgetFk {
  validCategoryIds: Set<string>;
}

const widgetAdapter: ImportAdapter<CsvRow, WidgetFk> = {
  modelName: "Widget",
  prismaModel: "widget",
  csvFile: "widgets.csv",
  naturalKeyColumn: "code",
  naturalKeyField: "code",
  deletedAtField: "deletedAt",
  expectedColumns: EXPECTED_COLUMNS,

  async buildFkContext() {
    return { validCategoryIds: new Set(["cat-a", "cat-b"]) };
  },

  mapRow(row, _rowIndex, fk): MappedRow {
    const errors = [];
    const code = (row.code ?? "").trim();

    const categoryCheck = checkRequiredFk(
      row.category_id,
      (raw) => (raw && fk.validCategoryIds.has(raw.trim()) ? raw.trim() : null),
      "category_id",
    );
    if (categoryCheck.issue) errors.push(categoryCheck.issue);

    return {
      naturalKey: code,
      data: { code, name: row.name ?? "", categoryId: categoryCheck.value },
      errors,
      warnings: [],
    };
  },
};

function toHashMap(rows: { naturalKey: string; rowHash: string }[]): Map<string, string> {
  return new Map(rows.map((r) => [r.naturalKey, r.rowHash]));
}

describe("import hash", () => {
  test("same business columns -> same hash regardless of column order", () => {
    const a = computeRowHash({ code: "W1", name: "Widget 1", category_id: "cat-a" }, EXPECTED_COLUMNS);
    const b = computeRowHash({ category_id: "cat-a", code: "W1", name: "Widget 1" }, EXPECTED_COLUMNS);
    assert.strictEqual(a, b);
  });

  test("a changed business column changes the hash", () => {
    const a = computeRowHash({ code: "W1", name: "Widget 1", category_id: "cat-a" }, EXPECTED_COLUMNS);
    const b = computeRowHash({ code: "W1", name: "Widget 1 renamed", category_id: "cat-a" }, EXPECTED_COLUMNS);
    assert.notStrictEqual(a, b);
  });
});

describe("import header validation", () => {
  test("rejects a file missing an expected column", () => {
    const result = validateHeader(["code", "name"], EXPECTED_COLUMNS);
    assert.strictEqual(result.ok, false);
    assert.deepStrictEqual(result.missing, ["category_id"]);
  });

  test("ignores trailing blank-named columns from stray semicolons", () => {
    const result = validateHeader(["code", "name", "category_id", "", ""], EXPECTED_COLUMNS);
    assert.strictEqual(result.ok, true);
  });

  test("flags an unexpected extra column", () => {
    const result = validateHeader(["code", "name", "category_id", "legacy_type"], EXPECTED_COLUMNS);
    assert.strictEqual(result.ok, false);
    assert.deepStrictEqual(result.extra, ["legacy_type"]);
  });
});

describe("import diff classification", () => {
  test("unknown natural key classifies as insert", () => {
    assert.strictEqual(classifyRow("W1", "hash-1", new Map()), "insert");
  });

  test("known natural key with a different hash classifies as update", () => {
    const existing = new Map([["W1", "hash-old"]]);
    assert.strictEqual(classifyRow("W1", "hash-new", existing), "update");
  });

  test("known natural key with the same hash classifies as skip", () => {
    const existing = new Map([["W1", "hash-1"]]);
    assert.strictEqual(classifyRow("W1", "hash-1", existing), "skip");
  });
});

describe("planImport (full engine, no DB)", () => {
  const header = EXPECTED_COLUMNS;
  const fk: WidgetFk = { validCategoryIds: new Set(["cat-a", "cat-b"]) };

  const baseRows: CsvRow[] = [
    { code: "W1", name: "Widget 1", category_id: "cat-a" },
    { code: "W2", name: "Widget 2", category_id: "cat-b" },
  ];

  test("desynced header rejects the whole file, no rows planned", () => {
    const badHeader = ["code", "name"]; // missing category_id
    const plan = planImport(badHeader, baseRows, widgetAdapter, fk, new Map());

    assert.ok(plan.headerError);
    assert.deepStrictEqual(plan.headerError!.missing, ["category_id"]);
    assert.strictEqual(plan.toInsert.length, 0);
    assert.strictEqual(plan.toUpdate.length, 0);
  });

  test("first import of a fresh file plans every row as an insert", () => {
    const plan = planImport(header, baseRows, widgetAdapter, fk, new Map());

    assert.strictEqual(plan.headerError, null);
    assert.strictEqual(plan.toInsert.length, 2);
    assert.strictEqual(plan.toUpdate.length, 0);
    assert.strictEqual(plan.unchanged.length, 0);
    assert.strictEqual(plan.rowErrors.length, 0);
  });

  test("idempotence: reimporting the exact same file plans zero writes", () => {
    const firstPlan = planImport(header, baseRows, widgetAdapter, fk, new Map());
    const existingHashes = toHashMap(firstPlan.toInsert);

    const secondPlan = planImport(header, baseRows, widgetAdapter, fk, existingHashes);

    assert.strictEqual(secondPlan.toInsert.length, 0);
    assert.strictEqual(secondPlan.toUpdate.length, 0);
    assert.strictEqual(secondPlan.unchanged.length, baseRows.length);
    assert.strictEqual(secondPlan.rowErrors.length, 0);
  });

  test("a modified row is planned as a targeted update, siblings stay unchanged", () => {
    const firstPlan = planImport(header, baseRows, widgetAdapter, fk, new Map());
    const existingHashes = toHashMap(firstPlan.toInsert);

    const modifiedRows: CsvRow[] = [
      { code: "W1", name: "Widget 1 (renamed)", category_id: "cat-a" },
      { code: "W2", name: "Widget 2", category_id: "cat-b" },
    ];

    const plan = planImport(header, modifiedRows, widgetAdapter, fk, existingHashes);

    assert.strictEqual(plan.toUpdate.length, 1);
    assert.strictEqual(plan.toUpdate[0]!.naturalKey, "W1");
    assert.strictEqual(plan.unchanged.length, 1);
    assert.deepStrictEqual(plan.unchanged, ["W2"]);
    assert.strictEqual(plan.toInsert.length, 0);
  });

  test("a brand new row alongside untouched ones is planned as an insert only for itself", () => {
    const firstPlan = planImport(header, baseRows, widgetAdapter, fk, new Map());
    const existingHashes = toHashMap(firstPlan.toInsert);

    const rowsWithNewOne: CsvRow[] = [
      ...baseRows,
      { code: "W3", name: "Widget 3", category_id: "cat-a" },
    ];

    const plan = planImport(header, rowsWithNewOne, widgetAdapter, fk, existingHashes);

    assert.strictEqual(plan.toInsert.length, 1);
    assert.strictEqual(plan.toInsert[0]!.naturalKey, "W3");
    assert.strictEqual(plan.unchanged.length, 2);
  });

  test("a missing required FK rejects only that row, with a clear reason", () => {
    const rowsWithBadFk: CsvRow[] = [
      { code: "W1", name: "Widget 1", category_id: "cat-a" },
      { code: "W2", name: "Widget 2", category_id: "does-not-exist" },
    ];

    const plan = planImport(header, rowsWithBadFk, widgetAdapter, fk, new Map());

    assert.strictEqual(plan.toInsert.length, 1);
    assert.strictEqual(plan.toInsert[0]!.naturalKey, "W1");
    assert.strictEqual(plan.rowErrors.length, 1);
    assert.strictEqual(plan.rowErrors[0]!.naturalKey, "W2");
    assert.strictEqual(plan.rowErrors[0]!.column, "category_id");
    assert.match(plan.rowErrors[0]!.message, /category_id/);
  });

  test("a required FK left empty is also rejected (not silently nulled)", () => {
    const rowsWithMissingFk: CsvRow[] = [{ code: "W1", name: "Widget 1", category_id: "" }];

    const plan = planImport(header, rowsWithMissingFk, widgetAdapter, fk, new Map());

    assert.strictEqual(plan.toInsert.length, 0);
    assert.strictEqual(plan.rowErrors.length, 1);
    assert.match(plan.rowErrors[0]!.message, /requise/);
  });

  test("duplicate natural keys within the same file are rejected, not silently overwritten", () => {
    const duplicateRows: CsvRow[] = [
      { code: "W1", name: "Widget 1", category_id: "cat-a" },
      { code: "W1", name: "Widget 1 duplicate", category_id: "cat-b" },
    ];

    const plan = planImport(header, duplicateRows, widgetAdapter, fk, new Map());

    assert.strictEqual(plan.toInsert.length, 0);
    assert.strictEqual(plan.rowErrors.length, 2);
    assert.deepStrictEqual(findDuplicateNaturalKeys(duplicateRows, "code").get("W1"), [1, 2]);
  });

  test("a natural key present in prior imports but absent from the file is reported as an orphan, never written", () => {
    const existingHashes = new Map([
      ["W1", computeRowHash(baseRows[0]!, EXPECTED_COLUMNS)],
      ["W2", computeRowHash(baseRows[1]!, EXPECTED_COLUMNS)],
      ["W-gone", "some-old-hash"],
    ]);

    const plan = planImport(header, baseRows, widgetAdapter, fk, existingHashes);

    assert.deepStrictEqual(plan.orphans, ["W-gone"]);
    assert.strictEqual(plan.toInsert.length, 0);
    assert.strictEqual(plan.toUpdate.length, 0);
  });
});
