import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import {
  TeamCustomerSchema,
  PostTeamCustomerSchema,
  PutTeamCustomerSchema,
  GetTeamCustomersSchema,
  GetTeamCustomerSchema,
  DeleteTeamCustomerSchema,
} from "../models/team_customers";
import { database } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const team_customers = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all team customers",
      path: "/team-customers",
      tags: ["Team Customer"],
    })
    .input(GetTeamCustomersSchema)
    .output(z.array(TeamCustomerSchema))
    .handler(async ({ input }) => {
      let query = database.selectFrom("team_customers");
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
      summary: "Get a team customer by ID",
      path: "/team-customers/{teamCustomerId}",
      tags: ["Team Customer"],
    })
    .input(GetTeamCustomerSchema)
    .output(TeamCustomerSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("team_customers")
        .selectAll()
        .where("id", "=", input.teamCustomerId)
        .executeTakeFirst();
      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Team customer not found" });
      }
      return data as any;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a team customer relationship",
      path: "/team-customers",
      tags: ["Team Customer"],
    })
    .input(PostTeamCustomerSchema)
    .output(TeamCustomerSchema)
    .handler(async ({ input }) => {
      const relationship = await database
        .insertInto("team_customers")
        .values({
          ...input,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();
      if (!relationship) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create team customer" });
      }
      return relationship as any;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a team customer relationship",
      path: "/team-customers/{teamCustomerId}",
      tags: ["Team Customer"],
    })
    .input(z.object({ teamCustomerId: z.uuid() }).merge(PutTeamCustomerSchema))
    .output(TeamCustomerSchema)
    .handler(async ({ input }) => {
      const { teamCustomerId, ...data } = input;
      const relationship = await database
        .updateTable("team_customers")
        .set(data)
        .where("id", "=", teamCustomerId)
        .returningAll()
        .executeTakeFirst();
      if (!relationship) {
        throw new ORPCError("NOT_FOUND", { message: "Team customer not found" });
      }
      return relationship as any;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a team customer relationship",
      path: "/team-customers/{teamCustomerId}",
      tags: ["Team Customer"],
    })
    .input(DeleteTeamCustomerSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("team_customers")
        .selectAll()
        .where("id", "=", input.teamCustomerId)
        .executeTakeFirst();
      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Team customer not found" });
      }
      await database
        .deleteFrom("team_customers")
        .where("id", "=", input.teamCustomerId)
        .execute();
    }),
};
