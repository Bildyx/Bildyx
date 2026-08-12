import { apiDelete, apiGet, apiPost, apiPut } from "./httpClient";

/**
 * Paths below match the real oRPC/OpenAPI routes in apps/api/src/routes/*.
 * Each resource has its own path shape (some are prefixed "user-", some
 * aren't, and "getByProfile" is nested under /profiles/{userProfileId}/...
 * rather than a query param) — so unlike the generic factory this used to
 * be, each service here is written out explicitly to match the real API.
 */

export type UserExperience = {
  id: string;
  userProfileId: string;
  organizationId?: string;
  jobId?: string;
  title?: string;
  startDate?: string;
  endDate?: string | null;
  description?: string;
  [key: string]: unknown;
};

export type UserEducation = {
  id: string;
  userProfileId: string;
  organizationId?: string;
  degreeId?: string;
  subjectId?: string;
  level?: "MASTER" | "BACHELOR" | "PHD" | "OTHER";
  startDate?: string;
  endDate?: string | null;
  [key: string]: unknown;
};

export type UserCertification = {
  id: string;
  userProfileId: string;
  certificationId?: string;
  organizationId?: string;
  issuedDate?: string;
  [key: string]: unknown;
};

export type UserLanguage = { id: string; userProfileId: string; language: string; proficiency: string };
export type UserSkill = { id: string; userProfileId: string; skillId?: string; name: string };
export type LookupItem = { id: string; name: string };

export const userExperienceService = {
  getByProfile: (userProfileId: string) => apiGet<UserExperience[]>(`/profiles/${userProfileId}/experiences`),
  getById: (id: string) => apiGet<UserExperience>(`/user-experiences/${id}`),
  create: (input: Partial<UserExperience>) => apiPost<UserExperience>("/user-experiences", input),
  update: (id: string, input: Partial<UserExperience>) => apiPut<UserExperience>(`/user-experiences/${id}`, input),
  delete: (id: string) => apiDelete<UserExperience>(`/user-experiences/${id}`),
};

export const userEducationService = {
  getByProfile: (userProfileId: string) => apiGet<UserEducation[]>(`/profiles/${userProfileId}/educations`),
  getById: (id: string) => apiGet<UserEducation>(`/educations/${id}`),
  create: (input: Partial<UserEducation>) => apiPost<UserEducation>("/educations", input),
  update: (id: string, input: Partial<UserEducation>) => apiPut<UserEducation>(`/educations/${id}`, input),
  delete: (id: string) => apiDelete<UserEducation>(`/educations/${id}`),
};

export const userCertificationService = {
  getByProfile: (userProfileId: string) => apiGet<UserCertification[]>(`/profiles/${userProfileId}/certifications`),
  getById: (id: string) => apiGet<UserCertification>(`/user-certifications/${id}`),
  create: (input: Partial<UserCertification>) => apiPost<UserCertification>("/user-certifications", input),
  update: (id: string, input: Partial<UserCertification>) => apiPut<UserCertification>(`/user-certifications/${id}`, input),
  delete: (id: string) => apiDelete<UserCertification>(`/user-certifications/${id}`),
};

export const userLanguageService = {
  getByProfile: (userProfileId: string) => apiGet<UserLanguage[]>(`/profiles/${userProfileId}/languages`),
  getById: (id: string) => apiGet<UserLanguage>(`/user-languages/${id}`),
  create: (input: Partial<UserLanguage>) => apiPost<UserLanguage>("/user-languages", input),
  update: (id: string, input: Partial<UserLanguage>) => apiPut<UserLanguage>(`/user-languages/${id}`, input),
  delete: (id: string) => apiDelete<UserLanguage>(`/user-languages/${id}`),
};

export const userSkillService = {
  getByProfile: (userProfileId: string) => apiGet<UserSkill[]>(`/profiles/${userProfileId}/skills`),
  getById: (id: string) => apiGet<UserSkill>(`/user-skills/${id}`),
  create: (input: Partial<UserSkill>) => apiPost<UserSkill>("/user-skills", input),
  update: (id: string, input: Partial<UserSkill>) => apiPut<UserSkill>(`/user-skills/${id}`, input),
  delete: (id: string) => apiDelete<UserSkill>(`/user-skills/${id}`),
};

// ─── Lookup/reference data (search by ?name=) ────────────────────────────
function createLookupService<T extends { id: string; name: string }>(resourcePath: string) {
  return {
    search: (query: string) => apiGet<T[]>(`/${resourcePath}?name=${encodeURIComponent(query)}`),
    getById: (id: string) => apiGet<T>(`/${resourcePath}/${id}`),
    create: (name: string, extra?: Record<string, unknown>) => apiPost<T>(`/${resourcePath}`, { name, ...extra }),
  };
}

export const degreeService = createLookupService<LookupItem>("degrees");
export const jobService = createLookupService<LookupItem>("jobs");
export const industryService = createLookupService<LookupItem>("industries");
export const subjectService = createLookupService<LookupItem>("subjects");
export const skillService = createLookupService<LookupItem>("skills");
export const cityService = createLookupService<LookupItem>("cities");
export const countryService = createLookupService<LookupItem>("countries");
// certifications require an organizationId in the real API — kept separate since it doesn't fit the generic shape above.
export const certificationService = {
  search: (organizationId: string, name?: string) =>
    apiGet<LookupItem[]>(`/certifications?organizationId=${organizationId}${name ? `&name=${encodeURIComponent(name)}` : ""}`),
  getById: (id: string) => apiGet<LookupItem>(`/certifications/${id}`),
};

export type FullUserProfile = {
  id: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role?: string;
  biography?: string;
  countries_worked_in?: string[];
  countries_studied_in?: string[];
  companies?: string[];
  products?: string[];
  job_occupations?: string[];
  degrees?: string[];
  certifications_meta?: string[];
  languages?: UserLanguage[];
  skills?: UserSkill[];
  experiences?: UserExperience[];
  educations?: UserEducation[];
  certifications?: UserCertification[];
  [key: string]: unknown;
};

export const userProfileService = {
  getFullProfileByUserId: (userId: string) => apiGet<FullUserProfile>(`/users/${userId}/full-profile`),
  getById: (profileId: string) => apiGet<FullUserProfile>(`/profiles/${profileId}`),
  update: (profileId: string, input: Partial<FullUserProfile>) => apiPut<FullUserProfile>(`/profiles/${profileId}`, input),
};

