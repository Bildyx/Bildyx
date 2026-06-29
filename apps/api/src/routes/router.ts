import { publicProcedure } from "../oRPC";
import { certifications } from "./certifications";
import { cities } from "./cities";
import { countries } from "./countries";



export const router = publicProcedure.router({
  certifications,
  cities,
  countries,
});
export type Router = typeof router;
