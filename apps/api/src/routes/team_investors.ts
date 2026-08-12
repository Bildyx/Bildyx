import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import {
  TeamInvestorSchema,
  PostTeamInvestorSchema,
  PutTeamInvestorSchema,
  GetTeamInvestorsSchema,
  GetTeamInvestorSchema,
  DeleteTeamInvestorSchema,
} from "../models/team_investors";
import { database } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const team_investors = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all team investors",
      path: "/team-investors",
      tags: ["Team Investor"],
    })
    .input(GetTeamInvestorsSchema)
    .output(z.array(TeamInvestorSchema))
    .handler(async ({ input }) => {
      let query = database.selectFrom("team_investors");
      if (input.team_id) {
        query = query.where("team_id", "=", input.team_id);
      }
      if (input.organization_id) {
        query = query.where("organization_id", "=", input.organization_id);
      }
      return await query.selectAll().execute() as any;
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a team investor by ID",
      path: "/team-investors/{teamInvestorId}",
      tags: ["Team Investor"],
    })
    .input(GetTeamInvestorSchema)
    .output(TeamInvestorSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("team_investors")
        .selectAll()
        .where("id", "=", input.teamInvestorId)
        .executeTakeFirst();
      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Team investor not found" });
      }
      return data as any;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a team investor relationship",
      path: "/team-investors",
      tags: ["Team Investor"],
    })
    .input(PostTeamInvestorSchema)
    .output(TeamInvestorSchema)
    .handler(async ({ input }) => {
      const relationship = await database
        .insertInto("team_investors")
        .values({
          ...input,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();
      if (!relationship) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create team investor" });
      }
      return relationship as any;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a team investor relationship",
      path: "/team-investors/{teamInvestorId}",
      tags: ["Team Investor"],
    })
    .input(z.object({ teamInvestorId: z.uuid() }).merge(PutTeamInvestorSchema))
    .output(TeamInvestorSchema)
    .handler(async ({ input }) => {
      const { teamInvestorId, ...data } = input;
      const relationship = await database
        .updateTable("team_investors")
        .set(data)
        .where("id", "=", teamInvestorId)
        .returningAll()
        .executeTakeFirst();
      if (!relationship) {
        throw new ORPCError("NOT_FOUND", { message: "Team investor not found" });
      }
      return relationship as any;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a team investor relationship",
      path: "/team-investors/{teamInvestorId}",
      tags: ["Team Investor"],
    })
    .input(DeleteTeamInvestorSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("team_investors")
        .selectAll()
        .where("id", "=", input.teamInvestorId)
        .executeTakeFirst();
      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Team investor not found" });
      }
      await database
        .deleteFrom("team_investors")
        .where("id", "=", input.teamInvestorId)
        .execute();
    }),
};
