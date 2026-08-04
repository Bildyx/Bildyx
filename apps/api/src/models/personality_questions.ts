import { z } from "zod";

export const PersonalityQuestionSchema = z.object({
  id: z.string().uuid(),
  test_id: z.string().uuid(),
  criterion_id: z.string().uuid(),
  order: z.number().int(),
  text: z.string().trim().min(1),
  reverse_scored: z.boolean(),
});

// GET
export const GetPersonalityQuestionsSchema = z.object({
  test_id: z.string().uuid().optional(),
  criterion_id: z.string().uuid().optional(),
});

export const GetPersonalityQuestionSchema = z.object({
  questionId: z.string().uuid(),
});

// POST
export const PostPersonalityQuestionSchema = PersonalityQuestionSchema.omit({
  id: true,
});

// PATCH
export const PutPersonalityQuestionSchema = PostPersonalityQuestionSchema.partial();

// DELETE
export const DeletePersonalityQuestionSchema = z.object({
  questionId: z.string().uuid(),
});

export const DeletePersonalityQuestionsBulkSchema = z.object({
  questionIds: z.array(z.string().uuid()),
});

export type PersonalityQuestion = z.infer<typeof PersonalityQuestionSchema>;
export type PostPersonalityQuestion = z.infer<typeof PostPersonalityQuestionSchema>;
export type PutPersonalityQuestion = z.infer<typeof PutPersonalityQuestionSchema>;
