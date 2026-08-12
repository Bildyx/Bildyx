import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import {
  TeamMemberSchema,
  PostTeamMemberSchema,
  PutTeamMemberSchema,
  GetTeamMembersSchema,
  GetTeamMemberSchema,
  DeleteTeamMemberSchema,
} from "../models/team_members";
import { database } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const team_members = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all team members",
      path: "/team-members",
      tags: ["Team Member"],
    })
    .input(GetTeamMembersSchema)
    .output(z.array(TeamMemberSchema))
    .handler(async ({ input }) => {
      let query = database.selectFrom("team_members");
      if (input.team_id) {
        query = query.where("team_id", "=", input.team_id);
      }
      if (input.fullname) {
        query = query.where("fullname", "ilike", `%${input.fullname.trim()}%`);
      }
      return await query.selectAll().execute() as any;
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a team member by ID",
      path: "/team-members/{teamMemberId}",
      tags: ["Team Member"],
    })
    .input(GetTeamMemberSchema)
    .output(TeamMemberSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("team_members")
        .selectAll()
        .where("id", "=", input.teamMemberId)
        .executeTakeFirst();
      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Team member not found" });
      }
      return data as any;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a team member",
      path: "/team-members",
      tags: ["Team Member"],
    })
    .input(PostTeamMemberSchema)
    .output(TeamMemberSchema)
    .handler(async ({ input }) => {
      const member = await database
        .insertInto("team_members")
        .values({
          ...input,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();
      if (!member) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create team member" });
      }
      return member as any;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a team member",
      path: "/team-members/{teamMemberId}",
      tags: ["Team Member"],
    })
    .input(z.object({ teamMemberId: z.uuid() }).merge(PutTeamMemberSchema))
    .output(TeamMemberSchema)
    .handler(async ({ input }) => {
      const { teamMemberId, ...data } = input;
      const member = await database
        .updateTable("team_members")
        .set(data)
        .where("id", "=", teamMemberId)
        .returningAll()
        .executeTakeFirst();
      if (!member) {
        throw new ORPCError("NOT_FOUND", { message: "Team member not found" });
      }
      return member as any;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a team member",
      path: "/team-members/{teamMemberId}",
      tags: ["Team Member"],
    })
    .input(DeleteTeamMemberSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("team_members")
        .selectAll()
        .where("id", "=", input.teamMemberId)
        .executeTakeFirst();
      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Team member not found" });
      }
      await database
        .deleteFrom("team_members")
        .where("id", "=", input.teamMemberId)
        .execute();
    }),
};
