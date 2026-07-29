import { PrismaClient } from "@prisma/client";
import { readCsv, resolveNameList, buildNameLookup, slugify } from "../seed-utils";

// Many-to-many relation columns added by
// scripts/generate_excel_templates.py (see M2M_COLUMNS): each holds a
// "Name1;Name2" list of human-readable keys rather than an id, since Prisma's
// implicit M2M relations have no foreign key column to carry them.

type OrganizationRelationsCsv = {
  name: string;
  slug?: string;
  countries?: string;
  industries?: string;
  working_area_cities?: string;
};

type CityRelationsCsv = {
  serial_number: string;
  main_industries?: string;
};

type SubjectRelationsCsv = {
  serial_number: string;
  industries?: string;
};

type IndustryRelationsCsv = {
  serial_number: string;
  related_industries?: string;
};

// Must run after every other seeder: each relation references rows created
// by a different seeder (or, for the industries self-relation, by the
// industries seeder itself).
export async function seedManyToManyRelations(prisma: PrismaClient) {
  const validCountryIsoCodes = new Set(
    (await prisma.country.findMany({ select: { isoCode: true } })).map(
      (c) => c.isoCode,
    ),
  );
  const resolveIndustryId = buildNameLookup(
    await prisma.industry.findMany({ select: { id: true, name: true } }),
  );
  const resolveCityId = buildNameLookup(
    await prisma.city.findMany({ select: { id: true, name: true } }),
  );

  // organizations.csv left its slug column empty on every one of its rows:
  // `where: { slug: r.slug }` therefore raised a P2025 that aborted the whole
  // seed at its last step. We now resolve the organization by its slug when
  // set, otherwise by slugify(name), and cleanly skip a row that cannot be
  // found instead of failing the seed.
  const organizations = await prisma.organization.findMany({
    select: { id: true, slug: true },
  });
  const organizationIdBySlug = new Map(organizations.map((o) => [o.slug, o.id]));

  let linked = 0;
  let skipped = 0;

  // Organization <-> Country / Industry / City (working area)
  const organizationRows = readCsv<OrganizationRelationsCsv>(
    "organizations.csv",
  );
  for (const r of organizationRows) {
    const countryCodes = r.countries
      ? r.countries
          .split(/[;,]/)
          .map((c) => c.trim().toUpperCase())
          .filter((c) => validCountryIsoCodes.has(c))
      : [];
    const industryIds = resolveNameList(r.industries, resolveIndustryId);
    const cityIds = resolveNameList(r.working_area_cities, resolveCityId);

    if (!countryCodes.length && !industryIds.length && !cityIds.length) {
      continue;
    }

    const organizationId =
      organizationIdBySlug.get((r.slug ?? "").trim()) ??
      organizationIdBySlug.get(slugify(r.name ?? ""));
    if (!organizationId) {
      console.warn(`  Organisation introuvable pour "${r.name}" - relations ignorées`);
      skipped++;
      continue;
    }

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        countries: { connect: countryCodes.map((isoCode) => ({ isoCode })) },
        industries: { connect: industryIds.map((id) => ({ id })) },
        cities_working_area: { connect: cityIds.map((id) => ({ id })) },
      },
    });
    linked++;
  }

  // City <-> Industry (main industries)
  const cityRows = readCsv<CityRelationsCsv>("cities.csv");
  for (const r of cityRows) {
    const industryIds = resolveNameList(r.main_industries, resolveIndustryId);
    if (!industryIds.length) continue;

    if (!(await prisma.city.findUnique({ where: { serial_number: r.serial_number }, select: { id: true } }))) {
      console.warn(`  city ${r.serial_number} introuvable - relations ignorées`);
      skipped++;
      continue;
    }

    await prisma.city.update({
      where: { serial_number: r.serial_number },
      data: { mainIndustries: { connect: industryIds.map((id) => ({ id })) } },
    });
    linked++;
  }

  // Subject <-> Industry (product industries)
  const subjectRows = readCsv<SubjectRelationsCsv>("subjects.csv");
  for (const r of subjectRows) {
    const industryIds = resolveNameList(r.industries, resolveIndustryId);
    if (!industryIds.length) continue;

    if (!(await prisma.subject.findUnique({ where: { serial_number: r.serial_number }, select: { id: true } }))) {
      console.warn(`  subject ${r.serial_number} introuvable - relations ignorées`);
      skipped++;
      continue;
    }

    await prisma.subject.update({
      where: { serial_number: r.serial_number },
      data: { industries: { connect: industryIds.map((id) => ({ id })) } },
    });
    linked++;
  }

  // Industry <-> Industry (self-relation, symmetric: linking from
  // industries_A is enough, industries_B will reflect the same relation).
  const industryRows = readCsv<IndustryRelationsCsv>("industries.csv");
  for (const r of industryRows) {
    const relatedIds = resolveNameList(
      r.related_industries,
      resolveIndustryId,
    );
    if (!relatedIds.length) continue;

    if (!(await prisma.industry.findUnique({ where: { serial_number: r.serial_number }, select: { id: true } }))) {
      console.warn(`  industry ${r.serial_number} introuvable - relations ignorées`);
      skipped++;
      continue;
    }

    await prisma.industry.update({
      where: { serial_number: r.serial_number },
      data: { industries_A: { connect: relatedIds.map((id) => ({ id })) } },
    });
    linked++;
  }

  console.log(
    `Many-to-many relations linked: ${linked} rows updated` +
      (skipped > 0 ? `, ${skipped} ignorées (référence introuvable)` : ""),
  );

  return linked;
}
