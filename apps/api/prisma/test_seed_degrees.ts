import { PrismaClient, Prisma, DegreeLevel } from "@prisma/client";
import { readCsv, toDate, toInt, toFloat, toJson, parseEnum } from "./seed-utils";

const prisma = new PrismaClient();

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

async function main() {
  const degreesCsv = readCsv<DegreeCsv>("degrees.csv");

  const degrees: Prisma.DegreeCreateManyInput[] = degreesCsv.map((r) => ({
    id: r.id,
    name: r.name,
    serial_number: r.serial_number,

    level: parseEnum(r.level, DegreeLevel),

    area: r.area || null,

    durationYears: toFloat(r.duration_years),

    description: r.description || null,

    score: toInt(r.score),

    metadata: toJson(r.metadata),

    deletedAt: toDate(r.deleted_at, false),
    createdAt: toDate(r.created_at, true) as Date,
    updatedAt: toDate(r.updated_at, true) as Date,
  }));

  const result = await prisma.degree.createMany({
    data: degrees,
    skipDuplicates: true,
  });

  console.log(`Degrees rows imported: ${result.count}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
