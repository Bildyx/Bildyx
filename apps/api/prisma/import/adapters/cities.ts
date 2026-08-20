import type { PrismaClient } from "@prisma/client";
import { Currency, CostOfLiving, Language } from "@prisma/client";
import { toBool, toIntLoose } from "../../seed-utils";
import {
  checkEnum,
  checkEnumArray,
  checkFloat,
  checkInt,
  checkRequiredFk,
  checkRequiredText,
  checkScaleEnum,
  LANGUAGE_ALIASES,
} from "../checks";
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
  // M2M free-text column (City<->Industry, "main industries").
  "main_industries",
];

// "metadata": scoped for a pending schema extension (see
// updates/schema.prisma) that never shipped - City has no such column
// live. Tolerated in the CSV, never written (see types.ts).
const LEGACY_COLUMNS = ["metadata"];

export interface CitiesFk {
  validCountryIsoCodes: Set<string>;
}

export const citiesAdapter: ImportAdapter<CsvRow, CitiesFk> = {
  modelName: "City",
  prismaModel: "city",
  csvFile: "cities.csv",
  naturalKeyColumn: "serial_number",
  naturalKeyField: "serial_number",
  expectedColumns: EXPECTED_COLUMNS,
  legacyColumns: LEGACY_COLUMNS,
  m2mColumns: [
    {
      column: "main_industries",
      relationField: "mainIndustries",
      targetModel: "industry",
      targetLookupField: "name",
      targetConnectField: "id",
    },
  ],

  async buildFkContext(prisma: PrismaClient): Promise<CitiesFk> {
    const countries = await prisma.country.findMany({
      select: { isoCode: true },
    });
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

    const costOfLiving = checkScaleEnum(
      row.cost_of_living,
      CostOfLiving,
      "cost_of_living",
    );
    if (costOfLiving.issue) warnings.push(costOfLiving.issue);

    const language = checkEnumArray(
      row.language,
      Language,
      "language",
      LANGUAGE_ALIASES,
    );
    warnings.push(...language.issues);

    // The column stays INTEGER in the database (see the note on migration
    // 20260728160000) while the source is annotated ("1 (via Cairo Intl.
    // Airport)"). toIntLoose extracts the first integer from it; the
    // annotation is lost, but the warning below at least makes it visible
    // instead of disappearing silently.
    const numberOfAirports = { value: toIntLoose(row.number_of_airports) };
    const rawAirports = (row.number_of_airports ?? "").trim();
    if (rawAirports && String(numberOfAirports.value) !== rawAirports) {
      warnings.push({
        row: 0,
        column: "number_of_airports",
        message: `number_of_airports: "${rawAirports}" réduit à ${numberOfAirports.value} (colonne entière)`,
      });
    }

    const medianSalary = checkInt(row.median_salary, "median_salary");
    if (medianSalary.issue) warnings.push(medianSalary.issue);
    const medianHomePrice = checkInt(
      row.median_home_price,
      "median_home_price",
    );
    if (medianHomePrice.issue) warnings.push(medianHomePrice.issue);
    const averageRent = checkInt(row.average_rent, "average_rent");
    if (averageRent.issue) warnings.push(averageRent.issue);
    const numberOfUniversities = checkInt(
      row.number_of_universities,
      "number_of_universities",
    );
    if (numberOfUniversities.issue) warnings.push(numberOfUniversities.issue);
    const latitude = checkFloat(row.latitude, "latitude");
    if (latitude.issue) warnings.push(latitude.issue);
    const longitude = checkFloat(row.longitude, "longitude");
    if (longitude.issue) warnings.push(longitude.issue);

    return {
      naturalKey: serialNumber.value,
      data: {
        name: name.value,
        serial_number: serialNumber.value,
        countryId: countryId.value,
        isCapital: toBool(row.is_capital),
        stateProvince: row.state_province || null,
        population: row.population || null,
        numberOfMultinationalHqs: row.number_of_multinational_hqs || null,
        numberOfAirports: numberOfAirports.value,
        largest_organization: row.largest_organization || null,
        currency: currency.value,
        medianSalary: medianSalary.value,
        costOfLiving: costOfLiving.value,
        medianHomePrice: medianHomePrice.value,
        averageRent: averageRent.value,
        temperatures: row.temperatures || null,
        climate: row.climate || null,
        interestingFact: row.interesting_fact || null,
        degreeHolders: row.degree_holders || null,
        numberOfUniversities: numberOfUniversities.value,
        top_universities: row.top_universities || null,
        numberOfNationalities: row.number_of_nationalities || null,
        language: language.value,
        peopleDescription: row.people_description || null,
        latitude: latitude.value,
        longitude: longitude.value,
      },
      errors,
      warnings,
    };
  },
};
