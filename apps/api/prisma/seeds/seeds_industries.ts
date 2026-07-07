import { PrismaClient, Prisma } from "@prisma/client";
import { readCsv, toJson, toDate } from "../seed-utils";

type IndustryCsv = {
  id: string;
  name: string;
  serial_number: string;
  description?: string;
  icon_url?: string;
  metadata?: string;
  score?: string;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
};

export async function seedIndustries(prisma: PrismaClient) {
  const rows = readCsv<IndustryCsv>("industries_rows.csv");

  const data: Prisma.IndustryCreateManyInput[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    serialNumber: r.serial_number,

    description: r.description || null,
    iconUrl: r.icon_url || null,

    metadata: toJson(r.metadata),

    score:
      r.score && r.score !== "" ? Number(r.score) : null,

    deletedAt: toDate(r.deleted_at, false),
    createdAt: toDate(r.created_at, true) as Date,
    updatedAt: toDate(r.updated_at, true) as Date,
  }));

  const result = await prisma.industry.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Industries rows imported: ${result.count}`);

  // NOTE: la self-relation "relatedIndustries" (table implicite Prisma) n'est
  // pas seedée ici car absente du CSV.

  return result.count;
}
