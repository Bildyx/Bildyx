import { DegreeLevel } from "@prisma/client";
import { toFloat, toInt } from "../../seed-utils";
import { checkEnum, checkJson, checkRequiredText } from "../checks";
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

    const metadata = checkJson(row.metadata, "metadata");
    if (metadata.issue) warnings.push(metadata.issue);

    return {
      naturalKey: serialNumber.value,
      data: {
        name: name.value,
        serial_number: serialNumber.value,
        level: level.value,
        area: row.area || null,
        durationYears: toFloat(row.duration_years),
        description: row.description || null,
        score: toInt(row.score),
        metadata: metadata.value,
      },
      errors,
      warnings,
    };
  },
};
