import { z } from "zod";

export const SkillImportanceEnum = z.enum(["NICE_TO_HAVE", "PREFERRED", "REQUIRED"]);

export const JobAdSkillSchema = z.object({
  id: z.string().uuid(),
  job_ad_id: z.string().uuid(),
  skill_id: z.string().uuid(),
  importance: SkillImportanceEnum,
});

export const CreateJobAdSkillSchema = JobAdSkillSchema.omit({ id: true });
export const UpdateJobAdSkillSchema = z.object({ importance: SkillImportanceEnum });

export const GetJobAdSkillsSchema = z.object({
  job_ad_id: z.string().uuid().optional(),
  skill_id: z.string().uuid().optional(),
  importance: SkillImportanceEnum.optional(),
});

export type JobAdSkill = z.infer<typeof JobAdSkillSchema>;
export type CreateJobAdSkill = z.infer<typeof CreateJobAdSkillSchema>;
export type UpdateJobAdSkill = z.infer<typeof UpdateJobAdSkillSchema>;