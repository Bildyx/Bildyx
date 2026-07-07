import { PrismaClient, Prisma, DegreeLevel } from "@prisma/client";
import { parse } from "csv-parse/sync";
import fs from "node:fs";

const prisma = new PrismaClient();

function readCsv<T>(file: string): T[] {
  const csv = fs.readFileSync(`data/${file}`, "utf8");

  return parse(csv, {
    columns: true,
    delimiter: ",",
    skip_empty_lines: true,
  }) as T[];
}

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

function parseLevel(level?: string): DegreeLevel | null {
  if (!level) return null;

  return DegreeLevel[level as keyof typeof DegreeLevel] ?? null;
}

async function main() {
  const degreesCsv = readCsv<DegreeCsv>("degrees_rows.csv");

  const degrees: Prisma.DegreeCreateManyInput[] = degreesCsv.map((r) => ({
    id: r.id,
    name: r.name,
    serialNumber: r.serial_number,

    level: parseLevel(r.level),

    area: r.area || null,

    durationYears:
      r.duration_years && r.duration_years !== ""
        ? Number(r.duration_years)
        : null,

    description: r.description || null,

    score:
      r.score && r.score !== ""
        ? Number(r.score)
        : null,

    metadata:
      r.metadata && r.metadata.trim() !== ""
        ? JSON.parse(r.metadata)
        : Prisma.JsonNull,

    deletedAt:
      r.deleted_at && r.deleted_at !== ""
        ? new Date(r.deleted_at)
        : null,

    createdAt:
      r.created_at && r.created_at !== ""
        ? new Date(r.created_at)
        : new Date(),

    updatedAt:
      r.updated_at && r.updated_at !== ""
        ? new Date(r.updated_at)
        : new Date(),
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