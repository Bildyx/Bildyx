import { $, $$ } from "../dom";
import { state } from "../state";

export function renderCompany() {
  const companyName = $<HTMLElement>("[data-company-name]");

  if (companyName) {
    companyName.textContent = companyName.textContent?.trim() || "Company";
  }

  const disabled = state.teams.length === 0;
  const buttonsToDisable = [
    $('[data-open-modal="member"]'),
    $('.ca-team-main [data-open-modal="office"]'),
    $('.ca-team-main [data-open-modal="product"]'),
    $('.ca-team-main [data-open-modal="brand"]'),
    $('[data-open-modal="photos"]'),
    $('[data-open-modal="partner"]'),
    $('[data-open-modal="customer"]'),
    $('[data-open-modal="investor"]'),
    $('[data-open-modal="subsidiary"]'),
  ];

  buttonsToDisable.forEach((btn) => {
    if (btn) {
      (btn as HTMLButtonElement).disabled = disabled;
      if (disabled) {
        (btn as HTMLElement).style.opacity = "0.5";
        (btn as HTMLElement).style.cursor = "not-allowed";
      } else {
        (btn as HTMLElement).style.opacity = "";
        (btn as HTMLElement).style.cursor = "";
      }
    }
  });
}
