import { z } from "zod";

export const TeamMemberSchema = z.object({
  id: z.string().uuid(),
  team_id: z.string().uuid(),
  name: z.string(),
  job_title: z.string().nullable(),
  photo_url: z.string().nullable(),
  sort_order: z.number().int(),
  created_at: z.date(),
});

export const TeamSchema = z.object({
  id: z.string().uuid(),
  company_account_id: z.string().uuid(),
  name: z.string(),
  who_we_are: z.string().nullable(),
  what_we_are_great_at: z.string().nullable(),
  team_culture: z.string().nullable(),
  how_we_work_together: z.string().nullable(),
  not_for_you_if: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
  members: z.array(TeamMemberSchema).optional(),
});

export const GetTeamsSchema = z.object({
  companyId: z.string().uuid(),
  search: z.string().optional(),
});

export type GetTeamsInput = z.infer<typeof GetTeamsSchema>;

export const PostTeamMemberSchema = z.object({
  name: z.string().trim().min(1, "Member name is required"),
  job_title: z.string().trim().min(1, "Member role/job title is required"),
  photo_url: z.string().nullable().optional(),
  sort_order: z.number().int().optional(),
});

export const PostTeamSchema = z.object({
  company_account_id: z.string().uuid(),
  name: z.string().trim().min(1, "Team name is required"),
  who_we_are: z.string().nullable().optional(),
  what_we_are_great_at: z.string().nullable().optional(),
  team_culture: z.string().nullable().optional(),
  how_we_work_together: z.string().nullable().optional(),
  not_for_you_if: z.string().nullable().optional(),
});

export const AddTeamMemberSchema = PostTeamMemberSchema.extend({
  team_id: z.string().uuid(),
});
