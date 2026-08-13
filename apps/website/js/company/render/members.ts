import { $, $$ } from "../dom";
import { state } from "../state";
import { openModal } from "../events/modal";

const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8," +
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'>" +
  "<circle cx='12' cy='12' r='10'/>" +
  "</svg>";

const esc = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export function renderMembers() {
  const container = $<HTMLElement>("#caMembers");

  if (!container) {
    return;
  }

  const members = state.members.filter(
    (member) =>
      !state.activeTeamId ||
      !member.team_id ||
      member.team_id === state.activeTeamId,
  );

  if (!members.length) {
    container.innerHTML =
      '<div class="ca-empty">No team members added yet. Use "Add Team Members" to build this team.</div>';

    return;
  }

  container.innerHTML = members
    .map((member) => {
      const job = state.jobs.find((item) => item.id === member.job_id);

      const jobTitle = job?.title ?? member.job_id;

      return `
          <article
            class="ca-member"
            data-edit-member="${esc(member.id)}"
            style="position: relative; cursor: pointer;"
          >
            <button
              class="ca-member-delete"
              type="button"
              data-delete-member-quick="${esc(member.id)}"
            >
              ×
            </button>

            <div
              class="ca-member-photo-wrap"
              style="
                position: relative;
                width: 54px;
                height: 54px;
                margin: 6px auto 8px;
              "
            >
              <img
                src="${esc(member.profile_image || DEFAULT_AVATAR)}"
                style="
                  width: 54px;
                  height: 54px;
                  border-radius: 50%;
                  object-fit: cover;
                "
              />
            </div>

            <strong>${esc(member.fullname)}</strong>

            <small>${esc(jobTitle)}</small>
          </article>
        `;
    })
    .join("");

  $$<HTMLElement>("[data-edit-member]", container).forEach((element) => {
    element.addEventListener("click", (event) => {
      const target = event.target as Element;

      if (target.closest("[data-delete-member-quick]")) {
        return;
      }

      const id = element.dataset.editMember;

      if (!id) {
        return;
      }

      openModal("edit-member", {
        memberId: id,
      });
    });
  });
}
