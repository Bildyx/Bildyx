import { PrismaClient, Prisma, UniversityType } from "@prisma/client";
import {
  readCsv,
  toJson,
  toDate,
  toInt,
  toFloat,
  parseEnum,
} from "../seed-utils";

type UniversityCsv = {
  id: string;
  name: string;
  serial_number: string;
  type?: string;
  description?: string;
  website_url?: string;
  logo_url?: string;
  country_id?: string;
  city_id?: string;
  student_count?: string;
  metadata?: string;
  score_university?: string;
  local_name?: string;
  notes?: string;
  established?: string;
  score?: string;
  undergraduates?: string;
  postgraduates?: string;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
};

// universities.csv renseigne country_id/city_id avec des noms lisibles
// ("USA", "Cambridge,Massachusetts") plutot que les vraies cles (iso_code /
// UUID genere a l'insertion des villes) -> on resout par nom apres avoir
// seede countries et cities.
const COUNTRY_NAME_ALIASES: Record<string, string> = {
  USA: "United States",
  US: "United States",
  UK: "United Kingdom",
};

function normalizeName(v: string): string {
  return v.trim().toLowerCase();
}

async function buildCountryLookup(prisma: PrismaClient) {
  const countries = await prisma.country.findMany({
    select: { isoCode: true, name: true },
  });
  const byName = new Map(
    countries.map((c) => [normalizeName(c.name), c.isoCode]),
  );

  return (rawCountryId?: string): string | null => {
    if (!rawCountryId || rawCountryId.trim() === "") return null;
    const trimmed = rawCountryId.trim();
    const aliased = COUNTRY_NAME_ALIASES[trimmed.toUpperCase()] ?? trimmed;
    return byName.get(normalizeName(aliased)) ?? null;
  };
}

async function buildCityLookup(prisma: PrismaClient) {
  const cities = await prisma.city.findMany({
    select: { id: true, name: true, stateProvince: true },
  });
  const byNameAndState = new Map(
    cities.map((c) => [
      `${normalizeName(c.name)}|${normalizeName(c.stateProvince ?? "")}`,
      c.id,
    ]),
  );
  const byNameOnly = new Map<string, string[]>();
  for (const c of cities) {
    const key = normalizeName(c.name);
    byNameOnly.set(key, [...(byNameOnly.get(key) ?? []), c.id]);
  }

  // "CityName,StateProvince" ou juste "CityName"
  return (rawCityId?: string): string | null => {
    if (!rawCityId || rawCityId.trim() === "") return null;
    const parts = rawCityId.split(",").map((s) => s.trim());
    const namePart = parts[0] ?? "";
    const statePart = parts[1] ?? "";

    const exact = byNameAndState.get(
      `${normalizeName(namePart)}|${normalizeName(statePart)}`,
    );
    if (exact) return exact;

    const matches = byNameOnly.get(normalizeName(namePart));
    if (matches && matches.length === 1) return (matches[0] ?? null);

    return null;
  };
}

export async function seedUniversities(prisma: PrismaClient) {
  const rows = readCsv<UniversityCsv>("universities.csv");

  const resolveCountryId = await buildCountryLookup(prisma);
  const resolveCityId = await buildCityLookup(prisma);

  const unmatchedCountries = new Set<string>();
  const unmatchedCities = new Set<string>();

  const data: Prisma.UniversityCreateManyInput[] = rows.map((r) => {
    const countryId = resolveCountryId(r.country_id);
    if (r.country_id && !countryId) unmatchedCountries.add(r.country_id);

    const cityId = resolveCityId(r.city_id);
    if (r.city_id && !cityId) unmatchedCities.add(r.city_id);

    return {
      id: r.id,
      name: r.name,
      serial_number: r.serial_number,

      type: parseEnum(r.type, UniversityType),

      description: r.description || null,
      websiteUrl: r.website_url || null,
      logoUrl: r.logo_url || null,

      countryId,
      cityId,

      studentCount: toInt(r.student_count),

      metadata: toJson(r.metadata),

      scoreUniversity: toFloat(r.score_university),

      localName: r.local_name || null,
      notes: r.notes || null,
      established: r.established || null,

      score: toInt(r.score),

      undergraduates: toInt(r.undergraduates),
      postgraduates: toInt(r.postgraduates),

      deletedAt: toDate(r.deleted_at, false),
      createdAt: toDate(r.created_at, true) as Date,
      updatedAt: toDate(r.updated_at, true) as Date,
    };
  });

  if (unmatchedCountries.size > 0) {
    console.warn(
      `Universities: country_id non resolus (mis a null): ${[...unmatchedCountries].join(", ")}`,
    );
  }
  if (unmatchedCities.size > 0) {
    console.warn(
      `Universities: city_id non resolus (mis a null): ${[...unmatchedCities].join(", ")}`,
    );
  }

  // NOTE: depend de countries.ts et cities.ts (country_id / city_id) -> a
  // seeder avant.
  const result = await prisma.university.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Universities rows imported: ${result.count}`);

  return result.count;
}
