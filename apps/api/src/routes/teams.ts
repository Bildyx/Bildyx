import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import { GetTeamsSchema, TeamSchema, PostTeamSchema, AddTeamMemberSchema, TeamMemberSchema } from "../models/teams";
import { z } from "zod";

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
    .output(z.array(TeamSchema))
    .handler(async ({ input }) => {
      const { companyId, search } = input;

      const company = await database.selectFrom('companies')
        .where('id', '=', companyId)
        .select('id')
        .executeTakeFirst();

      if (!company) {
        throw new ORPCError("NOT_FOUND", { message: "Company not found" });
      }

      let query = database
        .selectFrom('teams')
        .innerJoin('company_accounts', 'company_accounts.id', 'teams.company_account_id')
        .where('company_accounts.company_id', '=', companyId);

      if (search) {
        const p = `%${search.trim()}%`;
        query = query.where((eb) => eb('teams.name', 'ilike', p).or('teams.who_we_are', 'ilike', p));
      }

      const teamsData = await query
        .selectAll('teams')
        .orderBy('teams.created_at', 'desc')
        .execute();

      return teamsData;
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
      const companyAccount = await database.selectFrom('company_accounts')
        .where('id', '=', input.company_account_id)
        .select('id')
        .executeTakeFirst();

      if (!companyAccount) {
        throw new ORPCError("NOT_FOUND", { message: "Company account not found" });
      }

      const existingTeam = await database.selectFrom('teams')
        .where('company_account_id', '=', input.company_account_id)
        .where('name', 'ilike', input.name)
        .select('id')
        .executeTakeFirst();

      if (existingTeam) {
        throw new ORPCError("CONFLICT", { message: "A team with this name already exists for this company account" });
      }

      const team = await database
        .insertInto('teams')
        .values(input)
        .returningAll()
        .executeTakeFirst();

      if (!team) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create team" });
      }

      return team;
    }),

  addMember: publicProcedure
    .route({
      method: "POST",
      summary: "Add a member to a team",
      description: "Add a new member to a specific team",
      path: "/teams/{team_id}/members",
      tags: ["Team"]
    })
    .input(AddTeamMemberSchema)
    .output(TeamMemberSchema)
    .handler(async ({ input }) => {
      const team = await database.selectFrom('teams')
        .where('id', '=', input.team_id)
        .select('id')
        .executeTakeFirst();

      if (!team) {
        throw new ORPCError("NOT_FOUND", { message: "Team not found" });
      }

      const existingMember = await database.selectFrom('team_members')
        .where('team_id', '=', input.team_id)
        .where('name', 'ilike', input.name)
        .select('id')
        .executeTakeFirst();

      if (existingMember) {
        throw new ORPCError("CONFLICT", { message: `A member named "${input.name}" already exists in this team` });
      }

      const newMember = await database
        .insertInto('team_members')
        .values(input)
        .returningAll()
        .executeTakeFirst();

      if (!newMember) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to add member to team" });
      }

      return newMember;
    }),
};