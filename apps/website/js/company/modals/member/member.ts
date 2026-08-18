import { UserProfileService } from "../../../../services/user-profile.service";
import { $, modalContent } from "../../dom";
import { state } from "../../state";

const userProfileService = new UserProfileService();

const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8," +
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'>" +
  "<circle cx='12' cy='12' r='10'/>" +
  "</svg>";

export async function hydrateMemberModal(
  name: string,
  payload: Record<string, string>,
) {
  if (!modalContent) {
    return;
  }

  if (name === "edit-member") {
    hydrateEditMember(payload.memberId);

    return;
  }

  await hydrateAddMember();
}

function hydrateEditMember(memberId?: string) {
  if (!memberId) {
    return;
  }

  const member = state.members.find((item) => item.id === memberId);

  if (!member) {
    return;
  }

  const idInput = $<HTMLInputElement>('[data-field="memberId"]', modalContent!);

  const nameInput = $<HTMLInputElement>(
    '[data-field="memberName"]',
    modalContent!,
  );

  const jobInput = $<HTMLInputElement>(
    '[data-field="job"] [data-cselect-value]',
    modalContent!,
  );

  const jobLabel = $<HTMLElement>(
    '[data-field="job"] .ca-cselect-val',
    modalContent!,
  );

  const preview = $<HTMLImageElement>(
    '[data-field="previewImg"]',
    modalContent!,
  );

  if (idInput) {
    idInput.value = member.id;
  }

  if (nameInput) {
    nameInput.value = member.fullname;
  }

  const job = state.jobs.find((item) => item.id === member.job_id);

  if (jobInput) {
    jobInput.value = job?.id ?? member.job_id;
  }

  if (jobLabel && job) {
    jobLabel.textContent = job.title;

    jobLabel.classList.remove("is-placeholder");
  }

  if (preview) {
    preview.src = member.profile_image || DEFAULT_AVATAR;
  }
}

async function hydrateAddMember() {
  const teamSelect = $<HTMLSelectElement>(
    '[data-field="teamId"]',
    modalContent!,
  );

  if (teamSelect && state.activeTeamId) {
    teamSelect.value = state.activeTeamId;
  }

  updateMemberCount();

  teamSelect?.addEventListener("change", updateMemberCount);

  const results = $(".ca-member-results");

  const search = $<HTMLInputElement>(
    '[data-field="memberSearch"]',
    modalContent!,
  );

  if (!results || !search) {
    return;
  }

  try {
    const profiles = await userProfileService.getAll({
      excludeOrganizations: true,
    });

    const renderResults = (term: string) => {
      results.innerHTML = "";

      const filtered =
        term.length > 0
          ? profiles.filter((profile) => {
              const fullName =
                `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.toLowerCase();

              return fullName.includes(term);
            })
          : [];

      filtered.forEach((profile) => {
        const item = document.createElement("div");

        item.className = "ca-member-result-item";

        item.innerHTML = `
            <strong>
              ${profile.first_name ?? ""}
              ${profile.last_name ?? ""}
            </strong>

            <small>
              ${profile.role ?? "Job Seeker"}
            </small>
          `;

        item.addEventListener("click", () => {
          state.selectedUserProfile = profile;

          const nameInput = $<HTMLInputElement>(
            '[data-field="memberName"]',
            modalContent!,
          );

          if (nameInput) {
            nameInput.value =
              `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();
          }

          results
            .querySelectorAll(".ca-member-result-item")
            .forEach((element) => element.classList.remove("is-selected"));

          item.classList.add("is-selected");
        });

        results.appendChild(item);
      });
    };

    search.addEventListener("input", () =>
      renderResults(search.value.toLowerCase().trim()),
    );
  } catch (error) {
    console.error("Failed to load user profiles", error);
  }
}

function updateMemberCount() {
  const teamSelect = $<HTMLSelectElement>(
    '[data-field="teamId"]',
    modalContent!,
  );

  const count = state.members.filter(
    (member) => member.team_id === teamSelect?.value,
  ).length;

  const label = $<HTMLElement>("[data-member-count]", modalContent!);

  if (label) {
    label.textContent = `${count}/12 members`;
  }
}
