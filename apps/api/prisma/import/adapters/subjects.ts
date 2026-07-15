import type { PrismaClient } from "@prisma/client";
import { SubjectCategory } from "@prisma/client";
import { buildNameLookup, toInt, toJson, toStringArray } from "../../seed-utils";
import { checkEnum, checkOptionalFk, checkRequiredText } from "../checks";
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
  "organization_id",
  "website_url",
  "logo_url",
  "tags",
  "score",
  "metadata",
  // M2M free-text column (Subject<->Industry).
  "industries",
];

export interface SubjectsFk {
  resolveOrganizationId: (raw?: string) => string | null;
}

export const subjectsAdapter: ImportAdapter<CsvRow, SubjectsFk> = {
  modelName: "Subject",
  prismaModel: "subject",
  csvFile: "subjects.csv",
  naturalKeyColumn: "serial_number",
  naturalKeyField: "serial_number",
  deletedAtField: "deleted_at",
  expectedColumns: EXPECTED_COLUMNS,

  async buildFkContext(prisma: PrismaClient): Promise<SubjectsFk> {
    const organizations = await prisma.organization.findMany({ select: { id: true, name: true } });
    return { resolveOrganizationId: buildNameLookup(organizations) };
  },

  mapRow(row, _rowIndex, fk): MappedRow {
    const errors: RowIssue[] = [];
    const warnings: RowIssue[] = [];

    const serialNumber = checkRequiredText(row.serial_number, "serial_number");
    if (serialNumber.issue) errors.push(serialNumber.issue);

    const name = checkRequiredText(row.name, "name");
    if (name.issue) errors.push(name.issue);

    const category = checkEnum(row.category, SubjectCategory, "category", false);
    if (category.issue) warnings.push(category.issue);

    const organizationId = checkOptionalFk(row.organization_id, fk.resolveOrganizationId, "organization_id");
    if (organizationId.issue) warnings.push(organizationId.issue);

    return {
      naturalKey: serialNumber.value,
      data: {
        name: name.value,
        serial_number: serialNumber.value,
        type: row.type || null,
        description: row.description || null,
        short_description: row.short_description || null,
        category: category.value,
        competitors: toStringArray(row.competitors),
        vendors: toStringArray(row.vendors),
        fun_fact: row.fun_fact || null,
        organization_id: organizationId.value,
        website_url: row.website_url || null,
        logo_url: row.logo_url || null,
        tags: toStringArray(row.tags),
        score: toInt(row.score),
        metadata: toJson(row.metadata),
      },
      errors,
      warnings,
    };
  },
};
