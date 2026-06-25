import { publicProcedure } from "../oRPC";
import { certifications } from "./certifications";
import { cities } from "./cities";
import { countries } from "./countries";
import { degrees } from "./degrees";
import { industries } from "./industries";
import { skills } from "./skills";
import { universities } from "./universities";
import { organizations } from "./orgnizations";
import { products } from "./products";
import { jobs } from "./jobs";



export const router = publicProcedure.router({
  certifications,
  cities,
  countries,
  degrees,
  industries,
  skills,
  universities,
  organizations,
  products,
  jobs
});
export type Router = typeof router;