import {
  PrismaClient,
  Prisma,
  CertificationCategory,
  DifficultyLevel,
} from "@prisma/client";
import {
  readCsv,
  toStringArray,
  parseEnum,
  buildNameLookup,
} from "../seed-utils";

import { Certification } from "../../src/models/certifications";

type CertificationCsv = Partial<Record<keyof Certification, string>> & {
  issuing_organization_name?: string;
};

export async function seedCertifications(prisma: PrismaClient) {
  const rows = readCsv<CertificationCsv>("certifications.csv");

  // certifications.csv fills issuing_organization_name with the
  // organization's name (e.g. "Adobe") rather than its UUID -> resolution by
  // name.
  const organizations = await prisma.organization.findMany({
    select: { id: true, name: true },
  });
  const resolveOrganizationId = buildNameLookup(organizations);
  const unmatchedOrganizations = new Set<string>();

  const data: Prisma.CertificationCreateManyInput[] = rows.map((r) => {
    const issuingOrganizationId = resolveOrganizationId(
      r.issuing_organization_name,
    );
    if (r.issuing_organization_name && !issuingOrganizationId) {
      unmatchedOrganizations.add(r.issuing_organization_name);
    }

    return {
      id: r.id!,
      name: r.name!,
      serial_number: r.serial_number!,

      issuingOrganizationId,

      description: r.description || null,
      level: r.level || null,

      category: parseEnum(r.category, CertificationCategory),

      products: toStringArray(r.products),
      jobs: toStringArray(r.jobs),

      validityDurationMonths:
        r.validity_duration_months && r.validity_duration_months !== ""
          ? Number(r.validity_duration_months)
          : null,

      difficulty: parseEnum(r.difficulty, DifficultyLevel),

      websiteUrl: r.website_url || null,

      score: r.score && r.score !== "" ? Number(r.score) : null,
    };
  });

  if (unmatchedOrganizations.size > 0) {
    console.warn(
      `Certifications: issuing_organization_name non resolus (mis a null): ${[...unmatchedOrganizations].join(", ")}`,
    );
  }

  // NOTE: depends on organizations.ts (issuing_organization_name) -> seed
  // that first.
  const result = await prisma.certification.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Certifications rows imported: ${result.count}`);

  return result.count;
}
