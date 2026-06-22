import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import { GetTeamsSchema, TeamSchema } from "../models/teams";
import { z } from "zod";

export const teams = {
  getByCompany: publicProcedure
    .route({ method: "GET", path: "/companies/{companyId}/teams", tags: ["Team"] })
    .input(GetTeamsSchema)
    .output(z.array(TeamSchema))
    .handler(async ({ input }) => {
      const { companyId } = input;

      const company = await database.selectFrom('companies')
        .where('id', '=', companyId)
        .select('id')
        .executeTakeFirst();

      if (!company) {
        throw new ORPCError("NOT_FOUND", { message: "Company not found" });
      }

      const data = await database
        .selectFrom('teams')
        .innerJoin('company_accounts', 'company_accounts.id', 'teams.company_account_id')
        .where('company_accounts.company_id', '=', companyId)
        .selectAll()
        .execute();

      return data;
    })
};