import { database } from "../../database.js";

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

function formatEnum(val: string | null | undefined): string | null {
  if (!val) return null;
  const clean = val.trim().toUpperCase();

  // Special overrides
  const overrides: Record<string, string> = {
    NGO: "NGO",
    SOE: "SOE",
    API: "API",
    PHD: "PhD",
    GRANDE_ECOLE: "Grande École",
    LOW_MEDIUM: "Low-Medium",
    MEDIUM_HIGH: "Medium-High",
  };

  if (clean in overrides) {
    return overrides[clean]!;
  }

  // Ranges
  if (clean.startsWith("RANGE_")) {
    const range = clean.replace("RANGE_", "");
    if (range.endsWith("_PLUS")) {
      return range.replace("_PLUS", "+");
    }
    return range.replace("_", " - ");
  }

  // General Title Case: "RESEARCH_INSTITUTE" -> "Research Institute"
  return clean
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
    qualityOfLife: formatEnum(row.quality_of_life),
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
    levelOfGlobalization: formatEnum(row.level_of_globalisation),
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
    costOfLiving: formatEnum(row.cost_of_living),
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

export async function mapCity(row: Record<string, any>) {
  const iso2 = (row.country_id || row.countryId || "").toLowerCase();
  const flagUrl = iso2 ? `https://flagcdn.com/w320/${iso2}.png` : null;
  const photoUrl = await fetchWikivoyagePhoto(row.name);

  // Dynamic database relations fetching
  let mainIndustriesStr = null;
  let largestCompaniesStr = null;
  let topUniversitiesStr = null;

  try {
    if (row.id) {
      // 1. Industries
      const industries = await database
        .selectFrom("industries")
        .innerJoin(
          "_CityMainIndustries",
          "_CityMainIndustries.B",
          "industries.id",
        )
        .select("industries.name")
        .where("_CityMainIndustries.A", "=", row.id)
        .execute();
      if (industries.length > 0) {
        mainIndustriesStr = industries.map((ind) => ind.name).join(", ");
      }

      // 2. Headquartered Companies
      const companies = await database
        .selectFrom("organizations")
        .select("organizations.name")
        .where("city_id", "=", row.id)
        .limit(5)
        .execute();
      if (companies.length > 0) {
        largestCompaniesStr = companies.map((c) => c.name).join(", ");
      }
    }
  } catch (err) {
    console.warn(
      `[mapCity] Failed to query relations for city '${row.name}':`,
      err,
    );
  }

  // Formatting helpers
  const cur = str(row.currency) || "USD";
  const getFormattedValue = (
    val: number | null | undefined,
    isHomePrice = false,
    isRent = false,
  ) => {
    if (val == null) return null;
    let formattedVal = val.toLocaleString("en-US");
    if (isHomePrice && val >= 1000000) {
      formattedVal = `${(val / 1000000).toFixed(1)} Million`;
    }
    const suffix = isRent ? "/month" : "";
    if (cur === "USD") {
      return `US $${formattedVal}${suffix}`;
    }
    if (cur === "EUR") {
      return `€${formattedVal}${suffix}`;
    }
    if (cur === "HKD") {
      return `HK$${formattedVal}${suffix}`;
    }
    if (cur === "AED") {
      return `AED ${formattedVal}${suffix}`;
    }
    return `${cur} ${formattedVal}${suffix}`;
  };

  return {
    cityName: row.name,
    serialNumber: row.serial_number,
    cityNameSnakeCase: row.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, ""),
    flagUrl,
    photoUrl,
    population:
      str(row.population) ||
      (typeof row.population === "number"
        ? row.population.toLocaleString("en-US")
        : null),
    mainIndustries: mainIndustriesStr || str(row.main_industries),
    numberOfMultinationalHQs:
      str(row.number_of_multinational_hqs) ||
      (typeof row.number_of_multinational_hqs === "number"
        ? `${row.number_of_multinational_hqs}+`
        : null),
    numberOfAirports:
      typeof row.number_of_airports === "number"
        ? String(row.number_of_airports)
        : str(row.number_of_airports),
    largestCompanies: largestCompaniesStr || str(row.largest_organization),
    medianSalary:
      typeof row.median_salary === "number"
        ? getFormattedValue(row.median_salary)
        : str(row.median_salary),
    costOfLiving: formatEnum(row.cost_of_living),
    medianHomePrice:
      typeof row.median_home_price === "number"
        ? getFormattedValue(row.median_home_price, true)
        : str(row.median_home_price),
    averageRent:
      typeof row.average_rent === "number"
        ? getFormattedValue(row.average_rent, false, true)
        : str(row.average_rent),
    temperatures: str(row.temperatures),
    climate: str(row.climate),
    interestingFact: str(row.interesting_fact),
    degreeHolders: str(row.degree_holders),
    numberOfCollegesAndUniversities:
      typeof row.number_of_universities === "number"
        ? `${row.number_of_universities}+`
        : str(row.number_of_universities),
    topUniversities:
      topUniversitiesStr ||
      join(row.top_universities) ||
      str(row.top_universities),
    numberOfNationalities:
      str(row.number_of_nationalities) ||
      (typeof row.number_of_nationalities === "number"
        ? `${row.number_of_nationalities}+`
        : null),
    languages: join(row.language) || str(row.language),
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

export async function mapOrganization(row: Record<string, any>) {
  let headquartersLocation = null;
  let cityName = null;
  let parent = null;
  let industry = null;
  let country = null;

  try {
    if (row.id) {
      // Run all 3 DB queries in parallel instead of sequentially
      const [cityResult, parentResult, industryResult] = await Promise.all([
        // 1. Headquarters Location (City + Country)
        row.city_id
          ? database
              .selectFrom("cities")
              .leftJoin("countries", "countries.iso_code", "cities.country_id")
              .select(["cities.name as cityName", "countries.name as countryName"])
              .where("cities.id", "=", row.city_id)
              .executeTakeFirst()
          : Promise.resolve(null),

        // 2. Parent Organization
        row.parent_organization_id
          ? database
              .selectFrom("organizations")
              .select("name")
              .where("id", "=", row.parent_organization_id)
              .executeTakeFirst()
          : Promise.resolve(null),

        // 3. Industries
        database
          .selectFrom("industries")
          .innerJoin(
            "_OrganizationIndustries",
            "_OrganizationIndustries.A",
            "industries.id",
          )
          .select("industries.name")
          .where("_OrganizationIndustries.B", "=", row.id)
          .execute(),
      ]);

      // Process city result
      if (cityResult) {
        cityName = cityResult.cityName;
        country = cityResult.countryName || null;
        headquartersLocation = cityResult.countryName
          ? `${cityResult.cityName}, ${cityResult.countryName}`
          : cityResult.cityName;
      }

      // Process parent result
      if (parentResult) {
        parent = parentResult.name;
      }

      // Process industries result
      if (industryResult.length > 0) {
        industry = industryResult.map((i) => i.name).join(", ");
      }
    }
  } catch (err) {
    console.warn(
      `[mapOrganization] Failed to query relations for organization '${row.name}':`,
      err,
    );
  }

  const formatPersonnel = (val: unknown): string | null => {
    if (val == null || val === "") return null;
    const num = Number(val);
    if (!isNaN(num)) {
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")} million`;
      }
      return num.toLocaleString("en-US");
    }
    return String(val);
  };

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    serial_number: row.serial_number,
    subtype: row.subtype,
    industry,
    parent,
    headquartersLocation,
    country,
    description: str(row.description),
    founded: str(row.founded),
    type1: str(row.type1),
    type2: str(row.type2),
    ownership: str(row.ownership),
    collections: str(row.collections),
    numberOfEmployees: row.numberOfEmployees ? formatEnum(row.numberOfEmployees) : null,
    offices: str(row.offices),
    subsidiaries: str(row.subsidiaries),
    known_for: join(row.known_for),
    budget: str(row.budget),
    partners: join(row.partners),
    personnel: formatPersonnel(row.personnel),
    authority: str(row.authority),
    jurisdiction: str(row.jurisdiction),
    student_count: fmt(row.student_count),
    undergraduates: fmt(row.undergraduates),
    postgraduates: fmt(row.postgraduates),
    mission: str(row.mission),
    research_areas: join(row.research_areas),
    products: join(row.products),
    facilities: join(row.facilities),
    founders: join(row.founders),
    project: str(row.project),
    members: fmt(row.members),
    programs_activities: join(row.programs_activities),
    services: join(row.services),
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
    skillCategories: formatEnum(row.category),
    usedIn: join(row.used_in),
    jobOccupations: join(row.jobs),
    industry: str(row.industry),
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
    type: formatEnum(row.category) || str(row.type),
    company: organizationName ?? null,
    description: str(row.description),
    industries: industriesStr || null,
    competitors: join(row.competitors),
    funFact: str(row.fun_fact),
    year: new Date().getFullYear(),
  };
}

// ---------------------------------------------------------------------------
// Degree
// ---------------------------------------------------------------------------

export function mapDegree(row: Record<string, any>) {
  return {
    name: row.name,
    serialNumber: row.serial_number,
    level: formatEnum(row.level),
    area: str(row.area),
    description: str(row.description),
    year: new Date().getFullYear(),
  };
}
