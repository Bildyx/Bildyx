import { $ } from "../dom";

export function renderPortfolio() {
  const container = $<HTMLElement>("#caPortfolio");

  if (!container) {
    return;
  }

  if (!container.textContent?.trim()) {
    container.textContent = "No products or services added yet.";
  }
}
