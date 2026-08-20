import { DifficultyLevel } from "@prisma/client";
import { toStringArray } from "../../seed-utils";
import {
  checkEnum,
  checkInt,
  checkRequiredText,
} from "../checks";
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
];

// "metadata": scoped for a pending schema extension (see
// updates/schema.prisma) that never shipped - Skill has no such column
// live. Tolerated in the CSV, never written (see types.ts).
const LEGACY_COLUMNS = ["metadata"];

export const skillsAdapter: ImportAdapter<CsvRow, void> = {
  modelName: "Skill",
  prismaModel: "skill",
  csvFile: "skills.csv",
  naturalKeyColumn: "serial_number",
  naturalKeyField: "serial_number",
  expectedColumns: EXPECTED_COLUMNS,
  legacyColumns: LEGACY_COLUMNS,

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

    const score = checkInt(row.score, "score");
    if (score.issue) warnings.push(score.issue);

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
        score: score.value,
      },
      errors,
      warnings,
    };
  },
};
