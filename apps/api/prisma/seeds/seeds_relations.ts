import { PrismaClient } from "@prisma/client";
import { readCsv, resolveNameList, buildNameLookup, slugify } from "../seed-utils";

// Colonnes de relation many-to-many ajoutees par
// scripts/generate_excel_templates.py (voir M2M_COLUMNS) : chacune contient
// une liste "Nom1;Nom2" de cles lisibles plutot qu'un id, puisque les
// relations M2M implicites de Prisma n'ont aucune colonne de cle etrangere
// pour les porter.

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

// Doit tourner apres tous les autres seeders : chaque relation reference des
// lignes creees par un seeder different (voire, pour la self-relation
// industries, par le seeder industries lui-meme).
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

  // organizations.csv laissait sa colonne slug vide sur la totalité de ses
  // lignes : `where: { slug: r.slug }` levait donc un P2025 qui interrompait
  // tout le seed à sa dernière étape. On résout désormais l'organisation par
  // son slug s'il est renseigné, sinon par slugify(name), et on ignore
  // proprement une ligne introuvable au lieu de faire échouer le seed.
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

  // Industry <-> Industry (self-relation, symmetrique : relier depuis
  // industries_A suffit, industries_B refletera la meme relation).
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
