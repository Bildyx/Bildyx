import { z } from "zod";

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
});

export const GetTeamsSchema = z.object({
  companyId: z.string().uuid(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  name: z.string().optional(),
});

export type GetTeamsInput = z.infer<typeof GetTeamsSchema>;

export const GetTeamsOutputSchema = z.object({
  data: z.array(TeamSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export const PostTeamSchema = z.object({
  company_account_id: z.string().uuid(),
  name: z.string(),
  who_we_are: z.string().nullable().optional(),
  what_we_are_great_at: z.string().nullable().optional(),
  team_culture: z.string().nullable().optional(),
  how_we_work_together: z.string().nullable().optional(),
  not_for_you_if: z.string().nullable().optional(),
});