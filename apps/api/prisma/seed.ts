import { PrismaClient, Prisma } from "@prisma/client";
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

async function main() {
  
  //Degrees
  type DegreeCsv = {
    name: string;
    serial_number: string;
    area?: string;
    description?: string;
  };

  const degreesCsv = readCsv<DegreeCsv>("degrees_rows.csv");

  const degrees: Prisma.DegreeCreateManyInput[] = degreesCsv.map((r) => ({
    name: r.name,
    serialNumber: r.serial_number,
    area: r.area || null,
    description: r.description || null,
  }));

  const degreesResult = await prisma.degree.createMany({
    data: degrees,
    skipDuplicates: true,
  });

  console.log(`Degrees rows imported : ${degreesResult.count}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });