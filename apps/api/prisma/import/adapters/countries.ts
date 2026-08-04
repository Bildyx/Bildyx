import {
  Currency,
  GovernmentType,
  QualityOfLife,
  CostOfLiving,
  Language,
} from "@prisma/client";
import {
  checkEnum,
  checkEnumArray,
  checkFloat,
  checkInt,
  checkJson,
  checkRequiredText,
  checkScaleEnum,
  LANGUAGE_ALIASES,
} from "../checks";
import type { CsvRow, ImportAdapter, MappedRow, RowIssue } from "../types";

const EXPECTED_COLUMNS = [
  "name",
  "serial_number",
  "iso_code",
  "capital_name",
  "flag_url",
  "population",
  "area_km2",
  "gdp_usd",
  "gdp_per_capita_usd",
  "hdi",
  "officialLanguages",
  "calling_code",
  "government_type",
  "quality_of_life",
  "temperatures",
  "climate",
  "crime_rate",
  "income_inequality",
  "work_life_balance",
  "main_industries",
  "number_of_multinational_hqs",
  "currency",
  "median_salary",
  "cost_of_living",
  "median_home_price",
  "average_rent",
  "interesting_fact",
  "citizenship_process",
  "work_permit",
  "global_competitiveness_index",
  "level_of_globalisation",
  "number_of_international_students",
  "number_of_foreign_organizations",
  "personal_income_tax",
  "number_of_tourists",
  "number_of_airports",
  "quality_of_education",
  "degree_holders",
  "number_of_universities",
  "top_universities",
  "ethnic_groups",
  "religion",
  "cultural_values",
  "people_description",
  "metadata",
];

// Country.isoCode is normalized (upper-cased, truncated to 2 chars) before
// being used as the natural key for hashing/DB writes - exposed here so
// plan.ts's pre-mapRow duplicate/orphan tracking can apply the same
// normalization and agree with what mapRow actually produces (see
// normalizeNaturalKey in types.ts).
function normalizeIsoCode(raw: string): string {
  return raw.toUpperCase().slice(0, 2);
}

