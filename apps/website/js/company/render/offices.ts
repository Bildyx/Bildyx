import { $, $$ } from "../dom";
import { state } from "../state";
import { openModal } from "../events/modal";
import { toast } from "../../helpers";
import { TeamOfficeService } from "../../../services/team-office.service";

const teamOfficeService = new TeamOfficeService();

export function renderOffices() {
  const container = $<HTMLElement>("#caOffices");

  if (!container) {
    return;
  }

  container.innerHTML = state.offices
    .map((office) => {
      const city = state.cities.find((item) => item.id === office.city_id);

      const label = city
        ? `${city.name}, ${city.country_name}`
        : office.city_id;

      return `
            <div class="ca-chip">
              <span>
                ${label}
              </span>

              <div class="ca-item-actions">
                <button
                  type="button"
                  class="ca-item-action"
                  data-edit-office="${office.id}"
                >
                  ✎
                </button>

                <button
                  type="button"
                  class="ca-item-action danger"
                  data-delete-office-quick="${office.id}"
                >
                  ×
                </button>
              </div>
            </div>
          `;
    })
    .join("");

  $$<HTMLButtonElement>("[data-edit-office]", container).forEach((button) => {
    button.addEventListener("click", () => {
      openModal("edit-office", {
        officeId: button.dataset.editOffice ?? "",
      });
    });
  });

  $$<HTMLButtonElement>("[data-delete-office-quick]", container).forEach(
    (button) => {
      button.addEventListener("click", async () => {
        const id = button.dataset.deleteOfficeQuick;

        if (!id) {
          return;
        }

        if (!window.confirm("Are you sure you want to delete this office?")) {
          return;
        }

        try {
          await teamOfficeService.delete(id);

          state.offices = state.offices.filter((office) => office.id !== id);

          renderOffices();

          toast.success("The city has been deleted.");
        } catch (error) {
          console.error(error);
          toast.error("Failed to delete the office.");
        }
      });
    },
  );
}
