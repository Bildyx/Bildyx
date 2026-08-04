import { z } from "zod";

export const PersonalityAnswerSchema = z.object({
  id: z.string().uuid(),
  result_id: z.string().uuid(),
  question_id: z.string().uuid(),
  raw_score: z.number().int().min(1).max(5),
});

// GET
export const GetPersonalityAnswersSchema = z.object({
  result_id: z.string().uuid().optional(),
});

export const GetPersonalityAnswerSchema = z.object({
  answerId: z.string().uuid(),
});

// POST
export const PostPersonalityAnswerSchema = PersonalityAnswerSchema.omit({
  id: true,
});

// PATCH
export const PutPersonalityAnswerSchema = PostPersonalityAnswerSchema.partial();

// DELETE
export const DeletePersonalityAnswerSchema = z.object({
  answerId: z.string().uuid(),
});

export const DeletePersonalityAnswersBulkSchema = z.object({
  answerIds: z.array(z.string().uuid()),
});

export type PersonalityAnswer = z.infer<typeof PersonalityAnswerSchema>;
export type PostPersonalityAnswer = z.infer<typeof PostPersonalityAnswerSchema>;
export type PutPersonalityAnswer = z.infer<typeof PutPersonalityAnswerSchema>;
