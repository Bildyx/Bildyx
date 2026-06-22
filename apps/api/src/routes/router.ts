import { publicProcedure } from "../oRPC";
import { teams } from "./teams";

export const router = publicProcedure.router({
  teams,
});
export type Router = typeof router;