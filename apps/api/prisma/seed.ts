import { PrismaClient, Prisma } from "@prisma/client";
import { parse } from "csv-parse/sync";
import fs from "node:fs";

const prisma = new PrismaClient();

async function main() {
  console.log(process.cwd());
  console.log(fs.existsSync("data/degrees.csv"));
  const csv = fs.readFileSync("data/degrees.csv", "utf8");

  const records = parse(csv, {
    columns: true,
    delimiter: ";",
    skip_empty_lines: true,
  });

  const degrees: Prisma.DegreeCreateManyInput[] = records.map((r: any) => ({
    name: r.name,
    serialNumber: r.serial_number,
    area: r.area || null,
    description: r.description || null,
  }));

  const result = await prisma.degree.createMany({
    data: degrees,
    skipDuplicates: true,
  });

  console.log(`${result.count} raws imported.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });