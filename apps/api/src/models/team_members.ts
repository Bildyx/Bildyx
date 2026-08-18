import { z } from "zod";

export const TeamMemberSchema = z.object({
  id: z.uuid(),
  team_id: z.uuid(),
  fullname: z.string().trim().min(1),
  job_id: z.uuid(),
  profile_image: z.string().nullable().optional(),
  is_leader: z.boolean().nullable().optional().default(false),
});

export const GetTeamMembersSchema = z.object({
  team_id: z.uuid().optional(),
  fullname: z.string().optional(),
});

export const GetTeamMemberSchema = z.object({
  teamMemberId: z.uuid(),
});

export const PostTeamMemberSchema = TeamMemberSchema.omit({
  id: true,
});

export const PutTeamMemberSchema = PostTeamMemberSchema.partial();

export const DeleteTeamMemberSchema = z.object({
  teamMemberId: z.uuid(),
});

export const DeleteTeamMembersBulkSchema = z.object({
  teamMemberIds: z.array(z.uuid()),
});

export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type PostTeamMember = z.infer<typeof PostTeamMemberSchema>;
export type PutTeamMember = z.infer<typeof PutTeamMemberSchema>;
