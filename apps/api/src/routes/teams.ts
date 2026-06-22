import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import { GetTeamsSchema, TeamSchema, GetTeamsOutputSchema } from "../models/teams";
import { z } from "zod";

export const teams = {
  getByCompany: publicProcedure
    .route({ method: "GET", path: "/companies/{companyId}/teams", tags: ["Team"] })
    .input(GetTeamsSchema)
    .output(GetTeamsOutputSchema)
    .handler(async ({ input }) => {
      const { companyId, page, limit, search, name } = input;

      const company = await database.selectFrom('companies')
        .where('id', '=', companyId)
        .select('id')
        .executeTakeFirst();

      if (!company) {
        throw new ORPCError("NOT_FOUND", { message: "Company not found" });
      }

      // 1. Base query
      let query = database
        .selectFrom('teams')
        .innerJoin('company_accounts', 'company_accounts.id', 'teams.company_account_id')
        .where('company_accounts.company_id', '=', companyId);

      // 2. Filtres
      if (search) {
        const p = `%${search.trim()}%`;
        query = query.where((eb) => eb('teams.name', 'ilike', p).or('teams.who_we_are', 'ilike', p));
      }

      if (name) {
        query = query.where('teams.name', 'ilike', `%${name.trim()}%`);
      }

      // 3. Exécution avec pagination
      const [totalResult, teamsData] = await Promise.all([
        query.select((eb) => eb.fn.count<number>('teams.id').as('count')).executeTakeFirst(),
        query
          .selectAll('teams')
          .limit(limit)
          .offset((page - 1) * limit)
          .orderBy('teams.created_at', 'desc')
          .execute()
      ]);

      const total = Number(totalResult?.count ?? 0);

      return {
        data: teamsData,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }
      };
    }),

  getByTeam: publicProcedure
    .route({ method: "GET", path: "/teams/{teamId}", tags: ["Team"] })
    .input(z.object({ teamId: z.string().uuid() }))
    .output(TeamSchema)
    .handler(async ({ input }) => {
      const { teamId } = input;

      const data = await database
        .selectFrom('teams')
        .where('id', '=', teamId)
        .selectAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Team not found" });
      }

      return data;
    })
};