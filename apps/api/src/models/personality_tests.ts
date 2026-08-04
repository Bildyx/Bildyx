import { z } from "zod";

export const PersonalityTestSchema = z.object({
  id: z.string().uuid(),
  code: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().nullable().optional(),
  is_active: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
});

// GET
export const GetPersonalityTestsSchema = z.object({
  code: z.string().optional(),
  name: z.string().optional(),
});

export const GetPersonalityTestSchema = z.object({
  testId: z.string().uuid(),
});

// POST
export const PostPersonalityTestSchema = PersonalityTestSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// PATCH
export const PutPersonalityTestSchema = PostPersonalityTestSchema.partial();

// DELETE
export const DeletePersonalityTestSchema = z.object({
  testId: z.string().uuid(),
});

export const DeletePersonalityTestsBulkSchema = z.object({
  testIds: z.array(z.string().uuid()),
});

export type PersonalityTest = z.infer<typeof PersonalityTestSchema>;
export type PostPersonalityTest = z.infer<typeof PostPersonalityTestSchema>;
export type PutPersonalityTest = z.infer<typeof PutPersonalityTestSchema>;
