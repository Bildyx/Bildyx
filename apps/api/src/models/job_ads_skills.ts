import { z } from "zod";

export const SkillImportanceEnum = z.enum(["REQUIRED", "PREFERRED", "NICE_TO_HAVE"]);

export const JobAdSkillSchema = z.object({
  id: z.string().uuid(),
  job_ad_id: z.string().uuid(),
  skill_id: z.string().uuid(),
  importance: SkillImportanceEnum.optional().default("REQUIRED"),
});

export const CreateJobAdSkillSchema = JobAdSkillSchema.omit({
  id: true,
});

export const UpdateJobAdSkillSchema = CreateJobAdSkillSchema.partial();

export const GetJobAdSkillsSchema = z.object({
  job_ad_id: z.string().uuid().optional(),
  skill_id: z.string().uuid().optional(),
  importance: SkillImportanceEnum.optional(),
});

export type JobAdSkill = z.infer<typeof JobAdSkillSchema>;
export type CreateJobAdSkill = z.infer<typeof CreateJobAdSkillSchema>;
export type UpdateJobAdSkill = z.infer<typeof UpdateJobAdSkillSchema>;
