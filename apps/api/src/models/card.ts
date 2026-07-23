import { z } from "zod";

export const CardInputSchema = z.object({
  id: z.string(),
  extended: z.string().optional(),
});
