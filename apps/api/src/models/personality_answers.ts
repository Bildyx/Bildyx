import { z } from "zod";
import { zNullableUUID } from "./utils/preprocessors";

export const PersonalityAnswerSchema = z.object({
  id: z.uuid(),
  result_id: z.uuid(),
  question_id: z.uuid(),
  raw_score: z.number().int().min(1).max(5),
});

// GET
export const GetPersonalityAnswersSchema = z.object({
  result_id: zNullableUUID(),
});

export const GetPersonalityAnswerSchema = z.object({
  answerId: z.uuid(),
});

// POST
export const PostPersonalityAnswerSchema = PersonalityAnswerSchema.omit({
  id: true,
});

// PATCH
export const PutPersonalityAnswerSchema = PostPersonalityAnswerSchema.partial();

// DELETE
export const DeletePersonalityAnswerSchema = z.object({
  answerId: z.uuid(),
});

export const DeletePersonalityAnswersBulkSchema = z.object({
  answerIds: z.array(z.uuid()),
});

export type PersonalityAnswer = z.infer<typeof PersonalityAnswerSchema>;
export type PostPersonalityAnswer = z.infer<typeof PostPersonalityAnswerSchema>;
export type PutPersonalityAnswer = z.infer<typeof PutPersonalityAnswerSchema>;
