import {
  PrismaClient,
  Currency,
  Language,
  CostOfLiving,
  Prisma,
  GovernmentType,
  QualityOfLife,
} from "@prisma/client";
import {
  readCsv,
  toJson,
  toDate,
  toInt,
  toFloat,
  toBigInt,
  parseEnum,
  parseEnumArray,
} from "../seed-utils";

import { Country } from "../../src/models/countries";

type CountryCsv = Partial<Record<keyof Country, string>>;

export async function seedCountries(prisma: PrismaClient) {
  const rows = readCsv<CountryCsv>("countries.csv");

  const skipped = rows.filter((r) => !r.iso_code || r.iso_code.trim() === "");
  if (skipped.length > 0) {
    console.warn(
      `Countries skipped (missing iso_code): ${skipped.map((r) => r.name).join(", ")}`,
    );
  }

  const data: Prisma.CountryCreateManyInput[] = rows
    .filter((r) => r.iso_code && r.iso_code.trim() !== "")
    .map((r) => ({
      isoCode: r.iso_code!.trim().toUpperCase().slice(0, 2),
      name: r.name!,
      serial_number: r.serial_number!,

      capitalName: r.capital_name || null,
      flagUrl: r.flag_url || null,

      population: r.population ?? null,
      areaKm2: toInt(r.area_km2),
      gdpUsd: toFloat(r.gdp_usd),
      gdpPerCapitaUsd: toFloat(r.gdp_per_capita_usd),
      hdi: toFloat(r.hdi),

      currency: parseEnum(r.currency, Currency),

      officialLanguages: parseEnumArray(r.officialLanguages, Language),

      callingCode: r.calling_code || null,

      governmentType: parseEnum(r.government_type, GovernmentType),
      qualityOfLife: parseEnum(r.quality_of_life, QualityOfLife),

      temperatures: r.temperatures || null,
      climate: r.climate || null,
      crimeRate: r.crime_rate || null,
      incomeInequality: r.income_inequality || null,
      workLifeBalance: r.work_life_balance || null,
      mainIndustries: r.main_industries || null,

      numberOfMultinationalHqs: r.number_of_multinational_hqs ?? null,
      medianSalary: toInt(r.median_salary),

      costOfLiving: parseEnum(r.cost_of_living, CostOfLiving),

      medianHomePrice: toInt(r.median_home_price),
      averageRent: toInt(r.average_rent),

      interestingFact: r.interesting_fact || null,
      citizenshipProcess: r.citizenship_process || null,
      workPermit: r.work_permit || null,

      globalCompetitivenessIndex: r.global_competitiveness_index ?? null,
      levelOfGlobalisation: r.level_of_globalisation || null,
      numberOfInternationalStudents: toInt(r.number_of_international_students),
      numberOfForeignOrganizations: toInt(r.number_of_foreign_organizations),
      personalIncomeTax: r.personal_income_tax || null,
      numberOfTourists: r.number_of_tourists ?? null,
      numberOfAirports: r.number_of_airports ?? null,
      qualityOfEducation: r.quality_of_education || null,
      degreeHolders: r.degree_holders || null,
      numberOfUniversities: toInt(r.number_of_universities),
      top_universities: r.top_universities || null,

      ethnicGroups: r.ethnic_groups || null,
      religion: r.religion || null,

      culturalValues: r.cultural_values || null,
      peopleDescription: r.people_description || null,
    }));

  const result = await prisma.country.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Countries rows imported: ${result.count}`);

  return result.count;
}
