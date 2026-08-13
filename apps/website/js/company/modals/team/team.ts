import { $, modalContent } from "../../dom";
import { state } from "../../state";

export function hydrateTeamModal(payload: Record<string, string>) {
  if (!modalContent) {
    return;
  }

  const teamId = payload.teamId ?? "";

  if (!teamId) {
    return;
  }

  const team = state.teams.find((item) => item.id === teamId);

  if (!team) {
    return;
  }

  const title = $("#modalTeamTitle");

  const lead = $("#modalTeamLead");

  const idInput = $<HTMLInputElement>('[data-field="teamId"]', modalContent);

  const nameInput = $<HTMLInputElement>(
    '[data-field="teamName"]',
    modalContent,
  );

  const saveButton = $<HTMLButtonElement>("[data-save-team-btn]", modalContent);

  const deleteButton = $<HTMLButtonElement>("[data-delete-team]", modalContent);

  if (title) {
    title.textContent = "Edit Team";
  }

  if (lead) {
    lead.textContent = "Update or remove this team.";
  }

  if (idInput) {
    idInput.value = team.id;
  }

  if (nameInput) {
    nameInput.value = team.name;
  }

  if (saveButton) {
    saveButton.textContent = "Update Team";
  }

  if (deleteButton) {
    deleteButton.style.display = "";
  }
}
