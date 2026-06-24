import { publicProcedure } from "../oRPC";
import { teams } from "./teams";
import { certifications } from "./certifications";

export const router = publicProcedure.router({
  teams,
  certifications,
});
export type Router = typeof router;