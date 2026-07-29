import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { EmployeeCountRange, OrganizationSubType } from "@prisma/client";
import {
  buildNameLookup,
  normalizeEnumKey,
  slugify,
  toStringArray,
} from "../../seed-utils";
import { runBatched } from "../batch";
import {
  checkEnum,
  checkInt,
  checkJson,
  checkOptionalFk,
  checkRequiredText,
} from "../checks";
import type {
  CsvRow,
  ImportAdapter,
  MappedRow,
  PrismaTransactionClient,
  RowIssue,
} from "../types";

const EXPECTED_COLUMNS = [
  "name",
  "serial_number",
  "slug",
  "subtype",
  "type1",
  "type2",
  "ownership",
  "mission",
  "known_for",
  "programs_activities",
  "project",
  "research_areas",
  "description",
  "products",
  "services",
  "partners",
  "budget",
  "founded",
  "founders",
  "facilities",
  "offices",
  "authority",
  "jurisdiction",
  "members",
  "collections",
  "student_count",
  "undergraduates",
  "postgraduates",
  "score",
  "city_name",
  "numberOfEmployees",
  "personnel",
  "subsidiaries",
  "parent_organization_name",
  "metadata",
  // M2M free-text columns.
  "countries",
  "industries",
  "working_area_cities",
];

// EmployeeCountRange values look like RANGE_1_10, RANGE_5000_PLUS - handles
// CSV cells such as "1-10", "1_10", "5000+" (same logic as the previous
// seeds_organizations.ts).
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

  if (key === "5000_PLUS" || key === "5000") return EmployeeCountRange.RANGE_5000_PLUS;

  return null;
}

export interface OrganizationsFk {
  resolveCityId: (raw?: string) => string | null;
  // Resolves an organization name to its id, whether that organization
  // already exists in the DB or is being inserted in this same batch (in
  // which case its id was pre-generated below so it can be referenced
  // regardless of row order).
  resolveOrgIdByName: (raw?: string) => string | null;
  idBySlug: Map<string, string>;
  // Ids confirmed to already exist in the DB - resolveOrgIdByName can also
  // return a pre-generated id for a row that never actually gets written
  // (e.g. it was rejected for having a duplicate natural key elsewhere in
  // the file), so afterUpsert cross-checks against this set before linking.
  existingIds: Set<string>;
}

