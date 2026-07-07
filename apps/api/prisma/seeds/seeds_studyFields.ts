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

  const data: Prisma.StudyFieldsCreateManyInput[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    serial_number: r.serial_number,

    area: r.area || null,
    description: r.description || null,

    score: r.score && r.score !== "" ? Number(r.score) : null,

    metadata: toJson(r.metadata),

    deleted_at: toDate(r.deleted_at, false),
    created_at: toDate(r.created_at, true) as Date,
    updated_at: toDate(r.updated_at, true) as Date,
  }));

  const result = await prisma.studyFields.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`StudyFields rows imported: ${result.count}`);

  return result.count;
}
