import { z } from "zod";
import { DifficultyLevelEnum, SkillCategoryEnum } from "./utils/enums";
import { zStringArray } from "./utils/preprocessors";

export const SkillSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  serial_number: z.string().trim().min(1),
  type: z.string().nullable().optional(),
  category: SkillCategoryEnum.nullable().optional(),
  categories: zStringArray(),
  description: z.string().nullable().optional(),
  icon_url: z.string().nullable().optional(),
  industry_id: z.string().uuid().nullable().optional(),
  difficulty: DifficultyLevelEnum.nullable().optional(),
  used_in: zStringArray(),
  jobs: zStringArray(),
  product_categories: zStringArray(),
  common_fields_of_study: zStringArray(),
  related_abilities: zStringArray(),
  time_to_master: z.string().nullable().optional(),
  metadata: z.any().nullable().optional(),
  deleted_at: z.date().nullable().optional().default(null),
  created_at: z.date(),
  updated_at: z.date(),
  score: z.number().int().min(0).nullable().optional(),
});

// GET
export const GetSkillsSchema = z.object({
  name: z.string().optional(),
  category: SkillCategoryEnum.optional(),
  difficulty: DifficultyLevelEnum.optional(),
  industry_id: z.string().uuid().optional(),
});

export const GetSkillSchema = z.object({
  skillId: z.string().uuid(),
});

// POST
export const PostSkillSchema = SkillSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

// PATCH
export const PutSkillSchema = PostSkillSchema.partial();

// DELETE
export const DeleteSkillSchema = z.object({
  skillId: z.string().uuid(),
});

export const DeleteSkillsBulkSchema = z.object({
  skillIds: z.array(z.string().uuid()),
});

export type Skill = z.infer<typeof SkillSchema>;
export type PostSkill = z.infer<typeof PostSkillSchema>;
export type PutSkill = z.infer<typeof PutSkillSchema>;
