export const COMPANY_PROFILE_STORAGE_KEY = "bildyx_company_con_profile_v3";

export type TeamMember = {
  id: string;
  name: string;
  jobTitle: string;
  teamId?: string;
  isLeader?: boolean;
  avatarUrl?: string;
};

export type Team = { id: string; name: string; type?: string };

export type TeamProfile = {
  who?: string;
  great?: string;
  culture?: string;
  work?: string;
  notFor?: string;
  led?: string;
  solving?: string;
  day?: string;
  value?: string;
  growth?: string;
};

export type NamedItem = { id: string; name: string; status?: string };

export type Photo = { id: string; url: string; teamId?: string };

export type CompanyConProfile = {
  companyName?: string;
  logoUrl?: string;
  parentCompany?: string;
  teams?: Team[];
  members?: TeamMember[];
  offices?: NamedItem[];
  products?: NamedItem[];
  brands?: NamedItem[];
  photos?: Photo[];
  partners?: NamedItem[];
  customers?: NamedItem[];
  investors?: NamedItem[];
  subsidiaries?: NamedItem[];
  teamProfiles?: Record<string, TeamProfile>;
};

export function readCompanyProfile(): CompanyConProfile | null {
  try {
    return JSON.parse(localStorage.getItem(COMPANY_PROFILE_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

export function writeCompanyProfile(profile: CompanyConProfile) {
  localStorage.setItem(COMPANY_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  // Notify same-tab listeners (the native `storage` event only fires cross-tab).
  window.dispatchEvent(new CustomEvent("bildyx-company-profile-updated"));
}

export function uid() {
  return Math.random().toString(36).slice(2);
}
