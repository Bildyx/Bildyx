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

export function mapCountry(row: Record<string, any>) {
  return {
    countryName: row.name,
    serialNumber: row.serial_number,
    qualityOfLife: str(row.quality_of_life),
    temperatures: str(row.temperatures),
    climate: str(row.climate),
    crimeRate: str(row.crime_rate),
    incomeInequality: str(row.income_inequality),
    workLifeBalance: str(row.work_life_balance),
    capital: str(row.capital_name),
    mainCities: null as string | null, // not in DB schema
    population: fmt(row.population),
    interestingFact: str(row.interesting_fact),
    citizenshipProcess: str(row.citizenship_process),
    workPermit: str(row.work_permit),
    globalCompetitivenessIndex: fmt(row.global_competitiveness_index),
    levelOfGlobalization: str(row.level_of_globalisation),
    numberOfInternationalStudents: fmt(row.number_of_international_students),
    numberOfForeignCompaniesThatHaveOffice: fmt(row.number_of_foreign_organizations),
    numberOfTourists: fmt(row.number_of_tourists),
    numberOfAirports: fmt(row.number_of_airports),
    qualityOfPrimaryAndSecondaryEducation: str(row.quality_of_education),
    degreeHolders: str(row.degree_holders),
    numberOfCollegesAndUniversities: fmt(row.number_of_universities),
    topUniversities: null as string | null, // not in DB schema
    ethnicGroups: join(row.ethnic_groups),
    languages: join(row.officialLanguages),
    religion: join(row.religion),
    culturalValues: str(row.cultural_values),
    peopleDescription: str(row.people_description),
    currency: str(row.currency),
    mainIndustries: null as string | null,
    largestCompanies: null as string | null,
    numberOfMultinationalHQs: fmt(row.number_of_multinational_hqs),
    medianSalary: fmt(row.median_salary),
    personalIncomeTax: str(row.personal_income_tax),
    costOfLiving: str(row.cost_of_living),
    medianHomePrice: fmt(row.median_home_price),
    averageRent: fmt(row.average_rent),
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
    numberOfMultinationalHQs: str(row.number_of_multinational_hqs) ?? fmt(row.number_of_multinational_hqs),
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
    numberOfNationalities: str(row.number_of_nationalities) ?? fmt(row.number_of_nationalities),
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
