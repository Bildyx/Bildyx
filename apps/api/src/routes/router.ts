import { publicProcedure } from "../oRPC";
import { certifications } from "./certifications";
import { cities } from "./cities";
import { countries } from "./countries";
import { industries } from "./industries";

export const router = publicProcedure.router({
  certifications,
  cities,
  countries,
  industries,
});
export type Router = typeof router;
