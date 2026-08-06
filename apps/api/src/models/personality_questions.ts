import { z } from "zod";
import { zNullableUUID } from "./utils/preprocessors";

export const PersonalityQuestionSchema = z.object({
  id: z.uuid(),
  test_id: z.uuid(),
  criterion_id: z.uuid(),
  order: z.number().int(),
  text: z.string().trim().min(1),
  reverse_scored: z.boolean(),
});

// GET
export const GetPersonalityQuestionsSchema = z.object({
  test_id: zNullableUUID(),
  criterion_id: zNullableUUID(),
});

export const GetPersonalityQuestionSchema = z.object({
  questionId: z.uuid(),
});

// POST
export const PostPersonalityQuestionSchema = PersonalityQuestionSchema.omit({
  id: true,
});

export const PostPersonalityQuestionBulkSchema = z.array(
  PostPersonalityQuestionSchema,
);

// PATCH
export const PutPersonalityQuestionSchema =
  PostPersonalityQuestionSchema.partial();

// DELETE
export const DeletePersonalityQuestionSchema = z.object({
  questionId: z.uuid(),
});

export const DeletePersonalityQuestionsBulkSchema = z.object({
  questionIds: z.array(z.uuid()),
});

export type PersonalityQuestion = z.infer<typeof PersonalityQuestionSchema>;
export type PostPersonalityQuestion = z.infer<
  typeof PostPersonalityQuestionSchema
>;
export type PutPersonalityQuestion = z.infer<
  typeof PutPersonalityQuestionSchema
>;
