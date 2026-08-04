import { z } from "zod";
import { zNullableUUID } from "./utils/preprocessors";

export const PersonalityCriterionSchema = z.object({
  id: z.uuid(),
  test_id: z.uuid(),
  code: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().nullable().optional(),
  order: z.number().int(),
});

// GET
export const GetPersonalityCriteriaSchema = z.object({
  test_id: zNullableUUID(),
  code: z.string().optional(),
});

export const GetPersonalityCriterionSchema = z.object({
  criterionId: z.uuid(),
});

// POST
export const PostPersonalityCriterionSchema = PersonalityCriterionSchema.omit({
  id: true,
});

// PATCH
export const PutPersonalityCriterionSchema =
  PostPersonalityCriterionSchema.partial();

// DELETE
export const DeletePersonalityCriterionSchema = z.object({
  criterionId: z.uuid(),
});

export const DeletePersonalityCriteriaBulkSchema = z.object({
  criterionIds: z.array(z.uuid()),
});

export type PersonalityCriterion = z.infer<typeof PersonalityCriterionSchema>;
export type PostPersonalityCriterion = z.infer<
  typeof PostPersonalityCriterionSchema
>;
export type PutPersonalityCriterion = z.infer<
  typeof PutPersonalityCriterionSchema
>;
