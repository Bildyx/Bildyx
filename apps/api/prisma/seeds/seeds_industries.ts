import { PrismaClient, Prisma } from "@prisma/client";
import { readCsv, toJson, toDate } from "../seed-utils";

import { Industry } from "../../src/models/industries";

type IndustryCsv = Partial<Record<keyof Industry, string>>;

export async function seedIndustries(prisma: PrismaClient) {
  const rows = readCsv<IndustryCsv>("industries.csv");

  const data: Prisma.IndustryCreateManyInput[] = rows.map((r) => ({
    id: r.id!,
    name: r.name!,
    serial_number: r.serial_number!,

    description: r.description || null,
    iconUrl: r.icon_url || null,

    score: r.score && r.score !== "" ? Number(r.score) : null,
  }));

  const result = await prisma.industry.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Industries rows imported: ${result.count}`);

  // NOTE: the "relatedIndustries" self-relation (implicit Prisma table) is
  // not seeded here as it is absent from the CSV.

  return result.count;
}
