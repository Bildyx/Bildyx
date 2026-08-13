import { z } from "zod";
import { TeamSubjectStatusEnum } from "./utils/enums";

export const TeamSubjectSchema = z.object({
  id: z.uuid(),
  team_id: z.uuid().nullable().optional(),
  subject_id: z.uuid(),
  status: TeamSubjectStatusEnum,
});

export const GetTeamSubjectsSchema = z.object({
  subject_id: z.uuid().optional(),
  team_id: z.uuid().optional(),
  status: TeamSubjectStatusEnum.optional(),
});

export const GetTeamSubjectSchema = z.object({
  teamSubjectId: z.uuid(),
});

export const PostTeamSubjectSchema = TeamSubjectSchema.omit({
  id: true,
});

export const PutTeamSubjectSchema = PostTeamSubjectSchema.partial();

export const DeleteTeamSubjectSchema = z.object({
  teamSubjectId: z.uuid(),
});

export const DeleteTeamSubjectsBulkSchema = z.object({
  teamSubjectIds: z.array(z.uuid()),
});

export type TeamSubject = z.infer<typeof TeamSubjectSchema>;
export type PostTeamSubject = z.infer<typeof PostTeamSubjectSchema>;
export type PutTeamSubject = z.infer<typeof PutTeamSubjectSchema>;
