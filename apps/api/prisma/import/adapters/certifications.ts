import type { PrismaClient } from "@prisma/client";
import { CertificationCategory, DifficultyLevel } from "@prisma/client";
import { buildNameLookup, toStringArray } from "../../seed-utils";
import {
  checkEnum,
  checkInt,
  checkOptionalFk,
  checkRequiredText,
} from "../checks";
import type { CsvRow, ImportAdapter, MappedRow, RowIssue } from "../types";

const EXPECTED_COLUMNS = [
  "name",
  "serial_number",
  "issuing_organization_name",
  "description",
  "level",
  "category",
  "products",
  "jobs",
  "validity_duration_months",
  "difficulty",
  "website_url",
  "score",
];

export interface CertificationsFk {
  resolveOrganizationId: (raw?: string) => string | null;
}

export const certificationsAdapter: ImportAdapter<CsvRow, CertificationsFk> = {
  modelName: "Certification",
  prismaModel: "certification",
  csvFile: "certifications.csv",
  naturalKeyColumn: "serial_number",
  naturalKeyField: "serial_number",
  deletedAtField: "deletedAt",
  expectedColumns: EXPECTED_COLUMNS,

  async buildFkContext(prisma: PrismaClient): Promise<CertificationsFk> {
    const organizations = await prisma.organization.findMany({
      select: { id: true, name: true },
    });
    return { resolveOrganizationId: buildNameLookup(organizations) };
  },

  mapRow(row, _rowIndex, fk): MappedRow {
    const errors: RowIssue[] = [];
    const warnings: RowIssue[] = [];

    const serialNumber = checkRequiredText(row.serial_number, "serial_number");
    if (serialNumber.issue) errors.push(serialNumber.issue);

    const name = checkRequiredText(row.name, "name");
    if (name.issue) errors.push(name.issue);

    const category = checkEnum(
      row.category,
      CertificationCategory,
      "category",
      false,
    );
    if (category.issue) warnings.push(category.issue);

    const difficulty = checkEnum(
      row.difficulty,
      DifficultyLevel,
      "difficulty",
      false,
    );
    if (difficulty.issue) warnings.push(difficulty.issue);

    const issuingOrganizationId = checkOptionalFk(
      row.issuing_organization_name,
      fk.resolveOrganizationId,
      "issuing_organization_name",
    );
    if (issuingOrganizationId.issue) warnings.push(issuingOrganizationId.issue);

    const validityDurationMonths = checkInt(
      row.validity_duration_months,
      "validity_duration_months",
    );
    if (validityDurationMonths.issue)
      warnings.push(validityDurationMonths.issue);
    const score = checkInt(row.score, "score");
    if (score.issue) warnings.push(score.issue);

    return {
      naturalKey: serialNumber.value,
      data: {
        name: name.value,
        serial_number: serialNumber.value,
        issuingOrganizationId: issuingOrganizationId.value,
        description: row.description || null,
        level: row.level || null,
        category: category.value,
        products: toStringArray(row.products),
        jobs: toStringArray(row.jobs),
        validityDurationMonths: validityDurationMonths.value,
        difficulty: difficulty.value,
        websiteUrl: row.website_url || null,
        score: score.value,
      },
      errors,
      warnings,
    };
  },
};
