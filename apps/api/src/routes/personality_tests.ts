import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  PersonalityTestSchema,
  PostPersonalityTestSchema,
  PutPersonalityTestSchema,
  GetPersonalityTestsSchema,
  GetPersonalityTestSchema,
  DeletePersonalityTestSchema,
  DeletePersonalityTestsBulkSchema,
} from "../models/personality_tests";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const personalityTests = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all personality tests",
      description:
        "Get all personality tests with optional search and code filters",
      path: "/personality-tests",
      tags: ["PersonalityTest"],
    })
    .input(GetPersonalityTestsSchema)
    .output(z.array(PersonalityTestSchema))
    .handler(async ({ input }) => {
      const { code, name } = input;

      let query = database.selectFrom("personality_tests");

      if (code) {
        query = query.where("code", "=", code);
      }

      if (name) {
        query = query.where("name", "ilike", `%${name.trim()}%`);
      }

      return await query.selectAll().orderBy("name", "asc").execute();
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a specific personality test",
      description: "Get a personality test by its ID",
      path: "/personality-tests/{testId}",
      tags: ["PersonalityTest"],
    })
    .input(GetPersonalityTestSchema)
    .output(PersonalityTestSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("personality_tests")
        .where("id", "=", input.testId)
        .selectAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", {
          message: "Personality test not found",
        });
      }

      return data;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a personality test",
      description: "Create a new personality test",
      path: "/personality-tests",
      tags: ["PersonalityTest"],
    })
    .input(PostPersonalityTestSchema)
    .output(PersonalityTestSchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("personality_tests")
        .where("code", "=", input.code)
        .select("id")
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "A personality test with this code already exists",
        });
      }

      const test = await database
        .insertInto("personality_tests")
        .values({
          ...input,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();

      if (!test) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create personality test",
        });
      }

      return test;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a personality test",
      description: "Update an existing personality test by its ID",
      path: "/personality-tests/{testId}",
      tags: ["PersonalityTest"],
    })
    .input(z.object({ testId: z.uuid() }).merge(PutPersonalityTestSchema))
    .output(PersonalityTestSchema)
    .handler(async ({ input }) => {
      const { testId, ...rest } = input;

      const existing = await database
        .selectFrom("personality_tests")
        .where("id", "=", testId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", {
          message: "Personality test not found",
        });
      }

      const test = await database
        .updateTable("personality_tests")
        .set(rest)
        .where("id", "=", testId)
        .returningAll()
        .executeTakeFirst();

      if (!test) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update personality test",
        });
      }

      return test;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a personality test",
      description: "Delete an existing personality test by its ID",
      path: "/personality-tests/{testId}",
      tags: ["PersonalityTest"],
    })
    .input(DeletePersonalityTestSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("personality_tests")
        .where("id", "=", input.testId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", {
          message: "Personality test not found",
        });
      }

      await database
        .deleteFrom("personality_tests")
        .where("id", "=", input.testId)
        .execute();
    }),

  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple personality tests",
      description: "Delete multiple existing personality tests by their IDs",
      path: "/personality-tests",
      tags: ["PersonalityTest"],
    })
    .input(DeletePersonalityTestsBulkSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      await database
        .deleteFrom("personality_tests")
        .where("id", "in", input.testIds)
        .execute();
    }),
};
