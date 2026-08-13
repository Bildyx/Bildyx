import { $, $$ } from "../dom";
import { renderTeamProfile } from "../render/teams";
import { state } from "../state";

export function initProfileEvents() {
  $$<HTMLElement>("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.mode;

      if (mode !== "people" && mode !== "operate") {
        return;
      }

      state.mode = mode;

      $$<HTMLElement>("[data-mode]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });

      renderTeamProfile();
    });
  });

  document.addEventListener("input", (event) => {
    const target = event.target as HTMLElement;

    const textarea = target.closest<HTMLTextAreaElement>(".ca-tfield textarea");

    if (!textarea) {
      return;
    }

    const field = textarea.closest(".ca-tfield");

    const counter = field?.querySelector<HTMLElement>(".ca-wcount");

    if (!counter) {
      return;
    }

    const text = textarea.value.trim();

    const words = text ? text.split(/\s+/).length : 0;

    const chars = textarea.value.length;

    counter.textContent = `${words}/30 words · ${chars}/180 chars`;
  });
}
