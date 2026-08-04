import { z } from "zod";

export const PersonalityCriterionSchema = z.object({
  id: z.string().uuid(),
  test_id: z.string().uuid(),
  code: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().nullable().optional(),
  order: z.number().int(),
});

// GET
export const GetPersonalityCriteriaSchema = z.object({
  test_id: z.string().uuid().optional(),
  code: z.string().optional(),
});

export const GetPersonalityCriterionSchema = z.object({
  criterionId: z.string().uuid(),
});

// POST
export const PostPersonalityCriterionSchema = PersonalityCriterionSchema.omit({
  id: true,
});

// PATCH
export const PutPersonalityCriterionSchema = PostPersonalityCriterionSchema.partial();

// DELETE
export const DeletePersonalityCriterionSchema = z.object({
  criterionId: z.string().uuid(),
});

export const DeletePersonalityCriteriaBulkSchema = z.object({
  criterionIds: z.array(z.string().uuid()),
});

export type PersonalityCriterion = z.infer<typeof PersonalityCriterionSchema>;
export type PostPersonalityCriterion = z.infer<typeof PostPersonalityCriterionSchema>;
export type PutPersonalityCriterion = z.infer<typeof PutPersonalityCriterionSchema>;
