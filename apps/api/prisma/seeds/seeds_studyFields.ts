import { PrismaClient, Prisma } from "@prisma/client";
import { readCsv, toJson, toDate } from "../seed-utils";

type StudyFieldCsv = {
  id: string;
  name: string;
  serial_number: string;
  area?: string;
  description?: string;
  score?: string;
  metadata?: string;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
};

export async function seedStudyFields(prisma: PrismaClient) {
  const rows = readCsv<StudyFieldCsv>("study_fields_rows.csv");

  const data: Prisma.StudyFieldCreateManyInput[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    serialNumber: r.serial_number,

    area: r.area || null,
    description: r.description || null,

    score:
      r.score && r.score !== "" ? Number(r.score) : null,

    metadata: toJson(r.metadata),

    deletedAt: toDate(r.deleted_at, false),
    createdAt: toDate(r.created_at, true) as Date,
    updatedAt: toDate(r.updated_at, true) as Date,
  }));

  const result = await prisma.studyField.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`StudyFields rows imported: ${result.count}`);

  return result.count;
}
