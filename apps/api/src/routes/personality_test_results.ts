import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  PersonalityTestResultSchema,
  PostPersonalityTestResultSchema,
  PutPersonalityTestResultSchema,
  GetPersonalityTestResultsSchema,
  GetPersonalityTestResultSchema,
  DeletePersonalityTestResultSchema,
  DeletePersonalityTestResultsBulkSchema,
} from "../models/personality_test_results";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const personalityTestResults = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all personality test results",
      description: "Get all personality test results with optional user_profile_id and test_id filters",
      path: "/personality-test-results",
      tags: ["PersonalityTestResult"],
    })
    .input(GetPersonalityTestResultsSchema)
    .output(z.array(PersonalityTestResultSchema))
    .handler(async ({ input }) => {
      const { user_profile_id, test_id } = input;

      let query = database.selectFrom("personality_test_results");

      if (user_profile_id) {
        query = query.where("user_profile_id", "=", user_profile_id);
      }

      if (test_id) {
        query = query.where("test_id", "=", test_id);
      }

      return await query.selectAll().execute();
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a specific personality test result",
      description: "Get a personality test result by its ID",
      path: "/personality-test-results/{resultId}",
      tags: ["PersonalityTestResult"],
    })
    .input(GetPersonalityTestResultSchema)
    .output(PersonalityTestResultSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("personality_test_results")
        .where("id", "=", input.resultId)
        .selectAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Personality test result not found" });
      }

      return data;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a personality test result",
      description: "Create a new personality test result",
      path: "/personality-test-results",
      tags: ["PersonalityTestResult"],
    })
    .input(PostPersonalityTestResultSchema)
    .output(PersonalityTestResultSchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("personality_test_results")
        .where("user_profile_id", "=", input.user_profile_id)
        .where("test_id", "=", input.test_id)
        .select("id")
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "A result for this user profile and test already exists",
        });
      }

      const result = await database
        .insertInto("personality_test_results")
        .values({
          ...input,
          id: randomUUID(),
          updated_at: new Date(),
        })
        .returningAll()
        .executeTakeFirst();

      if (!result) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create personality test result",
        });
      }

      return result;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a personality test result",
      description: "Update an existing personality test result by its ID",
      path: "/personality-test-results/{resultId}",
      tags: ["PersonalityTestResult"],
    })
    .input(z.object({ resultId: z.string().uuid() }).merge(PutPersonalityTestResultSchema))
    .output(PersonalityTestResultSchema)
    .handler(async ({ input }) => {
      const { resultId, ...rest } = input;

      const existing = await database
        .selectFrom("personality_test_results")
        .where("id", "=", resultId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Personality test result not found" });
      }

      const result = await database
        .updateTable("personality_test_results")
        .set({ ...rest, updated_at: new Date() })
        .where("id", "=", resultId)
        .returningAll()
        .executeTakeFirst();

      if (!result) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update personality test result",
        });
      }

      return result;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a personality test result",
      description: "Delete an existing personality test result by its ID",
      path: "/personality-test-results/{resultId}",
      tags: ["PersonalityTestResult"],
    })
    .input(DeletePersonalityTestResultSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("personality_test_results")
        .where("id", "=", input.resultId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Personality test result not found" });
      }

      await database
        .deleteFrom("personality_test_results")
        .where("id", "=", input.resultId)
        .execute();
    }),

  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple personality test results",
      description: "Delete multiple existing personality test results by their IDs",
      path: "/personality-test-results",
      tags: ["PersonalityTestResult"],
    })
    .input(DeletePersonalityTestResultsBulkSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      await database
        .deleteFrom("personality_test_results")
        .where("id", "in", input.resultIds)
        .execute();
    }),
};
