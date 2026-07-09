import {
  PrismaClient,
  Prisma,
  CostOfLiving,
  Currency,
  Language,
} from "@prisma/client";
import {
  readCsv,
  toJson,
  toDate,
  toInt,
  toIntLoose,
  toFloat,
  toBool,
  parseEnum,
  parseEnumArray,
} from "../seed-utils";

type CityCsv = {
  id: string;
  name: string;
  serial_number: string;
  country_id: string;
  is_capital?: string;
  state_province?: string;
  population?: string;
  number_of_multinational_hqs?: string;
  number_of_airports?: string;
  largest_organization?: string;
  currency?: string;
  median_salary?: string;
  cost_of_living?: string;
  median_home_price?: string;
  average_rent?: string;
  temperatures?: string;
  climate?: string;
  interesting_fact?: string;
  degree_holders?: string;
  number_of_universities?: string;
  top_universities?: string;
  number_of_nationalities?: string;
  language?: string;
  latitude?: string;
  longitude?: string;
  metadata?: string;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
};

export async function seedCities(prisma: PrismaClient) {
  const rows = readCsv<CityCsv>("cities.csv");

  const existingCountries = await prisma.country.findMany({
    select: { isoCode: true },
  });
  const validCountryIds = new Set(existingCountries.map((c) => c.isoCode));

  const skipped = rows.filter((r) => !validCountryIds.has(r.country_id));
  if (skipped.length > 0) {
    console.warn(
      `Cities skipped (unknown country_id): ${skipped
        .map((r) => `${r.name} (${r.country_id})`)
        .join(", ")}`,
    );
  }

  const data: Prisma.CityCreateManyInput[] = rows
    .filter((r) => validCountryIds.has(r.country_id))
    .map((r) => ({
      id: r.id,
      name: r.name,
      serial_number: r.serial_number,

      countryId: r.country_id,

      isCapital: toBool(r.is_capital),
      stateProvince: r.state_province || null,

      population: r.population ?? null,

      numberOfMultinationalHqs: r.number_of_multinational_hqs ?? null,
      numberOfAirports: toIntLoose(r.number_of_airports),

      largest_organization: r.largest_organization || null,

      currency: parseEnum(r.currency, Currency) as Currency,

      medianSalary: toInt(r.median_salary),
      costOfLiving: parseEnum(r.cost_of_living, CostOfLiving),
      medianHomePrice: toInt(r.median_home_price),
      averageRent: toInt(r.average_rent),

      temperatures: r.temperatures || null,
      climate: r.climate || null,
      interestingFact: r.interesting_fact || null,
      degreeHolders: r.degree_holders || null,

      numberOfUniversities: toInt(r.number_of_universities),
      top_universities: r.top_universities || null,

      numberOfNationalities: r.number_of_nationalities ?? null,

      language: parseEnumArray(r.language, Language),

      // NOTE: "peopleDescription" existe dans le schema City mais n'est pas
      // present dans cities_rows.csv -> laisse a null.

      latitude: toFloat(r.latitude),
      longitude: toFloat(r.longitude),

      metadata: toJson(r.metadata),

      deletedAt: toDate(r.deleted_at, false),
      createdAt: toDate(r.created_at, true) as Date,
      updatedAt: toDate(r.updated_at, true) as Date,
    }));

  const result = await prisma.city.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Cities rows imported: ${result.count}`);

  // NOTE: la relation M2M "mainIndustries" (Industry[]) n'est pas seedée ici.

  return result.count;
}
