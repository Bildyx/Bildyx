export function $<T extends Element = Element>(
  selector: string,
  parent: ParentNode = document,
): T | null {
  return parent.querySelector<T>(selector);
}

export function $$<T extends Element = Element>(
  selector: string,
  parent: ParentNode = document,
): T[] {
  return Array.from(parent.querySelectorAll<T>(selector));
}

// ─────────────────────────────────────────────
// Main page elements
// ─────────────────────────────────────────────

export const editActions = $<HTMLElement>("[data-edit-actions]");

export const editButton = $<HTMLButtonElement>("[data-toggle-edit-mode]");

export const editingActions = $<HTMLElement>("[data-editing-actions]");

export const saveEditButton = $<HTMLButtonElement>("[data-save-edit]");

export const cancelEditButton = $<HTMLButtonElement>("[data-cancel-edit]");

// ─────────────────────────────────────────────
// Company
// ─────────────────────────────────────────────

export const companyName = $<HTMLElement>("[data-company-name]");

export const profileUrlText = $<HTMLElement>("[data-profile-url-text]");

export const urlDisplay = $<HTMLElement>(".ca-profile-url-display");

export const urlEdit = $<HTMLElement>(".ca-profile-url-edit");

export const urlInput = $<HTMLInputElement>(".ca-url-input");

export const urlEditButton = $<HTMLButtonElement>(".ca-url-edit-btn");

export const urlCancelButton = $<HTMLButtonElement>(".ca-url-cancel-btn");

export const urlSaveButton = $<HTMLButtonElement>(".ca-url-save-btn");

// ─────────────────────────────────────────────
// Teams
// ─────────────────────────────────────────────

export const teamTabs = $<HTMLElement>("#caTeamTabs");

export const teamMembers = $<HTMLElement>("#caMembers");

export const teamProfile = $<HTMLElement>("#caTeamProfile");

export const offices = $<HTMLElement>("#caOffices");

export const products = $<HTMLElement>("#caProducts");

export const portfolio = $<HTMLElement>("#caPortfolio");

export const photos = $<HTMLElement>("#caPhotos");

export const partners = $<HTMLElement>("#caPartners");

export const customers = $<HTMLElement>("#caCustomers");

export const investors = $<HTMLElement>("#caInvestors");

export const subsidiaries = $<HTMLElement>("#caSubsidiaries");

// ─────────────────────────────────────────────
// Modal
// ─────────────────────────────────────────────

export const modal = $<HTMLElement>("#companyAdminModal");

export const modalContent = $<HTMLElement>("#companyAdminModalContent");

// Main modal elements
export const overlay = document.getElementById("companyAdminModal");

export function openModalElement(): void {
  if (!overlay) {
    return;
  }

  overlay.classList.add("is-open");
  document.body.classList.add("modal-open");
}

export function closeModal(): void {
  if (!overlay) {
    return;
  }

  overlay.classList.remove("is-open");
  document.body.classList.remove("modal-open");

  if (modalContent) {
    modalContent.innerHTML = "";
  }
}

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────

export const skeletonLoader = $<HTMLElement>("#caSkeletonLoader");

export const teamRealContent = $<HTMLElement>("#caTeamRealContent");

// ─────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────

export const toastElement = $<HTMLElement>("#caToast");

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

export function getTemplate(id: string): HTMLTemplateElement | null {
  return $<HTMLTemplateElement>(`#modal-${id}`);
}
