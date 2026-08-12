import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import {
  TeamPartnerSchema,
  PostTeamPartnerSchema,
  PutTeamPartnerSchema,
  GetTeamPartnersSchema,
  GetTeamPartnerSchema,
  DeleteTeamPartnerSchema,
} from "../models/team_partners";
import { database } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const team_partners = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all team partners",
      path: "/team-partners",
      tags: ["Team Partner"],
    })
    .input(GetTeamPartnersSchema)
    .output(z.array(TeamPartnerSchema))
    .handler(async ({ input }) => {
      let query = database.selectFrom("team_partners");
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
      summary: "Get a team partner by ID",
      path: "/team-partners/{teamPartnerId}",
      tags: ["Team Partner"],
    })
    .input(GetTeamPartnerSchema)
    .output(TeamPartnerSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("team_partners")
        .selectAll()
        .where("id", "=", input.teamPartnerId)
        .executeTakeFirst();
      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Team partner not found" });
      }
      return data as any;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a team partner relationship",
      path: "/team-partners",
      tags: ["Team Partner"],
    })
    .input(PostTeamPartnerSchema)
    .output(TeamPartnerSchema)
    .handler(async ({ input }) => {
      const relationship = await database
        .insertInto("team_partners")
        .values({
          ...input,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();
      if (!relationship) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create team partner" });
      }
      return relationship as any;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a team partner relationship",
      path: "/team-partners/{teamPartnerId}",
      tags: ["Team Partner"],
    })
    .input(z.object({ teamPartnerId: z.uuid() }).merge(PutTeamPartnerSchema))
    .output(TeamPartnerSchema)
    .handler(async ({ input }) => {
      const { teamPartnerId, ...data } = input;
      const relationship = await database
        .updateTable("team_partners")
        .set(data)
        .where("id", "=", teamPartnerId)
        .returningAll()
        .executeTakeFirst();
      if (!relationship) {
        throw new ORPCError("NOT_FOUND", { message: "Team partner not found" });
      }
      return relationship as any;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a team partner relationship",
      path: "/team-partners/{teamPartnerId}",
      tags: ["Team Partner"],
    })
    .input(DeleteTeamPartnerSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("team_partners")
        .selectAll()
        .where("id", "=", input.teamPartnerId)
        .executeTakeFirst();
      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Team partner not found" });
      }
      await database
        .deleteFrom("team_partners")
        .where("id", "=", input.teamPartnerId)
        .execute();
    }),
};
