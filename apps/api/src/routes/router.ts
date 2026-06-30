import { publicProcedure } from "../oRPC";
import { certifications } from "./certifications";
import { cities } from "./cities";
import { countries } from "./countries";
import { degrees } from "./degrees";
import { industries } from "./industries";
import { jobs } from "./jobs";

export const router = publicProcedure.router({
  certifications,
  cities,
  countries,
  degrees,
  industries,
  jobs,
});
export type Router = typeof router;
