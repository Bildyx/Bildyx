import { z } from "zod";
import { OrganizationSchema } from "./organizations";
import { zNullableUUID } from "./utils/preprocessors";
import { OrganizationSubtypeEnum, EmployeeCountRangeEnum } from "./utils/enums";

export const GetTargetListSchema = z.object({
  userProfileId: z.uuid(),
  matchFilter: z.enum(["same", "similar", "different"]).optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  sizes: z
    .preprocess(
      (val) => (typeof val === "string" ? [val] : val),
      z.array(EmployeeCountRangeEnum),
    )
    .optional(),
  subtypes: z
    .preprocess(
      (val) => (typeof val === "string" ? [val] : val),
      z.array(OrganizationSubtypeEnum),
    )
    .optional(),
  subject_category_id: zNullableUUID(),
  industry_id: zNullableUUID(),
  keyword: z.string().optional(),
});

export const TargetRowSchema = OrganizationSchema.extend({
  subject_id: z.uuid().nullable().optional(),
  subject_category_id: z.uuid().nullable().optional(),
  subject_name: z.string().nullable().optional(),
  subject_description: z.string().nullable().optional(),
  subject_logo_url: z.string().nullable().optional(),
  match_category: z.enum(["same", "similar", "different"]).optional(),
});

export type GetTargetList = z.infer<typeof GetTargetListSchema>;
export type TargetRow = z.infer<typeof TargetRowSchema>;
