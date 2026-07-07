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

export async function seedUniversities(prisma: PrismaClient) {
  const rows = readCsv<UniversityCsv>("universities.csv");

  const data: Prisma.UniversityCreateManyInput[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    serial_number: r.serial_number,

    type: parseEnum(r.type, UniversityType),

    description: r.description || null,
    websiteUrl: r.website_url || null,
    logoUrl: r.logo_url || null,

    countryId: r.country_id || null,
    cityId: r.city_id || null,

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
  }));

  // NOTE: depend de countries.ts et cities.ts (country_id / city_id) -> a
  // seeder avant.
  const result = await prisma.university.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Universities rows imported: ${result.count}`);

  return result.count;
}
