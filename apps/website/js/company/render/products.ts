import { $ } from "../dom";

export function renderProducts() {
  const container = $<HTMLElement>("#caProducts");

  if (!container) {
    return;
  }

  /*
   * Product/team subject rendering can be connected here
   * when the existing product/subject service is wired.
   *
   * The current PHP only provides the #caProducts container.
   */
}
