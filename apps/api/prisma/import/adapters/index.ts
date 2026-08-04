import { industriesAdapter } from "./industries";
import { countriesAdapter } from "./countries";
import { citiesAdapter } from "./cities";
import { organizationsAdapter } from "./organizations";
import { jobsAdapter } from "./jobs";
import { certificationsAdapter } from "./certifications";
import { subjectsAdapter } from "./subjects";
import { skillsAdapter } from "./skills";
import { degreesAdapter } from "./degrees";
import { studyFieldsAdapter } from "./studyFields";
import type { ImportAdapter } from "../types";

// Same dependency order as apps/api/prisma/seed.ts: industries -> countries
// -> cities -> organizations -> (jobs/certifications/subjects)
// -> skills/degrees/studyFields.
export const ADAPTERS: ImportAdapter<any, any>[] = [
  industriesAdapter,
  countriesAdapter,
  citiesAdapter,
  organizationsAdapter,
  jobsAdapter,
  certificationsAdapter,
  subjectsAdapter,
  skillsAdapter,
  degreesAdapter,
  studyFieldsAdapter,
];

export function findAdapterByModelName(modelName: string): ImportAdapter<any, any> | undefined {
  const target = modelName.trim().toLowerCase();
  return ADAPTERS.find((a) => a.modelName.toLowerCase() === target);
}

export {
  industriesAdapter,
  countriesAdapter,
  citiesAdapter,
  organizationsAdapter,
  jobsAdapter,
  certificationsAdapter,
  subjectsAdapter,
  skillsAdapter,
  degreesAdapter,
  studyFieldsAdapter,
};
