import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  MilitaryCapabilitySchema,
  PostMilitaryCapabilitySchema,
  PutMilitaryCapabilitySchema,
  GetMilitaryCapabilitiesSchema,
  GetMilitaryCapabilitySchema,
  DeleteMilitaryCapabilitySchema,
  DeleteMilitaryCapabilitiesBulkSchema,
} from "../models/military_capabilities";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const military_capabilities = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all military capabilities",
      description: "Get all military capabilities with optional filters",
      path: "/military-capabilities",
      tags: ["Military Capability"],
    })
    .input(GetMilitaryCapabilitiesSchema)
    .output(z.array(MilitaryCapabilitySchema))
    .handler(async ({ input }) => {
      const { organization_id } = input;

      let query = database.selectFrom("military_capabilities");

      if (organization_id) {
        query = query.where("organization_id", "=", organization_id);
      }

      return await query.selectAll().execute();
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get one military capability record",
      description: "Get military capability details by ID",
      path: "/military-capabilities/{militaryCapabilityId}",
      tags: ["Military Capability"],
    })
    .input(GetMilitaryCapabilitySchema)
    .output(MilitaryCapabilitySchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("military_capabilities")
        .where("id", "=", input.militaryCapabilityId)
        .selectAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Military capabilities not found" });
      }

      return data;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a military capability record",
      description: "Create a new military capability record for an organization",
      path: "/military-capabilities",
      tags: ["Military Capability"],
    })
    .input(PostMilitaryCapabilitySchema)
    .output(MilitaryCapabilitySchema)
    .handler(async ({ input }) => {
      // Validate organization exists
      const orgExists = await database
        .selectFrom("organizations")
        .where("id", "=", input.organization_id)
        .where("deleted_at", "is", null)
        .select("id")
        .executeTakeFirst();

      if (!orgExists) {
        throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
      }

      // Check unique constraint
      const existing = await database
        .selectFrom("military_capabilities")
        .where("organization_id", "=", input.organization_id)
        .select("id")
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "Military capabilities already exist for this organization",
        });
      }

      const capability = await database
        .insertInto("military_capabilities")
        .values({
          ...input,
          id: randomUUID(),
          updated_at: new Date(),
        })
        .returningAll()
        .executeTakeFirst();

      if (!capability) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create military capability record",
        });
      }

      return capability;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a military capability record",
      description: "Update an existing military capability record by its ID",
      path: "/military-capabilities/{militaryCapabilityId}",
      tags: ["Military Capability"],
    })
    .input(z.object({ militaryCapabilityId: z.string().uuid() }).merge(PutMilitaryCapabilitySchema))
    .output(MilitaryCapabilitySchema)
    .handler(async ({ input }) => {
      const { militaryCapabilityId, ...rest } = input;

      const record = await database
        .selectFrom("military_capabilities")
        .where("id", "=", militaryCapabilityId)
        .select(["id", "organization_id"])
        .executeTakeFirst();

      if (!record) {
        throw new ORPCError("NOT_FOUND", { message: "Military capabilities not found" });
      }

      if (rest.organization_id && rest.organization_id !== record.organization_id) {
        // Validate new organization exists
        const orgExists = await database
          .selectFrom("organizations")
          .where("id", "=", rest.organization_id)
          .where("deleted_at", "is", null)
          .select("id")
          .executeTakeFirst();

        if (!orgExists) {
          throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
        }

        // Check unique constraint
        const existing = await database
          .selectFrom("military_capabilities")
          .where("organization_id", "=", rest.organization_id)
          .select("id")
          .executeTakeFirst();

        if (existing) {
          throw new ORPCError("CONFLICT", {
            message: "Military capabilities already exist for this organization",
          });
        }
      }

      const updated = await database
        .updateTable("military_capabilities")
        .set({
          ...rest,
          updated_at: new Date(),
        })
        .where("id", "=", militaryCapabilityId)
        .returningAll()
        .executeTakeFirst();

      if (!updated) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update military capability record",
        });
      }

      return updated;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a military capability record",
      description: "Delete an existing military capability record by its ID",
      path: "/military-capabilities/{militaryCapabilityId}",
      tags: ["Military Capability"],
    })
    .input(DeleteMilitaryCapabilitySchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("military_capabilities")
        .where("id", "=", input.militaryCapabilityId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Military capabilities not found" });
      }

      await database
        .deleteFrom("military_capabilities")
        .where("id", "=", input.militaryCapabilityId)
        .execute();
    }),

  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple military capability records",
      description: "Delete multiple existing military capability records by their IDs",
      path: "/military-capabilities",
      tags: ["Military Capability"],
    })
    .input(DeleteMilitaryCapabilitiesBulkSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      await database
        .deleteFrom("military_capabilities")
        .where("id", "in", input.militaryCapabilityIds)
        .execute();
    }),
};
