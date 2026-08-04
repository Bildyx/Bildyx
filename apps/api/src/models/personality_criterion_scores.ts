import { z } from "zod";

export const PersonalityCriterionScoreSchema = z.object({
  id: z.string().uuid(),
  result_id: z.string().uuid(),
  criterion_id: z.string().uuid(),
  score: z.number().int().min(0).max(100),
});

// GET
export const GetPersonalityCriterionScoresSchema = z.object({
  result_id: z.string().uuid().optional(),
});

export const GetPersonalityCriterionScoreSchema = z.object({
  scoreId: z.string().uuid(),
});

// POST
export const PostPersonalityCriterionScoreSchema = PersonalityCriterionScoreSchema.omit({
  id: true,
});

// PATCH
export const PutPersonalityCriterionScoreSchema = PostPersonalityCriterionScoreSchema.partial();

// DELETE
export const DeletePersonalityCriterionScoreSchema = z.object({
  scoreId: z.string().uuid(),
});

export const DeletePersonalityCriterionScoresBulkSchema = z.object({
  scoreIds: z.array(z.string().uuid()),
});

export type PersonalityCriterionScore = z.infer<typeof PersonalityCriterionScoreSchema>;
export type PostPersonalityCriterionScore = z.infer<typeof PostPersonalityCriterionScoreSchema>;
export type PutPersonalityCriterionScore = z.infer<typeof PutPersonalityCriterionScoreSchema>;
