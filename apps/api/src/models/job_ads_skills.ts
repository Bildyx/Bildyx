import { z } from "zod";
import { SkillImportanceEnum } from "./utils/enums";
import { zNullableUUID } from "./utils/preprocessors";

export const JobAdSkillSchema = z.object({
  id: z.uuid(),
  job_ad_id: z.uuid(),
  skill_id: z.uuid(),
  importance: SkillImportanceEnum.optional().default("REQUIRED"),
});

// GET
export const GetJobAdSkillsSchema = z.object({
  job_ad_id: zNullableUUID(),
  skill_id: zNullableUUID(),
  importance: SkillImportanceEnum.optional(),
});

export const GetJobAdSkillSchema = z.object({
  jobAdSkillId: z.uuid(),
});

// POST
export const PostJobAdSkillSchema = JobAdSkillSchema.omit({
  id: true,
});

// PATCH
export const PutJobAdSkillSchema = PostJobAdSkillSchema.partial();

// DELETE
export const DeleteJobAdSkillSchema = z.object({
  jobAdSkillId: z.uuid(),
});

export const DeleteJobAdSkillsBulkSchema = z.object({
  jobAdSkillIds: z.array(z.uuid()),
});

export type JobAdSkill = z.infer<typeof JobAdSkillSchema>;
export type PostJobAdSkill = z.infer<typeof PostJobAdSkillSchema>;
export type PutJobAdSkill = z.infer<typeof PutJobAdSkillSchema>;
