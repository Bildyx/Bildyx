import { z } from "zod";

export const PersonalityTestResultSchema = z.object({
  id: z.string().uuid(),
  user_profile_id: z.string().uuid(),
  test_id: z.string().uuid(),
  completed_at: z.date(),
  created_at: z.date(),
  updated_at: z.date(),
});

// GET
export const GetPersonalityTestResultsSchema = z.object({
  user_profile_id: z.string().uuid().optional(),
  test_id: z.string().uuid().optional(),
});

export const GetPersonalityTestResultSchema = z.object({
  resultId: z.string().uuid(),
});

// POST
export const PostPersonalityTestResultSchema = PersonalityTestResultSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// PATCH
export const PutPersonalityTestResultSchema = PostPersonalityTestResultSchema.partial();

// DELETE
export const DeletePersonalityTestResultSchema = z.object({
  resultId: z.string().uuid(),
});

export const DeletePersonalityTestResultsBulkSchema = z.object({
  resultIds: z.array(z.string().uuid()),
});

export type PersonalityTestResult = z.infer<typeof PersonalityTestResultSchema>;
export type PostPersonalityTestResult = z.infer<typeof PostPersonalityTestResultSchema>;
export type PutPersonalityTestResult = z.infer<typeof PutPersonalityTestResultSchema>;
