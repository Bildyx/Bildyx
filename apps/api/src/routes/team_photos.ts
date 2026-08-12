import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import {
  TeamPhotoSchema,
  PostTeamPhotoSchema,
  PutTeamPhotoSchema,
  GetTeamPhotosSchema,
  GetTeamPhotoSchema,
  DeleteTeamPhotoSchema,
} from "../models/team_photos";
import { database } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const team_photos = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all team photos",
      path: "/team-photos",
      tags: ["Team Photo"],
    })
    .input(GetTeamPhotosSchema)
    .output(z.array(TeamPhotoSchema))
    .handler(async ({ input }) => {
      let query = database.selectFrom("team_photos");
      if (input.team_id) {
        query = query.where("team_id", "=", input.team_id);
      }
      return await query.selectAll().execute() as any;
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a team photo by ID",
      path: "/team-photos/{teamPhotoId}",
      tags: ["Team Photo"],
    })
    .input(GetTeamPhotoSchema)
    .output(TeamPhotoSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("team_photos")
        .selectAll()
        .where("id", "=", input.teamPhotoId)
        .executeTakeFirst();
      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Team photo not found" });
      }
      return data as any;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a team photo",
      path: "/team-photos",
      tags: ["Team Photo"],
    })
    .input(PostTeamPhotoSchema)
    .output(TeamPhotoSchema)
    .handler(async ({ input }) => {
      const photo = await database
        .insertInto("team_photos")
        .values({
          ...input,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();
      if (!photo) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create team photo" });
      }
      return photo as any;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a team photo",
      path: "/team-photos/{teamPhotoId}",
      tags: ["Team Photo"],
    })
    .input(z.object({ teamPhotoId: z.uuid() }).merge(PutTeamPhotoSchema))
    .output(TeamPhotoSchema)
    .handler(async ({ input }) => {
      const { teamPhotoId, ...data } = input;
      const photo = await database
        .updateTable("team_photos")
        .set(data)
        .where("id", "=", teamPhotoId)
        .returningAll()
        .executeTakeFirst();
      if (!photo) {
        throw new ORPCError("NOT_FOUND", { message: "Team photo not found" });
      }
      return photo as any;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a team photo",
      path: "/team-photos/{teamPhotoId}",
      tags: ["Team Photo"],
    })
    .input(DeleteTeamPhotoSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("team_photos")
        .selectAll()
        .where("id", "=", input.teamPhotoId)
        .executeTakeFirst();
      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Team photo not found" });
      }
      await database
        .deleteFrom("team_photos")
        .where("id", "=", input.teamPhotoId)
        .execute();
    }),
};
