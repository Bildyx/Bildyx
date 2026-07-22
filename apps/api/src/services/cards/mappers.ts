/**
 * Mapping functions: DB rows → EJS template data objects.
 * Each function receives a raw DB row and returns a plain object
 * whose keys match the EJS template variables exactly.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(val: number | null | undefined): string | null {
  if (val == null) return null;
  return val.toLocaleString("en-US");
}

function join(arr: unknown): string | null {
  if (arr == null || arr === "") return null;
  if (Array.isArray(arr)) {
    return arr.join(", ");
  }
  if (typeof arr === "string") {
    if (arr.startsWith("[") && arr.endsWith("]")) {
      try {
        const parsed = JSON.parse(arr);
        if (Array.isArray(parsed)) {
          return parsed.join(", ");
        }
      } catch {}
    }
    return arr;
  }
  return String(arr);
}

function str(val: unknown): string | null {
  if (val == null || val === "") return null;
  return String(val);
}

// ---------------------------------------------------------------------------
// Country
// ---------------------------------------------------------------------------

const wikivoyageCache = new Map<string, string | null>();

export async function fetchWikivoyagePhoto(
  countryName: string,
): Promise<string | null> {
  if (!countryName) return null;
  const key = countryName.trim();
  if (wikivoyageCache.has(key)) {
    return wikivoyageCache.get(key)!;
  }
  try {
    const url = `https://en.wikivoyage.org/api/rest_v1/page/summary/${encodeURIComponent(key)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Bildyx/1.0 (https://bildyx.com)",
      },
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      const photoUrl =
        data.thumbnail?.source || data.originalimage?.source || null;
      wikivoyageCache.set(key, photoUrl);
      return photoUrl;
    }
  } catch (err) {
    console.warn(
      `[Wikivoyage] Failed to fetch photo for '${countryName}':`,
      err,
    );
  }
  wikivoyageCache.set(key, null);
  return null;
}

export async function mapCountry(row: Record<string, any>) {
  const iso2 = (row.iso_code || "").toLowerCase();
  const flagUrl = iso2 ? `https://flagcdn.com/w320/${iso2}.png` : null;
  const mapUrl = iso2
    ? `https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${iso2}/vector.svg`
    : null;
  const photoUrl = await fetchWikivoyagePhoto(row.name);

  return {
    countryName: row.name,
    serialNumber: row.serial_number,
    isoCode: row.iso_code,
    flagUrl,
    mapUrl,
    photoUrl,
    qualityOfLife: str(row.quality_of_life),
    temperatures: str(row.temperatures),
    climate: str(row.climate),
    crimeRate: str(row.crime_rate),
    incomeInequality: str(row.income_inequality),
    workLifeBalance: str(row.work_life_balance),
    capital: str(row.capital_name),
    mainCities: join(row.main_cities) || str(row.main_cities),
    population:
      str(row.population) ||
      (typeof row.population === "number"
        ? row.population.toLocaleString("en-US")
        : null),
    interestingFact: str(row.interesting_fact),
    citizenshipProcess: str(row.citizenship_process),
    workPermit: str(row.work_permit),
    globalCompetitivenessIndex:
      str(row.global_competitiveness_index) ||
      (row.global_competitiveness_index != null
        ? String(row.global_competitiveness_index)
        : null),
    levelOfGlobalization: str(row.level_of_globalisation),
    numberOfInternationalStudents:
      typeof row.number_of_international_students === "number"
        ? `~${row.number_of_international_students.toLocaleString("en-US")}`
        : str(row.number_of_international_students),
    numberOfForeignCompaniesThatHaveOffice:
      typeof row.number_of_foreign_organizations === "number"
        ? `~${row.number_of_foreign_organizations.toLocaleString("en-US")}`
        : str(row.number_of_foreign_organizations),
    numberOfTourists: str(row.number_of_tourists),
    numberOfAirports: str(row.number_of_airports),
    qualityOfPrimaryAndSecondaryEducation: str(row.quality_of_education),
    degreeHolders: str(row.degree_holders),
    numberOfCollegesAndUniversities:
      typeof row.number_of_universities === "number"
        ? `${row.number_of_universities}+`
        : str(row.number_of_universities),
    topUniversities: join(row.top_universities) || str(row.top_universities),
    ethnicGroups: join(row.ethnic_groups) || str(row.ethnic_groups),
    languages:
      join(row.officialLanguages) ||
      join(row.languages) ||
      str(row.languages) ||
      str(row.officialLanguages),
    religion: join(row.religion) || str(row.religion),
    culturalValues: str(row.cultural_values),
    peopleDescription: str(row.people_description),
    currency: str(row.currency),
    mainIndustries: join(row.main_industries) || str(row.main_industries),
    largestCompanies: join(row.largest_companies) || str(row.largest_companies),
    numberOfMultinationalHQs: str(row.number_of_multinational_hqs),
    medianSalary:
      typeof row.median_salary === "number"
        ? `~€${row.median_salary.toLocaleString("en-US")}`
        : str(row.median_salary),
    personalIncomeTax: str(row.personal_income_tax),
    costOfLiving: str(row.cost_of_living),
    medianHomePrice:
      typeof row.median_home_price === "number"
        ? `~€${row.median_home_price.toLocaleString("en-US")}`
        : str(row.median_home_price),
    averageRent:
      typeof row.average_rent === "number"
        ? `~€${row.average_rent.toLocaleString("en-US")}`
        : str(row.average_rent),
    year: new Date().getFullYear(),
    extended: false,
  };
}

// ---------------------------------------------------------------------------
// City
// ---------------------------------------------------------------------------

export function mapCity(row: Record<string, any>) {
  return {
    cityName: row.name,
    serialNumber: row.serial_number,
    cityNameSnakeCase: row.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, ""),
    population: str(row.population) ?? fmt(row.population),
    mainIndustries: null as string | null,
    numberOfMultinationalHQs:
      str(row.number_of_multinational_hqs) ??
      fmt(row.number_of_multinational_hqs),
    numberOfAirports: fmt(row.number_of_airports),
    largestCompanies: null as string | null,
    medianSalary: fmt(row.median_salary),
    costOfLiving: str(row.cost_of_living),
    medianHomePrice: fmt(row.median_home_price),
    averageRent: fmt(row.average_rent),
    temperatures: str(row.temperatures),
    climate: str(row.climate),
    interestingFact: str(row.interesting_fact),
    degreeHolders: str(row.degree_holders),
    numberOfCollegesAndUniversities: fmt(row.number_of_universities),
    topUniversities: null as string | null,
    numberOfNationalities:
      str(row.number_of_nationalities) ?? fmt(row.number_of_nationalities),
    languages: str(row.language),
    peopleDescription: str(row.people_description),
    year: new Date().getFullYear(),
  };
}

// ---------------------------------------------------------------------------
// Job
// ---------------------------------------------------------------------------

export function mapJob(row: Record<string, any>) {
  const jobNameSnakeCase = row.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return {
    jobName: row.title,
    serialNumber: row.serial_number,
    jobNameSnakeCase,
    description: str(row.description),
    products: join(row.products),
    toolsAndTech: join(row.tools_and_tech),
    year: new Date().getFullYear(),
  };
}

// ---------------------------------------------------------------------------
// Organization (Company)
// ---------------------------------------------------------------------------

export function mapOrganization(row: Record<string, any>) {
  return {
    organizationName: row.name,
    serialNumber: row.slug,
    category: str(row.category),
    industry: null as string | null,
    products: join(row.products),
    companyType: str(row.type),
    numberOfEmployees: str(row.numberOfEmployees),
    founded: str(row.founded),
    headquartersLocation: null as string | null,
    parent: null as string | null,
    numberOfOffices: fmt(row.numberOfSubsidiaries),
    subsidiaries: null as string | null,
    knownFor: join(row.known_for),
    year: new Date().getFullYear(),
  };
}

// ---------------------------------------------------------------------------
// University
// ---------------------------------------------------------------------------

export function mapUniversity(row: Record<string, any>) {
  return {
    name: row.name,
    serialNumber: row.serial_number,
    established: fmt(row.founded_year),
    type: str(row.type),
    location: str(row.location),
    totalStudents: fmt(row.student_count),
    undergraduates: fmt(row.undergraduates),
    postgraduates: fmt(row.postgraduates),
    notes: str(row.notes),
    year: new Date().getFullYear(),
  };
}

// ---------------------------------------------------------------------------
// Skill
// ---------------------------------------------------------------------------

export function mapSkill(row: Record<string, any>) {
  return {
    name: row.name,
    serialNumber: row.serial_number,
    type: str(row.type),
    skillCategories: join(row.categories),
    usedIn: join(row.used_in),
    jobOccupations: join(row.jobs),
    industry: null as string | null,
    productCategory: join(row.product_categories),
    commonFieldsOfStudy: join(row.common_fields_of_study),
    relatedAbilities: join(row.related_abilities),
    timeToMasterIt: str(row.time_to_master),
    year: new Date().getFullYear(),
  };
}

// ---------------------------------------------------------------------------
// Industry
// ---------------------------------------------------------------------------

export function mapIndustry(row: Record<string, any>) {
  return {
    industryName: row.name,
    serialNumber: row.serial_number,
    description: str(row.description),
    medianSalary: null as string | null,
    year: new Date().getFullYear(),
  };
}

// ---------------------------------------------------------------------------
// Certification
// ---------------------------------------------------------------------------

export function mapCertification(
  row: Record<string, any>,
  issuingOrgName?: string,
) {
  return {
    name: row.name,
    serialNumber: row.serial_number,
    level: str(row.level),
    description: str(row.description),
    issuedBy: issuingOrgName ?? null,
    productRelated: join(row.products),
    jobsRelated: join(row.jobs),
    year: new Date().getFullYear(),
  };
}

// ---------------------------------------------------------------------------
// Subject / Product / Service
// ---------------------------------------------------------------------------

export function mapSubject(
  row: Record<string, any>,
  organizationName?: string,
  industriesStr?: string,
) {
  return {
    name: row.name,
    serialNumber: row.serial_number,
    type: str(row.type),
    company: organizationName ?? null,
    description: str(row.description),
    industries: industriesStr || null,
    competitors: join(row.competitors),
    funFact: str(row.fun_fact),
    year: new Date().getFullYear(),
  };
}
