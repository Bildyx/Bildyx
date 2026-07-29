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

// Une relation many-to-many implicite exposée comme colonne texte dans le
// CSV/template.
export interface M2mColumn {
  // Nom de la colonne CSV (ex: "industries", "main_industries").
  column: string;
  // Champ de relation Prisma sur le modèle courant (ex: "mainIndustries").
  relationField: string;
  // Delegate PrismaClient du modèle cible (ex: "industry", "country").
  targetModel: string;
  // Champ du modèle cible auquel la cellule fait référence, comparé sans
  // tenir compte de la casse (ex: "name" pour Industry, "isoCode" pour
  // Country).
  targetLookupField: string;
  // Second champ accepté pour la même cellule, essayé seulement si la valeur
  // ne correspond à aucun targetLookupField. La colonne `countries`
  // d'organizations.csv est renseignée avec des noms de pays ("France") alors
  // que le contrat attend un code ISO : sans ce repli, aucun des liens
  // organisation<->pays n'était posé.
  targetAltLookupField?: string;
  // Champ unique du modèle cible à utiliser dans le `connect` Prisma
  // (ex: "id" pour Industry/City, "isoCode" pour Country).
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
  // --prune only (see run.ts). Every one of the 11 reference models has one
  // ("deletedAt" or, for Subject/StudyFields, "deleted_at").
  deletedAtField: string;
  // Exact set of business columns the current schema/template expects,
  // mirroring what generate_excel_templates.py would produce (business
  // scalar fields + M2M free-text columns). Used for header validation and
  // as the row-hash input.
  expectedColumns: string[];
  // Relations many-to-many implicites, portées dans le CSV par une colonne
  // texte ";"-séparée (voir M2M_COLUMNS dans
  // scripts/generate_excel_templates.py).
  //
  // Ces colonnes étaient déclarées dans expectedColumns - donc acceptées par
  // la validation d'en-tête - mais AUCUN adaptateur ne les écrivait : le
  // moteur d'import ignorait purement et simplement toutes les relations
  // M2M, que seul l'ancien seeds_relations.ts savait poser. Déclarées ici,
  // elles sont appliquées génériquement par run.ts après écriture des
  // lignes (voir applyM2mLinks).
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
