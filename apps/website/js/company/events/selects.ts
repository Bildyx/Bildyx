import { $$ } from "../dom";

export function initCustomSelects(): void {
  document.addEventListener("click", (event) => {
    const target = event.target as Element;

    const trigger = target.closest<HTMLElement>(".ca-cselect-trigger");

    const option = target.closest<HTMLElement>(".ca-cselect-opt");

    // Fermer les autres selects
    $$(".ca-cselect.is-open").forEach((select) => {
      if (!select.contains(target)) {
        select.classList.remove("is-open");
      }
    });

    // Ouvrir / fermer le select
    if (trigger) {
      const select = trigger.closest<HTMLElement>(".ca-cselect");

      if (select) {
        select.classList.toggle("is-open");
      }

      return;
    }

    // Sélectionner une option
    if (option) {
      const select = option.closest<HTMLElement>(".ca-cselect");

      if (!select) {
        return;
      }

      const value = option.dataset.value ?? option.textContent?.trim() ?? "";

      const label = option.textContent?.trim() ?? "";

      const valueElement = select.querySelector<HTMLElement>(".ca-cselect-val");

      const hiddenInput = select.querySelector<HTMLInputElement>(
        "[data-cselect-value]",
      );

      if (valueElement) {
        valueElement.textContent = label;
        valueElement.classList.remove("is-placeholder");
      }

      if (hiddenInput) {
        hiddenInput.value = value;
      }

      select
        .querySelectorAll<HTMLElement>(".ca-cselect-opt")
        .forEach((item) => {
          item.classList.toggle("is-selected", item === option);
        });

      select.classList.remove("is-open");
    }
  });
}
