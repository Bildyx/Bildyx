import { CompanyAdminMode, CompanyAdminState } from "./types";

export const state: CompanyAdminState = {
  teams: [],
  members: [],
  offices: [],
  teamProfiles: {},
  photos: [],
  partners: [],
  customers: [],
  investors: [],
  subsidiaries: [],
  cities: [],
  countries: [],
  jobs: [],

  activeTeamId: null,
  mode: "people",
  editMode: false,
  selectedUserProfile: null,
};

export function getActiveTeam() {
  return (
    state.teams.find((team) => team.id === state.activeTeamId) ??
    state.teams[0] ??
    null
  );
}

export function setActiveTeam(teamId: string | null) {
  state.activeTeamId = teamId;
}

export function setMode(mode: CompanyAdminMode) {
  state.mode = mode;
}

export function setEditMode(value: boolean) {
  state.editMode = value;
}
