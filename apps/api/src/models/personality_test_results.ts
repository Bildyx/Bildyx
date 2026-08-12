import { z } from "zod";
import { zNullableUUID } from "./utils/preprocessors";

export const PersonalityTestResultSchema = z.object({
  id: z.uuid(),
  user_profile_id: z.uuid(),
  test_id: z.uuid(),
  completed_at: z.date(),
});

// GET
export const GetPersonalityTestResultsSchema = z.object({
  user_profile_id: zNullableUUID(),
  test_id: zNullableUUID(),
});

export const GetPersonalityTestResultSchema = z.object({
  resultId: z.uuid(),
});

// POST
export const PostPersonalityTestResultSchema = PersonalityTestResultSchema.omit(
  {
    id: true,
  },
);

// PATCH
export const PutPersonalityTestResultSchema =
  PostPersonalityTestResultSchema.partial();

// DELETE
export const DeletePersonalityTestResultSchema = z.object({
  resultId: z.uuid(),
});

export const DeletePersonalityTestResultsBulkSchema = z.object({
  resultIds: z.array(z.uuid()),
});

export type PersonalityTestResult = z.infer<typeof PersonalityTestResultSchema>;
export type PostPersonalityTestResult = z.infer<
  typeof PostPersonalityTestResultSchema
>;
export type PutPersonalityTestResult = z.infer<
  typeof PutPersonalityTestResultSchema
>;

// Custom Actions
export const SubmitPersonalityTestResultSchema = z.object({
  user_profile_id: z.string().uuid(),
  test_code: z.string(),
  answers: z.record(z.string(), z.union([z.number(), z.string()])),
});

export const SubmitPersonalityTestResultResponseSchema = z.object({
  success: z.boolean(),
  result_id: z.string().uuid(),
  scores: z.record(z.string(), z.number()),
});

export const GetSavedAnswersSchema = z.object({
  user_profile_id: z.string().uuid(),
  test_code: z.string(),
});

export const GetSavedAnswersResponseSchema = z.object({
  result: PersonalityTestResultSchema.nullable(),
  answers: z.record(z.string(), z.union([z.number(), z.string()])),
  scores: z.record(z.string(), z.number()),
});

export const GetTestsSummarySchema = z.object({
  user_profile_id: z.string().uuid(),
});

export const TestSummaryItemSchema = z.object({
  test_id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  is_completed: z.boolean(),
});

export const GetTestsSummaryResponseSchema = z.array(TestSummaryItemSchema);

export const DeleteByTestCodeSchema = z.object({
  user_profile_id: z.string().uuid(),
  test_code: z.string(),
});

export const DeleteByTestCodeResponseSchema = z.object({
  success: z.boolean(),
});
