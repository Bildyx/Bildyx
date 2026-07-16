import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { EmployeeCountRange, OrganizationSubType } from "@prisma/client";
import {
  buildNameLookup,
  normalizeEnumKey,
  toInt,
  toStringArray,
} from "../../seed-utils";
import { runBatched } from "../batch";
import { checkEnum, checkJson, checkOptionalFk, checkRequiredText } from "../checks";
import type {
  CsvRow,
  ImportAdapter,
  MappedRow,
  PrismaTransactionClient,
  RowIssue,
} from "../types";

const EXPECTED_COLUMNS = [
  "name",
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
  "graduates",
  "undergraduates",
  "score",
  "city_id",
  "numberOfEmployees",
  "personnel",
  "subsidiaries",
  "parent_organization_id",
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
}

export const organizationsAdapter: ImportAdapter<CsvRow, OrganizationsFk> = {
  modelName: "Organization",
  prismaModel: "organization",
  csvFile: "organizations.csv",
  naturalKeyColumn: "slug",
  naturalKeyField: "slug",
  deletedAtField: "deletedAt",
  expectedColumns: EXPECTED_COLUMNS,

  async buildFkContext(prisma: PrismaClient, rows: CsvRow[]): Promise<OrganizationsFk> {
    const cities = await prisma.city.findMany({ select: { id: true, name: true } });
    const resolveCityId = buildNameLookup(cities);

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
      const slug = (row.slug ?? "").trim();
      const name = (row.name ?? "").trim().toLowerCase();
      if (!slug || !name) continue;
      idByNameForBatch.set(name, idBySlug.get(slug) ?? idByNameFromDb.get(name) ?? randomUUID());
    }

    const resolveOrgIdByName = (raw?: string): string | null => {
      if (!raw || raw.trim() === "") return null;
      const name = raw.trim().toLowerCase();
      return idByNameForBatch.get(name) ?? idByNameFromDb.get(name) ?? null;
    };

    return { resolveCityId, resolveOrgIdByName, idBySlug };
  },

  mapRow(row, _rowIndex, fk): MappedRow {
    const errors: RowIssue[] = [];
    const warnings: RowIssue[] = [];

    const slug = checkRequiredText(row.slug, "slug");
    if (slug.issue) errors.push(slug.issue);

    const name = checkRequiredText(row.name, "name");
    if (name.issue) errors.push(name.issue);

    const subtype = checkEnum(row.subtype, OrganizationSubType, "subtype", false);
    if (subtype.issue) warnings.push(subtype.issue);

    const cityId = checkOptionalFk(row.city_id, fk.resolveCityId, "city_id");
    if (cityId.issue) warnings.push(cityId.issue);

    // parent_organization_id is only checked for resolvability here -
    // actually written by afterUpsert (see types.ts for why).
    if (row.parent_organization_id && row.parent_organization_id.trim() !== "") {
      const resolved = fk.resolveOrgIdByName(row.parent_organization_id);
      if (!resolved) {
        warnings.push({
          row: 0,
          column: "parent_organization_id",
          message: `parent_organization_id: référence "${row.parent_organization_id}" non résolue (mise à null)`,
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

    const id = fk.idBySlug.get(slug.value) ?? fk.resolveOrgIdByName(row.name);

    const metadata = checkJson(row.metadata, "metadata");
    if (metadata.issue) warnings.push(metadata.issue);

    return {
      naturalKey: slug.value,
      data: {
        // Explicit id: reused if the org already exists (update), otherwise
        // the pre-generated id from buildFkContext (insert) - see
        // resolveOrgIdByName's role in cross-row parent resolution above.
        id: id ?? undefined,
        name: name.value,
        slug: slug.value,
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
        members: toInt(row.members),
        collections: row.collections || null,
        graduates: row.graduates || null,
        undergraduates: row.undergraduates || null,
        score: toInt(row.score),
        city_id: cityId.value,
        numberOfEmployees,
        personnel: toInt(row.personnel),
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
    const parentLinks: { id: unknown; parentOrganizationId: string }[] = [];
    for (const { data, row } of written) {
      const rawParentName = row.parent_organization_id;
      if (!rawParentName || rawParentName.trim() === "") continue;
      const parentOrganizationId = fk.resolveOrgIdByName(rawParentName);
      if (!parentOrganizationId) continue;
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
