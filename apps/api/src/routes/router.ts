import { publicProcedure } from "../oRPC";
import { certifications } from "./certifications";
import { cities } from "./cities";
import { countries } from "./countries";
import { degrees } from "./degrees";
import { industries } from "./industries";
import { jobs } from "./jobs";
import { job_ads } from "./job_ads";
import { job_ads_skills } from "./job_ads_skills";
import { products } from "./products";
import { skills } from "./skills";
import { universities } from "./universities";

export const router = publicProcedure.router({
  certifications,
  cities,
  countries,
  degrees,
  industries,
  jobs,
  job_ads,
  job_ads_skills,
  products,
  skills,
  universities,
});
export type Router = typeof router;

