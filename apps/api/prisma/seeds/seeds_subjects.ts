import { PrismaClient, Prisma, SubjectCategory } from "@prisma/client";
import {
  readCsv,
  toJson,
  toDate,
  toStringArray,
  parseEnum,
  buildNameLookup,
} from "../seed-utils";

type SubjectCsv = {
  id: string;
  name: string;
  serial_number: string;
  type?: string;
  description?: string;
  short_description?: string;
  category?: string;
  competitors?: string;
  vendors?: string;
  fun_fact?: string;
  organization_name?: string;
  website_url?: string;
  logo_url?: string;
  tags?: string;
  score?: string;
  metadata?: string;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
};

export async function seedSubjects(prisma: PrismaClient) {
  const rows = readCsv<SubjectCsv>("subjects.csv");

  // subjects.csv renseigne organization_name avec le nom de l'organisation
  // plutot que son UUID -> resolution par nom (meme pattern que
  // certifications.issuing_organization_name).
  const organizations = await prisma.organization.findMany({
    select: { id: true, name: true },
  });
  const resolveOrganizationId = buildNameLookup(organizations);
  const unmatchedOrganizations = new Set<string>();

  const data: Prisma.SubjectCreateManyInput[] = rows.map((r) => {
    const organization_id = resolveOrganizationId(r.organization_name);
    if (r.organization_name && !organization_id) {
      unmatchedOrganizations.add(r.organization_name);
    }

    return {
      id: r.id,
      name: r.name,
      serial_number: r.serial_number,

      type: r.type || null,

      description: r.description || null,
      short_description: r.short_description || null,

      category: parseEnum(r.category, SubjectCategory),

      competitors: toStringArray(r.competitors),
      vendors: toStringArray(r.vendors),

      fun_fact: r.fun_fact || null,

      organization_id,

      website_url: r.website_url || null,
      logo_url: r.logo_url || null,

      tags: toStringArray(r.tags),

      score: r.score && r.score !== "" ? Number(r.score) : null,

      metadata: toJson(r.metadata),

      deleted_at: toDate(r.deleted_at, false),
      created_at: toDate(r.created_at, true) as Date,
      updated_at: toDate(r.updated_at, true) as Date,
    };
  });

  if (unmatchedOrganizations.size > 0) {
    console.warn(
      `Subjects: organization_name non resolus (mis a null): ${[...unmatchedOrganizations].join(", ")}`,
    );
  }

  // NOTE: depend de organizations.ts (organization_name) -> a seeder avant.
  const result = await prisma.subject.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Subjects rows imported: ${result.count}`);

  return result.count;
}
