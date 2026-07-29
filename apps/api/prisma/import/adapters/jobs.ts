import type { PrismaClient } from "@prisma/client";
import { JobCategory, SeniorityLevel } from "@prisma/client";
import { buildNameLookup, toStringArray } from "../../seed-utils";
import {
  checkEnum,
  checkInt,
  checkJson,
  checkOptionalFk,
  checkRequiredText,
} from "../checks";
import type { CsvRow, ImportAdapter, MappedRow, RowIssue } from "../types";

const EXPECTED_COLUMNS = [
  "title",
  "serial_number",
  "category",
  "description",
  "seniority_level",
  "industry_name",
  "products",
  "tools_and_tech",
  "tags",
  "metadata",
  "score",
];

export interface JobsFk {
  resolveIndustryId: (raw?: string) => string | null;
}

export const jobsAdapter: ImportAdapter<CsvRow, JobsFk> = {
  modelName: "Job",
  prismaModel: "job",
  csvFile: "jobs.csv",
  naturalKeyColumn: "serial_number",
  naturalKeyField: "serial_number",
  deletedAtField: "deletedAt",
  expectedColumns: EXPECTED_COLUMNS,

  async buildFkContext(prisma: PrismaClient): Promise<JobsFk> {
    const industries = await prisma.industry.findMany({ select: { id: true, name: true } });
    return { resolveIndustryId: buildNameLookup(industries) };
  },

  mapRow(row, _rowIndex, fk): MappedRow {
    const errors: RowIssue[] = [];
    const warnings: RowIssue[] = [];

    const serialNumber = checkRequiredText(row.serial_number, "serial_number");
    if (serialNumber.issue) errors.push(serialNumber.issue);

    const title = checkRequiredText(row.title, "title");
    if (title.issue) errors.push(title.issue);

    const category = checkEnum(row.category, JobCategory, "category", false);
    if (category.issue) warnings.push(category.issue);

    const seniorityLevel = checkEnum(row.seniority_level, SeniorityLevel, "seniority_level", false);
    if (seniorityLevel.issue) warnings.push(seniorityLevel.issue);

    const industryId = checkOptionalFk(row.industry_name, fk.resolveIndustryId, "industry_name");
    if (industryId.issue) warnings.push(industryId.issue);

    const score = checkInt(row.score, "score");
    if (score.issue) warnings.push(score.issue);

    const metadata = checkJson(row.metadata, "metadata");
    if (metadata.issue) warnings.push(metadata.issue);

    return {
      naturalKey: serialNumber.value,
      data: {
        title: title.value,
        serial_number: serialNumber.value,
        category: category.value,
        description: row.description || null,
        seniorityLevel: seniorityLevel.value,
        industryId: industryId.value,
        products: toStringArray(row.products),
        toolsAndTech: toStringArray(row.tools_and_tech),
        tags: toStringArray(row.tags),
        metadata: metadata.value,
        score: score.value,
      },
      errors,
      warnings,
    };
  },
};
