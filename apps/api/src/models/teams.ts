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
});

export type GetTeamsInput = z.infer<typeof GetTeamsSchema>;
