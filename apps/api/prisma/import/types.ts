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
  // Prisma field name for the model's soft-delete timestamp, used by
  // --prune only (see run.ts). Every one of the 11 reference models has one
  // ("deletedAt" or, for Subject/StudyFields, "deleted_at").
  deletedAtField: string;
  // Exact set of business columns the current schema/template expects,
  // mirroring what generate_excel_templates.py would produce (business
  // scalar fields + M2M free-text columns). Used for header validation and
  // as the row-hash input.
  expectedColumns: string[];
  buildFkContext: (prisma: PrismaClient, rows: Row[]) => Promise<Fk>;
  mapRow: (row: Row, rowIndex: number, fk: Fk) => MappedRow;
  // Optional second pass after every insert/update of this model has been
  // written within the transaction. Only Organization needs this today, for
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
