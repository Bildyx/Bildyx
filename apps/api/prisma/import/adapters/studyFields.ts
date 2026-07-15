import { toInt } from "../../seed-utils";
import { checkJson, checkRequiredText } from "../checks";
import type { CsvRow, ImportAdapter, MappedRow, RowIssue } from "../types";

const EXPECTED_COLUMNS = ["name", "serial_number", "area", "description", "score", "metadata"];

export const studyFieldsAdapter: ImportAdapter<CsvRow, void> = {
  modelName: "StudyFields",
  prismaModel: "studyFields",
  csvFile: "study_fields.csv",
  naturalKeyColumn: "serial_number",
  naturalKeyField: "serial_number",
  deletedAtField: "deleted_at",
  expectedColumns: EXPECTED_COLUMNS,

  async buildFkContext() {},

  mapRow(row): MappedRow {
    const errors: RowIssue[] = [];
    const warnings: RowIssue[] = [];

    const serialNumber = checkRequiredText(row.serial_number, "serial_number");
    if (serialNumber.issue) errors.push(serialNumber.issue);

    const name = checkRequiredText(row.name, "name");
    if (name.issue) errors.push(name.issue);

    const metadata = checkJson(row.metadata, "metadata");
    if (metadata.issue) warnings.push(metadata.issue);

    return {
      naturalKey: serialNumber.value,
      data: {
        name: name.value,
        serial_number: serialNumber.value,
        area: row.area || null,
        description: row.description || null,
        score: toInt(row.score),
        metadata: metadata.value,
      },
      errors,
      warnings,
    };
  },
};
