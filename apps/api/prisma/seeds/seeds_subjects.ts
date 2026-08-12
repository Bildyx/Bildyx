import { PrismaClient, Prisma, SubjectCategory } from "@prisma/client";
import {
  readCsv,
  toJson,
  toDate,
  toStringArray,
  parseEnum,
  buildNameLookup,
} from "../seed-utils";

import { Subject } from "../../src/models/subjects";

type SubjectCsv = Partial<Record<keyof Subject, string>> & {
  organization_name?: string;
};

export async function seedSubjects(prisma: PrismaClient) {
  const rows = readCsv<SubjectCsv>("subjects.csv");

  // subjects.csv fills organization_name with the organization's name rather
  // than its UUID -> resolution by name (same pattern as
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
      id: r.id!,
      name: r.name!,
      serial_number: r.serial_number!,

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
    };
  });

  if (unmatchedOrganizations.size > 0) {
    console.warn(
      `Subjects: organization_name non resolus (mis a null): ${[...unmatchedOrganizations].join(", ")}`,
    );
  }

  // NOTE: depends on organizations.ts (organization_name) -> seed that first.
  const result = await prisma.subject.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Subjects rows imported: ${result.count}`);

  return result.count;
}
