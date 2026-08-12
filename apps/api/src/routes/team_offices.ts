import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import {
  TeamOfficeSchema,
  PostTeamOfficeSchema,
  PutTeamOfficeSchema,
  GetTeamOfficesSchema,
  GetTeamOfficeSchema,
  DeleteTeamOfficeSchema,
} from "../models/team_offices";
import { database } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const team_offices = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all team offices",
      path: "/team-offices",
      tags: ["Team Office"],
    })
    .input(GetTeamOfficesSchema)
    .output(z.array(TeamOfficeSchema))
    .handler(async ({ input }) => {
      let query = database.selectFrom("team_offices");
      if (input.city_id) {
        query = query.where("city_id", "=", input.city_id);
      }
      if (input.type) {
        query = query.where("type", "ilike", `%${input.type.trim()}%`);
      }
      return await query.selectAll().execute() as any;
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a team office by ID",
      path: "/team-offices/{teamOfficeId}",
      tags: ["Team Office"],
    })
    .input(GetTeamOfficeSchema)
    .output(TeamOfficeSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("team_offices")
        .selectAll()
        .where("id", "=", input.teamOfficeId)
        .executeTakeFirst();
      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Team office not found" });
      }
      return data as any;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a team office",
      path: "/team-offices",
      tags: ["Team Office"],
    })
    .input(PostTeamOfficeSchema)
    .output(TeamOfficeSchema)
    .handler(async ({ input }) => {
      const office = await database
        .insertInto("team_offices")
        .values({
          ...input,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();
      if (!office) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create team office" });
      }
      return office as any;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a team office",
      path: "/team-offices/{teamOfficeId}",
      tags: ["Team Office"],
    })
    .input(z.object({ teamOfficeId: z.uuid() }).merge(PutTeamOfficeSchema))
    .output(TeamOfficeSchema)
    .handler(async ({ input }) => {
      const { teamOfficeId, ...data } = input;
      const office = await database
        .updateTable("team_offices")
        .set(data)
        .where("id", "=", teamOfficeId)
        .returningAll()
        .executeTakeFirst();
      if (!office) {
        throw new ORPCError("NOT_FOUND", { message: "Team office not found" });
      }
      return office as any;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a team office",
      path: "/team-offices/{teamOfficeId}",
      tags: ["Team Office"],
    })
    .input(DeleteTeamOfficeSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("team_offices")
        .selectAll()
        .where("id", "=", input.teamOfficeId)
        .executeTakeFirst();
      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Team office not found" });
      }
      await database
        .deleteFrom("team_offices")
        .where("id", "=", input.teamOfficeId)
        .execute();
    }),
};