export const organizationsAdapter: ImportAdapter<CsvRow, OrganizationsFk> = {
  modelName: "Organization",
  prismaModel: "organization",
  csvFile: "organizations.csv",
  // organizations.csv's slug column is currently unfilled for every row, so
  // the slug is derived from name instead (see mapRow) - naturalKeyColumn
  // has to agree so plan.ts's pre-mapRow duplicate/diff check uses the same
  // key (same pattern as Country's iso_code/normalizeIsoCode).
  naturalKeyColumn: "name",
  naturalKeyField: "slug",
  normalizeNaturalKey: slugify,
  deletedAtField: "deletedAt",
  expectedColumns: EXPECTED_COLUMNS,
  m2mColumns: [
    {
      column: "countries",
      relationField: "countries",
      targetModel: "country",
      targetLookupField: "isoCode",
      targetConnectField: "isoCode",
    },
    {
      column: "industries",
      relationField: "industries",
      targetModel: "industry",
      targetLookupField: "name",
      targetConnectField: "id",
    },
    {
      column: "working_area_cities",
      relationField: "cities_working_area",
      targetModel: "city",
      targetLookupField: "name",
      targetConnectField: "id",
    },
  ],

  async buildFkContext(prisma: PrismaClient, rows: CsvRow[]): Promise<OrganizationsFk> {
    const cities = await prisma.city.findMany({ select: { id: true, name: true } });
    const resolveCityByExactName = buildNameLookup(cities);
    // city_id cells are typically "City, Country" (e.g. "Paris, France") but
    // City.name only holds the city ("Paris") - fall back to matching just
    // the part before the first comma when the exact string doesn't resolve.
    const resolveCityId = (raw?: string): string | null =>
      resolveCityByExactName(raw) ?? resolveCityByExactName(raw?.split(",")[0]);

    const existingOrgs = await prisma.organization.findMany({
      select: { id: true, slug: true, name: true },
    });
    const idBySlug = new Map(existingOrgs.map((o) => [o.slug, o.id]));
    const idByNameFromDb = new Map(
      existingOrgs.map((o) => [o.name.trim().toLowerCase(), o.id]),
    );

    // Rows not already in DB (by slug) will be inserted - pre-generate their
    // id now so any sibling row can reference them as a parent regardless
    // of file order.
    const idByNameForBatch = new Map<string, string>();
    for (const row of rows) {
      const name = (row.name ?? "").trim().toLowerCase();
      if (!name) continue;
      const slug = slugify(row.name ?? "");
      idByNameForBatch.set(name, idBySlug.get(slug) ?? idByNameFromDb.get(name) ?? randomUUID());
    }

    const resolveOrgIdByName = (raw?: string): string | null => {
      if (!raw || raw.trim() === "") return null;
      const name = raw.trim().toLowerCase();
      return idByNameForBatch.get(name) ?? idByNameFromDb.get(name) ?? null;
    };

    const existingIds = new Set(existingOrgs.map((o) => o.id));

    return { resolveCityId, resolveOrgIdByName, idBySlug, existingIds };
  },

  mapRow(row, _rowIndex, fk): MappedRow {
    const errors: RowIssue[] = [];
    const warnings: RowIssue[] = [];

    const name = checkRequiredText(row.name, "name");
    if (name.issue) errors.push(name.issue);

    // organizations.csv's slug column is unfilled for every row - derive it
    // from name instead (see naturalKeyColumn/normalizeNaturalKey above).
    const slug = slugify(name.value);

    const serialNumber = checkRequiredText(row.serial_number, "serial_number");
    if (serialNumber.issue) errors.push(serialNumber.issue);

    const subtype = checkEnum(row.subtype, OrganizationSubType, "subtype", false);
    if (subtype.issue) warnings.push(subtype.issue);

    const cityId = checkOptionalFk(row.city_name, fk.resolveCityId, "city_name");
    if (cityId.issue) warnings.push(cityId.issue);

    // parent_organization_id is only checked for resolvability here -
    // actually written by afterUpsert (see types.ts for why).
    if (row.parent_organization_name && row.parent_organization_name.trim() !== "") {
      const resolved = fk.resolveOrgIdByName(row.parent_organization_name);
      if (!resolved) {
        warnings.push({
          row: 0,
          column: "parent_organization_name",
          message: `parent_organization_name: référence "${row.parent_organization_name}" non résolue (mise à null)`,
        });
      }
    }

    const numberOfEmployees = parseEmployeeRange(row.numberOfEmployees);
    if (row.numberOfEmployees && row.numberOfEmployees.trim() !== "" && numberOfEmployees === null) {
      warnings.push({
        row: 0,
        column: "numberOfEmployees",
        message: `numberOfEmployees: valeur "${row.numberOfEmployees}" non reconnue`,
      });
    }

    const id = fk.idBySlug.get(slug) ?? fk.resolveOrgIdByName(row.name);

    const members = checkInt(row.members, "members");
    if (members.issue) warnings.push(members.issue);
    const personnel = checkInt(row.personnel, "personnel");
    if (personnel.issue) warnings.push(personnel.issue);
    const studentCount = checkInt(row.student_count, "student_count");
    if (studentCount.issue) warnings.push(studentCount.issue);
    const undergraduates = checkInt(row.undergraduates, "undergraduates");
    if (undergraduates.issue) warnings.push(undergraduates.issue);
    const postgraduates = checkInt(row.postgraduates, "postgraduates");
    if (postgraduates.issue) warnings.push(postgraduates.issue);
    const score = checkInt(row.score, "score");
    if (score.issue) warnings.push(score.issue);

    const metadata = checkJson(row.metadata, "metadata");
    if (metadata.issue) warnings.push(metadata.issue);

    return {
      naturalKey: slug,
      data: {
        // Explicit id: reused if the org already exists (update), otherwise
        // the pre-generated id from buildFkContext (insert) - see
        // resolveOrgIdByName's role in cross-row parent resolution above.
        id: id ?? undefined,
        name: name.value,
        serial_number: serialNumber.value,
        slug,
        subtype: subtype.value,
        type1: row.type1 || null,
        type2: row.type2 || null,
        ownership: row.ownership || null,
        mission: row.mission || null,
        knownFor: row.known_for || null,
        programsActivities: toStringArray(row.programs_activities),
        project: row.project || null,
        researchAreas: toStringArray(row.research_areas),
        description: row.description || null,
        products: toStringArray(row.products),
        services: toStringArray(row.services),
        partners: toStringArray(row.partners),
        budget: row.budget || null,
        founded: row.founded || null,
        founders: toStringArray(row.founders),
        facilities: toStringArray(row.facilities),
        offices: row.offices || null,
        authority: row.authority || null,
        jurisdiction: row.jurisdiction || null,
        members: members.value,
        collections: row.collections || null,
        // graduates a été supprimée de la base (migration
        // 20260728120100) ; student_count/postgraduates l'ont remplacée et
        // undergraduates est passée de TEXT à INTEGER lors de la fusion
        // University -> Organization. L'adaptateur écrivait encore
        // l'ancienne forme, ce qui faisait échouer tout import Organization.
        studentCount: studentCount.value,
        undergraduates: undergraduates.value,
        postgraduates: postgraduates.value,
        score: score.value,
        city_id: cityId.value,
        numberOfEmployees,
        personnel: personnel.value,
        subsidiaries: row.subsidiaries || null,
        // Always null here - see afterUpsert.
        parentOrganizationId: null,
        metadata: metadata.value,
      },
      errors,
      warnings,
    };
  },

  async afterUpsert(tx: PrismaTransactionClient, written, fk: OrganizationsFk) {
    // A name pre-generates an id in buildFkContext regardless of whether its
    // row actually makes it into `written` (e.g. it was dropped for having a
    // duplicate natural key elsewhere in the file) - only link to ids that
    // are confirmed to exist, either already in the DB or written this run.
    const validIds = new Set([...fk.existingIds, ...written.map((w) => w.data.id)]);

    const parentLinks: { id: unknown; parentOrganizationId: string }[] = [];
    for (const { data, row } of written) {
      const rawParentName = row.parent_organization_name;
      if (!rawParentName || rawParentName.trim() === "") continue;
      const parentOrganizationId = fk.resolveOrgIdByName(rawParentName);
      if (!parentOrganizationId || !validIds.has(parentOrganizationId)) continue;
      parentLinks.push({ id: data.id, parentOrganizationId });
    }
    await runBatched(parentLinks, ({ id, parentOrganizationId }) =>
      tx.organization.update({
        where: { id },
        data: { parentOrganizationId },
      }),
    );
  },
};
