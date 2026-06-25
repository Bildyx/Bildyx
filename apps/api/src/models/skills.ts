import { z } from "zod";

export const SkillCategoryEnum = z.enum(["FRAMEWORK", "LANGUAGE", "METHODOLOGY", "OTHER", "SOFT", "TECHNICAL", "TOOL"]);
export const DifficultyLevelEnum = z.enum(["ADVANCED", "BEGINNER", "EXPERT", "INTERMEDIATE"]);

export const SkillSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  serialNumber: z.string(),
  type: z.string().nullable(),
  category: SkillCategoryEnum.nullable(),
  categories: z.array(z.string()).nullable(),
  description: z.string().nullable(),
  icon_url: z.string().nullable(),
  industry_id: z.string().uuid().nullable(),
  difficulty: DifficultyLevelEnum.nullable(),
  used_in: z.array(z.string()).nullable(),
  jobs: z.array(z.string()).nullable(),
  product_categories: z.array(z.string()).nullable(),
  common_fields_of_study: z.array(z.string()).nullable(),
  related_abilities: z.array(z.string()).nullable(),
  time_to_master: z.string().nullable(),
  metadata: z.unknown().nullable(),
  deleted_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const CreateSkillSchema = SkillSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export const UpdateSkillSchema = CreateSkillSchema.partial();

export const GetSkillsSchema = z.object({
  search: z.string().optional(),
  category: SkillCategoryEnum.optional(),
  difficulty: DifficultyLevelEnum.optional(),
  industry_id: z.string().uuid().optional(),
});

export type Skill = z.infer<typeof SkillSchema>;
export type CreateSkill = z.infer<typeof CreateSkillSchema>;
export type UpdateSkill = z.infer<typeof UpdateSkillSchema>;