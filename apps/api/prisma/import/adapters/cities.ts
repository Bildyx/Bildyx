import type { PrismaClient } from "@prisma/client";
import { Currency, CostOfLiving, Language } from "@prisma/client";
import { toInt, toIntLoose, toFloat, toJson, toBool } from "../../seed-utils";
import { checkEnum, checkEnumArray, checkRequiredFk, checkRequiredText } from "../checks";
import type { CsvRow, ImportAdapter, MappedRow, RowIssue } from "../types";

const EXPECTED_COLUMNS = [
  "name",
  "serial_number",
  "country_id",
  "is_capital",
  "state_province",
  "population",
  "number_of_multinational_hqs",
  "number_of_airports",
  "largest_organization",
  "currency",
  "median_salary",
  "median_home_price",
  "average_rent",
  "cost_of_living",
  "temperatures",
  "climate",
  "interesting_fact",
  "degree_holders",
  "number_of_universities",
  "top_universities",
  "number_of_nationalities",
  "language",
  "people_description",
  "latitude",
  "longitude",
  "metadata",
  // M2M free-text column (City<->Industry, "main industries").
  "main_industries",
];

export interface CitiesFk {
  validCountryIsoCodes: Set<string>;
}

export const citiesAdapter: ImportAdapter<CsvRow, CitiesFk> = {
  modelName: "City",
  prismaModel: "city",
  csvFile: "cities.csv",
  naturalKeyColumn: "serial_number",
  naturalKeyField: "serial_number",
  deletedAtField: "deletedAt",
  expectedColumns: EXPECTED_COLUMNS,

  async buildFkContext(prisma: PrismaClient): Promise<CitiesFk> {
    const countries = await prisma.country.findMany({ select: { isoCode: true } });
    return { validCountryIsoCodes: new Set(countries.map((c) => c.isoCode)) };
  },

  mapRow(row, _rowIndex, fk): MappedRow {
    const errors: RowIssue[] = [];
    const warnings: RowIssue[] = [];

    const serialNumber = checkRequiredText(row.serial_number, "serial_number");
    if (serialNumber.issue) errors.push(serialNumber.issue);

    const name = checkRequiredText(row.name, "name");
    if (name.issue) errors.push(name.issue);

    const countryId = checkRequiredFk(
      row.country_id,
      (raw) => {
        const code = (raw ?? "").trim().toUpperCase();
        return fk.validCountryIsoCodes.has(code) ? code : null;
      },
      "country_id",
    );
    if (countryId.issue) errors.push(countryId.issue);

    // City.currency is a required (non-nullable) enum in the schema.
    const currency = checkEnum(row.currency, Currency, "currency", true);
    if (currency.issue) errors.push(currency.issue);

    const costOfLiving = checkEnum(row.cost_of_living, CostOfLiving, "cost_of_living", false);
    if (costOfLiving.issue) warnings.push(costOfLiving.issue);

    const language = checkEnumArray(row.language, Language, "language");
    warnings.push(...language.issues);

    return {
      naturalKey: serialNumber.value,
      data: {
        name: name.value,
        serial_number: serialNumber.value,
        countryId: countryId.value,
        isCapital: toBool(row.is_capital),
        stateProvince: row.state_province || null,
        population: row.population ?? null,
        numberOfMultinationalHqs: row.number_of_multinational_hqs ?? null,
        numberOfAirports: toIntLoose(row.number_of_airports),
        largest_organization: row.largest_organization || null,
        currency: currency.value,
        medianSalary: toInt(row.median_salary),
        costOfLiving: costOfLiving.value,
        medianHomePrice: toInt(row.median_home_price),
        averageRent: toInt(row.average_rent),
        temperatures: row.temperatures || null,
        climate: row.climate || null,
        interestingFact: row.interesting_fact || null,
        degreeHolders: row.degree_holders || null,
        numberOfUniversities: toInt(row.number_of_universities),
        top_universities: row.top_universities || null,
        numberOfNationalities: row.number_of_nationalities ?? null,
        language: language.value,
        peopleDescription: row.people_description || null,
        latitude: toFloat(row.latitude),
        longitude: toFloat(row.longitude),
        metadata: toJson(row.metadata),
      },
      errors,
      warnings,
    };
  },
};
