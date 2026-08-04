import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  PersonalityAnswerSchema,
  PostPersonalityAnswerSchema,
  PutPersonalityAnswerSchema,
  GetPersonalityAnswersSchema,
  GetPersonalityAnswerSchema,
  DeletePersonalityAnswerSchema,
  DeletePersonalityAnswersBulkSchema,
} from "../models/personality_answers";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const personalityAnswers = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all personality answers",
      description: "Get all personality answers with optional result_id filter",
      path: "/personality-answers",
      tags: ["PersonalityAnswer"],
    })
    .input(GetPersonalityAnswersSchema)
    .output(z.array(PersonalityAnswerSchema))
    .handler(async ({ input }) => {
      const { result_id } = input;

      let query = database.selectFrom("personality_answers");

      if (result_id) {
        query = query.where("result_id", "=", result_id);
      }

      return await query.selectAll().execute();
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a specific personality answer",
      description: "Get a personality answer by its ID",
      path: "/personality-answers/{answerId}",
      tags: ["PersonalityAnswer"],
    })
    .input(GetPersonalityAnswerSchema)
    .output(PersonalityAnswerSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("personality_answers")
        .where("id", "=", input.answerId)
        .selectAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Personality answer not found" });
      }

      return data;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a personality answer",
      description: "Create a new personality answer",
      path: "/personality-answers",
      tags: ["PersonalityAnswer"],
    })
    .input(PostPersonalityAnswerSchema)
    .output(PersonalityAnswerSchema)
    .handler(async ({ input }) => {
      const answer = await database
        .insertInto("personality_answers")
        .values({
          ...input,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();

      if (!answer) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create personality answer",
        });
      }

      return answer;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a personality answer",
      description: "Update an existing personality answer by its ID",
      path: "/personality-answers/{answerId}",
      tags: ["PersonalityAnswer"],
    })
    .input(z.object({ answerId: z.string().uuid() }).merge(PutPersonalityAnswerSchema))
    .output(PersonalityAnswerSchema)
    .handler(async ({ input }) => {
      const { answerId, ...rest } = input;

      const existing = await database
        .selectFrom("personality_answers")
        .where("id", "=", answerId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Personality answer not found" });
      }

      const answer = await database
        .updateTable("personality_answers")
        .set(rest)
        .where("id", "=", answerId)
        .returningAll()
        .executeTakeFirst();

      if (!answer) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update personality answer",
        });
      }

      return answer;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a personality answer",
      description: "Delete an existing personality answer by its ID",
      path: "/personality-answers/{answerId}",
      tags: ["PersonalityAnswer"],
    })
    .input(DeletePersonalityAnswerSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("personality_answers")
        .where("id", "=", input.answerId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Personality answer not found" });
      }

      await database
        .deleteFrom("personality_answers")
        .where("id", "=", input.answerId)
        .execute();
    }),

  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple personality answers",
      description: "Delete multiple existing personality answers by their IDs",
      path: "/personality-answers",
      tags: ["PersonalityAnswer"],
    })
    .input(DeletePersonalityAnswersBulkSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      await database
        .deleteFrom("personality_answers")
        .where("id", "in", input.answerIds)
        .execute();
    }),
};
