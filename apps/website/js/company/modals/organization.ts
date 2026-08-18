import { $, modalContent } from "../dom";

export function hydrateOrganizationModal(name: string) {
  if (!modalContent) {
    return;
  }

  const search = $<HTMLInputElement>(
    '[data-field="orgSearchInput"]',
    modalContent,
  );

  const results = $<HTMLElement>(
    '[data-field="orgSearchResults"]',
    modalContent,
  );

  const selected = $<HTMLInputElement>(
    '[data-field="selectedOrgId"]',
    modalContent,
  );

  const addButton = $<HTMLButtonElement>(
    `[data-add-item="${organizationKey(name)}"]`,
    modalContent,
  );

  if (!search || !results || !selected) {
    return;
  }

  search.addEventListener("input", () => {
    const term = search.value.trim().toLowerCase();

    if (!term) {
      results.style.display = "none";

      return;
    }

    /*
     * Ici tu peux brancher ton
     * organizationService.search()
     * existant.
     *
     * On ne l'invente pas puisque
     * sa signature n'est pas présente
     * dans les sources fournies.
     */
  });

  if (addButton) {
    addButton.disabled = true;

    selected.addEventListener("change", () => {
      addButton.disabled = !selected.value;
    });
  }
}

function organizationKey(name: string) {
  switch (name) {
    case "partner":
      return "partners";

    case "customer":
      return "customers";

    case "investor":
      return "investors";

    case "subsidiary":
      return "subsidiaries";

    default:
      return "";
  }
}
