import { publicProcedure } from "../oRPC";
import { teams } from "./teams";
import { certifications } from "./certifications";
import { cities } from "./cities";
import { countries } from "./countries";
import { degrees } from "./degrees";



export const router = publicProcedure.router({
  teams,
  certifications,
  cities,
  countries,
  degrees,
});
export type Router = typeof router;