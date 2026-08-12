import { z } from "zod";

export const TeamSubsidiarySchema = z.object({
  id: z.uuid(),
  team_id: z.uuid().nullable().optional(),
  organization_id: z.uuid().nullable().optional(),
});

export const GetTeamSubsidiariesSchema = z.object({
  team_id: z.uuid().optional(),
  organization_id: z.uuid().optional(),
});

export const GetTeamSubsidiarySchema = z.object({
  teamSubsidiaryId: z.uuid(),
});

export const PostTeamSubsidiarySchema = TeamSubsidiarySchema.omit({
  id: true,
});

export const PutTeamSubsidiarySchema = PostTeamSubsidiarySchema.partial();

export const DeleteTeamSubsidiarySchema = z.object({
  teamSubsidiaryId: z.uuid(),
});

export const DeleteTeamSubsidiariesBulkSchema = z.object({
  teamSubsidiaryIds: z.array(z.uuid()),
});

export type TeamSubsidiary = z.infer<typeof TeamSubsidiarySchema>;
export type PostTeamSubsidiary = z.infer<typeof PostTeamSubsidiarySchema>;
export type PutTeamSubsidiary = z.infer<typeof PutTeamSubsidiarySchema>;
