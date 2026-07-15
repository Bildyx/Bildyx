import { randomUUID } from "node:crypto";
import {
  EmployeeCountRange,
  OrganizationSubType,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import {
  buildNameLookup,
  normalizeEnumKey,
  parseEnum,
  readCsv,
  toDate,
  toInt,
  toJson,
  toStringArray,
} from "../seed-utils";

// EmployeeCountRange values are like RANGE_1_10, RANGE_5000_PLUS.
// Handles CSV cells such as "1-10", "1_10", "5000+".
function parseEmployeeRange(v?: string): EmployeeCountRange | null {
  if (!v || v.trim() === "") return null;

  if (v.trim() === "5000+") return EmployeeCountRange.RANGE_5000_PLUS;

  const key = normalizeEnumKey(v);

  if (key in EmployeeCountRange) {
    return EmployeeCountRange[key as keyof typeof EmployeeCountRange];
  }

  const prefixed = `RANGE_${key}`;
  if (prefixed in EmployeeCountRange) {
    return EmployeeCountRange[prefixed as keyof typeof EmployeeCountRange];
  }

  if (key === "5000_PLUS" || key === "5000") {
    return EmployeeCountRange.RANGE_5000_PLUS;
  }

  return null;
}

// Colonnes reellement presentes dans organizations.csv (le fichier ne
// contient pas d'id/created_at/updated_at/deleted_at, et son "type" est une
// colonne texte unique, sans equivalent des type1/type2 du schema actuel).
type OrganizationCsv = {
  name: string;
  slug: string;
  type?: string;
  legal_status?: string;
  ownership?: string;
  mission?: string;
  known_for?: string;
  activities?: string;
  project?: string;
  research_areas?: string;
  products?: string;
  services?: string;
  partnerships?: string;
  budget?: string;
  founded?: string;
  founder?: string;
  equipments?: string;
  score?: string;
  city_id?: string;
  numberOfEmployees?: string;
  numberOfSubsidiaries?: string;
  parent_organization_id?: string;
  metadata?: string;
};

export async function seedOrganizations(prisma: PrismaClient) {
  const rows = readCsv<OrganizationCsv>("organizations.csv");

  // organizations.csv renseigne city_id avec le nom de la ville (les villes
  // sont deja seedees a ce stade) et parent_organization_id avec le nom
  // d'une autre organisation du meme fichier (elle n'a pas encore d'id reel
  // puisqu'aucune ligne organization n'est encore en base) -> resolution par
  // nom, avec des uuid generes nous-memes en amont pour parent_organization_id
  // afin de pouvoir la resoudre en une seule passe quel que soit l'ordre des
  // lignes dans le CSV.
  const cities = await prisma.city.findMany({ select: { id: true, name: true } });
  const resolveCityId = buildNameLookup(cities);
  const unmatchedCities = new Set<string>();

  const idByOrgName = new Map(
    rows.map((r) => [r.name.trim().toLowerCase(), randomUUID()]),
  );
  const resolveParentId = (rawName?: string): string | null => {
    if (!rawName || rawName.trim() === "") return null;
    return idByOrgName.get(rawName.trim().toLowerCase()) ?? null;
  };
  const unmatchedParents = new Set<string>();

  const data: Prisma.OrganizationCreateManyInput[] = rows.map((r) => {
    const city_id = resolveCityId(r.city_id);
    if (r.city_id && !city_id) unmatchedCities.add(r.city_id);

    return {
      id: idByOrgName.get(r.name.trim().toLowerCase())!,
      name: r.name,
      slug: r.slug,

      subtype: parseEnum(r.type, OrganizationSubType),
      // type1/type2 n'ont pas d'equivalent dans organizations.csv (une seule
      // colonne "type" y existe) -> laisses a null.
      type1: null,
      type2: null,

      // legal_status n'a plus de champ correspondant dans le schema actuel
      // (retire de Organization) -> non stocke.

      ownership: r.ownership || null,
      mission: r.mission || null,

      knownFor: r.known_for || null,
      programsActivities: toStringArray(r.activities),

      project: r.project || null,

      researchAreas: toStringArray(r.research_areas),
      products: toStringArray(r.products),
      services: toStringArray(r.services),
      partners: toStringArray(r.partnerships),

      budget: r.budget || null,
      founded: r.founded || null,
      founders: r.founder ? [r.founder] : [],
      facilities: r.equipments ? [r.equipments] : [],

      // authority/jurisdiction/members/collections/graduates/undergraduates/
      // personnel n'ont pas de colonne dans organizations.csv -> laisses a
      // null (champs optionnels dans le schema).

      score: toInt(r.score),

      city_id,

      numberOfEmployees: parseEmployeeRange(r.numberOfEmployees),
      subsidiaries: r.numberOfSubsidiaries || null,

      // parentOrganizationId est une self-reference : renseignee dans la 2e
      // passe ci-dessous, une fois toutes les lignes en base, pour ne jamais
      // violer la contrainte de cle etrangere si un enfant apparait dans le
      // CSV avant son parent.
      parentOrganizationId: null,

      metadata: toJson(r.metadata),

      deletedAt: toDate(undefined, false),
      createdAt: toDate(undefined, true) as Date,
      updatedAt: toDate(undefined, true) as Date,
    };
  });

  const result = await prisma.organization.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Organizations rows imported: ${result.count}`);

  for (const r of rows) {
    const parentOrganizationId = resolveParentId(r.parent_organization_id);
    if (r.parent_organization_id && !parentOrganizationId) {
      unmatchedParents.add(r.parent_organization_id);
    }
    if (!parentOrganizationId) continue;

    await prisma.organization.update({
      where: { id: idByOrgName.get(r.name.trim().toLowerCase())! },
      data: { parentOrganizationId },
    });
  }

  if (unmatchedCities.size > 0) {
    console.warn(
      `Organizations: city_id non resolus (mis a null): ${[...unmatchedCities].join(", ")}`,
    );
  }
  if (unmatchedParents.size > 0) {
    console.warn(
      `Organizations: parent_organization_id non resolus (mis a null): ${[...unmatchedParents].join(", ")}`,
    );
  }

  return result.count;
}
