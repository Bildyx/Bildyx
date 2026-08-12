import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import {
  TeamSubjectSchema,
  PostTeamSubjectSchema,
  PutTeamSubjectSchema,
  GetTeamSubjectsSchema,
  GetTeamSubjectSchema,
  DeleteTeamSubjectSchema,
} from "../models/team_subjects";
import { database } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const team_subjects = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all team subjects",
      path: "/team-subjects",
      tags: ["Team Subject"],
    })
    .input(GetTeamSubjectsSchema)
    .output(z.array(TeamSubjectSchema))
    .handler(async ({ input }) => {
      let query = database.selectFrom("team_subjects");
      if (input.subject_id) {
        query = query.where("subject_id", "=", input.subject_id);
      }
      if (input.status) {
        query = query.where("status", "=", input.status as any);
      }
      return await query.selectAll().execute() as any;
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a team subject by ID",
      path: "/team-subjects/{teamSubjectId}",
      tags: ["Team Subject"],
    })
    .input(GetTeamSubjectSchema)
    .output(TeamSubjectSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("team_subjects")
        .selectAll()
        .where("id", "=", input.teamSubjectId)
        .executeTakeFirst();
      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Team subject not found" });
      }
      return data as any;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a team subject",
      path: "/team-subjects",
      tags: ["Team Subject"],
    })
    .input(PostTeamSubjectSchema)
    .output(TeamSubjectSchema)
    .handler(async ({ input }) => {
      const subject = await database
        .insertInto("team_subjects")
        .values({
          ...input,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();
      if (!subject) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create team subject" });
      }
      return subject as any;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a team subject",
      path: "/team-subjects/{teamSubjectId}",
      tags: ["Team Subject"],
    })
    .input(z.object({ teamSubjectId: z.uuid() }).merge(PutTeamSubjectSchema))
    .output(TeamSubjectSchema)
    .handler(async ({ input }) => {
      const { teamSubjectId, ...data } = input;
      const subject = await database
        .updateTable("team_subjects")
        .set(data)
        .where("id", "=", teamSubjectId)
        .returningAll()
        .executeTakeFirst();
      if (!subject) {
        throw new ORPCError("NOT_FOUND", { message: "Team subject not found" });
      }
      return subject as any;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a team subject",
      path: "/team-subjects/{teamSubjectId}",
      tags: ["Team Subject"],
    })
    .input(DeleteTeamSubjectSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("team_subjects")
        .selectAll()
        .where("id", "=", input.teamSubjectId)
        .executeTakeFirst();
      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Team subject not found" });
      }
      await database
        .deleteFrom("team_subjects")
        .where("id", "=", input.teamSubjectId)
        .execute();
    }),
};
