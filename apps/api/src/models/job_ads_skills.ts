import { z } from "zod";
import { SkillImportanceEnum } from "./utils/enums";

export const JobAdSkillSchema = z.object({
  id: z.string().uuid(),
  job_ad_id: z.string().uuid(),
  skill_id: z.string().uuid(),
  importance: SkillImportanceEnum.optional().default("REQUIRED"),
});

// GET
export const GetJobAdSkillsSchema = z.object({
  job_ad_id: z.string().uuid().optional(),
  skill_id: z.string().uuid().optional(),
  importance: SkillImportanceEnum.optional(),
});

export const GetJobAdSkillSchema = z.object({
  jobAdSkillId: z.string().uuid(),
});

// POST
export const PostJobAdSkillSchema = JobAdSkillSchema.omit({
  id: true,
});

// PATCH
export const PutJobAdSkillSchema = PostJobAdSkillSchema.partial();

// DELETE
export const DeleteJobAdSkillSchema = z.object({
  jobAdSkillId: z.string().uuid(),
});

export const DeleteJobAdSkillsBulkSchema = z.object({
  jobAdSkillIds: z.array(z.string().uuid()),
});

export type JobAdSkill = z.infer<typeof JobAdSkillSchema>;
export type PostJobAdSkill = z.infer<typeof PostJobAdSkillSchema>;
export type PutJobAdSkill = z.infer<typeof PutJobAdSkillSchema>;
