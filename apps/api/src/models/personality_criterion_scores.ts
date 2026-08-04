import { z } from "zod";
import { zNullableUUID } from "./utils/preprocessors";

export const PersonalityCriterionScoreSchema = z.object({
  id: z.uuid(),
  result_id: z.uuid(),
  criterion_id: z.uuid(),
  score: z.number().int().min(0).max(100),
});

// GET
export const GetPersonalityCriterionScoresSchema = z.object({
  result_id: zNullableUUID(),
});

export const GetPersonalityCriterionScoreSchema = z.object({
  scoreId: z.uuid(),
});

// POST
export const PostPersonalityCriterionScoreSchema =
  PersonalityCriterionScoreSchema.omit({
    id: true,
  });

// PATCH
export const PutPersonalityCriterionScoreSchema =
  PostPersonalityCriterionScoreSchema.partial();

// DELETE
export const DeletePersonalityCriterionScoreSchema = z.object({
  scoreId: z.uuid(),
});

export const DeletePersonalityCriterionScoresBulkSchema = z.object({
  scoreIds: z.array(z.uuid()),
});

export type PersonalityCriterionScore = z.infer<
  typeof PersonalityCriterionScoreSchema
>;
export type PostPersonalityCriterionScore = z.infer<
  typeof PostPersonalityCriterionScoreSchema
>;
export type PutPersonalityCriterionScore = z.infer<
  typeof PutPersonalityCriterionScoreSchema
>;
