import { z } from "zod";
import { zNullableUUID } from "./utils/preprocessors";

export const PersonalityTestResultSchema = z.object({
  id: z.uuid(),
  user_profile_id: z.uuid(),
  test_id: z.uuid(),
  completed_at: z.date(),
  created_at: z.date(),
  updated_at: z.date(),
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
    created_at: true,
    updated_at: true,
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
