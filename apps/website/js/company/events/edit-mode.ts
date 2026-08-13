import { state } from "../state";
import { $ } from "../dom";

function refreshEditUI() {
  const panel = $(".ca-team-panel");
  const actions = $("[data-edit-actions]");

  const editButton = $<HTMLButtonElement>("[data-edit-start]");

  const saveButton = $<HTMLButtonElement>("[data-edit-save]");

  const cancelButton = $<HTMLButtonElement>("[data-edit-cancel]");

  panel?.classList.toggle("is-editing", state.editMode);

  editButton?.classList.toggle("is-active", state.editMode);

  if (editButton) {
    editButton.style.display = state.editMode ? "none" : "";
  }

  if (saveButton) {
    saveButton.style.display = state.editMode ? "" : "none";
  }

  if (cancelButton) {
    cancelButton.style.display = state.editMode ? "" : "none";
  }

  actions?.classList.toggle("is-editing", state.editMode);
}

export function initEditMode() {
  const editButton = $<HTMLButtonElement>("[data-edit-start]");

  const saveButton = $<HTMLButtonElement>("[data-edit-save]");

  const cancelButton = $<HTMLButtonElement>("[data-edit-cancel]");

  editButton?.addEventListener("click", () => {
    state.editMode = true;
    refreshEditUI();
  });

  saveButton?.addEventListener("click", () => {
    state.editMode = false;
    refreshEditUI();
  });

  cancelButton?.addEventListener("click", () => {
    state.editMode = false;
    refreshEditUI();
  });

  refreshEditUI();
}

export { refreshEditUI };
