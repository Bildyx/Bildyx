import { $, $$ } from "../dom";
import { state } from "../state";
import { openModal } from "../events/modal";

const esc = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export function renderTeams() {
  const container = $<HTMLElement>("#caTeamTabs");

  if (!container) {
    return;
  }

  if (!state.teams.length) {
    container.innerHTML = "";
    state.activeTeamId = null;
    return;
  }

  if (!state.activeTeamId) {
    state.activeTeamId = state.teams[0].id;
  }

  container.innerHTML = state.teams
    .map(
      (team) => `
          <button
            class="${team.id === state.activeTeamId ? "is-active" : ""}"
            data-team-id="${esc(team.id)}"
            type="button"
          >
            ${esc(team.name)}

            <span class="ca-item-actions">
              <span
                class="ca-item-action danger"
                data-delete-team-quick="${esc(team.id)}"
              >
                ×
              </span>
            </span>
          </button>
        `,
    )
    .join("");

  $$<HTMLButtonElement>("[data-team-id]", container).forEach((button) => {
    button.addEventListener("click", (event) => {
      const target = event.target as Element;

      if (target.closest(".ca-item-actions")) {
        return;
      }

      state.activeTeamId = button.dataset.teamId ?? null;

      renderTeams();

      openModal("edit-team", {
        teamId: state.activeTeamId ?? "",
      });
    });
  });
}

export function renderTeamProfile() {
  const container = $<HTMLElement>("#caTeamProfile");

  if (!container) {
    return;
  }

  const team =
    state.teams.find((item) => item.id === state.activeTeamId) ??
    state.teams[0];

  if (!team) {
    container.innerHTML = "<p>No team profile added yet.</p>";
    return;
  }

  const profile = state.teamProfiles[team.id];

  if (!profile) {
    container.innerHTML = "<p>No team profile added yet.</p>";
    return;
  }

  const points =
    state.mode === "operate"
      ? [
          ["How We're Led", profile.how_were_led],
          ["What We're Solving Now", profile.what_were_solving_now],
          ["A Typical Day", profile.typical_day],
          ["What We Value", profile.what_we_value],
          ["Growth Here", profile.growth_here],
        ]
      : [
          ["Who We Are", profile.who_we_are],
          ["What We're Great At", profile.what_were_great_at],
          ["Team Culture", profile.team_culture],
          ["How We Work Together", profile.how_we_work_together],
          [
            "This team is NOT for you if...",
            profile.this_team_is_not_for_you_if,
            true,
          ],
        ];

  container.innerHTML =
    points
      .filter(([, value]) => String(value ?? "").trim())
      .map(
        ([title, value, danger]) => `
          <section class="ca-point ${danger ? "danger" : ""}">
            <h4>${esc(title)}</h4>
            <p>${esc(value)}</p>
          </section>
        `,
      )
      .join("") || "<p>No team profile added yet.</p>";
}

export function updateProfileButton() {
  const button = $<HTMLButtonElement>("[data-profile-edit-button]");

  const team = state.teams.find((item) => item.id === state.activeTeamId);

  const hasProfile = Boolean(team && state.teamProfiles[team.id]);

  if (!button) {
    return;
  }

  button.textContent = hasProfile ? "✎ Edit" : "+ Add";

  button.setAttribute(
    "aria-label",
    hasProfile ? "Edit team profile" : "Add team profile",
  );
}
