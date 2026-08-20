import { z } from "zod";
import { TeamVisibilityEnum } from "./utils/enums";

export const TeamSchema = z.object({
  id: z.uuid(),
  type: z.string().trim().min(1, "Team type is required."),
  name: z.string().trim().min(1, "Team name is required."),
  visibility: TeamVisibilityEnum.optional().default("PUBLIC"),
  city_id: z.uuid("City is required."),
  product_service: z.string().nullable().optional(),
  organization_id: z.uuid(),
});

export const GetTeamsSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  city_id: z.uuid().optional(),
  visibility: TeamVisibilityEnum.optional(),
  organization_id: z.uuid().optional(),
});

export const GetTeamSchema = z.object({
  teamId: z.uuid(),
});

export const PostTeamSchema = TeamSchema.omit({
  id: true,
});

export const PutTeamSchema = PostTeamSchema.partial();

export const DeleteTeamSchema = z.object({
  teamId: z.uuid(),
});

export const DeleteTeamsBulkSchema = z.object({
  teamIds: z.array(z.uuid()),
});

export type Team = z.infer<typeof TeamSchema>;
export type PostTeam = z.infer<typeof PostTeamSchema>;
export type PutTeam = z.infer<typeof PutTeamSchema>;
