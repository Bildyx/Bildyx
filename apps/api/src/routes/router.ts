import { publicProcedure } from "../oRPC";
import { certifications } from "./certifications";
import { cities } from "./cities";
import { countries } from "./countries";
import { degrees } from "./degrees";
import { industries } from "./industries";
import { skills } from "./skills";
import { universities } from "./universities";
import { organizations } from "./orgnizations";



export const router = publicProcedure.router({
  certifications,
  cities,
  countries,
  degrees,
  industries,
  skills,
  universities,
  organizations,
});
export type Router = typeof router;