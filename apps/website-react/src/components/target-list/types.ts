export type MatchCategory = "same" | "similar" | "different";

export type TargetRow = {
  id: string;
  name?: string;
  description?: string | null;
  subtype?: string | null;
  numberOfEmployees?: string | null;
  avatar_url?: string | null;
  website_url?: string | null;
  website?: string | null;
  founded?: string | null;
  subject_id?: string | null;
  subject_category_id?: string | null;
  subject_name?: string | null;
  subject_description?: string | null;
  subject_logo_url?: string | null;
  match_category?: MatchCategory | null;

  [key: string]: unknown;
};
