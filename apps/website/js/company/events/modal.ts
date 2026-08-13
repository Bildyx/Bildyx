import {
  modal,
  modalContent,
  overlay,
  openModalElement,
  closeModal,
} from "../dom";

import { state } from "../state";
import { ModalPayload } from "../types";

import { hydrateTeamModal } from "../modals/team/team";
import { hydrateMemberModal } from "../modals/member/member";
import { hydrateProfileModal } from "../modals/profile";
import { hydrateOfficeModal } from "../modals/office/office";
import { hydrateProductModal } from "../modals/product/product";
import { hydrateOrganizationModal } from "../modals/organization";

export async function openModal(name: string, payload: ModalPayload = {}) {
  if (!modalContent) {
    return;
  }

  const templateName = name === "edit-team" ? "team" : name;

  const template = document.getElementById(
    `modal-${templateName}`,
  ) as HTMLTemplateElement | null;

  if (!template) {
    console.warn(`Modal template not found: modal-${templateName}`);
    return;
  }

  modalContent.innerHTML = "";

  modalContent.appendChild(template.content.cloneNode(true));

  modal?.classList.toggle("large", name === "profile");

  modalContent
    .querySelectorAll<HTMLSelectElement>('[data-field="teamId"]')
    .forEach((select) => {
      select.innerHTML = state.teams.length
        ? state.teams
            .map(
              (team) =>
                `<option value="${team.id}" ${
                  team.id === state.activeTeamId ? "selected" : ""
                }>${team.name}</option>`,
            )
            .join("")
        : `<option value="">Create a team first</option>`;
    });

  if (name === "team" || name === "edit-team") {
    hydrateTeamModal(payload);
  }

  if (name === "member" || name === "edit-member") {
    await hydrateMemberModal(name, payload);
  }

  if (name === "profile") {
    hydrateProfileModal();
  }

  if (name === "office" || name === "edit-office") {
    hydrateOfficeModal(name, payload);
  }

  if (name === "product" || name === "edit-product") {
    hydrateProductModal(name, payload);
  }

  if (
    ["partner", "customer", "investor", "subsidiary", "parent"].includes(name)
  ) {
    hydrateOrganizationModal(name);
  }

  bindModalCloseEvents();

  openModalElement();
}

function bindModalCloseEvents() {
  if (!modalContent) {
    return;
  }

  modalContent
    .querySelectorAll<HTMLElement>("[data-close-modal]")
    .forEach((button) => {
      button.onclick = () => {
        closeModal();
      };
    });
}

export function initModalEvents() {
  document.addEventListener("click", (event) => {
    const target = event.target as Element;

    const button = target.closest<HTMLElement>("[data-open-modal]");

    if (!button) {
      return;
    }

    const name = button.dataset.openModal;

    if (!name) {
      return;
    }

    openModal(name);
  });

  overlay?.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });
}
