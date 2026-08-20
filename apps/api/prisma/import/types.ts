import type { PrismaClient } from "@prisma/client";

export type CsvRow = Record<string, string | undefined>;

export interface RowIssue {
  // 1-based index within the CSV's data rows (excluding the header line).
  row: number;
  naturalKey?: string;
  column?: string;
  message: string;
}

export interface MappedRow {
  naturalKey: string;
  // Ready-to-write Prisma create/update input, including the natural key
  // field itself.
  data: Record<string, unknown>;
  errors: RowIssue[];
  warnings: RowIssue[];
}

// An implicit many-to-many relation exposed as a text column in the
// CSV/template.
export interface M2mColumn {
  // CSV column name (e.g. "industries", "main_industries").
  column: string;
  // Prisma relation field on the current model (e.g. "mainIndustries").
  relationField: string;
  // PrismaClient delegate of the target model (e.g. "industry", "country").
  targetModel: string;
  // Field of the target model the cell refers to, compared
  // case-insensitively (e.g. "name" for Industry, "isoCode" for
  // Country).
  targetLookupField: string;
  // Second field accepted for the same cell, tried only if the value matches
  // no targetLookupField. The `countries` column of organizations.csv is
  // filled with country names ("France") whereas the contract expects an ISO
  // code: without this fallback, none of the organization<->country links
  // were set.
  targetAltLookupField?: string;
  // Unique field of the target model to use in the Prisma `connect`
  // (e.g. "id" for Industry/City, "isoCode" for Country).
  targetConnectField: string;
}

// Fk is whatever per-model lookup context (e.g. name->id maps) a model's
// mapRow needs to resolve its foreign keys; built once per import batch by
// buildFkContext so mapRow itself stays a pure function.
export interface ImportAdapter<Row extends CsvRow = CsvRow, Fk = unknown> {
  modelName: string;
  // Lowercased PrismaClient delegate name (e.g. "industry", "studyFields").
  prismaModel: string;
  csvFile: string;
  // CSV header name carrying the natural key (e.g. "iso_code", "slug").
  naturalKeyColumn: string;
  // Prisma field name for the same natural key (used in `where` clauses).
  naturalKeyField: string;
  // Optional: normalizes the raw, trimmed CSV natural-key value the same way
  // mapRow will before using it for hashing/DB writes (e.g. Country.isoCode
  // is upper-cased and truncated to 2 chars in mapRow). plan.ts's
  // duplicate-detection and orphan-tracking run before mapRow is called and
  // must agree with what mapRow actually produces, or they can miss real
  // duplicates / misreport orphans purely due to casing. Defaults to the
  // identity function, which is correct for every adapter except Country.
  normalizeNaturalKey?: (raw: string) => string;
  // Prisma field name for the model's soft-delete timestamp, used by
  // --prune only (see run.ts). Only StudyFields actually has one
  // ("deleted_at") in the live schema today: the other reference models were
  // scoped for a soft-delete column (see updates/schema.prisma) that never
  // shipped. Omit for a model with no such column - run.ts then reports
  // --prune as unsupported for it instead of crashing on an unknown Prisma
  // argument.
  deletedAtField?: string;
  // Exact set of business columns the current schema/template expects,
  // mirroring what generate_excel_templates.py would produce (business
  // scalar fields + M2M free-text columns). Used for header validation and
  // as the row-hash input.
  expectedColumns: string[];
  // Columns some real CSV/Excel files carry (e.g. "metadata", or
  // Organization's "project"/"offices"/"partners"/"subsidiaries") that have
  // no matching column in the live schema yet - they were scoped for the
  // same pending soft-delete/metadata extension as deletedAtField above (see
  // updates/schema.prisma). Tolerated whether present or absent in the
  // header (never reported as missing or extra), always ignored by mapRow:
  // this keeps both the legacy filled-in files and a freshly generated,
  // schema-driven template (which won't have these columns) importable.
  legacyColumns?: string[];
  // Implicit many-to-many relations, carried in the CSV by a ";"-separated
  // text column (see M2M_COLUMNS in
  // scripts/generate_excel_templates.py).
  //
  // These columns were declared in expectedColumns - hence accepted by header
  // validation - but NO adapter ever wrote them: the import engine simply
  // ignored every M2M relation, which only the legacy seeds_relations.ts knew
  // how to set. Declared here, they are applied generically by run.ts after
  // the rows are written (see applyM2mLinks).
  m2mColumns?: M2mColumn[];
  buildFkContext: (prisma: PrismaClient, rows: Row[]) => Promise<Fk>;
  mapRow: (row: Row, rowIndex: number, fk: Fk) => MappedRow;
  // Optional second pass after every insert/update of this model has been
  // written. Only Organization needs this today, for
  // its self-referencing parentOrganizationId: inserting a child with its
  // parent's id set before the parent row exists would violate the FK, so
  // mapRow always writes parentOrganizationId: null and this hook fills it
  // in afterwards, exactly like the existing seeds_organizations.ts
  // two-phase insert.
  afterUpsert?: (
    tx: PrismaTransactionClient,
    written: { naturalKey: string; data: Record<string, unknown>; row: Row }[],
    fk: Fk,
  ) => Promise<void>;
}

// Prisma's generated $transaction callback client type, kept structural
// here (rather than importing Prisma.TransactionClient) so this module
// doesn't need to know about every delegate - adapters/run.ts access
// `tx[adapter.prismaModel]` dynamically since the model is only known at
// runtime by string name.
export type PrismaTransactionClient = Record<string, any>;
