import { apiGet } from "./httpClient";

export type Organization = {
  id: string;
  name?: string;
  display_name?: string;
  title?: string;
  city?: string;
  country?: string;
  location?: string;
  type?: string;
  subtype?: string;
  category?: string;
  industry?: string;
  description?: string;
  summary?: string;
  services?: string | string[];
  products?: string | string[];
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

export type OrganizationFilters = {
  name?: string;
  subtypes?: string[];
  city?: string;
  country?: string;
  sizes?: string[];
  keyword?: string;
  productFilter?: "same" | "similar" | "different";
  userExperienceKeywords?: string[];
};

/** See src/services/httpClient.ts — TODO: swap for the real @repo/api-client oRPC client. */
export class OrganizationService {
  public getAll(filters?: OrganizationFilters) {
    const params = new URLSearchParams();
    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value === undefined || value === "") return;
      params.set(key, Array.isArray(value) ? value.join(",") : String(value));
    });
    const query = params.toString();
    return apiGet<Organization[]>(`/organizations${query ? `?${query}` : ""}`);
  }

  public getById(organizationId: string) {
    return apiGet<Organization>(`/organizations/${organizationId}`);
  }
}
