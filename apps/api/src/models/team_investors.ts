import { z } from "zod";

export const TeamInvestorSchema = z.object({
  id: z.uuid(),
  team_id: z.uuid().nullable().optional(),
  organization_id: z.uuid().nullable().optional(),
});

export const GetTeamInvestorsSchema = z.object({
  team_id: z.uuid().optional(),
  organization_id: z.uuid().optional(),
});

export const GetTeamInvestorSchema = z.object({
  teamInvestorId: z.uuid(),
});

export const PostTeamInvestorSchema = TeamInvestorSchema.omit({
  id: true,
});

export const PutTeamInvestorSchema = PostTeamInvestorSchema.partial();

export const DeleteTeamInvestorSchema = z.object({
  teamInvestorId: z.uuid(),
});

export const DeleteTeamInvestorsBulkSchema = z.object({
  teamInvestorIds: z.array(z.uuid()),
});

export type TeamInvestor = z.infer<typeof TeamInvestorSchema>;
export type PostTeamInvestor = z.infer<typeof PostTeamInvestorSchema>;
export type PutTeamInvestor = z.infer<typeof PutTeamInvestorSchema>;