export const countriesAdapter: ImportAdapter<CsvRow, void> = {
  modelName: "Country",
  prismaModel: "country",
  csvFile: "countries.csv",
  naturalKeyColumn: "iso_code",
  naturalKeyField: "isoCode",
  deletedAtField: "deletedAt",
  expectedColumns: EXPECTED_COLUMNS,
  normalizeNaturalKey: normalizeIsoCode,

  async buildFkContext() {},

  mapRow(row): MappedRow {
    const errors: RowIssue[] = [];
    const warnings: RowIssue[] = [];

    const isoCode = normalizeIsoCode((row.iso_code ?? "").trim());
    if (!isoCode) {
      errors.push({ row: 0, column: "iso_code", message: "iso_code: valeur requise manquante" });
    }

    const name = checkRequiredText(row.name, "name");
    if (name.issue) errors.push(name.issue);

    const serialNumber = checkRequiredText(row.serial_number, "serial_number");
    if (serialNumber.issue) errors.push(serialNumber.issue);

    const currency = checkEnum(row.currency, Currency, "currency", false);
    if (currency.issue) warnings.push(currency.issue);

    const governmentType = checkEnum(row.government_type, GovernmentType, "government_type", false);
    if (governmentType.issue) warnings.push(governmentType.issue);

    const qualityOfLife = checkScaleEnum(row.quality_of_life, QualityOfLife, "quality_of_life");
    if (qualityOfLife.issue) warnings.push(qualityOfLife.issue);

    const costOfLiving = checkScaleEnum(row.cost_of_living, CostOfLiving, "cost_of_living");
    if (costOfLiving.issue) warnings.push(costOfLiving.issue);

    const officialLanguages = checkEnumArray(
      row.officialLanguages,
      Language,
      "officialLanguages",
      LANGUAGE_ALIASES,
    );
    warnings.push(...officialLanguages.issues);

    const areaKm2 = checkInt(row.area_km2, "area_km2");
    if (areaKm2.issue) warnings.push(areaKm2.issue);
    const gdpUsd = checkFloat(row.gdp_usd, "gdp_usd");
    if (gdpUsd.issue) warnings.push(gdpUsd.issue);
    const gdpPerCapitaUsd = checkFloat(row.gdp_per_capita_usd, "gdp_per_capita_usd");
    if (gdpPerCapitaUsd.issue) warnings.push(gdpPerCapitaUsd.issue);
    const hdi = checkFloat(row.hdi, "hdi");
    if (hdi.issue) warnings.push(hdi.issue);
    const medianSalary = checkInt(row.median_salary, "median_salary");
    if (medianSalary.issue) warnings.push(medianSalary.issue);
    const medianHomePrice = checkInt(row.median_home_price, "median_home_price");
    if (medianHomePrice.issue) warnings.push(medianHomePrice.issue);
    const averageRent = checkInt(row.average_rent, "average_rent");
    if (averageRent.issue) warnings.push(averageRent.issue);
    const numberOfInternationalStudents = checkInt(row.number_of_international_students, "number_of_international_students");
    if (numberOfInternationalStudents.issue) warnings.push(numberOfInternationalStudents.issue);
    const numberOfForeignOrganizations = checkInt(row.number_of_foreign_organizations, "number_of_foreign_organizations");
    if (numberOfForeignOrganizations.issue) warnings.push(numberOfForeignOrganizations.issue);
    const numberOfUniversities = checkInt(row.number_of_universities, "number_of_universities");
    if (numberOfUniversities.issue) warnings.push(numberOfUniversities.issue);

    const metadata = checkJson(row.metadata, "metadata");
    if (metadata.issue) warnings.push(metadata.issue);

    return {
      naturalKey: isoCode,
      data: {
        isoCode,
        name: name.value,
        serial_number: serialNumber.value,
        capitalName: row.capital_name || null,
        flagUrl: row.flag_url || null,
        population: row.population || null,
        areaKm2: areaKm2.value,
        gdpUsd: gdpUsd.value,
        gdpPerCapitaUsd: gdpPerCapitaUsd.value,
        hdi: hdi.value,
        officialLanguages: officialLanguages.value,
        callingCode: row.calling_code || null,
        governmentType: governmentType.value,
        qualityOfLife: qualityOfLife.value,
        temperatures: row.temperatures || null,
        climate: row.climate || null,
        crimeRate: row.crime_rate || null,
        incomeInequality: row.income_inequality || null,
        workLifeBalance: row.work_life_balance || null,
        mainIndustries: row.main_industries || null,
        numberOfMultinationalHqs: row.number_of_multinational_hqs || null,
        currency: currency.value,
        medianSalary: medianSalary.value,
        costOfLiving: costOfLiving.value,
        medianHomePrice: medianHomePrice.value,
        averageRent: averageRent.value,
        interestingFact: row.interesting_fact || null,
        citizenshipProcess: row.citizenship_process || null,
        workPermit: row.work_permit || null,
        globalCompetitivenessIndex: row.global_competitiveness_index || null,
        levelOfGlobalisation: row.level_of_globalisation || null,
        numberOfInternationalStudents: numberOfInternationalStudents.value,
        numberOfForeignOrganizations: numberOfForeignOrganizations.value,
        personalIncomeTax: row.personal_income_tax || null,
        numberOfTourists: row.number_of_tourists || null,
        numberOfAirports: row.number_of_airports || null,
        qualityOfEducation: row.quality_of_education || null,
        degreeHolders: row.degree_holders || null,
        numberOfUniversities: numberOfUniversities.value,
        top_universities: row.top_universities || null,
        ethnicGroups: row.ethnic_groups || null,
        religion: row.religion || null,
        culturalValues: row.cultural_values || null,
        peopleDescription: row.people_description || null,
        metadata: metadata.value,
      },
      errors,
      warnings,
    };
  },
};
