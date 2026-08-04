import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  PersonalityCriterionScoreSchema,
  PostPersonalityCriterionScoreSchema,
  PutPersonalityCriterionScoreSchema,
  GetPersonalityCriterionScoresSchema,
  GetPersonalityCriterionScoreSchema,
  DeletePersonalityCriterionScoreSchema,
  DeletePersonalityCriterionScoresBulkSchema,
} from "../models/personality_criterion_scores";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const personalityCriterionScores = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all personality criterion scores",
      description: "Get all personality criterion scores with optional result_id filter",
      path: "/personality-criterion-scores",
      tags: ["PersonalityCriterionScore"],
    })
    .input(GetPersonalityCriterionScoresSchema)
    .output(z.array(PersonalityCriterionScoreSchema))
    .handler(async ({ input }) => {
      const { result_id } = input;

      let query = database.selectFrom("personality_criterion_scores");

      if (result_id) {
        query = query.where("result_id", "=", result_id);
      }

      return await query.selectAll().execute();
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a specific personality criterion score",
      description: "Get a personality criterion score by its ID",
      path: "/personality-criterion-scores/{scoreId}",
      tags: ["PersonalityCriterionScore"],
    })
    .input(GetPersonalityCriterionScoreSchema)
    .output(PersonalityCriterionScoreSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("personality_criterion_scores")
        .where("id", "=", input.scoreId)
        .selectAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Personality criterion score not found" });
      }

      return data;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a personality criterion score",
      description: "Create a new personality criterion score",
      path: "/personality-criterion-scores",
      tags: ["PersonalityCriterionScore"],
    })
    .input(PostPersonalityCriterionScoreSchema)
    .output(PersonalityCriterionScoreSchema)
    .handler(async ({ input }) => {
      const score = await database
        .insertInto("personality_criterion_scores")
        .values({
          ...input,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();

      if (!score) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create personality criterion score",
        });
      }

      return score;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a personality criterion score",
      description: "Update an existing personality criterion score by its ID",
      path: "/personality-criterion-scores/{scoreId}",
      tags: ["PersonalityCriterionScore"],
    })
    .input(z.object({ scoreId: z.string().uuid() }).merge(PutPersonalityCriterionScoreSchema))
    .output(PersonalityCriterionScoreSchema)
    .handler(async ({ input }) => {
      const { scoreId, ...rest } = input;

      const existing = await database
        .selectFrom("personality_criterion_scores")
        .where("id", "=", scoreId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Personality criterion score not found" });
      }

      const score = await database
        .updateTable("personality_criterion_scores")
        .set(rest)
        .where("id", "=", scoreId)
        .returningAll()
        .executeTakeFirst();

      if (!score) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update personality criterion score",
        });
      }

      return score;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a personality criterion score",
      description: "Delete an existing personality criterion score by its ID",
      path: "/personality-criterion-scores/{scoreId}",
      tags: ["PersonalityCriterionScore"],
    })
    .input(DeletePersonalityCriterionScoreSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("personality_criterion_scores")
        .where("id", "=", input.scoreId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Personality criterion score not found" });
      }

      await database
        .deleteFrom("personality_criterion_scores")
        .where("id", "=", input.scoreId)
        .execute();
    }),

  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple personality criterion scores",
      description: "Delete multiple existing personality criterion scores by their IDs",
      path: "/personality-criterion-scores",
      tags: ["PersonalityCriterionScore"],
    })
    .input(DeletePersonalityCriterionScoresBulkSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      await database
        .deleteFrom("personality_criterion_scores")
        .where("id", "in", input.scoreIds)
        .execute();
    }),
};
