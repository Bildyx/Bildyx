import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import { GetTeamsSchema, TeamSchema, GetTeamsOutputSchema, PostTeamSchema } from "../models/teams";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const teams = {
  getByCompany: publicProcedure
    .route({ 
      method: "GET", 
      summary: "List all teams",
      description: "Get all teams by company",
      path: "/companies/{companyId}/teams", 
      tags: ["Team"] 
    })
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
    .route({ 
      method: "GET", 
      summary: "List one team",
      description: "Get one team by team id",
      path: "/teams/{teamId}", 
      tags: ["Team"] })
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
    }),

  create: publicProcedure
    .route({
      method: "POST", 
      summary: "Create a new team",
      description: "Create a new team for a company account",
      path: "/teams", 
      tags: ["Team"] })
    .input(PostTeamSchema)
    .output(TeamSchema)
    .handler(async ({ input }) => {

      const { company_account_id } = input;

      const companyAccount = await database.selectFrom('company_accounts')
        .where('id', '=', company_account_id)
        .select('id')
        .executeTakeFirst();

      if (!companyAccount) {
        throw new ORPCError("NOT_FOUND", { message: "Company account not found" });
      }

      const data = await database
        .insertInto('teams')
        .values({
          ...input,
          id: randomUUID(),
          updated_at: new Date(),
        })
        .returningAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Team not found" });
      }

      return data;
    }),
};