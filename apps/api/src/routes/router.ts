import { publicProcedure } from "../oRPC";
import { certifications } from "./certifications";

export const router = publicProcedure.router({
  certifications,
});
export type Router = typeof router;
