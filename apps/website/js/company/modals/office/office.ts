import { $, modalContent } from "../../dom";
import { state } from "../../state";

export function hydrateOfficeModal(
  name: string,
  payload: Record<string, string>,
) {
  if (name !== "edit-office" || !modalContent) {
    return;
  }

  const office = state.offices.find((item) => item.id === payload.officeId);

  if (!office) {
    return;
  }

  const idInput = $<HTMLInputElement>('[data-field="officeId"]', modalContent);

  const hiddenCity = $<HTMLInputElement>(
    '[data-field="office-city"] [data-cselect-value]',
    modalContent,
  );

  const label = $<HTMLElement>(
    '[data-field="office-city"] .ca-cselect-val',
    modalContent,
  );

  const city = state.cities.find((item) => item.id === office.city_id);

  if (idInput) {
    idInput.value = office.id;
  }

  if (hiddenCity) {
    hiddenCity.value = office.city_id;
  }

  if (label && city) {
    label.textContent = `${city.name}, ${city.country_name}`;

    label.classList.remove("is-placeholder");
  }
}
