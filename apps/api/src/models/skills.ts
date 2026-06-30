import { z } from "zod";
import { DifficultyLevelEnum, SkillCategoryEnum } from "./utils/enums";

const arrayPreprocessor = z.preprocess((val) => {
  if (Array.isArray(val)) {
    const filtered = val.filter((v) => v !== "");
    return filtered.length === 0 ? null : filtered;
  }
  return val === "" ? null : val;
}, z.array(z.string()).nullable().optional());

export const SkillSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  serialNumber: z.string().trim().min(1),
  type: z.string().nullable().optional(),
  category: SkillCategoryEnum.nullable().optional(),
  categories: arrayPreprocessor,
  description: z.string().nullable().optional(),
  icon_url: z.string().nullable().optional(),
  industry_id: z.string().uuid().nullable().optional(),
  difficulty: DifficultyLevelEnum.nullable().optional(),
  used_in: arrayPreprocessor,
  jobs: arrayPreprocessor,
  product_categories: arrayPreprocessor,
  common_fields_of_study: arrayPreprocessor,
  related_abilities: arrayPreprocessor,
  time_to_master: z.string().nullable().optional(),
  score: z.number().int().min(0).nullable().optional(),
  metadata: z.any().nullable().optional(),
  deleted_at: z
    .date()
    .nullable()
    .optional()
    .default(null as any),
  created_at: z.date().default(new Date()),
  updated_at: z.date().default(new Date()),
});

export const CreateSkillSchema = SkillSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  serialNumber: true,
}).extend({
  serialNumber: z.string().trim().min(1),
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
