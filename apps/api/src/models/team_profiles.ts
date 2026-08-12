import { z } from "zod";

export const TeamProfileSchema = z.object({
  id: z.uuid(),
  team_id: z.uuid(),
  who_we_are: z.string().nullable().optional(),
  what_were_great_at: z.string().nullable().optional(),
  team_culture: z.string().nullable().optional(),
  how_we_work_together: z.string().nullable().optional(),
  this_team_is_not_for_you_if: z.string().nullable().optional(),
  how_were_led: z.string().nullable().optional(),
  what_were_solving_now: z.string().nullable().optional(),
  typical_day: z.string().nullable().optional(),
  what_we_value: z.string().nullable().optional(),
  growth_here: z.string().nullable().optional(),
});

export const GetTeamProfilesSchema = z.object({
  team_id: z.uuid().optional(),
});

export const GetTeamProfileSchema = z.object({
  teamProfileId: z.uuid(),
});

export const PostTeamProfileSchema = TeamProfileSchema.omit({
  id: true,
});

export const PutTeamProfileSchema = PostTeamProfileSchema.partial();

export const DeleteTeamProfileSchema = z.object({
  teamProfileId: z.uuid(),
});

export const DeleteTeamProfilesBulkSchema = z.object({
  teamProfileIds: z.array(z.uuid()),
});

export type TeamProfile = z.infer<typeof TeamProfileSchema>;
export type PostTeamProfile = z.infer<typeof PostTeamProfileSchema>;
export type PutTeamProfile = z.infer<typeof PutTeamProfileSchema>;
