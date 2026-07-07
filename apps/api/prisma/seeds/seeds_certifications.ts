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
} from "../seed-utils";

type CertificationCsv = {
  id: string;
  name: string;
  serial_number: string;
  issuing_organization_id?: string;
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
  const rows = readCsv<CertificationCsv>("certifications_rows.csv");

  const data: Prisma.CertificationCreateManyInput[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    serial_number: r.serial_number,

    issuingOrganizationId: r.issuing_organization_id || null,

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

    score:
      r.score && r.score !== "" ? Number(r.score) : null,

    metadata: toJson(r.metadata),

    deletedAt: toDate(r.deleted_at, false),
    createdAt: toDate(r.created_at, true) as Date,
    updatedAt: toDate(r.updated_at, true) as Date,
  }));

  // NOTE: depend de organizations.ts (issuing_organization_id) -> a seeder
  // avant.
  const result = await prisma.certification.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Certifications rows imported: ${result.count}`);

  return result.count;
}
