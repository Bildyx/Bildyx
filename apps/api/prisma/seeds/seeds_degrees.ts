import { PrismaClient, Prisma, DegreeLevel } from "@prisma/client";
import { readCsv, toJson, toDate, toFloat, parseEnum } from "../seed-utils";

import { Degree } from "../../src/models/degrees";

type DegreeCsv = Partial<Record<keyof Degree, string>>;

export async function seedDegrees(prisma: PrismaClient) {
  const rows = readCsv<DegreeCsv>("degrees.csv");

  const data: Prisma.DegreeCreateManyInput[] = rows.map((r) => ({
    id: r.id!,
    name: r.name!,
    serial_number: r.serial_number!,

    level: parseEnum(r.level, DegreeLevel),

    area: r.area || null,

    durationYears: toFloat(r.duration_years),

    description: r.description || null,

    score: r.score && r.score !== "" ? Number(r.score) : null,
  }));

  const result = await prisma.degree.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Degrees rows imported: ${result.count}`);

  return result.count;
}
