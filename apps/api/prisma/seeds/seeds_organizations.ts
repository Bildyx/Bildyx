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

type OrganizationCsv = {
  id: string;
  name: string;
  slug: string;
  subtype?: string;
  type1?: string;
  type2?: string;
  ownership?: string;
  mission?: string;
  known_for?: string;
  programs_activities?: string;
  project?: string;
  research_areas?: string;
  products?: string;
  services?: string;
  partners?: string;
  budget?: string;
  founded?: string;
  founders?: string;
  facilities?: string;
  authority?: string;
  jurisdiction?: string;
  members?: string;
  collections?: string;
  graduates?: string;
  undergraduates?: string;
  score?: string;
  city_id?: string;
  numberOfEmployees?: string;
  personnel?: string;
  numberOfSubsidiaries?: string;
  parent_organization_id?: string;
  metadata?: string;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
};

export async function seedOrganizations(prisma: PrismaClient) {
  const rows = readCsv<OrganizationCsv>("organizations.csv");

  const data: Prisma.OrganizationCreateManyInput[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,

    subtype: parseEnum(r.subtype, OrganizationSubType),
    type1: r.type1 || null,
    type2: r.type2 || null,

    ownership: r.ownership || null,
    mission: r.mission || null,

    knownFor: r.known_for || null,
    programsActivities: toStringArray(r.programs_activities),

    project: r.project || null,

    researchAreas: toStringArray(r.research_areas),
    products: toStringArray(r.products),
    services: toStringArray(r.services),
    partners: toStringArray(r.partners),

    budget: r.budget || null,
    founded: r.founded || null,
    founders: toStringArray(r.founders),
    facilities: toStringArray(r.facilities),

    authority: r.authority || null,
    jurisdiction: r.jurisdiction || null,
    members: toInt(r.members),
    collections: r.collections || null,
    graduates: r.graduates || null,
    undergraduates: r.undergraduates || null,

    score: toInt(r.score),

    city_id: r.city_id || null,

    numberOfEmployees: parseEmployeeRange(r.numberOfEmployees),
    personnel: toInt(r.personnel),
    numberOfSubsidiaries: toInt(r.numberOfSubsidiaries),

    parentOrganizationId: r.parent_organization_id || null,

    metadata: toJson(r.metadata),

    deletedAt: toDate(r.deleted_at, false),
    createdAt: toDate(r.created_at, true) as Date,
    updatedAt: toDate(r.updated_at, true) as Date,
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
