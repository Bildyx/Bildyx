import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import {
  OrganizationInvestorSchema,
  PostOrganizationInvestorSchema,
  PutOrganizationInvestorSchema,
  GetOrganizationInvestorsSchema,
  GetOrganizationInvestorSchema,
  DeleteOrganizationInvestorSchema,
} from "../models/organization_investors";
import { database } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const organization_investors = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all organization investors",
      path: "/organization-investors",
      tags: ["Organization Investor"],
    })
    .input(GetOrganizationInvestorsSchema)
    .output(z.array(OrganizationInvestorSchema))
    .handler(async ({ input }) => {
      let query = database.selectFrom("organization_investors");
      if (input.organization_id) {
        query = query.where("organization_id", "=", input.organization_id);
      }
      if (input.investor_id) {
        query = query.where("investor_id", "=", input.investor_id);
      }
      return (await query.selectAll().execute()) as any;
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a organization investor by ID",
      path: "/organization-investors/{organizationInvestorId}",
      tags: ["Organization Investor"],
    })
    .input(GetOrganizationInvestorSchema)
    .output(OrganizationInvestorSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("organization_investors")
        .selectAll()
        .where("id", "=", input.organizationInvestorId)
        .executeTakeFirst();
      if (!data) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization investor not found",
        });
      }
      return data as any;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a organization investor relationship",
      path: "/organization-investors",
      tags: ["Organization Investor"],
    })
    .input(PostOrganizationInvestorSchema)
    .output(OrganizationInvestorSchema)
    .handler(async ({ input }) => {
      const relationship = await database
        .insertInto("organization_investors")
        .values({
          ...input,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();
      if (!relationship) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create organization investor",
        });
      }
      return relationship as any;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a organization investor relationship",
      path: "/organization-investors/{organizationInvestorId}",
      tags: ["Organization Investor"],
    })
    .input(
      z
        .object({ organizationInvestorId: z.uuid() })
        .merge(PutOrganizationInvestorSchema),
    )
    .output(OrganizationInvestorSchema)
    .handler(async ({ input }) => {
      const { organizationInvestorId, ...data } = input;
      const relationship = await database
        .updateTable("organization_investors")
        .set(data)
        .where("id", "=", organizationInvestorId)
        .returningAll()
        .executeTakeFirst();
      if (!relationship) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization investor not found",
        });
      }
      return relationship as any;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a organization investor relationship",
      path: "/organization-investors/{organizationInvestorId}",
      tags: ["Organization Investor"],
    })
    .input(DeleteOrganizationInvestorSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("organization_investors")
        .selectAll()
        .where("id", "=", input.organizationInvestorId)
        .executeTakeFirst();
      if (!existing) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization investor not found",
        });
      }
      await database
        .deleteFrom("organization_investors")
        .where("id", "=", input.organizationInvestorId)
        .execute();
    }),
};
