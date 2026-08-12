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
  SubmitPersonalityTestResultSchema,
  SubmitPersonalityTestResultResponseSchema,
  GetSavedAnswersSchema,
  GetSavedAnswersResponseSchema,
  GetTestsSummarySchema,
  GetTestsSummaryResponseSchema,
  DeleteByTestCodeSchema,
  DeleteByTestCodeResponseSchema,
} from "../models/personality_test_results";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const personalityTestResults = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all personality test results",
      description:
        "Get all personality test results with optional user_profile_id and test_id filters",
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
        throw new ORPCError("NOT_FOUND", {
          message: "Personality test result not found",
        });
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
    .input(
      z.object({ resultId: z.uuid() }).merge(PutPersonalityTestResultSchema),
    )
    .output(PersonalityTestResultSchema)
    .handler(async ({ input }) => {
      const { resultId, ...rest } = input;

      const existing = await database
        .selectFrom("personality_test_results")
        .where("id", "=", resultId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", {
          message: "Personality test result not found",
        });
      }

      const result = await database
        .updateTable("personality_test_results")
        .set(rest)
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
        throw new ORPCError("NOT_FOUND", {
          message: "Personality test result not found",
        });
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
      description:
        "Delete multiple existing personality test results by their IDs",
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

  submitResult: publicProcedure
    .route({
      method: "POST",
      summary: "Submit a personality test result",
      description: "Submit all answers for a personality test, calculate criterion scores, and save them",
      path: "/personality-test-results/submit",
      tags: ["PersonalityTestResult"],
    })
    .input(SubmitPersonalityTestResultSchema)
    .output(SubmitPersonalityTestResultResponseSchema)
    .handler(async ({ input }) => {
      const test = await database
        .selectFrom("personality_tests")
        .where("code", "=", input.test_code)
        .selectAll()
        .executeTakeFirst();

      if (!test) {
        throw new ORPCError("NOT_FOUND", {
          message: `Personality test with code ${input.test_code} not found`,
        });
      }

      const criteria = await database
        .selectFrom("personality_criteria")
        .where("test_id", "=", test.id)
        .selectAll()
        .execute();

      const questions = await database
        .selectFrom("personality_questions")
        .where("test_id", "=", test.id)
        .selectAll()
        .execute();

      const scoresRecord: Record<string, number> = {};
      const answerList: { question_id: string; raw_score: number }[] = [];

      for (const criterion of criteria) {
        const critQuestions = questions.filter((q) => q.criterion_id === criterion.id);
        let sum = 0;
        let count = 0;

        for (const q of critQuestions) {
          const rawVal = input.answers[String(q.order)] ?? input.answers[`q${q.order}`];
          if (rawVal === undefined || rawVal === null) {
            continue;
          }

          let scoreNum = 1;
          if (rawVal === "yes") {
            scoreNum = 5;
          } else if (rawVal === "no") {
            scoreNum = 1;
          } else {
            scoreNum = Number(rawVal);
          }

          answerList.push({ question_id: q.id, raw_score: scoreNum });

          const finalScore = q.reverse_scored ? 6 - scoreNum : scoreNum;
          sum += finalScore;
          count++;
        }

        const percentageScore = count > 0 ? Math.round((sum / (count * 5)) * 100) : 0;
        scoresRecord[criterion.code] = percentageScore;
      }

      // Collect any other answers just in case
      for (const q of questions) {
        if (answerList.some((a) => a.question_id === q.id)) continue;
        const rawVal = input.answers[String(q.order)] ?? input.answers[`q${q.order}`];
        if (rawVal === undefined || rawVal === null) continue;
        let scoreNum = 1;
        if (rawVal === "yes") {
          scoreNum = 5;
        } else if (rawVal === "no") {
          scoreNum = 1;
        } else {
          scoreNum = Number(rawVal);
        }
        answerList.push({ question_id: q.id, raw_score: scoreNum });
      }

      let resultId = randomUUID();

      await database.transaction().execute(async (trx) => {
        const existing = await trx
          .selectFrom("personality_test_results")
          .where("user_profile_id", "=", input.user_profile_id)
          .where("test_id", "=", test.id)
          .select("id")
          .executeTakeFirst();

        if (existing) {
          await trx
            .deleteFrom("personality_test_results")
            .where("id", "=", existing.id)
            .execute();
        }

        await trx
          .insertInto("personality_test_results")
          .values({
            id: resultId,
            user_profile_id: input.user_profile_id,
            test_id: test.id,
            completed_at: new Date(),
          })
          .execute();

        if (answerList.length > 0) {
          await trx
            .insertInto("personality_answers")
            .values(
              answerList.map((ans) => ({
                id: randomUUID(),
                result_id: resultId,
                question_id: ans.question_id,
                raw_score: ans.raw_score,
              })),
            )
            .execute();
        }

        if (criteria.length > 0) {
          await trx
            .insertInto("personality_criterion_scores")
            .values(
              criteria.map((c) => ({
                id: randomUUID(),
                result_id: resultId,
                criterion_id: c.id,
                score: scoresRecord[c.code] ?? 0,
              })),
            )
            .execute();
        }
      });

      return {
        success: true,
        result_id: resultId,
        scores: scoresRecord,
      };
    }),

  getSavedAnswers: publicProcedure
    .route({
      method: "GET",
      summary: "Get saved answers and scores for a test",
      description: "Get all saved answers and criterion scores for a specific test and user",
      path: "/personality-test-results/saved",
      tags: ["PersonalityTestResult"],
    })
    .input(GetSavedAnswersSchema)
    .output(GetSavedAnswersResponseSchema)
    .handler(async ({ input }) => {
      const test = await database
        .selectFrom("personality_tests")
        .where("code", "=", input.test_code)
        .select("id")
        .executeTakeFirst();

      if (!test) {
        throw new ORPCError("NOT_FOUND", {
          message: `Personality test with code ${input.test_code} not found`,
        });
      }

      const result = await database
        .selectFrom("personality_test_results")
        .where("user_profile_id", "=", input.user_profile_id)
        .where("test_id", "=", test.id)
        .selectAll()
        .executeTakeFirst();

      if (!result) {
        return {
          result: null,
          answers: {},
          scores: {},
        };
      }

      const answers = await database
        .selectFrom("personality_answers")
        .innerJoin("personality_questions", "personality_questions.id", "personality_answers.question_id")
        .where("result_id", "=", result.id)
        .select(["personality_questions.order", "personality_answers.raw_score"])
        .execute();

      const scores = await database
        .selectFrom("personality_criterion_scores")
        .innerJoin("personality_criteria", "personality_criteria.id", "personality_criterion_scores.criterion_id")
        .where("result_id", "=", result.id)
        .select(["personality_criteria.code", "personality_criterion_scores.score"])
        .execute();

      const answersRecord: Record<string, number> = {};
      for (const ans of answers) {
        answersRecord[String(ans.order)] = ans.raw_score;
      }

      const scoresRecord: Record<string, number> = {};
      for (const sc of scores) {
        scoresRecord[sc.code] = sc.score;
      }

      return {
        result,
        answers: answersRecord,
        scores: scoresRecord,
      };
    }),

  getTestsSummary: publicProcedure
    .route({
      method: "GET",
      summary: "Get summary of all personality tests with completion status",
      description: "Get summary of all personality tests and if they are completed for a given user",
      path: "/personality-test-results/summary",
      tags: ["PersonalityTestResult"],
    })
    .input(GetTestsSummarySchema)
    .output(GetTestsSummaryResponseSchema)
    .handler(async ({ input }) => {
      const tests = await database
        .selectFrom("personality_tests")
        .where("is_active", "=", true)
        .selectAll()
        .execute();

      const results = await database
        .selectFrom("personality_test_results")
        .where("user_profile_id", "=", input.user_profile_id)
        .selectAll()
        .execute();

      const summary = tests.map((t) => {
        const completed = results.some((r) => r.test_id === t.id);
        return {
          test_id: t.id,
          code: t.code,
          name: t.name,
          description: t.description,
          is_completed: completed,
        };
      });

      return summary;
    }),

  deleteByTestCode: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete personality test result by code",
      description: "Delete the personality test result, raw answers, and criterion scores for a specific test and user",
      path: "/personality-test-results/delete-by-code",
      tags: ["PersonalityTestResult"],
    })
    .input(DeleteByTestCodeSchema)
    .output(DeleteByTestCodeResponseSchema)
    .handler(async ({ input }) => {
      const test = await database
        .selectFrom("personality_tests")
        .where("code", "=", input.test_code)
        .select("id")
        .executeTakeFirst();

      if (!test) {
        throw new ORPCError("NOT_FOUND", {
          message: `Personality test with code ${input.test_code} not found`,
        });
      }

      await database
        .deleteFrom("personality_test_results")
        .where("user_profile_id", "=", input.user_profile_id)
        .where("test_id", "=", test.id)
        .execute();

      return { success: true };
    }),
};
