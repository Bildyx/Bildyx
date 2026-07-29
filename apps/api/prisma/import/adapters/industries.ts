import {
  checkInt,
  checkJson,
  checkRequiredText,
} from "../checks";
import type { CsvRow, ImportAdapter, MappedRow, RowIssue } from "../types";

const EXPECTED_COLUMNS = [
  "name",
  "serial_number",
  "description",
  "icon_url",
  "metadata",
  "score",
  // M2M free-text column (Industry<->Industry self-relation) - included so
  // header validation matches the real template, but relation linking
  // itself stays out of Phase 1's scope (see seeds_relations.ts for the
  // existing name-based linking logic this would reuse later).
  "related_industries",
];

export const industriesAdapter: ImportAdapter<CsvRow, void> = {
  modelName: "Industry",
  prismaModel: "industry",
  csvFile: "industries.csv",
  naturalKeyColumn: "serial_number",
  naturalKeyField: "serial_number",
  deletedAtField: "deletedAt",
  expectedColumns: EXPECTED_COLUMNS,
  m2mColumns: [
    {
      column: "related_industries",
      relationField: "industries_A",
      targetModel: "industry",
      targetLookupField: "name",
      targetConnectField: "id",
    },
  ],

  async buildFkContext() {},

  mapRow(row): MappedRow {
    const errors: RowIssue[] = [];
    const warnings: RowIssue[] = [];

    const serialNumber = checkRequiredText(row.serial_number, "serial_number");
    if (serialNumber.issue) errors.push(serialNumber.issue);

    const name = checkRequiredText(row.name, "name");
    if (name.issue) errors.push(name.issue);

    const score = checkInt(row.score, "score");
    if (score.issue) warnings.push(score.issue);

    const metadata = checkJson(row.metadata, "metadata");
    if (metadata.issue) warnings.push(metadata.issue);

    return {
      naturalKey: serialNumber.value,
      data: {
        name: name.value,
        serial_number: serialNumber.value,
        description: row.description || null,
        iconUrl: row.icon_url || null,
        metadata: metadata.value,
        score: score.value,
      },
      errors,
      warnings,
    };
  },
};
