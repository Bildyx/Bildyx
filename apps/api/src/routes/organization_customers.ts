import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import {
  OrganizationCustomerSchema,
  PostOrganizationCustomerSchema,
  PutOrganizationCustomerSchema,
  GetOrganizationCustomersSchema,
  GetOrganizationCustomerSchema,
  DeleteOrganizationCustomerSchema,
} from "../models/organization_customers";
import { database } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const organization_customers = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all organization customers",
      path: "/organization-customers",
      tags: ["Organization Customer"],
    })
    .input(GetOrganizationCustomersSchema)
    .output(z.array(OrganizationCustomerSchema))
    .handler(async ({ input }) => {
      let query = database.selectFrom("organization_customers");
      if (input.organization_id) {
        query = query.where("organization_id", "=", input.organization_id);
      }
      if (input.customer_id) {
        query = query.where("customer_id", "=", input.customer_id);
      }
      return (await query.selectAll().execute()) as any;
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a organization customer by ID",
      path: "/organization-customers/{organizationCustomerId}",
      tags: ["Organization Customer"],
    })
    .input(GetOrganizationCustomerSchema)
    .output(OrganizationCustomerSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("organization_customers")
        .selectAll()
        .where("id", "=", input.organizationCustomerId)
        .executeTakeFirst();
      if (!data) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization customer not found",
        });
      }
      return data as any;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a organization customer relationship",
      path: "/organization-customers",
      tags: ["Organization Customer"],
    })
    .input(PostOrganizationCustomerSchema)
    .output(OrganizationCustomerSchema)
    .handler(async ({ input }) => {
      const relationship = await database
        .insertInto("organization_customers")
        .values({
          ...input,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();
      if (!relationship) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create organization customer",
        });
      }
      return relationship as any;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a organization customer relationship",
      path: "/organization-customers/{organizationCustomerId}",
      tags: ["Organization Customer"],
    })
    .input(
      z
        .object({ organizationCustomerId: z.uuid() })
        .merge(PutOrganizationCustomerSchema),
    )
    .output(OrganizationCustomerSchema)
    .handler(async ({ input }) => {
      const { organizationCustomerId, ...data } = input;
      const relationship = await database
        .updateTable("organization_customers")
        .set(data)
        .where("id", "=", organizationCustomerId)
        .returningAll()
        .executeTakeFirst();
      if (!relationship) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization customer not found",
        });
      }
      return relationship as any;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a organization customer relationship",
      path: "/organization-customers/{organizationCustomerId}",
      tags: ["Organization Customer"],
    })
    .input(DeleteOrganizationCustomerSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("organization_customers")
        .selectAll()
        .where("id", "=", input.organizationCustomerId)
        .executeTakeFirst();
      if (!existing) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization customer not found",
        });
      }
      await database
        .deleteFrom("organization_customers")
        .where("id", "=", input.organizationCustomerId)
        .execute();
    }),
};
