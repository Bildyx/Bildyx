import {
  PrismaClient,
  Prisma,
  Currency,
  Language,
  GovernmentType,
  QualityOfLife,
  CostOfLiving,
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

type CountryCsv = {
  id: string;
  name: string;
  serial_number: string;
  iso_code?: string;
  capital_name?: string;
  flag_url?: string;
  population?: string;
  area_km2?: string;
  gdp_usd?: string;
  gdp_per_capita_usd?: string;
  hdi?: string;
  currency?: string;
  official_languages?: string;
  calling_code?: string;
  government_type?: string;
  quality_of_life?: string;
  temperatures?: string;
  climate?: string;
  crime_rate?: string;
  income_inequality?: string;
  work_life_balance?: string;
  main_industries?: string;
  number_of_multinational_hqs?: string;
  median_salary?: string;
  cost_of_living?: string;
  median_home_price?: string;
  average_rent?: string;
  interesting_fact?: string;
  citizenship_process?: string;
  work_permit?: string;
  global_competitiveness_index?: string;
  level_of_globalisation?: string;
  number_of_international_students?: string;
  number_of_foreign_organizations?: string;
  personal_income_tax?: string;
  number_of_tourists?: string;
  number_of_airports?: string;
  quality_of_education?: string;
  degree_holders?: string;
  number_of_universities?: string;
  top_universities?: string;
  ethnic_groups?: string;
  religion?: string;
  cultural_values?: string;
  people_description?: string;
  metadata?: string;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
};

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
      name: r.name,
      serial_number: r.serial_number,

      capitalName: r.capital_name || null,
      flagUrl: r.flag_url || null,

      population: r.population ?? null,
      areaKm2: toInt(r.area_km2),
      gdpUsd: toFloat(r.gdp_usd),
      gdpPerCapitaUsd: toFloat(r.gdp_per_capita_usd),
      hdi: toFloat(r.hdi),

      currency: parseEnum(r.currency, Currency),

      officialLanguages: parseEnumArray(r.official_languages, Language),

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
      topUniversities: r.top_universities || null,

      ethnicGroups: r.ethnic_groups || null,
      religion: r.religion || null,

      culturalValues: r.cultural_values || null,
      peopleDescription: r.people_description || null,

      metadata: toJson(r.metadata),

      deletedAt: toDate(r.deleted_at, false),
      createdAt: toDate(r.created_at, true) as Date,
      updatedAt: toDate(r.updated_at, true) as Date,
    }));

  const result = await prisma.country.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Countries rows imported: ${result.count}`);

  return result.count;
}
