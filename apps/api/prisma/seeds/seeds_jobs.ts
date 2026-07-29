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
  buildNameLookup,
} from "../seed-utils";

type JobCsv = {
  id: string;
  title: string;
  serial_number: string;
  category?: string;
  description?: string;
  seniority_level?: string;
  industry_name?: string;
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
  const rows = readCsv<JobCsv>("jobs.csv");

  // jobs.csv fills industry_name with the industry's name rather than its
  // uuid -> resolution by name (same pattern as
  // certifications.issuing_organization_id).
  const industries = await prisma.industry.findMany({
    select: { id: true, name: true },
  });
  const resolveIndustryId = buildNameLookup(industries);
  const unmatchedIndustries = new Set<string>();

  const data: Prisma.JobCreateManyInput[] = rows.map((r) => {
    const industryId = resolveIndustryId(r.industry_name);
    if (r.industry_name && !industryId) unmatchedIndustries.add(r.industry_name);

    return {
      id: r.id,
      title: r.title,
      serial_number: r.serial_number,

      category: parseEnum(r.category, JobCategory),

      description: r.description || null,

      seniorityLevel: parseEnum(r.seniority_level, SeniorityLevel),

      industryId,

      products: toStringArray(r.products),
      toolsAndTech: toStringArray(r.tools_and_tech),
      tags: toStringArray(r.tags),

      metadata: toJson(r.metadata),

      score: r.score && r.score !== "" ? Number(r.score) : null,

      deletedAt: toDate(r.deleted_at, false),
      createdAt: toDate(r.created_at, true) as Date,
      updatedAt: toDate(r.updated_at, true) as Date,
    };
  });

  if (unmatchedIndustries.size > 0) {
    console.warn(
      `Jobs: industry_name non resolus (mis a null): ${[...unmatchedIndustries].join(", ")}`,
    );
  }

  // NOTE: depends on industries.ts (industry_name) -> seed that first.
  const result = await prisma.job.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Jobs rows imported: ${result.count}`);

  return result.count;
}
