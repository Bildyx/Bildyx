import {
  PrismaClient,
  Prisma,
  CostOfLiving,
  Language,
  Currency,
} from "@prisma/client";
import {
  readCsv,
  toInt,
  toIntLoose,
  toFloat,
  toBool,
  parseEnum,
  parseEnumArray,
} from "../seed-utils";

import { City } from "../../src/models/cities";

type CityCsv = Partial<Record<keyof City, string>>;

export async function seedCities(prisma: PrismaClient) {
  const rows = readCsv<CityCsv>("cities.csv");

  const existingCountries = await prisma.country.findMany({
    select: { isoCode: true },
  });
  const validCountryIds = new Set(existingCountries.map((c) => c.isoCode));

  const skipped = rows.filter((r) => !validCountryIds.has(r.country_id!));
  if (skipped.length > 0) {
    console.warn(
      `Cities skipped (unknown country_id): ${skipped
        .map((r) => `${r.name} (${r.country_id})`)
        .join(", ")}`,
    );
  }

  const data: Prisma.CityCreateManyInput[] = rows
    .filter((r) => validCountryIds.has(r.country_id!))
    .map((r) => ({
      id: r.id!,
      name: r.name!,
      serial_number: r.serial_number!,

      countryId: r.country_id!,

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

      peopleDescription: r.people_description || null,

      latitude: toFloat(r.latitude),
      longitude: toFloat(r.longitude),
    }));

  const result = await prisma.city.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Cities rows imported: ${result.count}`);

  // NOTE: the "mainIndustries" M2M relation (Industry[]) is not seeded here.

  return result.count;
}
