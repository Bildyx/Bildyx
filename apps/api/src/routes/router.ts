import { publicProcedure } from "../oRPC";
import { auth } from "./auth";
import { certifications } from "./certifications";
import { cities } from "./cities";
import { countries } from "./countries";
import { degrees } from "./degrees";
import { industries } from "./industries";
import { jobs } from "./jobs";
import { job_ads } from "./job_ads";
import { job_ads_skills } from "./job_ads_skills";
import { subjects } from "./subjects";
import { skills } from "./skills";
import { universities } from "./universities";
import { organizations } from "./organizations";
import { users } from "./users";
import { user_sessions } from "./user_sessions";
import { user_profiles } from "./user_profiles";
import { user_educations } from "./user_educations";
import { user_education_fields } from "./user_education_fields";
import { user_certifications } from "./user_certifications";
import { audit_logs } from "./audit_logs";
import { cards } from "./cards";

export const router = publicProcedure.router({
  auth,
  certifications,
  cities,
  countries,
  degrees,
  industries,
  jobs,
  job_ads,
  job_ads_skills,
  subjects,
  skills,
  universities,
  organizations,
  users,
  user_sessions,
  user_profiles,
  user_educations,
  user_education_fields,
  user_certifications,
  audit_logs,
  cards,
});
export type Router = typeof router;
