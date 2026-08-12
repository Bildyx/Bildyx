import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import {
  TeamSubsidiarySchema,
  PostTeamSubsidiarySchema,
  PutTeamSubsidiarySchema,
  GetTeamSubsidiariesSchema,
  GetTeamSubsidiarySchema,
  DeleteTeamSubsidiarySchema,
} from "../models/team_subsidiaries";
import { database } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const team_subsidiaries = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all team subsidiaries",
      path: "/team-subsidiaries",
      tags: ["Team Subsidiary"],
    })
    .input(GetTeamSubsidiariesSchema)
    .output(z.array(TeamSubsidiarySchema))
    .handler(async ({ input }) => {
      let query = database.selectFrom("team_subsidiaries");
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
      summary: "Get a team subsidiary by ID",
      path: "/team-subsidiaries/{teamSubsidiaryId}",
      tags: ["Team Subsidiary"],
    })
    .input(GetTeamSubsidiarySchema)
    .output(TeamSubsidiarySchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("team_subsidiaries")
        .selectAll()
        .where("id", "=", input.teamSubsidiaryId)
        .executeTakeFirst();
      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Team subsidiary not found" });
      }
      return data as any;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a team subsidiary relationship",
      path: "/team-subsidiaries",
      tags: ["Team Subsidiary"],
    })
    .input(PostTeamSubsidiarySchema)
    .output(TeamSubsidiarySchema)
    .handler(async ({ input }) => {
      const relationship = await database
        .insertInto("team_subsidiaries")
        .values({
          ...input,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();
      if (!relationship) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create team subsidiary" });
      }
      return relationship as any;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a team subsidiary relationship",
      path: "/team-subsidiaries/{teamSubsidiaryId}",
      tags: ["Team Subsidiary"],
    })
    .input(z.object({ teamSubsidiaryId: z.uuid() }).merge(PutTeamSubsidiarySchema))
    .output(TeamSubsidiarySchema)
    .handler(async ({ input }) => {
      const { teamSubsidiaryId, ...data } = input;
      const relationship = await database
        .updateTable("team_subsidiaries")
        .set(data)
        .where("id", "=", teamSubsidiaryId)
        .returningAll()
        .executeTakeFirst();
      if (!relationship) {
        throw new ORPCError("NOT_FOUND", { message: "Team subsidiary not found" });
      }
      return relationship as any;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a team subsidiary relationship",
      path: "/team-subsidiaries/{teamSubsidiaryId}",
      tags: ["Team Subsidiary"],
    })
    .input(DeleteTeamSubsidiarySchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("team_subsidiaries")
        .selectAll()
        .where("id", "=", input.teamSubsidiaryId)
        .executeTakeFirst();
      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Team subsidiary not found" });
      }
      await database
        .deleteFrom("team_subsidiaries")
        .where("id", "=", input.teamSubsidiaryId)
        .execute();
    }),
};
