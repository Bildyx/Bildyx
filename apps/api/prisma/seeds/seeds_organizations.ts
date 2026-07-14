import {
  EmployeeCountRange,
  OrganizationSubType,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import {
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

  const data: Prisma.OrganizationCreateManyInput[] = rows.map((r) => ({
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

    city_id: r.city_id || null,

    numberOfEmployees: parseEmployeeRange(r.numberOfEmployees),
    numberOfSubsidiaries: toInt(r.numberOfSubsidiaries),

    parentOrganizationId: r.parent_organization_id || null,

    metadata: toJson(r.metadata),

    deletedAt: toDate(undefined, false),
    createdAt: toDate(undefined, true) as Date,
    updatedAt: toDate(undefined, true) as Date,
  }));

  // IMPORTANT: parentOrganizationId est une self-reference. Si un enfant
  // apparait dans le CSV avant son parent, createMany peut echouer sur la
  // contrainte de foreign key. Si ca arrive, seed en 2 passes : d'abord sans
  // parentOrganizationId, puis un updateMany pour le renseigner, OU trie
  // "rows" selon la profondeur de hierarchie avant le map ci-dessus.
  const result = await prisma.organization.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Organizations rows imported: ${result.count}`);

  // NOTE: les relations M2M "industries" et "workingArea" ne sont pas
  // seedées ici (absentes du CSV).

  return result.count;
}
