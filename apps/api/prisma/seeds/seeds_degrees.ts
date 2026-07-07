import { PrismaClient, Prisma, DegreeLevel } from "@prisma/client";
import { readCsv, toJson, toDate, toFloat, parseEnum } from "../seed-utils";

type DegreeCsv = {
  id: string;
  name: string;
  serial_number: string;
  level?: string;
  area?: string;
  duration_years?: string;
  description?: string;
  score?: string;
  metadata?: string;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
};

export async function seedDegrees(prisma: PrismaClient) {
  const rows = readCsv<DegreeCsv>("degrees.csv");

  const data: Prisma.DegreeCreateManyInput[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    serial_number: r.serial_number,

    level: parseEnum(r.level, DegreeLevel),

    area: r.area || null,

    durationYears: toFloat(r.duration_years),

    description: r.description || null,

    score: r.score && r.score !== "" ? Number(r.score) : null,

    metadata: toJson(r.metadata),

    deletedAt: toDate(r.deleted_at, false),
    createdAt: toDate(r.created_at, true) as Date,
    updatedAt: toDate(r.updated_at, true) as Date,
  }));

  const result = await prisma.degree.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Degrees rows imported: ${result.count}`);

  return result.count;
}
