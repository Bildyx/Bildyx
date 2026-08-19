import type { Organization as DbOrganization } from "@repo/models/organizations";

export type Organization = DbOrganization & {
  services?: string[];
  metadata?: Record<string, any>;
  display_name?: string;
  title?: string;
  city?: string;
  country?: string;
  location?: string;
  type?: string;
  category?: string;
  industry?: string;
  summary?: string;
};

export const WORK_FOR_SUBTYPES: Record<string, string[]> = {
  companies: ["COMPANY", "PUBLIC_COMPANY", "SOE", "CLUB", "SOCIETY", "CHAMBER_OF_COMMERCE"],
  government: ["GOVERNMENT", "STATE_GOVERNMENT", "CITY_GOVERNMENT", "CENTRAL_BANK", "COURT", "ARMY", "NATIONAL_AUDIT_OFFICE", "OMBUDSMAN"],
  healthcare: ["HOSPITAL"],
  education: ["UNIVERSITY", "RESEARCH_INSTITUTE", "PRIMARY_SCHOOLS", "SECONDARY_SCHOOLS", "THINK_TANK"],
  nonprofit: ["NON_PROFIT", "NGO", "FOUNDATION", "ASSOCIATION"],
  international: ["INTERNATIONAL_ORGANIZATION", "EMBASSY"],
  culture: ["MUSEUM", "NATIONAL_PARK", "PUBLIC_PARKS", "LIBRARY"],
};

const GOVERNMENT_SUBTYPES = ["GOVERNMENT", "STATE_GOVERNMENT", "CITY_GOVERNMENT", "CENTRAL_BANK", "COURT", "EMBASSY"];

export const PAGE_SIZE = 4;

export type MatchedOrg = { org: Organization; score: number; keywords: string[]; matchCount: number };

export function normalizeText(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function toTextList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(normalizeText).filter(Boolean);
  if (typeof value === "string") return value.split(/[;,|]/).map(normalizeText).filter(Boolean);
  return [];
}

export function getOrgKeywords(org: Organization): string[] {
  const meta = (org.metadata || {}) as Record<string, unknown>;
  return Array.from(
    new Set([...toTextList(org.services), ...toTextList(meta.services), ...toTextList(org.products), ...toTextList(meta.products)].filter(Boolean)),
  );
}

function getOrgText(org: Organization): string {
  const meta = (org.metadata || {}) as Record<string, unknown>;
  return normalizeText(
    [
      org.name,
      org.display_name,
      org.title,
      org.city,
      meta.city,
      org.country,
      meta.country,
      org.location,
      meta.location,
      org.type,
      org.subtype,
      org.category,
      org.industry,
      Array.isArray(meta.industries) ? (meta.industries as string[]).join(" ") : "",
      org.description,
      org.summary,
      ...getOrgKeywords(org),
    ].join(" "),
  );
}

export function getWorkForGroup(org: Organization): string {
  const text = getOrgText(org);
  const subtype = normalizeText(org.subtype);

  if (
    GOVERNMENT_SUBTYPES.includes(String(org.subtype || "")) ||
    subtype.includes("government") ||
    text.includes("government") ||
    text.includes("public service") ||
    text.includes("public sector") ||
    text.includes("embassy") ||
    text.includes("court")
  )
    return "government";

  if (text.includes("hospital") || text.includes("healthcare") || text.includes("health care") || text.includes("medical") || text.includes("clinic"))
    return "healthcare";

  if (text.includes("education") || text.includes("research") || text.includes("university") || text.includes("school") || text.includes("laboratory"))
    return "education";

  if (text.includes("non-profit") || text.includes("nonprofit") || text.includes("ngo") || text.includes("community") || text.includes("advocacy"))
    return "nonprofit";

  if (text.includes("international") || text.includes("diplomatic") || text.includes("united nations") || text.includes("embassy"))
    return "international";

  if (text.includes("culture") || text.includes("museum") || text.includes("heritage") || text.includes("park")) return "culture";

  return "companies";
}

export function matchesProductFilter(item: MatchedOrg, selected: string[], userExperienceKeywords: Set<string>): boolean {
  if (selected.length === 0) return true;
  const exact = item.matchCount > 0;
  const partial = item.keywords.some((k) =>
    Array.from(userExperienceKeywords).some((u) => k.includes(u) || u.includes(k) || k.split(" ").some((p) => p.length > 3 && u.includes(p))),
  );
  return selected.some((f) => (f === "same" ? exact : f === "similar" ? exact || partial : f === "different" ? !exact : true));
}

export type TargetFilters = {
  city: string;
  country: string;
  keyword: string;
  sizes: string[];
  products: string[];
  workFor: string[];
};

/** Ported from performSearch()'s scoring/filtering pipeline in js/target-list.ts */
export function computeMatches(
  orgs: Organization[],
  filters: TargetFilters,
  userExperienceKeywords: Set<string>,
  userWorkOrgIds: string[],
): MatchedOrg[] {
  const allMatched: MatchedOrg[] = orgs
    .map((org) => {
      if (!org.id || userWorkOrgIds.includes(org.id)) return null;
      const keywords = getOrgKeywords(org);
      const matchCount = keywords.filter((k) => userExperienceKeywords.has(k)).length;
      const score = keywords.length > 0 ? Math.round((matchCount / keywords.length) * 100) : 0;
      return { org, score, keywords, matchCount };
    })
    .filter((x): x is MatchedOrg => x !== null && (x.score > 0 || userExperienceKeywords.size === 0));

  return allMatched
    .filter((item) => {
      const text = getOrgText(item.org);
      if (filters.keyword && !text.includes(filters.keyword)) return false;
      if (filters.workFor.length && !filters.workFor.includes(getWorkForGroup(item.org))) return false;
      if (!matchesProductFilter(item, filters.products, userExperienceKeywords)) return false;
      return true;
    })
    .sort((a, b) => b.score - a.score);
}
