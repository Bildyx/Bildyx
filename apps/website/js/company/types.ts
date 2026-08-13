import { Team } from "@repo/models/teams";
import { TeamMember } from "@repo/models/team_members";
import { OrganizationOffice } from "@repo/models/organization_offices";
import { TeamProfile } from "@repo/models/team_profiles";
import { OrganizationPhoto } from "@repo/models/organization_photos";
import { OrganizationPartner } from "@repo/models/organization_partners";
import { OrganizationCustomer } from "@repo/models/organization_customers";
import { OrganizationInvestor } from "@repo/models/organization_investors";
import { OrganizationSubsidiary } from "@repo/models/organization_subsidiaries";
import { UserProfile } from "@repo/models/user_profiles";
import { CityListItem } from "@repo/models/cities";
import { Country } from "@repo/models/countries";
import { Job } from "@repo/models/jobs";

export type CompanyAdminMode = "people" | "operate";

export interface CompanyAdminState {
  teams: Team[];
  members: TeamMember[];
  offices: OrganizationOffice[];
  teamProfiles: Record<string, TeamProfile>;
  photos: OrganizationPhoto[];
  partners: OrganizationPartner[];
  customers: OrganizationCustomer[];
  investors: OrganizationInvestor[];
  subsidiaries: OrganizationSubsidiary[];
  cities: CityListItem[];
  countries: Country[];
  jobs: Job[];

  activeTeamId: string | null;
  mode: CompanyAdminMode;
  editMode: boolean;
  selectedUserProfile: UserProfile | null;
}

export type ModalPayload = Record<string, string>;

export interface RenderChipItem {
  id: string;
}
