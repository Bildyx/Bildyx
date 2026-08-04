import { z } from "zod";
import { LanguageSchema, LanguageProficiencyEnum } from "./utils/enums";

export const UserLanguageSchema = z.object({
  id: z.uuid(),
  user_profile_id: z.uuid(),
  language: LanguageSchema,
  proficiency: LanguageProficiencyEnum.nullable().optional(),
});

// GET
export const GetUserLanguagesSchema = z.object({
  userProfileId: z.uuid(),
});

export const GetUserLanguageSchema = z.object({
  userLanguageId: z.uuid(),
});

// POST
export const PostUserLanguageSchema = z.object({
  user_profile_id: z.uuid(),
  language: LanguageSchema,
  proficiency: LanguageProficiencyEnum.nullable().optional(),
});

// PATCH
export const PutUserLanguageSchema = z.object({
  proficiency: LanguageProficiencyEnum.nullable().optional(),
});

// DELETE
export const DeleteUserLanguageSchema = z.object({
  userLanguageId: z.uuid(),
});

export const DeleteUserLanguagesBulkSchema = z.object({
  userLanguageIds: z.array(z.uuid()),
});

export type UserLanguage = z.infer<typeof UserLanguageSchema>;
export type PostUserLanguage = z.infer<typeof PostUserLanguageSchema>;
export type PutUserLanguage = z.infer<typeof PutUserLanguageSchema>;
