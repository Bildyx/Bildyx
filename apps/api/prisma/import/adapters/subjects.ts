import type { PrismaClient } from "@prisma/client";
import { SubjectCategory } from "@prisma/client";
import { buildNameLookup, toStringArray } from "../../seed-utils";
import {
  checkInt,
  checkRequiredFk,
  checkRequiredText,
} from "../checks";
import type { CsvRow, ImportAdapter, MappedRow, RowIssue } from "../types";

const EXPECTED_COLUMNS = [
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
  // M2M free-text column (Subject<->Industry).
  "industries",
];

// "metadata": scoped for a pending schema extension (see
// updates/schema.prisma) that never shipped - Subject has no such column
// live. Tolerated in the CSV, never written (see types.ts).
const LEGACY_COLUMNS = ["metadata"];

export interface SubjectsFk {
  resolveOrganizationId: (raw?: string) => string | null;
  // Subject.category used to be a plain SubjectCategory column (still the
  // shape of the CSV cell and of updates/schema.prisma) but the live schema
  // replaced it with a required subject_category_id FK into
  // subject_categories, keyed by name - same refactor already applied in
  // seeds_subjects.ts. Every enum value is mirrored into that table (created
  // if missing) so any category cell can resolve.
  categoryIdByKey: Map<string, string>;
  otherCategoryId: string;
}

export const subjectsAdapter: ImportAdapter<CsvRow, SubjectsFk> = {
  modelName: "Subject",
  prismaModel: "subject",
  csvFile: "subjects.csv",
  naturalKeyColumn: "serial_number",
  naturalKeyField: "serial_number",
  expectedColumns: EXPECTED_COLUMNS,
  legacyColumns: LEGACY_COLUMNS,
  m2mColumns: [
    {
      column: "industries",
      relationField: "industries",
      targetModel: "industry",
      targetLookupField: "name",
      targetConnectField: "id",
    },
  ],

  async buildFkContext(prisma: PrismaClient): Promise<SubjectsFk> {
    const organizations = await prisma.organization.findMany({ select: { id: true, name: true } });
    const resolveOrganizationId = buildNameLookup(organizations);

    // subject_categories carries no data of its own: mirror every
    // SubjectCategory enum value into it, creating whichever are still
    // missing (same idempotent approach as seeds_subjects.ts).
    const categories = Object.values(SubjectCategory);
    const existing = await prisma.subject_categories.findMany();
    const existingNames = new Set(existing.map((c) => c.name));
    const missing = categories.filter((c) => !existingNames.has(c));
    if (missing.length > 0) {
      await prisma.subject_categories.createMany({
        data: missing.map((name) => ({ name })),
      });
    }

    const all = await prisma.subject_categories.findMany();
    const categoryIdByKey = new Map(all.map((c) => [c.name.toUpperCase(), c.id]));
    const otherCategoryId = categoryIdByKey.get("OTHER")!;

    return { resolveOrganizationId, categoryIdByKey, otherCategoryId };
  },

  mapRow(row, _rowIndex, fk): MappedRow {
    const errors: RowIssue[] = [];
    const warnings: RowIssue[] = [];

    const serialNumber = checkRequiredText(row.serial_number, "serial_number");
    if (serialNumber.issue) errors.push(serialNumber.issue);

    const name = checkRequiredText(row.name, "name");
    if (name.issue) errors.push(name.issue);

    // Subject.organization_id is required (NOT NULL) in the live schema -
    // an unresolved organization_name must reject the row (error), not
    // silently write a null that would only fail later at the DB
    // constraint (checkOptionalFk's behavior, used by every other adapter
    // for a genuinely optional FK).
    const organizationId = checkRequiredFk(
      row.organization_name,
      fk.resolveOrganizationId,
      "organization_name",
    );
    if (organizationId.issue) errors.push(organizationId.issue);

    const categoryKey = (row.category || "").trim().toUpperCase();
    const subjectCategoryId = fk.categoryIdByKey.get(categoryKey) ?? fk.otherCategoryId;
    if (categoryKey && !fk.categoryIdByKey.has(categoryKey)) {
      warnings.push({
        row: 0,
        column: "category",
        message: `category: valeur "${row.category}" non reconnue (classée dans OTHER)`,
      });
    }

    const score = checkInt(row.score, "score");
    if (score.issue) warnings.push(score.issue);

    return {
      naturalKey: serialNumber.value,
      data: {
        name: name.value,
        serial_number: serialNumber.value,
        type: row.type || null,
        description: row.description || null,
        short_description: row.short_description || null,
        competitors: toStringArray(row.competitors),
        vendors: toStringArray(row.vendors),
        fun_fact: row.fun_fact || null,
        organization_id: organizationId.value,
        subject_category_id: subjectCategoryId,
        website_url: row.website_url || null,
        logo_url: row.logo_url || null,
        tags: toStringArray(row.tags),
        score: score.value,
      },
      errors,
      warnings,
    };
  },
};
