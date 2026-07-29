import { DegreeLevel } from "@prisma/client";
import {
  checkEnum,
  checkFloat,
  checkInt,
  checkJson,
  checkRequiredText,
} from "../checks";
import type { CsvRow, ImportAdapter, MappedRow, RowIssue } from "../types";

const EXPECTED_COLUMNS = [
  "name",
  "serial_number",
  "level",
  "area",
  "duration_years",
  "description",
  "score",
  "metadata",
];

export const degreesAdapter: ImportAdapter<CsvRow, void> = {
  modelName: "Degree",
  prismaModel: "degree",
  csvFile: "degrees.csv",
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

    const level = checkEnum(row.level, DegreeLevel, "level", false);
    if (level.issue) warnings.push(level.issue);

    const durationYears = checkFloat(row.duration_years, "duration_years");
    if (durationYears.issue) warnings.push(durationYears.issue);
    const score = checkInt(row.score, "score");
    if (score.issue) warnings.push(score.issue);

    const metadata = checkJson(row.metadata, "metadata");
    if (metadata.issue) warnings.push(metadata.issue);

    return {
      naturalKey: serialNumber.value,
      data: {
        name: name.value,
        serial_number: serialNumber.value,
        level: level.value,
        area: row.area || null,
        durationYears: durationYears.value,
        description: row.description || null,
        score: score.value,
        metadata: metadata.value,
      },
      errors,
      warnings,
    };
  },
};
