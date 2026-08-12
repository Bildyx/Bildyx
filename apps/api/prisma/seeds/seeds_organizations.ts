import { randomUUID } from "node:crypto";
import { generateSerialNumber } from "../../src/models/utils/enums.js";
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

// Columns actually present in organizations.csv (the file contains no
// id/created_at/updated_at/deleted_at).
import { Organization } from "../../src/models/organizations";

type OrganizationCsv = Partial<Record<keyof Organization, string>> & {
  city_name?: string;
  parent_organization_name?: string;
};

export async function seedOrganizations(prisma: PrismaClient) {
  const rows = readCsv<OrganizationCsv>("organizations.csv");

  // organizations.csv fills city_name with the city's name (cities are
  // already seeded at this point) and parent_organization_name with the name
  // of another organization from the same file (which has no real id yet
  // since no organization row is in the database) -> resolution by name,
  // with uuids we generate ourselves up front for parent_organization_name
  // so it can be resolved in a single pass whatever the row order in the
  // CSV.
  const cities = await prisma.city.findMany({
    select: { id: true, name: true },
  });
  const resolveCityId = buildNameLookup(cities);
  const unmatchedCities = new Set<string>();

  const idByOrgName = new Map(
    rows.map((r) => [r.name!.trim().toLowerCase(), randomUUID()]),
  );
  const resolveParentId = (rawName?: string): string | null => {
    if (!rawName || rawName.trim() === "") return null;
    return idByOrgName.get(rawName.trim().toLowerCase()) ?? null;
  };
  const unmatchedParents = new Set<string>();

  const data: Prisma.OrganizationCreateManyInput[] = rows.map((r) => {
    const city_id = resolveCityId(r.city_name);
    if (r.city_name && !city_id) unmatchedCities.add(r.city_name);

    return {
      id: idByOrgName.get(r.name!.trim().toLowerCase())!,
      name: r.name!,
      slug: r.slug!,
      serial_number:
        r.serial_number ||
        generateSerialNumber(parseEnum(r.subtype, OrganizationSubType)),

      subtype: parseEnum(r.subtype, OrganizationSubType),
      type1: r.type1 || null,
      type2: r.type2 || null,

      ownership: r.ownership || null,
      mission: r.mission || null,

      knownFor: r.known_for || null,
      programsActivities: toStringArray(r.programs_activities),

      researchAreas: toStringArray(r.research_areas),
      products: toStringArray(r.products),
      services: toStringArray(r.services),

      budget: r.budget || null,
      founded: r.founded || null,
      founders: r.founders ? [r.founders] : [],
      facilities: r.facilities ? [r.facilities] : [],

      // organizations.csv also carries description/offices/authority/
      // jurisdiction/members/collections/student_count/undergraduates/
      // postgraduates/personnel, not handled here: this seeder is the legacy
      // ingestion path, `npm run import` is what covers the full model (see
      // prisma/import/adapters/organizations.ts).

      score: toInt(r.score),

      city_id,

      numberOfEmployees: parseEmployeeRange(r.numberOfEmployees),

      // parentOrganizationId is a self-reference: filled in the 2nd pass
      // below, once every row is in the database, so the foreign key
      // constraint is never violated if a child appears in the CSV before
      // its parent.
      parentOrganizationId: null,
    };
  });

  const result = await prisma.organization.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Organizations rows imported: ${result.count}`);

  for (const r of rows) {
    const parentOrganizationId = resolveParentId(r.parent_organization_name);
    if (r.parent_organization_name && !parentOrganizationId) {
      unmatchedParents.add(r.parent_organization_name);
    }
    if (!parentOrganizationId) continue;

    await prisma.organization.update({
      where: { id: idByOrgName.get(r.name!.trim().toLowerCase())! },
      data: { parentOrganizationId },
    });
  }

  if (unmatchedCities.size > 0) {
    console.warn(
      `Organizations: city_name non resolus (mis a null): ${[...unmatchedCities].join(", ")}`,
    );
  }
  if (unmatchedParents.size > 0) {
    console.warn(
      `Organizations: parent_organization_name non resolus (mis a null): ${[...unmatchedParents].join(", ")}`,
    );
  }

  return result.count;
}
