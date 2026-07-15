import type { PrismaClient } from "@prisma/client";
import { UniversityType } from "@prisma/client";
import { toFloat, toInt } from "../../seed-utils";
import { checkEnum, checkJson, checkOptionalFk, checkRequiredText } from "../checks";
import type { CsvRow, ImportAdapter, MappedRow, RowIssue } from "../types";

const EXPECTED_COLUMNS = [
  "name",
  "serial_number",
  "type",
  "description",
  "website_url",
  "logo_url",
  "country_id",
  "city_id",
  "student_count",
  "metadata",
  "score_university",
  "local_name",
  "notes",
  "established",
  "score",
  "undergraduates",
  "postgraduates",
];

// universities.csv references country_id/city_id by human-readable name
// ("USA", "Cambridge,Massachusetts") rather than the real natural key, same
// as the previous seeds_universities.ts.
const COUNTRY_NAME_ALIASES: Record<string, string> = {
  USA: "United States",
  US: "United States",
  UK: "United Kingdom",
};

function normalizeName(v: string): string {
  return v.trim().toLowerCase();
}

export interface UniversitiesFk {
  resolveCountryId: (raw?: string) => string | null;
  resolveCityId: (raw?: string) => string | null;
}

export const universitiesAdapter: ImportAdapter<CsvRow, UniversitiesFk> = {
  modelName: "University",
  prismaModel: "university",
  csvFile: "universities.csv",
  naturalKeyColumn: "serial_number",
  naturalKeyField: "serial_number",
  deletedAtField: "deletedAt",
  expectedColumns: EXPECTED_COLUMNS,

  async buildFkContext(prisma: PrismaClient): Promise<UniversitiesFk> {
    const countries = await prisma.country.findMany({ select: { isoCode: true, name: true } });
    const byCountryName = new Map(countries.map((c) => [normalizeName(c.name), c.isoCode]));
    const resolveCountryId = (raw?: string): string | null => {
      if (!raw || raw.trim() === "") return null;
      const trimmed = raw.trim();
      const aliased = COUNTRY_NAME_ALIASES[trimmed.toUpperCase()] ?? trimmed;
      return byCountryName.get(normalizeName(aliased)) ?? null;
    };

    const cities = await prisma.city.findMany({
      select: { id: true, name: true, stateProvince: true },
    });
    const byCityNameAndState = new Map(
      cities.map((c) => [`${normalizeName(c.name)}|${normalizeName(c.stateProvince ?? "")}`, c.id]),
    );
    const byCityNameOnly = new Map<string, string[]>();
    for (const c of cities) {
      const key = normalizeName(c.name);
      byCityNameOnly.set(key, [...(byCityNameOnly.get(key) ?? []), c.id]);
    }
    const resolveCityId = (raw?: string): string | null => {
      if (!raw || raw.trim() === "") return null;
      const [namePart = "", statePart = ""] = raw.split(",").map((s) => s.trim());
      const exact = byCityNameAndState.get(`${normalizeName(namePart)}|${normalizeName(statePart)}`);
      if (exact) return exact;
      const matches = byCityNameOnly.get(normalizeName(namePart));
      return matches && matches.length === 1 ? (matches[0] ?? null) : null;
    };

    return { resolveCountryId, resolveCityId };
  },

  mapRow(row, _rowIndex, fk): MappedRow {
    const errors: RowIssue[] = [];
    const warnings: RowIssue[] = [];

    const serialNumber = checkRequiredText(row.serial_number, "serial_number");
    if (serialNumber.issue) errors.push(serialNumber.issue);

    const name = checkRequiredText(row.name, "name");
    if (name.issue) errors.push(name.issue);

    const type = checkEnum(row.type, UniversityType, "type", false);
    if (type.issue) warnings.push(type.issue);

    const countryId = checkOptionalFk(row.country_id, fk.resolveCountryId, "country_id");
    if (countryId.issue) warnings.push(countryId.issue);

    const cityId = checkOptionalFk(row.city_id, fk.resolveCityId, "city_id");
    if (cityId.issue) warnings.push(cityId.issue);

    const metadata = checkJson(row.metadata, "metadata");
    if (metadata.issue) warnings.push(metadata.issue);

    return {
      naturalKey: serialNumber.value,
      data: {
        name: name.value,
        serial_number: serialNumber.value,
        type: type.value,
        description: row.description || null,
        websiteUrl: row.website_url || null,
        logoUrl: row.logo_url || null,
        countryId: countryId.value,
        cityId: cityId.value,
        studentCount: toInt(row.student_count),
        metadata: metadata.value,
        scoreUniversity: toFloat(row.score_university),
        localName: row.local_name || null,
        notes: row.notes || null,
        established: row.established || null,
        score: toInt(row.score),
        undergraduates: toInt(row.undergraduates),
        postgraduates: toInt(row.postgraduates),
      },
      errors,
      warnings,
    };
  },
};
