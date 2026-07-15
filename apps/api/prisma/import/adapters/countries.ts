import {
  Currency,
  GovernmentType,
  QualityOfLife,
  CostOfLiving,
  Language,
} from "@prisma/client";
import { toInt, toFloat, toJson } from "../../seed-utils";
import { checkEnum, checkEnumArray, checkRequiredText } from "../checks";
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

export const countriesAdapter: ImportAdapter<CsvRow, void> = {
  modelName: "Country",
  prismaModel: "country",
  csvFile: "countries.csv",
  naturalKeyColumn: "iso_code",
  naturalKeyField: "isoCode",
  deletedAtField: "deletedAt",
  expectedColumns: EXPECTED_COLUMNS,

  async buildFkContext() {},

  mapRow(row): MappedRow {
    const errors: RowIssue[] = [];
    const warnings: RowIssue[] = [];

    const isoCode = (row.iso_code ?? "").trim().toUpperCase().slice(0, 2);
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

    const qualityOfLife = checkEnum(row.quality_of_life, QualityOfLife, "quality_of_life", false);
    if (qualityOfLife.issue) warnings.push(qualityOfLife.issue);

    const costOfLiving = checkEnum(row.cost_of_living, CostOfLiving, "cost_of_living", false);
    if (costOfLiving.issue) warnings.push(costOfLiving.issue);

    const officialLanguages = checkEnumArray(row.officialLanguages, Language, "officialLanguages");
    warnings.push(...officialLanguages.issues);

    return {
      naturalKey: isoCode,
      data: {
        isoCode,
        name: name.value,
        serial_number: serialNumber.value,
        capitalName: row.capital_name || null,
        flagUrl: row.flag_url || null,
        population: row.population ?? null,
        areaKm2: toInt(row.area_km2),
        gdpUsd: toFloat(row.gdp_usd),
        gdpPerCapitaUsd: toFloat(row.gdp_per_capita_usd),
        hdi: toFloat(row.hdi),
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
        numberOfMultinationalHqs: row.number_of_multinational_hqs ?? null,
        currency: currency.value,
        medianSalary: toInt(row.median_salary),
        costOfLiving: costOfLiving.value,
        medianHomePrice: toInt(row.median_home_price),
        averageRent: toInt(row.average_rent),
        interestingFact: row.interesting_fact || null,
        citizenshipProcess: row.citizenship_process || null,
        workPermit: row.work_permit || null,
        globalCompetitivenessIndex: row.global_competitiveness_index ?? null,
        levelOfGlobalisation: row.level_of_globalisation || null,
        numberOfInternationalStudents: toInt(row.number_of_international_students),
        numberOfForeignOrganizations: toInt(row.number_of_foreign_organizations),
        personalIncomeTax: row.personal_income_tax || null,
        numberOfTourists: row.number_of_tourists ?? null,
        numberOfAirports: row.number_of_airports ?? null,
        qualityOfEducation: row.quality_of_education || null,
        degreeHolders: row.degree_holders || null,
        numberOfUniversities: toInt(row.number_of_universities),
        top_universities: row.top_universities || null,
        ethnicGroups: row.ethnic_groups || null,
        religion: row.religion || null,
        culturalValues: row.cultural_values || null,
        peopleDescription: row.people_description || null,
        metadata: toJson(row.metadata),
      },
      errors,
      warnings,
    };
  },
};
