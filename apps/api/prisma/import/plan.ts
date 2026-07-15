import { computeRowHash } from "./hash";
import { findDuplicateNaturalKeys, validateHeader } from "./validate";
import { classifyRow, findOrphans } from "./diff";
import type { CsvRow, ImportAdapter, RowIssue } from "./types";

export interface PlannedRow<Row = CsvRow> {
  naturalKey: string;
  rowHash: string;
  data: Record<string, unknown>;
  // Raw CSV row, kept around for adapters whose afterUpsert hook needs a
  // value that isn't itself a Prisma field (e.g. Organization's
  // parent_organization_id, resolved only after every row has been
  // written).
  row: Row;
}

export interface ImportPlan<Row = CsvRow> {
  modelName: string;
  // Set when the header itself is structurally wrong - every other field is
  // empty in that case, since per-row validation is meaningless against the
  // wrong set of columns.
  headerError: { missing: string[]; extra: string[] } | null;
  duplicateNaturalKeys: Map<string, number[]>;
  toInsert: PlannedRow<Row>[];
  toUpdate: PlannedRow<Row>[];
  unchanged: string[];
  orphans: string[];
  rowErrors: RowIssue[];
  rowWarnings: RowIssue[];
}

function emptyPlan<Row>(
  modelName: string,
  headerError: ImportPlan<Row>["headerError"],
): ImportPlan<Row> {
  return {
    modelName,
    headerError,
    duplicateNaturalKeys: new Map(),
    toInsert: [],
    toUpdate: [],
    unchanged: [],
    orphans: [],
    rowErrors: [],
    rowWarnings: [],
  };
}

// Pure: given the already-loaded CSV, an adapter's per-model mapping logic,
// an already-resolved FK context, and the previously stored hashes, decides
// exactly what would be inserted/updated/skipped/rejected. No DB access
// happens in here, which is what makes idempotence, insert/update
// detection, and validation behavior unit-testable without a live
// database.
export function planImport<Row extends CsvRow, Fk>(
  header: string[],
  rows: Row[],
  adapter: Pick<
    ImportAdapter<Row, Fk>,
    "modelName" | "naturalKeyColumn" | "expectedColumns" | "mapRow"
  >,
  fkContext: Fk,
  existingHashes: Map<string, string>,
): ImportPlan<Row> {
  const headerCheck = validateHeader(header, adapter.expectedColumns);
  if (!headerCheck.ok) {
    return emptyPlan<Row>(adapter.modelName, {
      missing: headerCheck.missing,
      extra: headerCheck.extra,
    });
  }

  const plan = emptyPlan<Row>(adapter.modelName, null);
  plan.duplicateNaturalKeys = findDuplicateNaturalKeys(
    rows,
    adapter.naturalKeyColumn,
  );

  const currentNaturalKeys = new Set<string>();

  rows.forEach((row, index) => {
    const rowNumber = index + 1;
    const naturalKey = (row[adapter.naturalKeyColumn] ?? "").trim();

    if (naturalKey) currentNaturalKeys.add(naturalKey);

    if (plan.duplicateNaturalKeys.has(naturalKey)) {
      plan.rowErrors.push({
        row: rowNumber,
        naturalKey,
        column: adapter.naturalKeyColumn,
        message: `clé naturelle "${naturalKey}" dupliquée dans le fichier (lignes ${plan.duplicateNaturalKeys
          .get(naturalKey)!
          .join(", ")})`,
      });
      return;
    }

    const mapped = adapter.mapRow(row, rowNumber, fkContext);

    for (const issue of mapped.errors) {
      plan.rowErrors.push({ ...issue, row: rowNumber, naturalKey });
    }
    for (const issue of mapped.warnings) {
      plan.rowWarnings.push({ ...issue, row: rowNumber, naturalKey });
    }

    if (mapped.errors.length > 0) return;

    const rowHash = computeRowHash(row, adapter.expectedColumns);
    const action = classifyRow(mapped.naturalKey, rowHash, existingHashes);
    const planned: PlannedRow<Row> = {
      naturalKey: mapped.naturalKey,
      rowHash,
      data: mapped.data,
      row,
    };

    if (action === "insert") plan.toInsert.push(planned);
    else if (action === "update") plan.toUpdate.push(planned);
    else plan.unchanged.push(mapped.naturalKey);
  });

  plan.orphans = findOrphans(currentNaturalKeys, existingHashes);

  return plan;
}
