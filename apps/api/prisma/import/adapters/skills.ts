import { DifficultyLevel } from "@prisma/client";
import { toInt, toJson, toStringArray } from "../../seed-utils";
import { checkEnum, checkRequiredText } from "../checks";
import type { CsvRow, ImportAdapter, MappedRow, RowIssue } from "../types";

const EXPECTED_COLUMNS = [
  "name",
  "serial_number",
  "type",
  "category",
  "description",
  "icon_url",
  "industry",
  "difficulty",
  "used_in",
  "jobs",
  "product_categories",
  "common_fields_of_study",
  "related_abilities",
  "time_to_master",
  "score",
  "metadata",
];

export const skillsAdapter: ImportAdapter<CsvRow, void> = {
  modelName: "Skill",
  prismaModel: "skill",
  csvFile: "skills.csv",
  naturalKeyColumn: "serial_number",
  naturalKeyField: "serial_number",
  deletedAtField: "deletedAt",
  expectedColumns: EXPECTED_COLUMNS,

  async buildFkContext() {},

  mapRow(row): MappedRow {
    const errors: RowIssue[] = [];
    const warnings: RowIssue[] = [];

    const serialNumber = checkRequiredText(row.serial_number, "serial_number");
    if (serialNumber.issue) errors.push(serialNumber.issue);

    const name = checkRequiredText(row.name, "name");
    if (name.issue) errors.push(name.issue);

    const difficulty = checkEnum(row.difficulty, DifficultyLevel, "difficulty", false);
    if (difficulty.issue) warnings.push(difficulty.issue);

    return {
      naturalKey: serialNumber.value,
      data: {
        name: name.value,
        serial_number: serialNumber.value,
        type: row.type || null,
        category: row.category || null,
        description: row.description || null,
        iconUrl: row.icon_url || null,
        industry: row.industry || null,
        difficulty: difficulty.value,
        usedIn: toStringArray(row.used_in),
        jobs: toStringArray(row.jobs),
        productCategories: toStringArray(row.product_categories),
        commonFieldsOfStudy: toStringArray(row.common_fields_of_study),
        relatedAbilities: toStringArray(row.related_abilities),
        timeToMaster: row.time_to_master || null,
        score: toInt(row.score),
        metadata: toJson(row.metadata),
      },
      errors,
      warnings,
    };
  },
};
