#!/usr/bin/env -S npx tsx
// One-off data migration for the University -> Organization merge. Run this
// AFTER migration 20260728120000_add_academic_fields_and_new_profile_tables
// has been applied (needs organizations.student_count/postgraduates and
// user_educations.organization_id to exist) and BEFORE
// 20260728120100_drop_university_after_data_migration (which drops the
// universities table and user_educations.university_id for good).
//
// The `universities` table and `user_educations.university_id` column are
// deliberately read via raw SQL, not a Prisma Client delegate: schema.prisma
// no longer declares a University model (removed as part of this same
// merge), so a Client generated from the current schema has no
// `prisma.university` - but the physical table/column still exist in the
// database at the point this script is meant to run (between the two
// migrations above). Raw SQL reads the DB as it actually is right now,
// independent of what the checked-in schema currently declares.
//
// For every University row: upserts a matching Organization (by slug) with
// subtype=UNIVERSITY and the academic fields carried over, then repoints
// every user_educations.university_id to that Organization's id via
// organization_id. Idempotent: re-running matches existing rows by slug and
// updates them instead of duplicating, and only touches user_educations
// rows where organization_id is still null.
//
// Fields with no home on Organization (dropped, not migrated - Organization
// has no equivalent field): websiteUrl, logoUrl, localName, notes,
// scoreUniversity, countryId (Organization only derives a country via its
// headquartersCity relation, not a direct field). University.established
// maps to Organization.founded (same "founding date" meaning, matching how
// the field is used elsewhere on Organization).
//
// Usage:
//   tsx prisma/migrate-universities-to-organizations.ts [--dry-run]

import "dotenv/config";
import { PrismaClient, OrganizationSubType, Prisma } from "@prisma/client";
import { slugify } from "./seed-utils";

const prisma = new PrismaClient();

interface UniversityRow {
  id: string;
  name: string;
  serial_number: string;
  type: string | null;
  description: string | null;
  city_id: string | null;
  established: string | null;
  score: number | null;
  student_count: number | null;
  undergraduates: number | null;
  postgraduates: number | null;
  metadata: unknown;
}

interface UserEducationToRepoint {
  id: string;
  university_id: string;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const universities = await prisma.$queryRaw<UniversityRow[]>`
    SELECT id, name, serial_number, type, description, city_id, established,
           score, student_count, undergraduates, postgraduates, metadata
    FROM universities
  `;
  console.log(`Found ${universities.length} universities to migrate.`);

  const existingOrgs = await prisma.organization.findMany({
    select: { id: true, slug: true, serial_number: true },
  });
  const orgIdBySlug = new Map(existingOrgs.map((o) => [o.slug, o.id]));
  const usedSerialNumbers = new Set(existingOrgs.map((o) => o.serial_number));

  const orgIdByUniversityId = new Map<string, string>();

  for (const uni of universities) {
    const slug = slugify(uni.name);
    // Organization.serial_number is unique across ALL organizations, while
    // University.serial_number was only unique among universities - guard
    // against a real collision instead of letting the upsert crash.
    let serialNumber = uni.serial_number;
    if (usedSerialNumbers.has(serialNumber) && !orgIdBySlug.has(slug)) {
      serialNumber = `${serialNumber}-UNI`;
    }
    usedSerialNumbers.add(serialNumber);

    const data = {
      name: uni.name,
      slug,
      serial_number: serialNumber,
      subtype: OrganizationSubType.UNIVERSITY,
      // UniversityType's old values (GRANDE_ECOLE, INSTITUTE, ...) map 1:1
      // onto the free-text type1.
      type1: uni.type,
      description: uni.description,
      city_id: uni.city_id,
      founded: uni.established,
      score: uni.score,
      studentCount: uni.student_count,
      undergraduates: uni.undergraduates,
      postgraduates: uni.postgraduates,
      metadata: (uni.metadata ?? Prisma.JsonNull) as Prisma.InputJsonValue | typeof Prisma.JsonNull,
    };

    console.log(`${dryRun ? "[dry-run] " : ""}University "${uni.name}" -> Organization slug="${slug}"`);

    if (dryRun) {
      orgIdByUniversityId.set(uni.id, orgIdBySlug.get(slug) ?? "(would be created)");
      continue;
    }

    const existingId = orgIdBySlug.get(slug);
    const org = existingId
      ? await prisma.organization.update({ where: { id: existingId }, data })
      : await prisma.organization.create({ data });

    orgIdBySlug.set(slug, org.id);
    orgIdByUniversityId.set(uni.id, org.id);
  }

  const educationsToRepoint = await prisma.$queryRaw<UserEducationToRepoint[]>`
    SELECT id, university_id
    FROM user_educations
    WHERE university_id IS NOT NULL AND organization_id IS NULL
  `;
  console.log(`Found ${educationsToRepoint.length} user_educations rows to repoint.`);

  for (const edu of educationsToRepoint) {
    const organizationId = orgIdByUniversityId.get(edu.university_id);
    if (!organizationId) {
      console.warn(`  Skipping user_educations ${edu.id}: no migrated organization for university_id ${edu.university_id}`);
      continue;
    }
    console.log(`${dryRun ? "[dry-run] " : ""}user_educations ${edu.id}: university_id ${edu.university_id} -> organization_id ${organizationId}`);
    if (!dryRun) {
      await prisma.userEducations.update({ where: { id: edu.id }, data: { organization_id: organizationId } });
    }
  }

  console.log(dryRun ? "\nDry run complete - no data was written." : "\nMigration complete.");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
