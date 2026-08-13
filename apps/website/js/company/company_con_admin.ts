import { state } from "./state";
import { skeletonLoader, teamRealContent } from "./dom";

import { TeamService } from "../../services/team.service";
import { TeamMemberService } from "../../services/team-member.service";
import { TeamOfficeService } from "../../services/team-office.service";
import { TeamProfileService } from "../../services/team-profile.service";
import { TeamPhotoService } from "../../services/team-photo.service";
import { CityService } from "../../services/city.service";
import { CountryService } from "../../services/country.service";
import { JobService } from "../../services/job.service";

import { toast } from "../helpers";

import { initEditMode } from "./events/edit-mode";
import { initModalEvents } from "./events/modal";
import { initProfileEvents } from "./events/profile";
import { initCustomSelects } from "./events/selects";
import { initUploads } from "./events/uploads";

import { renderTeams } from "./render/teams";
import { renderMembers } from "./render/members";
import { renderOffices } from "./render/offices";
import { renderProducts } from "./render/products";
import { renderPortfolio } from "./render/portfolio";
import { renderPhotos } from "./render/photos";
import { renderCompany } from "./render/company";
import { initProfileUrl } from "./events/url";

const teamService = new TeamService();

const teamMemberService = new TeamMemberService();

const teamOfficeService = new TeamOfficeService();

const teamProfileService = new TeamProfileService();

const teamPhotoService = new TeamPhotoService();

const cityService = new CityService();

const countryService = new CountryService();

const jobService = new JobService();

async function loadData() {
  if (skeletonLoader && teamRealContent) {
    skeletonLoader.style.display = "block";

    teamRealContent.style.display = "none";
  }

  try {
    const [teams, members, offices, profiles, photos, cities, countries, jobs] =
      await Promise.all([
        teamService.getAll(),
        teamMemberService.getAll(),
        teamOfficeService.getAll(),
        teamProfileService.getAll(),
        teamPhotoService.getAll(),
        cityService.getAll(),
        countryService.getAll(),
        jobService.getAll(),
      ]);

    state.teams = teams.map((team) => ({
      ...team,
      visibility: team.visibility ?? "PUBLIC",
    }));

    state.members = members.map((member) => ({
      ...member,
      team_id: member.team_id ?? "",
    }));

    state.offices = offices.map((office) => ({
      ...office,
      name: office.city_id,
    }));

    state.cities = cities;

    state.countries = countries;

    state.jobs = jobs;

    state.photos = photos.map((photo) => ({
      ...photo,
      name: photo.name ?? "",
    }));

    state.teamProfiles = {};

    profiles.forEach((profile) => {
      if (!profile.team_id) {
        return;
      }

      state.teamProfiles[profile.team_id] = profile;
    });

    state.activeTeamId = state.teams[0]?.id ?? null;

    render();
  } catch (error) {
    console.error(error);

    toast.error("Failed to load team data.");
  } finally {
    if (skeletonLoader && teamRealContent) {
      skeletonLoader.style.display = "none";

      teamRealContent.style.display = "";
    }
  }
}

function render() {
  renderTeams();
  renderMembers();
  renderOffices();
  renderProducts();
  renderPortfolio();
  renderPhotos();
  renderCompany();
}

function initTabsArrows() {
  const left = document.querySelector<HTMLElement>(".ca-tab-arrow.left");

  const right = document.querySelector<HTMLElement>(".ca-tab-arrow.right");

  const tabs = document.querySelector<HTMLElement>("#caTeamTabs");

  if (!tabs) {
    return;
  }

  left?.addEventListener("click", () => {
    tabs.scrollBy({
      left: -150,
      behavior: "smooth",
    });
  });

  right?.addEventListener("click", () => {
    tabs.scrollBy({
      left: 150,
      behavior: "smooth",
    });
  });
}

function init() {
  initEditMode();
  initProfileUrl();
  initModalEvents();
  initCustomSelects();
  initUploads();
  initProfileEvents();
  initTabsArrows();

  loadData();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
