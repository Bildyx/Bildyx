import { z } from "zod";
import { DifficultyLevelEnum } from "./utils/enums";

export const UserSkillSchema = z.object({
  id: z.string().uuid(),
  user_profile_id: z.string().uuid(),
  skill_id: z.string().uuid(),
  level: DifficultyLevelEnum.nullable().optional(),
  name: z.string().optional(),
});

// GET
export const GetUserSkillsSchema = z.object({
  userProfileId: z.string().uuid(),
});

export const GetUserSkillSchema = z.object({
  userSkillId: z.string().uuid(),
});

// POST
export const PostUserSkillSchema = z.object({
  user_profile_id: z.string().uuid(),
  skill_id: z.string().uuid(),
  level: DifficultyLevelEnum.nullable().optional(),
});

// PATCH
export const PutUserSkillSchema = z.object({
  level: DifficultyLevelEnum.nullable().optional(),
});

// DELETE
export const DeleteUserSkillSchema = z.object({
  userSkillId: z.string().uuid(),
});

export const DeleteUserSkillsBulkSchema = z.object({
  userSkillIds: z.array(z.string().uuid()),
});

export type UserSkill = z.infer<typeof UserSkillSchema>;
export type PostUserSkill = z.infer<typeof PostUserSkillSchema>;
export type PutUserSkill = z.infer<typeof PutUserSkillSchema>;
