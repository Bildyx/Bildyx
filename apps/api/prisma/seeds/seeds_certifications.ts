import {
  PrismaClient,
  Prisma,
  CertificationCategory,
  DifficultyLevel,
} from "@prisma/client";
import {
  readCsv,
  toJson,
  toDate,
  toStringArray,
  parseEnum,
  buildNameLookup,
} from "../seed-utils";

type CertificationCsv = {
  id: string;
  name: string;
  serial_number: string;
  issuing_organization_name?: string;
  description?: string;
  level?: string;
  category?: string;
  products?: string;
  jobs?: string;
  validity_duration_months?: string;
  difficulty?: string;
  website_url?: string;
  score?: string;
  metadata?: string;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
};

export async function seedCertifications(prisma: PrismaClient) {
  const rows = readCsv<CertificationCsv>("certifications.csv");

  // certifications.csv renseigne issuing_organization_name avec le nom de
  // l'organisation (ex: "Adobe") plutot que son UUID -> resolution par nom.
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
      id: r.id,
      name: r.name,
      serial_number: r.serial_number,

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

      metadata: toJson(r.metadata),

      deletedAt: toDate(r.deleted_at, false),
      createdAt: toDate(r.created_at, true) as Date,
      updatedAt: toDate(r.updated_at, true) as Date,
    };
  });

  if (unmatchedOrganizations.size > 0) {
    console.warn(
      `Certifications: issuing_organization_name non resolus (mis a null): ${[...unmatchedOrganizations].join(", ")}`,
    );
  }

  // NOTE: depend de organizations.ts (issuing_organization_name) -> a seeder
  // avant.
  const result = await prisma.certification.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Certifications rows imported: ${result.count}`);

  return result.count;
}
