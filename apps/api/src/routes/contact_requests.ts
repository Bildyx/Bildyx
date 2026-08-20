import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  ContactRequestSchema,
  PostContactRequestSchema,
  DeleteContactRequestSchema,
} from "../models/contact_requests";
import { z } from "zod";

export const contact_requests = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all contact requests",
      description: "Get all contact requests",
      path: "/contact-requests",
      tags: ["Contact Request"],
    })
    .output(z.array(ContactRequestSchema))
    .handler(async () => {
      const results = await database
        .selectFrom("contact_requests")
        .selectAll()
        .execute();

      return results;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a contact request",
      description: "Create a new contact request",
      path: "/contact-requests",
      tags: ["Contact Request"],
    })
    .input(PostContactRequestSchema)
    .output(ContactRequestSchema)
    .handler(async ({ input }) => {
      const contact_request = await database
        .insertInto("contact_requests")
        .values({
          ...input,
        } as any)
        .returningAll()
        .executeTakeFirst();

      if (!contact_request) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create contact request",
        });
      }

      return contact_request;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a contact request",
      description: "Delete a contact request",
      path: "/contact-requests/{contactRequestId}",
      tags: ["Contact Request"],
    })
    .input(DeleteContactRequestSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("contact_requests")
        .where("id", "=", input.contactRequestId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", {
          message: "Contact request not found",
        });
      }

      await database
        .deleteFrom("contact_requests")
        .where("id", "=", input.contactRequestId)
        .execute();
    }),
};
