import {
  PrismaClient,
  Prisma,
  JobCategory,
  SeniorityLevel,
} from "@prisma/client";
import {
  readCsv,
  toJson,
  toDate,
  toStringArray,
  parseEnum,
} from "../seed-utils";

type JobCsv = {
  id: string;
  title: string;
  serial_number: string;
  category?: string;
  description?: string;
  seniority_level?: string;
  industry_id?: string;
  products?: string;
  tools_and_tech?: string;
  tags?: string;
  metadata?: string;
  score?: string;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
};

export async function seedJobs(prisma: PrismaClient) {
  const rows = readCsv<JobCsv>("jobs_rows.csv");

  const data: Prisma.JobCreateManyInput[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    serialNumber: r.serial_number,

    category: parseEnum(r.category, JobCategory),

    description: r.description || null,

    seniorityLevel: parseEnum(r.seniority_level, SeniorityLevel),

    industryId: r.industry_id || null,

    products: toStringArray(r.products),
    toolsAndTech: toStringArray(r.tools_and_tech),
    tags: toStringArray(r.tags),

    metadata: toJson(r.metadata),

    score:
      r.score && r.score !== "" ? Number(r.score) : null,

    deletedAt: toDate(r.deleted_at, false),
    createdAt: toDate(r.created_at, true) as Date,
    updatedAt: toDate(r.updated_at, true) as Date,
  }));

  // NOTE: depend de industries.ts (industry_id) -> a seeder avant.
  const result = await prisma.job.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Jobs rows imported: ${result.count}`);

  return result.count;
}
