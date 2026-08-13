import { $, modalContent } from "../dom";
import { state } from "../state";

const PROFILE_FIELDS = [
  "who_we_are",
  "what_were_great_at",
  "team_culture",
  "how_we_work_together",
  "this_team_is_not_for_you_if",
  "how_were_led",
  "what_were_solving_now",
  "typical_day",
  "what_we_value",
  "growth_here",
] as const;

export function hydrateProfileModal(teamId = state.activeTeamId ?? "") {
  if (!modalContent) {
    return;
  }

  const profile = state.teamProfiles[teamId];

  const select = $<HTMLSelectElement>('[data-field="teamId"]', modalContent);

  if (select && teamId) {
    select.value = teamId;

    select.onchange = () => {
      hydrateProfileModal(select.value);
    };
  }

  PROFILE_FIELDS.forEach((field) => {
    const textarea = $<HTMLTextAreaElement>(
      `[data-field="${field}"]`,
      modalContent!,
    );

    if (textarea) {
      textarea.value = profile?.[field] ?? "";
    }
  });
}
