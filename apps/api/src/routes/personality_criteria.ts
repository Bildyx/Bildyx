import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  PersonalityCriterionSchema,
  PostPersonalityCriterionSchema,
  PutPersonalityCriterionSchema,
  GetPersonalityCriteriaSchema,
  GetPersonalityCriterionSchema,
  DeletePersonalityCriterionSchema,
  DeletePersonalityCriteriaBulkSchema,
} from "../models/personality_criteria";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const personalityCriteria = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all personality criteria",
      description:
        "Get all personality criteria with optional test_id and code filters",
      path: "/personality-criteria",
      tags: ["PersonalityCriterion"],
    })
    .input(GetPersonalityCriteriaSchema)
    .output(z.array(PersonalityCriterionSchema))
    .handler(async ({ input }) => {
      const { test_id, code } = input;

      let query = database.selectFrom("personality_criteria");

      if (test_id) {
        query = query.where("test_id", "=", test_id);
      }

      if (code) {
        query = query.where("code", "=", code);
      }

      return await query.selectAll().orderBy("order", "asc").execute();
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a specific personality criterion",
      description: "Get a personality criterion by its ID",
      path: "/personality-criteria/{criterionId}",
      tags: ["PersonalityCriterion"],
    })
    .input(GetPersonalityCriterionSchema)
    .output(PersonalityCriterionSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("personality_criteria")
        .where("id", "=", input.criterionId)
        .selectAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", {
          message: "Personality criterion not found",
        });
      }

      return data;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a personality criterion",
      description: "Create a new personality criterion",
      path: "/personality-criteria",
      tags: ["PersonalityCriterion"],
    })
    .input(PostPersonalityCriterionSchema)
    .output(PersonalityCriterionSchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("personality_criteria")
        .where("test_id", "=", input.test_id)
        .where("code", "=", input.code)
        .select("id")
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "A criterion with this code already exists for this test",
        });
      }

      const criterion = await database
        .insertInto("personality_criteria")
        .values({
          ...input,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();

      if (!criterion) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create personality criterion",
        });
      }

      return criterion;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a personality criterion",
      description: "Update an existing personality criterion by its ID",
      path: "/personality-criteria/{criterionId}",
      tags: ["PersonalityCriterion"],
    })
    .input(
      z.object({ criterionId: z.uuid() }).merge(PutPersonalityCriterionSchema),
    )
    .output(PersonalityCriterionSchema)
    .handler(async ({ input }) => {
      const { criterionId, ...rest } = input;

      const existing = await database
        .selectFrom("personality_criteria")
        .where("id", "=", criterionId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", {
          message: "Personality criterion not found",
        });
      }

      const criterion = await database
        .updateTable("personality_criteria")
        .set(rest)
        .where("id", "=", criterionId)
        .returningAll()
        .executeTakeFirst();

      if (!criterion) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update personality criterion",
        });
      }

      return criterion;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a personality criterion",
      description: "Delete an existing personality criterion by its ID",
      path: "/personality-criteria/{criterionId}",
      tags: ["PersonalityCriterion"],
    })
    .input(DeletePersonalityCriterionSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("personality_criteria")
        .where("id", "=", input.criterionId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", {
          message: "Personality criterion not found",
        });
      }

      await database
        .deleteFrom("personality_criteria")
        .where("id", "=", input.criterionId)
        .execute();
    }),

  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple personality criteria",
      description: "Delete multiple existing personality criteria by their IDs",
      path: "/personality-criteria",
      tags: ["PersonalityCriterion"],
    })
    .input(DeletePersonalityCriteriaBulkSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      await database
        .deleteFrom("personality_criteria")
        .where("id", "in", input.criterionIds)
        .execute();
    }),
};
