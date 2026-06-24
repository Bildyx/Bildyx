import { publicProcedure } from "../oRPC";
import { teams } from "./teams";
import { certifications } from "./certifications";
import { cities } from "./cities";

export const router = publicProcedure.router({
  teams,
  certifications,
  cities,
});
export type Router = typeof router;