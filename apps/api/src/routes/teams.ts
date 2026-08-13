import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import {
  TeamSchema,
  PostTeamSchema,
  PutTeamSchema,
  GetTeamsSchema,
  GetTeamSchema,
  DeleteTeamSchema,
} from "../models/teams";
import { database } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const teams = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all teams",
      path: "/teams",
      tags: ["Team"],
    })
    .input(GetTeamsSchema)
    .output(z.array(TeamSchema))
    .handler(async ({ input }) => {
      let query = database.selectFrom("teams");
      if (input.name) {
        query = query.where("name", "ilike", `%${input.name.trim()}%`);
      }
      if (input.type) {
        query = query.where("type", "=", input.type);
      }
      if (input.city_id) {
        query = query.where("city_id", "=", input.city_id);
      }
      if (input.visibility) {
        query = query.where("visibility", "=", input.visibility as any);
      }
      return (await query.selectAll().execute()) as any;
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a team by ID",
      path: "/teams/{teamId}",
      tags: ["Team"],
    })
    .input(GetTeamSchema)
    .output(TeamSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("teams")
        .selectAll()
        .where("id", "=", input.teamId)
        .executeTakeFirst();
      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Team not found" });
      }
      return data as any;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a team",
      path: "/teams",
      tags: ["Team"],
    })
    .input(PostTeamSchema)
    .output(TeamSchema)
    .handler(async ({ input }) => {
      const team = await database
        .insertInto("teams")
        .values({
          ...input,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();
      if (!team) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create team",
        });
      }
      return team as any;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a team",
      path: "/teams/{teamId}",
      tags: ["Team"],
    })
    .input(z.object({ teamId: z.uuid() }).merge(PutTeamSchema))
    .output(TeamSchema)
    .handler(async ({ input }) => {
      const { teamId, ...data } = input;
      const team = await database
        .updateTable("teams")
        .set(data)
        .where("id", "=", teamId)
        .returningAll()
        .executeTakeFirst();
      if (!team) {
        throw new ORPCError("NOT_FOUND", { message: "Team not found" });
      }
      return team as any;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a team",
      path: "/teams/{teamId}",
      tags: ["Team"],
    })
    .input(DeleteTeamSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      try {
        const existing = await database
          .selectFrom("teams")
          .selectAll()
          .where("id", "=", input.teamId)
          .executeTakeFirst();
        if (!existing) {
          throw new ORPCError("NOT_FOUND", { message: "Team not found" });
        }
        await database
          .deleteFrom("teams")
          .where("id", "=", input.teamId)
          .execute();
      } catch (error) {
        console.error("Error deleting team:", error);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to delete team",
        });
      }
    }),
};
