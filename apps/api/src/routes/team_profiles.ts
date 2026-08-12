import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import {
  TeamProfileSchema,
  PostTeamProfileSchema,
  PutTeamProfileSchema,
  GetTeamProfilesSchema,
  GetTeamProfileSchema,
  DeleteTeamProfileSchema,
} from "../models/team_profiles";
import { database } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const team_profiles = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all team profiles",
      path: "/team-profiles",
      tags: ["Team Profile"],
    })
    .input(GetTeamProfilesSchema)
    .output(z.array(TeamProfileSchema))
    .handler(async ({ input }) => {
      let query = database.selectFrom("team_profiles");
      if (input.team_id) {
        query = query.where("team_id", "=", input.team_id);
      }
      return await query.selectAll().execute() as any;
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a team profile by ID",
      path: "/team-profiles/{teamProfileId}",
      tags: ["Team Profile"],
    })
    .input(GetTeamProfileSchema)
    .output(TeamProfileSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("team_profiles")
        .selectAll()
        .where("id", "=", input.teamProfileId)
        .executeTakeFirst();
      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Team profile not found" });
      }
      return data as any;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a team profile",
      path: "/team-profiles",
      tags: ["Team Profile"],
    })
    .input(PostTeamProfileSchema)
    .output(TeamProfileSchema)
    .handler(async ({ input }) => {
      const profile = await database
        .insertInto("team_profiles")
        .values({
          ...input,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();
      if (!profile) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create team profile" });
      }
      return profile as any;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a team profile",
      path: "/team-profiles/{teamProfileId}",
      tags: ["Team Profile"],
    })
    .input(z.object({ teamProfileId: z.uuid() }).merge(PutTeamProfileSchema))
    .output(TeamProfileSchema)
    .handler(async ({ input }) => {
      const { teamProfileId, ...data } = input;
      const profile = await database
        .updateTable("team_profiles")
        .set(data)
        .where("id", "=", teamProfileId)
        .returningAll()
        .executeTakeFirst();
      if (!profile) {
        throw new ORPCError("NOT_FOUND", { message: "Team profile not found" });
      }
      return profile as any;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a team profile",
      path: "/team-profiles/{teamProfileId}",
      tags: ["Team Profile"],
    })
    .input(DeleteTeamProfileSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("team_profiles")
        .selectAll()
        .where("id", "=", input.teamProfileId)
        .executeTakeFirst();
      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Team profile not found" });
      }
      await database
        .deleteFrom("team_profiles")
        .where("id", "=", input.teamProfileId)
        .execute();
    }),
};
