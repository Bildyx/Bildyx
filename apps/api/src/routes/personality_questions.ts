import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  PersonalityQuestionSchema,
  PostPersonalityQuestionSchema,
  PutPersonalityQuestionSchema,
  GetPersonalityQuestionsSchema,
  GetPersonalityQuestionSchema,
  DeletePersonalityQuestionSchema,
  DeletePersonalityQuestionsBulkSchema,
  PostPersonalityQuestionBulkSchema,
} from "../models/personality_questions";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const personalityQuestions = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all personality questions",
      description:
        "Get all personality questions with optional test_id and criterion_id filters",
      path: "/personality-questions",
      tags: ["PersonalityQuestion"],
    })
    .input(GetPersonalityQuestionsSchema)
    .output(z.array(PersonalityQuestionSchema))
    .handler(async ({ input }) => {
      const { test_id, criterion_id } = input;

      let query = database.selectFrom("personality_questions");

      if (test_id) {
        query = query.where("test_id", "=", test_id);
      }

      if (criterion_id) {
        query = query.where("criterion_id", "=", criterion_id);
      }

      return await query.selectAll().orderBy("order", "asc").execute();
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a specific personality question",
      description: "Get a personality question by its ID",
      path: "/personality-questions/{questionId}",
      tags: ["PersonalityQuestion"],
    })
    .input(GetPersonalityQuestionSchema)
    .output(PersonalityQuestionSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("personality_questions")
        .where("id", "=", input.questionId)
        .selectAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", {
          message: "Personality question not found",
        });
      }

      return data;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a personality question",
      description: "Create a new personality question",
      path: "/personality-questions",
      tags: ["PersonalityQuestion"],
    })
    .input(PostPersonalityQuestionSchema)
    .output(PersonalityQuestionSchema)
    .handler(async ({ input }) => {
      const question = await database
        .insertInto("personality_questions")
        .values({
          ...input,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();

      if (!question) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create personality question",
        });
      }

      return question;
    }),

  createBulk: publicProcedure
    .route({
      method: "POST",
      summary: "Create multiple personality questions",
      description: "Create multiple personality questions",
      path: "/personality-questions/bulk",
      tags: ["PersonalityQuestion"],
    })
    .input(PostPersonalityQuestionBulkSchema)
    .output(z.array(PersonalityQuestionSchema))
    .handler(async ({ input }) => {
      const questions = await database
        .insertInto("personality_questions")
        .values(
          input.map((q) => ({
            ...q,
            id: randomUUID(),
          })),
        )
        .returningAll()
        .execute();

      return questions;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a personality question",
      description: "Update an existing personality question by its ID",
      path: "/personality-questions/{questionId}",
      tags: ["PersonalityQuestion"],
    })
    .input(
      z.object({ questionId: z.uuid() }).merge(PutPersonalityQuestionSchema),
    )
    .output(PersonalityQuestionSchema)
    .handler(async ({ input }) => {
      const { questionId, ...rest } = input;

      const existing = await database
        .selectFrom("personality_questions")
        .where("id", "=", questionId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", {
          message: "Personality question not found",
        });
      }

      const question = await database
        .updateTable("personality_questions")
        .set(rest)
        .where("id", "=", questionId)
        .returningAll()
        .executeTakeFirst();

      if (!question) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update personality question",
        });
      }

      return question;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a personality question",
      description: "Delete an existing personality question by its ID",
      path: "/personality-questions/{questionId}",
      tags: ["PersonalityQuestion"],
    })
    .input(DeletePersonalityQuestionSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("personality_questions")
        .where("id", "=", input.questionId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", {
          message: "Personality question not found",
        });
      }

      await database
        .deleteFrom("personality_questions")
        .where("id", "=", input.questionId)
        .execute();
    }),

  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple personality questions",
      description:
        "Delete multiple existing personality questions by their IDs",
      path: "/personality-questions",
      tags: ["PersonalityQuestion"],
    })
    .input(DeletePersonalityQuestionsBulkSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      await database
        .deleteFrom("personality_questions")
        .where("id", "in", input.questionIds)
        .execute();
    }),
};
