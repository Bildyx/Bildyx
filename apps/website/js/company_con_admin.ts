import { TeamService } from "../services/team.service";
import { TeamMemberService } from "../services/team-member.service";
import { TeamOfficeService } from "../services/team-office.service";
import { TeamProfileService } from "../services/team-profile.service";
import { TeamPhotoService } from "../services/team-photo.service";
import { TeamPartnerService } from "../services/team-partner.service";
import { TeamCustomerService } from "../services/team-customer.service";
import { TeamInvestorService } from "../services/team-investor.service";
import { TeamSubsidiaryService } from "../services/team-subsidiary.service";
import { CityService } from "../services/city.service";
import { UserProfileService } from "../services/user-profile.service";
import { OrganizationService } from "../services/organization.service";
import { CardService } from "../services/card.service";
import { getSession, toast } from "./helpers";
import { Team } from "@repo/models/teams";
import { TeamMember } from "@repo/models/team_members";
import {
  PostOrganizationOffice,
  OrganizationOffice,
} from "@repo/models/organization_offices";
import { TeamProfile } from "@repo/models/team_profiles";
import { OrganizationPhoto } from "@repo/models/organization_photos";
import { OrganizationPartner } from "@repo/models/organization_partners";
import { OrganizationCustomer } from "@repo/models/organization_customers";
import { OrganizationInvestor } from "@repo/models/organization_investors";
import { OrganizationSubsidiary } from "@repo/models/organization_subsidiaries";
import { UserProfile } from "@repo/models/user_profiles";
import { CityListItem } from "@repo/models/cities";
import { Job } from "@repo/models/jobs";
import { JobService } from "../services/job.service";
import { createClient } from "@supabase/supabase-js";
import { TeamSubjectService } from "../services/team-subject.service";
import { SubjectService } from "../services/subject.service";
import { TeamSubject } from "@repo/models/team_subjects";
import { Subject } from "@repo/models/subjects";

// ─── Services ────────────────────────────────────────────────────────────────
const teamService = new TeamService();
const teamMemberService = new TeamMemberService();
const userProfileService = new UserProfileService();
const organizationService = new OrganizationService();
const cardService = new CardService();
const teamOfficeService = new TeamOfficeService();
const teamProfileService = new TeamProfileService();
const teamPhotoService = new TeamPhotoService();
const teamPartnerService = new TeamPartnerService();
const teamCustomerService = new TeamCustomerService();
const teamInvestorService = new TeamInvestorService();
const teamSubsidiaryService = new TeamSubsidiaryService();
const cityService = new CityService();
const jobService = new JobService();
const teamSubjectService = new TeamSubjectService();
const subjectService = new SubjectService();

let teams: Team[] = [];
let members: TeamMember[] = [];
let offices: OrganizationOffice[] = [];
let teamProfiles: Record<string, TeamProfile> = {};
let photos: OrganizationPhoto[] = [];
let partners: OrganizationPartner[] = [];
let customers: OrganizationCustomer[] = [];
let investors: OrganizationInvestor[] = [];
let subsidiaries: OrganizationSubsidiary[] = [];
let cities: CityListItem[] = [];
let jobs: Job[] = [];
let teamSubjects: TeamSubject[] = [];
let allSubjects: Subject[] = [];

let activeTeamId: string | null = null;
let mode: "people" | "operate" = "people";
let editMode = false;
let originalProfile: TeamProfile | null = null;
let selectedUserProfile: UserProfile | null = null;
let myOrganization: any = null;

// ─── DOM helpers ─────────────────────────────────────────────────────────────
const $ = <T extends Element = Element>(sel: string) =>
  document.querySelector<T>(sel);
const overlay = $("#companyAdminModal");
const modal = overlay?.querySelector(".ca-modal");
const content = $("#companyAdminModalContent");

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

// ─── Utilities ───────────────────────────────────────────────────────────────
const esc = (v: unknown) =>
  String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const DEFAULT_AVATAR = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#cbd5e1">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm0 14.2a7.2 7.2 0 0 1-6-3.18C6.024 14.32 9.98 13.5 12 13.5s5.976.82 6 3.52a7.2 7.2 0 0 1-6 3.18z"/>
  </svg>
`)}`;

function confirmDelete() {
  return window.confirm("Are you sure you want to delete this item?");
}

async function withLoading(
  btn: HTMLButtonElement,
  action: () => Promise<void>,
) {
  if (btn.disabled) return;
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.style.opacity = "0.6";
  btn.style.cursor = "not-allowed";
  btn.innerHTML = `<span class="ca-spinner" style="display:inline-block; width:12px; height:12px; border:2px solid currentColor; border-radius:50%; border-top-color:transparent; animation:ca-spin 0.8s linear infinite; margin-right:6px; vertical-align:middle;"></span>Loading...`;

  try {
    await action();
  } finally {
    btn.disabled = false;
    btn.style.opacity = "";
    btn.style.cursor = "";
    btn.innerHTML = originalText;
  }
}

// Inject CSS style for ca-spin once
const style = document.createElement("style");
style.textContent = `
@keyframes ca-spin {
  to { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);

function activeTeam() {
  return teams.find((t) => t.id === activeTeamId) || teams[0] || null;
}

// ─── Rendering ───────────────────────────────────────────────────────────────
function updateProfileButton() {
  const button = $<HTMLButtonElement>(
    "[data-profile-edit-button], .ca-profile-side [data-open-modal='profile']",
  );
  const team = activeTeam();
  const hasProfile = Boolean(team && teamProfiles[team.id]);
  if (!button) return;
  button.textContent = "+ Add";
  button.setAttribute(
    "aria-label",
    hasProfile ? "Edit team profile" : "Add team profile",
  );
}

function hydrateProfileModal(forTeamId?: string) {
  if (!content) return;
  const tid =
    forTeamId ||
    content.querySelector<HTMLSelectElement>('[data-field="teamId"]')?.value ||
    activeTeamId ||
    "";
  const profile = teamProfiles[tid];
  const fields = [
    "who_we_are",
    "what_were_great_at",
    "team_culture",
    "how_we_work_together",
    "this_team_is_not_for_you_if",
    "how_were_led",
    "what_were_solving_now",
    "typical_day",
    "what_we_value",
    "growth_here",
  ] as const;
  fields.forEach((field) => {
    const el = content!.querySelector<HTMLTextAreaElement>(
      `[data-field="${field}"]`,
    );
    if (el) {
      el.value = profile?.[field] || "";
    }
  });
}

function refreshEditUI() {
  $(".ca-team-panel")?.classList.toggle("is-editing", editMode);
  $(".ca-edit-actions")?.classList.toggle("is-editing", editMode);
}

function renderTabs() {
  const el = $("#caTeamTabs");
  if (!el) return;
  if (!teams.length) {
    el.innerHTML = "";
    activeTeamId = null;
    return;
  }
  if (!activeTeamId) activeTeamId = teams[0].id;

  el.innerHTML = teams
    .map(
      (team) => `
        <button class="${team.id === activeTeamId ? "is-active" : ""}" data-id="${esc(team.id)}">
          ${esc(team.name)}
          <span class="ca-item-actions">
            <span class="ca-item-action" data-edit-team-quick="${esc(team.id)}">✎</span>
            <span class="ca-item-action danger" data-delete-team-quick="${esc(team.id)}">×</span>
          </span>
        </button>
      `,
    )
    .join("");

  el.querySelectorAll<HTMLButtonElement>("[data-id]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if ((e.target as Element).closest(".ca-item-actions")) return;
      activeTeamId = btn.dataset.id!;
      render();
    });
  });

  el.querySelectorAll<HTMLElement>("[data-edit-team-quick]").forEach(
    (pencil) => {
      pencil.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const teamId = pencil.dataset.editTeamQuick!;
        activeTeamId = teamId;
        render();
        open("edit-team", { teamId });
      });
    },
  );

  el.querySelectorAll<HTMLElement>("[data-delete-team-quick]").forEach(
    (btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.deleteTeamQuick!;
        const team = teams.find((t) => t.id === id);
        if (!team) return;

        open("confirm-delete-team");
        const nameLabel = content?.querySelector<HTMLElement>(
          '[data-field="teamNameToDelete"]',
        );
        if (nameLabel) nameLabel.textContent = team.name;

        const confirmBtn = content?.querySelector<HTMLElement>(
          "[data-confirm-delete-team-btn]",
        );
        if (confirmBtn) {
          confirmBtn.onclick = async () => {
            try {
              await teamService.delete(id);
              teams = teams.filter((t) => t.id !== id);
              members = members.filter((m) => m.team_id !== id);
              delete teamProfiles[id];
              activeTeamId = teams[0]?.id || null;
              render();
              closeModal();
            } catch (err) {
              toast.error("Failed to delete the team.");
              console.error(err);
            }
          };
        }
      });
    },
  );
}

function renderMembers() {
  const el = $("#caMembers");
  if (!el) return;

  const filtered = members
    .filter((m) => !activeTeamId || !m.team_id || m.team_id === activeTeamId)
    .sort((a, b) => {
      if (a.is_leader && !b.is_leader) return -1;
      if (!a.is_leader && b.is_leader) return 1;
      return a.fullname.localeCompare(b.fullname);
    });

  el.innerHTML = filtered.length
    ? filtered
        .map((m) => {
          const avatar = m.profile_image
            ? `
              <img
                src="${esc(m.profile_image)}"
                alt=""
                style="
                  width:54px;
                  height:54px;
                  border-radius:50%;
                  object-fit:cover;
                "
              />
            `
            : `
              <div class="ca-default-avatar">
                <i class="bi bi-person"></i>
              </div>
            `;

          const job = jobs.find((j) => j.id === m.job_id);
          const jobTitle = job ? job.title : m.job_id;

          return `
            <article
              class="ca-member"
              data-edit-member="${esc(m.id)}"
              style="position: relative; cursor: pointer;"
            >
              
              <button
                type="button"
                class="ca-star-button"
                data-manager-member="${esc(m.id)}"
                title="${m.is_leader ? "Remove team leader" : "Set as team leader"}"
                style="
                position:absolute;
                top:8px;
                left:8px;
                border:0;
                background:transparent;
                padding:4px;
                cursor:pointer;
                color:#2447f4;
                font-size:16px;
                z-index:2;  
                "
              >
                <i class="bi ${m.is_leader ? "bi-star-fill" : "bi-star"}"></i>
              </button>


              <button
                class="ca-member-delete"
                type="button"
                data-delete-member-quick="${esc(m.id)}"
              >
                <i class="bi bi-trash3-fill"></i>
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
                ${avatar}
              </div>

              <strong>${esc(m.fullname)}</strong>
              <small>${esc(jobTitle)}</small>
            </article>
          `;
        })
        .join("")
    : `
      <div class="ca-empty">
        No team members added yet. Use "Add Team Members" to build this team.
      </div>
    `;

  el.querySelectorAll<HTMLElement>("[data-edit-member]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).closest("[data-delete-member-quick]")) {
        return;
      }

      open("edit-member", {
        memberId: btn.dataset.editMember!,
      });
    });
  });

  el.querySelectorAll<HTMLButtonElement>("[data-delete-member-quick]").forEach(
    (btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();

        if (!confirmDelete()) return;

        const id = btn.dataset.deleteMemberQuick!;

        try {
          await teamMemberService.delete(id);

          members = members.filter((m) => m.id !== id);

          render();
        } catch (err) {
          toast.error("Failed to delete the member.");
          console.error(err);
        }
      });
    },
  );

  el.querySelectorAll<HTMLButtonElement>("[data-manager-member]").forEach(
    (btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();

        const memberId = btn.dataset.managerMember!;
        const member = members.find((m) => m.id === memberId);

        if (!member) return;

        const teamId = member.team_id;

        if (!teamId) {
          toast.error("This member is not assigned to a team.");
          return;
        }

        try {
          // ── Remove team leader ──
          if (member.is_leader) {
            const updated = await teamMemberService.update(memberId, {
              fullname: member.fullname,
              team_id: member.team_id || undefined,
              job_id: member.job_id,
              profile_image: member.profile_image,
              is_leader: false,
            });

            const index = members.findIndex((m) => m.id === memberId);

            if (index !== -1) {
              members[index] = updated;
            }

            render();

            toast.success(`"${member.fullname}" is no longer the team leader.`);
            return;
          }

          // ── Set as team leader ──
          const currentManager = members.find(
            (m) => m.team_id === teamId && m.is_leader && m.id !== memberId,
          );

          // Remove current team leader
          if (currentManager) {
            const updatedCurrentManager = await teamMemberService.update(
              currentManager.id,
              {
                fullname: currentManager.fullname,
                team_id: currentManager.team_id || undefined,
                job_id: currentManager.job_id,
                profile_image: currentManager.profile_image,
                is_leader: false,
              },
            );

            const currentManagerIndex = members.findIndex(
              (m) => m.id === currentManager.id,
            );

            if (currentManagerIndex !== -1) {
              members[currentManagerIndex] = updatedCurrentManager;
            }
          }

          // Set new team leader
          const updated = await teamMemberService.update(memberId, {
            fullname: member.fullname,
            team_id: member.team_id || undefined,
            job_id: member.job_id,
            profile_image: member.profile_image,
            is_leader: true,
          });

          const index = members.findIndex((m) => m.id === memberId);

          if (index !== -1) {
            members[index] = updated;
          }

          render();

          toast.success(`"${member.fullname}" is now the team leader.`);
        } catch (err) {
          toast.error("Failed to update the team leader.");
          console.error(err);
        }
      });
    },
  );
}

function renderChips(
  selector: string,
  arr: Array<{ id: string; name?: string }>,
  type?: string,
) {
  const el = $(selector);
  if (!el) return;
  const editKind = selector === "#caOffices" ? "office" : "product";

  el.innerHTML = (arr || [])
    .map((item) => {
      let text = "";
      let isMain = false;
      let spanContent = "";
      if (selector === "#caOffices") {
        const officeObj = offices.find((o) => o.id === item.id);
        const cityObj = cities.find((c) => c.id === officeObj?.city_id);
        if (cityObj) {
          text = `${cityObj.name}, ${cityObj.country_name}`;
        } else {
          text = "Office";
        }
        const teamObj = activeTeam();
        isMain =
          teamObj !== null &&
          officeObj !== undefined &&
          teamObj.city_id === officeObj.city_id;
        spanContent =
          '<i class="bi bi-building" style="font-size: 20px; color: #fff;"></i>';
      } else {
        text = item.name || "";
      }

      return `
        <div class="ca-chip ${type || ""}">
          <div class="ca-item-actions">
            <button class="ca-item-action" type="button" data-edit-${editKind}="${esc(item.id)}">✎</button>
            <button class="ca-item-action danger" type="button" data-delete-${editKind}-quick="${esc(item.id)}">×</button>
          </div>
          <span style="${isMain ? "box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--ca-blue);" : ""}">${spanContent}</span>
          <div style="text-align: center; margin-top: 4px; font-weight: 500; font-size: 11px; color: ${
            isMain ? "var(--ca-blue)" : "var(--ca-muted)"
          };">${esc(text)}</div>
        </div>
      `;
    })
    .join("");

  if (editKind === "office") {
    el.querySelectorAll<HTMLButtonElement>("[data-edit-office]").forEach(
      (btn) => {
        btn.addEventListener("click", () => {
          open("edit-office", { officeId: btn.dataset.editOffice! });
        });
      },
    );
    el.querySelectorAll<HTMLButtonElement>(
      "[data-delete-office-quick]",
    ).forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirmDelete()) return;
        const id = btn.dataset.deleteOfficeQuick!;
        try {
          await teamOfficeService.delete(id);
          offices = offices.filter((o) => o.id !== id);
          renderChips(
            "#caOffices",
            offices.map((o) => ({ id: o.id || o.city_id })),
          );
        } catch (err) {
          toast.error("Failed to delete the office.");
          console.error(err);
        }
      });
    });
  }
}

function renderProfile() {
  const el = $("#caTeamProfile");
  const team = activeTeam();

  if (!el) return;

  if (!team) {
    el.innerHTML = `
      <p class="ca-profile-empty">
        No team profile added yet.
      </p>
    `;
    return;
  }

  const profile = teamProfiles[team.id];

  if (!profile) {
    el.innerHTML = `
      <p class="ca-profile-empty">
        No team profile added yet.
      </p>
    `;
    return;
  }

  const points =
    mode === "operate"
      ? [
          ["How We're Led", "how_were_led", profile.how_were_led],
          [
            "What We're Solving Now",
            "what_were_solving_now",
            profile.what_were_solving_now,
          ],
          ["A Typical Day", "typical_day", profile.typical_day],
          ["What We Value", "what_we_value", profile.what_we_value],
          ["Growth Here", "growth_here", profile.growth_here],
        ]
      : [
          ["Who We Are", "who_we_are", profile.who_we_are],
          [
            "What We're Great At",
            "what_were_great_at",
            profile.what_were_great_at,
          ],
          ["Team Culture", "team_culture", profile.team_culture],
          [
            "How We Work Together",
            "how_we_work_together",
            profile.how_we_work_together,
          ],
          [
            "This team is NOT for you if...",
            "this_team_is_not_for_you_if",
            profile.this_team_is_not_for_you_if,
            true,
          ],
        ];

  const visiblePoints = editMode
    ? points
    : points.filter(([, , value]) => String(value || "").trim());

  if (!visiblePoints.length) {
    el.innerHTML = `
      <p class="ca-profile-empty">
        No team profile added yet.
      </p>
    `;
    return;
  }

  el.innerHTML = `
    <div class="ca-profile-points ${editMode ? "is-editing" : ""}">
      ${visiblePoints
        .map(([title, field, text, danger]) => {
          const fieldName = String(field);
          const fieldValue = String(text || "");

          if (editMode) {
            return `
    <section
      class="ca-point ${danger ? "danger" : ""} ca-point-editing"
      data-profile-point="${esc(fieldName)}"
    >
      <h4>${esc(title)}</h4>
      <textarea
        class="ca-profile-input"
        data-field="${esc(fieldName)}"
        rows="4"
      >${esc(fieldValue)}</textarea>
    </section>
  `;
          }

          return `
            <section
              class="ca-point ${danger ? "danger" : ""}"
              data-profile-point="${esc(fieldName)}"
            >
              <h4>${esc(title)}</h4>
              <p>${esc(fieldValue)}</p>
            </section>
          `;
        })
        .join("")}
    </div>
  `;

  if (!editMode) return;

  // ─────────────────────────────────────────────
  // Cancel
  // ─────────────────────────────────────────────
  el.querySelector<HTMLButtonElement>(
    "[data-inline-profile-cancel]",
  )?.addEventListener("click", () => {
    editMode = false;
    refreshEditUI();
    renderProfile();
  });

  // ─────────────────────────────────────────────
  // Save
  // ─────────────────────────────────────────────
  el.querySelector<HTMLButtonElement>(
    "[data-inline-profile-save]",
  )?.addEventListener("click", async () => {
    const currentProfile = teamProfiles[team.id];

    if (!currentProfile?.id) {
      toast.error("Unable to update this team profile.");
      return;
    }

    const updatedProfile = {
      ...currentProfile,
    };

    el.querySelectorAll<HTMLTextAreaElement>(
      "[data-inline-profile-field]",
    ).forEach((input) => {
      const field = input.dataset.inlineProfileField as keyof TeamProfile;

      if (field) {
        (updatedProfile as any)[field] = input.value.trim();
      }
    });

    const saveButton = el.querySelector<HTMLButtonElement>(
      "[data-inline-profile-save]",
    );

    const cancelButton = el.querySelector<HTMLButtonElement>(
      "[data-inline-profile-cancel]",
    );

    if (saveButton) {
      saveButton.disabled = true;
      saveButton.innerHTML = `
          <i class="bi bi-arrow-repeat ca-spin"></i>
          <span>Saving...</span>
        `;
    }

    if (cancelButton) {
      cancelButton.disabled = true;
    }

    try {
      const payload = {
        team_id: team.id,
        who_we_are: updatedProfile.who_we_are || "",
        what_were_great_at: updatedProfile.what_were_great_at || "",
        team_culture: updatedProfile.team_culture || "",
        how_we_work_together: updatedProfile.how_we_work_together || "",
        this_team_is_not_for_you_if:
          updatedProfile.this_team_is_not_for_you_if || "",
        how_were_led: updatedProfile.how_were_led || "",
        what_were_solving_now: updatedProfile.what_were_solving_now || "",
        typical_day: updatedProfile.typical_day || "",
        what_we_value: updatedProfile.what_we_value || "",
        growth_here: updatedProfile.growth_here || "",
      };

      await teamProfileService.update(currentProfile.id, payload);

      teamProfiles[team.id] = {
        ...currentProfile,
        ...payload,
      };

      editMode = false;
      refreshEditUI();
      renderProfile();

      toast.success("The team profile has been updated.");
    } catch (err) {
      toast.error("Failed to save the team profile.");
      console.error(err);

      if (saveButton) {
        saveButton.disabled = false;
        saveButton.innerHTML = `
            <i class="bi bi-check-lg"></i>
            <span>Save</span>
          `;
      }

      if (cancelButton) {
        cancelButton.disabled = false;
      }
    }
  });
}

function renderStatus() {
  const label = $("[data-published-label]");
  if (label) label.textContent = "Published";

  const photoEl = $("#caPhotos");
  if (photoEl) {
    photoEl.innerHTML = photos.length
      ? photos
          .map(
            (p) => `
            <div class="ca-photo-item">
              <img src="${esc(p.url)}" alt="${esc(p.name)}" class="ca-photo-img" />
              <button class="ca-photo-delete" type="button" data-delete-photo-quick="${esc(p.id)}">×</button>
            </div>
          `,
          )
          .join("")
      : '<div class="ca-empty-photos">No photos added yet.</div>';

    photoEl.querySelectorAll("[data-delete-photo-quick]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!confirmDelete()) return;
        const id = (btn as HTMLElement).dataset.deletePhotoQuick!;
        try {
          await teamPhotoService.delete(id);
          photos = photos.filter((p) => p.id !== id);
          renderStatus();
        } catch (err) {
          toast.error("Failed to delete the photo.");
          console.error(err);
        }
      });
    });
  }
  const photosCount = $("#caPhotosCount");
  if (photosCount) {
    photosCount.textContent = `${photos.length}/10`;
  }

  renderOrgSections();
}

async function renderOrgSections() {
  const mapSections: Array<[string, any[], string]> = [
    ["#caPartners", partners, "partner"],
    ["#caCustomers", customers, "customer"],
    ["#caInvestors", investors, "investor"],
    ["#caSubsidiaries", subsidiaries, "subsidiary"],
  ];

  for (const [selector, arr, labelText] of mapSections) {
    const el = $(selector);
    if (!el) continue;

    if (arr.length === 0) {
      el.className = "";
      el.innerHTML = `No ${labelText}s added yet.`;
      continue;
    }

    el.className = "ca-org-grid ca-carousel";
    el.innerHTML = arr
      .map((item) => {
        const targetOrgId =
          item.partner_id ||
          item.customer_id ||
          item.investor_id ||
          item.subsidiary_id;
        return `
            <div class="ca-card-slot" id="slot-${esc(item.id)}" data-org-id="${esc(targetOrgId)}">
              <div class="ca-photo-skeleton" style="height: 100%; border-radius: 14px;"></div>
            </div>
          `;
      })
      .join("");

    arr.forEach(async (item) => {
      const slot = el.querySelector(`#slot-${item.id}`) as HTMLElement | null;
      if (!slot) return;

      try {
        const targetOrgId =
          item.partner_id ||
          item.customer_id ||
          item.investor_id ||
          item.subsidiary_id;
        const html = await cardService.getOrganization(targetOrgId);
        slot.innerHTML = "";

        const iframe = document.createElement("iframe");
        iframe.className = "org-card-frame";
        iframe.srcdoc = `<html><head><style>html,body{margin:0;padding:0;overflow:hidden;font-family:"Plus Jakarta Sans",system-ui,sans-serif}.scale-wrap{position:absolute;top:0;left:0;transform-origin:top left;width:500px}.main-card{height:100%!important;box-sizing:border-box}.footer-row{margin-top:auto!important}</style></head><body><div class="scale-wrap" id="scaleWrap">${html}</div></body></html>`;

        const alignCardHeight = () => {
          try {
            const doc =
              iframe.contentDocument || iframe.contentWindow?.document;
            const wrap = doc?.getElementById("scaleWrap");
            if (!wrap) return;

            const cardWidth = 500;
            const slotWidth = slot.clientWidth || 300;
            const scale = slotWidth / cardWidth;

            wrap.style.transform = `scale(${scale})`;
            const rect = wrap.getBoundingClientRect();

            iframe.style.height = `${rect.height}px`;
            slot.style.minHeight = `${rect.height}px`;
            slot.style.height = `${rect.height}px`;
          } catch (e) {
            console.warn("Failed to scale iframe", e);
          }
        };

        iframe.addEventListener("load", alignCardHeight);
        window.addEventListener("resize", alignCardHeight);

        const delBtn = document.createElement("button");
        delBtn.className = "ca-card-delete-btn";
        delBtn.type = "button";
        delBtn.innerHTML = '<i class="bi bi-trash3-fill"></i>';
        delBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          if (!confirmDelete()) return;
          try {
            if (labelText === "partner") {
              await teamPartnerService.delete(item.id);
              partners = partners.filter((p) => p.id !== item.id);
            } else if (labelText === "customer") {
              await teamCustomerService.delete(item.id);
              customers = customers.filter((c) => c.id !== item.id);
            } else if (labelText === "investor") {
              await teamInvestorService.delete(item.id);
              investors = investors.filter((i) => i.id !== item.id);
            } else if (labelText === "subsidiary") {
              await teamSubsidiaryService.delete(item.id);
              subsidiaries = subsidiaries.filter((s) => s.id !== item.id);
            }
            window.removeEventListener("resize", alignCardHeight);
            await renderOrgSections();
          } catch (err) {
            toast.error(`Failed to delete ${labelText}.`);
            console.error(err);
          }
        });

        slot.appendChild(iframe);
        slot.appendChild(delBtn);
      } catch (err) {
        console.error("Failed to load organization card", err);
        slot.innerHTML = `<div style="padding: 24px; color: var(--ca-danger);">Failed to load card</div>`;
      }
    });
  }
}

async function renderParentCompany() {
  const container = $("#caParentCompanyContainer");
  if (!container) return;

  const parentId = myOrganization?.parent_organization_id;
  if (!parentId) {
    container.innerHTML = `
      <button class="ca-parent" type="button" data-open-modal="parent">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building2 h-8 w-8 text-primary-foreground/30"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path></svg>
        <span>Add your parent company if applicable</span>
      </button>
    `;
    return;
  }

  container.innerHTML = `
    <div class="ca-card-slot" id="slot-parent-company" data-org-id="${esc(parentId)}" style="min-height: 260px;">
      <div class="ca-photo-skeleton" style="height: 100%; border-radius: 14px;"></div>
    </div>
  `;

  const slot = container.querySelector(
    "#slot-parent-company",
  ) as HTMLElement | null;
  if (!slot) return;

  try {
    const html = await cardService.getOrganization(parentId);
    slot.innerHTML = "";

    const iframe = document.createElement("iframe");
    iframe.className = "org-card-frame";
    iframe.srcdoc = `<html><head><style>html,body{margin:0;padding:0;overflow:hidden;font-family:"Plus Jakarta Sans",system-ui,sans-serif}.scale-wrap{position:absolute;top:0;left:0;transform-origin:top left;width:500px}.main-card{height:100%!important;box-sizing:border-box}.footer-row{margin-top:auto!important}</style></head><body><div class="scale-wrap" id="scaleWrap">${html}</div></body></html>`;

    const alignCardHeight = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        const wrap = doc?.getElementById("scaleWrap");
        if (!wrap) return;

        const cardWidth = 500;
        const slotWidth = slot.clientWidth || 300;
        const scale = slotWidth / cardWidth;

        wrap.style.transform = `scale(${scale})`;
        const rect = wrap.getBoundingClientRect();

        iframe.style.height = `${rect.height}px`;
        slot.style.minHeight = `${rect.height}px`;
        slot.style.height = `${rect.height}px`;
      } catch (e) {
        console.warn("Failed to scale parent iframe", e);
      }
    };

    iframe.addEventListener("load", alignCardHeight);
    window.addEventListener("resize", alignCardHeight);

    const delBtn = document.createElement("button");
    delBtn.className = "ca-card-delete-btn";
    delBtn.type = "button";
    delBtn.innerHTML = '<i class="bi bi-trash3-fill"></i>';
    delBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!confirmDelete()) return;
      try {
        const myOrgId = getSession()?.companyId;
        if (myOrgId) {
          await organizationService.update(myOrgId, {
            parent_organization_id: null,
          });
          if (myOrganization) myOrganization.parent_organization_id = null;
          window.removeEventListener("resize", alignCardHeight);
          await renderParentCompany();
          toast.success("Parent company unlinked.");
        }
      } catch (err) {
        toast.error("Failed to remove parent company.");
        console.error(err);
      }
    });

    slot.appendChild(iframe);
    slot.appendChild(delBtn);
  } catch (err) {
    console.error("Failed to load parent organization card", err);
    slot.innerHTML = `<div style="padding: 24px; color: var(--ca-danger);">Failed to load card</div>`;
  }
}

async function renderPortfolio() {
  const el = $("#caPortfolio");
  if (!el) return;

  const activeSubs = teamSubjects.filter((ts) => ts.team_id === activeTeamId);

  if (activeSubs.length === 0) {
    el.className = "";
    el.innerHTML = "No products or services added yet.";
    return;
  }

  el.className = "ca-org-grid ca-carousel";
  el.innerHTML = "";

  activeSubs.forEach(async (ts) => {
    const slot = document.createElement("div");
    slot.className = "ca-card-slot";
    slot.style.minHeight = "260px";
    slot.innerHTML = `<div class="ca-photo-skeleton" style="height: 100%; border-radius: 14px;"></div>`;
    el.appendChild(slot);

    try {
      const html = await cardService.getSubject(ts.subject_id);
      slot.innerHTML = "";

      const iframe = document.createElement("iframe");
      iframe.className = "org-card-frame";
      iframe.srcdoc = `<html><head><style>html,body{margin:0;padding:0;overflow:hidden;font-family:"Plus Jakarta Sans",system-ui,sans-serif}.scale-wrap{position:absolute;top:0;left:0;transform-origin:top left;width:500px}.main-card{height:100%!important;box-sizing:border-box}.footer-row{margin-top:auto!important}</style></head><body><div class="scale-wrap" id="scaleWrap">${html}</div></body></html>`;

      const alignCardHeight = () => {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          const wrap = doc?.getElementById("scaleWrap");
          if (!wrap) return;

          const cardWidth = 500;
          const slotWidth = slot.clientWidth || 300;
          const scale = slotWidth / cardWidth;

          wrap.style.transform = `scale(${scale})`;
          const rect = wrap.getBoundingClientRect();

          iframe.style.height = `${rect.height}px`;
          slot.style.minHeight = `${rect.height}px`;
          slot.style.height = `${rect.height}px`;
        } catch (e) {
          console.warn("Failed to scale product iframe", e);
        }
      };

      iframe.addEventListener("load", alignCardHeight);
      window.addEventListener("resize", alignCardHeight);

      const delBtn = document.createElement("button");
      delBtn.className = "ca-card-delete-btn";
      delBtn.type = "button";
      delBtn.innerHTML = '<i class="bi bi-trash3-fill"></i>';
      delBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!confirmDelete()) return;
        try {
          await teamSubjectService.delete(ts.id);
          teamSubjects = teamSubjects.filter((s) => s.id !== ts.id);
          window.removeEventListener("resize", alignCardHeight);
          await renderPortfolio();
          render(); // Updates the chips too
        } catch (err) {
          toast.error("Failed to delete product.");
          console.error(err);
        }
      });

      slot.appendChild(iframe);
      slot.appendChild(delBtn);
    } catch (err) {
      console.error("Failed to load product card", err);
      slot.innerHTML = `<div style="padding: 24px; color: var(--ca-danger);">Failed to load card</div>`;
    }
  });
}

function render() {
  renderTabs();
  renderMembers();
  renderChips(
    "#caOffices",
    offices.map((o) => ({ id: o.id || o.city_id })),
  );
  const activeTeamSubs = teamSubjects.filter(
    (ts) => ts.team_id === activeTeamId,
  );
  const teamProds = activeTeamSubs.map((ts) => {
    const s = allSubjects.find((sub) => sub.id === ts.subject_id);
    return {
      id: ts.id,
      name: s ? s.name : "Product",
    };
  });
  renderChips("#caProducts", teamProds, "product");
  renderProfile();
  updateProfileButton();
  refreshEditUI();
  renderPortfolio();

  const logoBtn = $("#caCompanyLogoBtn");
  if (logoBtn) {
    const logoUrl = myOrganization?.logo_url || myOrganization?.avatar_url;
    if (logoUrl) {
      logoBtn.classList.add("has-image");
      logoBtn.innerHTML = `<img src="${esc(logoUrl)}" style="width: 100%; height: 100%; object-fit: cover;" />`;
    } else {
      logoBtn.classList.remove("has-image");
      logoBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="16 16 12 12 8 16" />
          <line x1="12" y1="12" x2="12" y2="21" />
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
        </svg><small>Upload Logo</small>
      `;
    }
  }

  const disabled = teams.length === 0;
  const buttonsToDisable = [
    $('[data-open-modal="member"]'),
    $('[data-open-modal="profile"]'),
    $('[data-open-modal="product"]'),
    $('[data-open-modal="brand"]'),
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

// ─── Modal helpers ────────────────────────────────────────────────────────────
function fillTeamSelect(select: HTMLSelectElement) {
  select.innerHTML = teams.length
    ? teams
        .map(
          (t) =>
            `<option value="${esc(t.id)}" ${t.id === activeTeamId ? "selected" : ""}>${esc(t.name)}</option>`,
        )
        .join("")
    : '<option value="">Create a team first</option>';
}

function hydrateEditModal(name: string, payload: Record<string, string> = {}) {
  if (!content) return;
  if (name === "edit-team") {
    const team = teams.find((t) => t.id === payload.teamId);
    if (!team) return;
    const idField = content.querySelector<HTMLInputElement>(
      '[data-field="teamId"]',
    );
    const nameField = content.querySelector<HTMLInputElement>(
      '[data-field="teamName"]',
    );
    if (idField) idField.value = team.id;
    if (nameField) nameField.value = team.name;
    const citySelect = content.querySelector<HTMLSelectElement>(
      'select[data-field="city"]',
    );
    if (citySelect && team.city_id) {
      citySelect.value = team.city_id;
    }
  }
  if (name === "edit-member") {
    const member = members.find((m) => m.id === payload.memberId);
    if (!member) return;
    const idField = content.querySelector<HTMLInputElement>(
      '[data-field="memberId"]',
    );
    const nameField = content.querySelector<HTMLInputElement>(
      '[data-field="memberName"]',
    );
    if (idField) idField.value = member.id;
    if (nameField) nameField.value = member.fullname;

    const jobWrap = content.querySelector('[data-field="job"]');
    if (jobWrap) {
      const job = jobs.find((j) => j.id === member.job_id);
      if (job) {
        const triggerVal = jobWrap.querySelector(".ca-cselect-val");
        if (triggerVal) {
          triggerVal.textContent = job.title;
          triggerVal.classList.remove("is-placeholder");
        }
        const hiddenIn = jobWrap.querySelector(
          "[data-cselect-value]",
        ) as HTMLInputElement | null;
        if (hiddenIn) hiddenIn.value = job.id;
      }
    }

    const previewImg = content.querySelector<HTMLImageElement>(
      '[data-field="previewImg"]',
    );
    if (previewImg) {
      previewImg.src = member.profile_image || DEFAULT_AVATAR;
    }
  }
  if (name === "edit-office") {
    const office = offices.find((o) => o.id === payload.officeId);
    if (!office) return;
    const idField = content.querySelector<HTMLInputElement>(
      '[data-field="officeId"]',
    );
    if (idField) idField.value = office.id;
  }
  if (name === "logo") {
    const previewImg = content.querySelector<HTMLImageElement>(
      '[data-field="previewImg"]',
    );
    const previewArea = content.querySelector<HTMLElement>(
      '[data-field="previewArea"]',
    );
    const uploadBtn = content.querySelector<HTMLElement>(
      '[data-field="uploadButton"]',
    );
    const logoUrl = myOrganization?.logo_url || myOrganization?.avatar_url;
    if (logoUrl && previewImg && previewArea && uploadBtn) {
      previewImg.src = logoUrl;
      previewArea.style.display = "flex";
      uploadBtn.style.display = "none";
    }
  }
}

function fillCitySelect(container: HTMLElement) {
  const isSelectElement = container instanceof HTMLSelectElement;

  if (isSelectElement) {
    const officeCitiesMap = new Map<string, CityListItem>();
    offices.forEach((o) => {
      const cityObj = cities.find((c) => c.id === o.city_id);
      if (cityObj) {
        officeCitiesMap.set(cityObj.id, cityObj);
      }
    });
    const officeCities = Array.from(officeCitiesMap.values());

    container.innerHTML =
      `<option value="" disabled selected>Select city</option>` +
      officeCities
        .map(
          (c: CityListItem) =>
            `<option value="${esc(c.id)}">${esc(`${c.name}, ${c.country_name}`)}</option>`,
        )
        .join("");
  } else {
    container.innerHTML = cities.length
      ? cities
          .map(
            (c: CityListItem) =>
              `<div class="ca-cselect-opt" data-value="${esc(c.id)}" role="option">${esc(`${c.name}, ${c.country_name}`)}</div>`,
          )
          .join("")
      : '<div class="ca-cselect-opt is-disabled">No cities available</div>';
  }
}

function fillJobSelect(container: HTMLElement) {
  container.innerHTML = jobs.length
    ? jobs
        .map(
          (j: Job) =>
            `<div class="ca-cselect-opt" data-value="${esc(j.id)}" role="option">${esc(j.title)}</div>`,
        )
        .join("")
    : '<div class="ca-cselect-opt is-disabled">No jobs available</div>';
}

async function open(name: string, payload: Record<string, string> = {}) {
  const templateName = name === "edit-team" ? "team" : name;
  if (templateName === "team") {
    if (offices.length === 0) {
      toast.error(
        "Veuillez d'abord ajouter un bureau (office) dans la section correspondante.",
      );
      return;
    }
  }
  const template = document.getElementById(
    "modal-" + templateName,
  ) as HTMLTemplateElement | null;
  if (!template || !overlay || !content) return;
  content.innerHTML = "";
  content.appendChild(template.content.cloneNode(true));
  modal?.classList.toggle("large", name === "profile");
  content
    .querySelectorAll<HTMLSelectElement>('[data-field="teamId"]')
    .forEach(fillTeamSelect);

  const cityContainer = content.querySelector<HTMLElement>(
    '[data-field="city"] .ca-cselect-opts-container, [data-field="office-city"] .ca-cselect-opts-container, select[data-field="city"]',
  );
  if (cityContainer) {
    fillCitySelect(cityContainer);
    const searchInput =
      content.querySelector<HTMLInputElement>("[data-city-search]");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        const term = searchInput.value.toLowerCase().trim();
        const opts =
          cityContainer.querySelectorAll<HTMLElement>(".ca-cselect-opt");
        opts.forEach((opt) => {
          const text = opt.textContent?.toLowerCase() || "";
          opt.style.display = text.includes(term) ? "" : "none";
        });
      });
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === " ") e.stopPropagation();
      });
    }
  }

  const jobContainer = content.querySelector<HTMLElement>(
    '[data-field="job"] .ca-cselect-opts-container',
  );
  if (jobContainer) {
    fillJobSelect(jobContainer);
    const searchInput =
      content.querySelector<HTMLInputElement>("[data-job-search]");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        const term = searchInput.value.toLowerCase().trim();
        const opts =
          jobContainer.querySelectorAll<HTMLElement>(".ca-cselect-opt");
        opts.forEach((opt) => {
          const text = opt.textContent?.toLowerCase() || "";
          opt.style.display = text.includes(term) ? "" : "none";
        });
      });
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === " ") e.stopPropagation();
      });
    }
  }
  const uploadBtn = content?.querySelector<HTMLElement>(
    '[data-field="uploadButton"]',
  );
  const previewArea = content?.querySelector<HTMLElement>(
    '[data-field="previewArea"]',
  );
  const previewImg = content?.querySelector<HTMLImageElement>(
    '[data-field="previewImg"]',
  );
  const memberFileIn = content?.querySelector<HTMLInputElement>(
    '[data-field="memberAvatar"]',
  );

  const changeImgBtn = content?.querySelector<HTMLElement>(
    '[data-action="changeImage"]',
  );

  const removeImgBtn = content?.querySelector<HTMLElement>(
    '[data-action="removeImage"]',
  );

  if (memberFileIn && changeImgBtn) {
    changeImgBtn.addEventListener("click", () => memberFileIn.click());
    memberFileIn.addEventListener("change", () => {
      const file = memberFileIn.files?.[0];

      if (!file) return;

      const previewImg = content.querySelector<HTMLImageElement>(
        '[data-field="previewImg"]',
      );

      if (previewImg) {
        previewImg.src = URL.createObjectURL(file);
      }
    });
  } else if (changeImgBtn || removeImgBtn) {
    const resetImageSelection = () => {
      selectedUserProfile = null;
      const resultsContainer =
        content.querySelector<HTMLElement>(".ca-member-results");
      resultsContainer
        ?.querySelectorAll(".ca-member-result-item")
        .forEach((el) => {
          el.classList.remove("is-selected");
        });
      if (uploadBtn && previewArea) {
        uploadBtn.style.display = "";
        previewArea.style.display = "none";
      }
    };
    changeImgBtn?.addEventListener("click", resetImageSelection);
    removeImgBtn?.addEventListener("click", resetImageSelection);
  }

  if (name === "edit-team" || (name === "team" && payload.teamId)) {
    const teamId = payload.teamId || activeTeamId || "";
    const team = teams.find((t) => t.id === teamId);
    if (team) {
      const idField = content.querySelector<HTMLInputElement>(
        '[data-field="teamId"]',
      );
      if (idField) idField.value = team.id;

      const titleEl = content.querySelector<HTMLElement>("#modalTeamTitle");
      if (titleEl) titleEl.textContent = "Edit Team";

      const leadEl = content.querySelector<HTMLElement>("#modalTeamLead");
      if (leadEl) leadEl.textContent = "Update or remove this team.";

      const saveBtn = content.querySelector<HTMLButtonElement>(
        "[data-save-team-btn]",
      );
      if (saveBtn) saveBtn.textContent = "Update Team";

      const deleteBtn =
        content.querySelector<HTMLElement>("[data-delete-team]");
      if (deleteBtn) deleteBtn.style.display = "";

      const nameField = content.querySelector<HTMLInputElement>(
        '[data-field="teamName"]',
      );
      if (nameField) nameField.value = team.name;

      const typeWrap = content.querySelector('[data-field="teamType"]');
      if (typeWrap) {
        const triggerVal = typeWrap.querySelector(".ca-cselect-val");
        if (triggerVal) {
          triggerVal.textContent = team.type;
          triggerVal.classList.remove("is-placeholder");
        }
        const hiddenIn = typeWrap.querySelector(
          "[data-cselect-value]",
        ) as HTMLInputElement | null;
        if (hiddenIn) hiddenIn.value = team.type;
      }

      const visibilitySelect = content.querySelector<HTMLSelectElement>(
        '[data-field="visibility"]',
      );
      if (visibilitySelect)
        visibilitySelect.value = team.visibility || "PUBLIC";

      const cityWrap = content.querySelector('[data-field="city"]');
      if (cityWrap) {
        const city = cities.find((c) => c.id === team.city_id);
        if (city) {
          const triggerVal = cityWrap.querySelector(".ca-cselect-val");
          if (triggerVal) {
            triggerVal.textContent = `${city.name}, ${city.country_name}`;
            triggerVal.classList.remove("is-placeholder");
          }
          const hiddenIn = cityWrap.querySelector(
            "[data-cselect-value]",
          ) as HTMLInputElement | null;
          if (hiddenIn) hiddenIn.value = city.id;
        }
      }

      const productSelect = content.querySelector<HTMLSelectElement>(
        '[data-field="product"]',
      );
      if (productSelect) productSelect.value = team.product_service || "None";
    }
  } else {
    hydrateEditModal(name, payload);
  }

  if (name === "member") {
    selectedUserProfile = null;
    const toggleExisting = content.querySelector(
      '[data-member-mode="existing"]',
    );
    const toggleNew = content.querySelector('[data-member-mode="new"]');
    const panelExisting = content.querySelectorAll(
      '[data-member-panel="existing"]',
    );
    const panelNew = content.querySelectorAll('[data-member-panel="new"]');

    const switchMode = (mode: "existing" | "new") => {
      toggleExisting?.classList.toggle("is-active", mode === "existing");
      toggleNew?.classList.toggle("is-active", mode === "new");
      panelExisting.forEach(
        (el) =>
          ((el as HTMLElement).style.display =
            mode === "existing" ? "" : "none"),
      );
      panelNew.forEach(
        (el) =>
          ((el as HTMLElement).style.display = mode === "new" ? "" : "none"),
      );
    };

    toggleExisting?.addEventListener("click", () => switchMode("existing"));
    toggleNew?.addEventListener("click", () => switchMode("new"));

    const teamSelect = content.querySelector<HTMLSelectElement>(
      '[data-field="teamId"]',
    );
    if (teamSelect && activeTeamId) {
      teamSelect.value = activeTeamId;
    }

    const updateCountLabel = () => {
      const tid = teamSelect?.value || "";
      const count = members.filter((m) => m.team_id === tid).length;
      const countLabel = content.querySelector("[data-member-count]");
      if (countLabel) countLabel.textContent = `${count}/12 members`;
    };
    updateCountLabel();
    teamSelect?.addEventListener("change", updateCountLabel);

    const resultsContainer =
      content.querySelector<HTMLElement>(".ca-member-results");
    const emptyLabel = content.querySelector<HTMLElement>(".ca-search-empty");
    const searchInput = content.querySelector<HTMLInputElement>(
      '[data-field="memberSearch"]',
    );

    if (resultsContainer && searchInput) {
      try {
        const profiles = await userProfileService.getAll({
          excludeOrganizations: true,
        });
        const renderResults = (term: string) => {
          resultsContainer.innerHTML = "";
          const filtered = term
            ? profiles.filter((p) => {
                const fullName =
                  `${p.first_name || ""} ${p.last_name || ""}`.toLowerCase();
                return fullName.includes(term);
              })
            : [];

          if (emptyLabel) {
            emptyLabel.style.display = filtered.length === 0 ? "" : "none";
          }

          filtered.forEach((p) => {
            const item = document.createElement("div");
            item.className = "ca-member-result-item";
            if (selectedUserProfile?.id === p.id) {
              item.classList.add("is-selected");
            }
            item.style.cssText =
              "display: flex; align-items: center; gap: 10px; padding: 8px; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: background 0.1s; margin-bottom: 6px;";

            const avatarUrl = p.avatar_url || DEFAULT_AVATAR;
            item.innerHTML = `
              <img src="${avatarUrl}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />
              <div style="display: flex; flex-direction: column;">
                <strong style="font-size: 13px; color: var(--ca-text);">${esc(p.first_name)} ${esc(p.last_name)}</strong>
                <small style="font-size: 11px; color: var(--ca-muted);">${esc(p.role || "Job Seeker")}</small>
              </div>
            `;

            item.onclick = () => {
              selectedUserProfile = p;
              resultsContainer
                .querySelectorAll(".ca-member-result-item")
                .forEach((el) => {
                  el.classList.remove("is-selected");
                });
              item.classList.add("is-selected");
              const nameField = content?.querySelector<HTMLInputElement>(
                '[data-field="memberName"]',
              );
              const fullNameStr =
                `${p.first_name || ""} ${p.last_name || ""}`.trim();
              if (nameField) {
                nameField.value = fullNameStr;
              }
              if (p.role) {
                const matchedJob = jobs.find(
                  (j) =>
                    j.title.toLowerCase().trim() ===
                    p.role!.toLowerCase().trim(),
                );
                if (matchedJob) {
                  const jobWrap = content?.querySelector('[data-field="job"]');
                  if (jobWrap) {
                    const triggerVal = jobWrap.querySelector(".ca-cselect-val");
                    if (triggerVal) {
                      triggerVal.textContent = matchedJob.title;
                      triggerVal.classList.remove("is-placeholder");
                    }
                    const hiddenIn = jobWrap.querySelector(
                      "[data-cselect-value]",
                    ) as HTMLInputElement | null;
                    if (hiddenIn) hiddenIn.value = matchedJob.id;
                  }
                }
              }
              if (uploadBtn && previewArea && previewImg) {
                uploadBtn.style.display = "none";
                previewArea.style.display = "flex";
                previewImg.src = p.avatar_url || DEFAULT_AVATAR;
              }
            };

            resultsContainer.appendChild(item);
          });
        };

        renderResults("");
        searchInput.addEventListener("input", () => {
          renderResults(searchInput.value.toLowerCase().trim());
        });
      } catch (err) {
        console.error("Failed to load user profiles", err);
      }
    }
  }

  if (name === "profile") {
    hydrateProfileModal();
    const teamSelect = content.querySelector<HTMLSelectElement>(
      '[data-field="teamId"]',
    );
    teamSelect?.addEventListener("change", () =>
      hydrateProfileModal(teamSelect.value),
    );
  }

  const orgSearchInput = content.querySelector<HTMLInputElement>(
    '[data-field="orgSearchInput"]',
  );
  const orgSearchResults = content.querySelector<HTMLElement>(
    '[data-field="orgSearchResults"]',
  );
  const selectedOrgIdHidden = content.querySelector<HTMLInputElement>(
    '[data-field="selectedOrgId"]',
  );
  const addButton =
    content.querySelector<HTMLButtonElement>("[data-add-item]") ||
    content.querySelector<HTMLButtonElement>("[data-add-parent]");

  if (orgSearchInput && orgSearchResults) {
    orgSearchInput.addEventListener("input", async () => {
      const query = orgSearchInput.value.trim();
      if (query.length < 2) {
        orgSearchResults.innerHTML = "";
        orgSearchResults.style.display = "none";
        if (addButton) addButton.disabled = true;
        if (selectedOrgIdHidden) selectedOrgIdHidden.value = "";
        return;
      }

      try {
        orgSearchResults.innerHTML =
          '<li style="padding: 8px 12px; color: #94a3b8; font-size: 12px;">Searching...</li>';
        orgSearchResults.style.display = "block";

        const orgs = await organizationService.getAll({ name: query });
        orgSearchResults.innerHTML = "";

        if (!orgs || orgs.length === 0) {
          orgSearchResults.innerHTML =
            '<li style="padding: 8px 12px; color: #94a3b8; font-size: 12px;">No results found</li>';
          return;
        }

        orgs.forEach((org: any) => {
          const li = document.createElement("li");
          li.className = "ca-cselect-opt";
          li.style.paddingLeft = "12px";
          li.textContent = org.name;
          li.addEventListener("click", () => {
            orgSearchInput.value = org.name;
            if (selectedOrgIdHidden) selectedOrgIdHidden.value = org.id;
            if (addButton) addButton.disabled = false;
            orgSearchResults.style.display = "none";
          });
          orgSearchResults.appendChild(li);
        });
      } catch (err) {
        console.error(err);
        orgSearchResults.innerHTML =
          '<li style="padding: 8px 12px; color: #ef4444; font-size: 12px;">Error loading organizations</li>';
      }
    });

    orgSearchInput.addEventListener("keydown", (e) => {
      if (e.key === " ") e.stopPropagation();
    });
  }

  const prodSearchInput = content.querySelector<HTMLInputElement>(
    '[data-field="prodSearchInput"]',
  );
  const prodSearchResults = content.querySelector<HTMLElement>(
    '[data-field="prodSearchResults"]',
  );
  const selectedProdIdHidden = content.querySelector<HTMLInputElement>(
    '[data-field="selectedProdId"]',
  );
  const addProdButton = content.querySelector<HTMLButtonElement>(
    "[data-add-product-portfolio]",
  );

  if (prodSearchInput && prodSearchResults) {
    prodSearchInput.addEventListener("input", async () => {
      const query = prodSearchInput.value.trim();
      if (query.length < 5) {
        prodSearchResults.innerHTML = "";
        prodSearchResults.style.display = "none";
        if (addProdButton) addProdButton.disabled = true;
        if (selectedProdIdHidden) selectedProdIdHidden.value = "";
        return;
      }

      try {
        prodSearchResults.innerHTML =
          '<li style="padding: 8px 12px; color: #94a3b8; font-size: 12px;">Searching...</li>';
        prodSearchResults.style.display = "block";

        const prods = await subjectService.getAll({ name: query });
        prodSearchResults.innerHTML = "";

        if (!prods || prods.length === 0) {
          prodSearchResults.innerHTML =
            '<li style="padding: 8px 12px; color: #94a3b8; font-size: 12px;">No results found</li>';
          return;
        }

        prods.forEach((prod: any) => {
          const li = document.createElement("li");
          li.className = "ca-cselect-opt";
          li.style.paddingLeft = "12px";
          li.textContent = prod.name;
          li.addEventListener("click", () => {
            prodSearchInput.value = prod.name;
            if (selectedProdIdHidden) selectedProdIdHidden.value = prod.id;
            if (addProdButton) addProdButton.disabled = false;
            prodSearchResults.style.display = "none";
          });
          prodSearchResults.appendChild(li);
        });
      } catch (err) {
        console.error(err);
        prodSearchResults.innerHTML =
          '<li style="padding: 8px 12px; color: #ef4444; font-size: 12px;">Error loading products</li>';
      }
    });

    prodSearchInput.addEventListener("keydown", (e) => {
      if (e.key === " ") e.stopPropagation();
    });
  }

  overlay.classList.add("open");
  document.body.classList.add("modal-open");
  bindModal();
}

function closeModal() {
  overlay?.classList.remove("open");
  document.body.classList.remove("modal-open");
}

// ─── Modal bindings ───────────────────────────────────────────────────────────
function bindModal() {
  content?.querySelectorAll("[data-close-modal]").forEach((btn) => {
    (btn as HTMLElement).onclick = closeModal;
  });

  const teamNameInput = content?.querySelector<HTMLInputElement>(
    '[data-field="teamName"]',
  );
  const counter = content?.querySelector(".ca-counter");
  teamNameInput?.addEventListener("input", () => {
    if (counter) counter.textContent = `${teamNameInput.value.length}/35`;
  });

  // ── Save Team (Create or Update) ──
  content
    ?.querySelector("[data-save-team-btn]")
    ?.addEventListener("click", async () => {
      const teamId =
        content!.querySelector<HTMLInputElement>('[data-field="teamId"]')
          ?.value || "";
      const name =
        content!
          .querySelector<HTMLInputElement>('[data-field="teamName"]')
          ?.value.trim() || "";
      if (!name) {
        toast.warning("Please enter a team name.");
        return;
      }

      const type =
        content!
          .querySelector<HTMLInputElement>(
            '[data-field="teamType"] [data-cselect-value]',
          )
          ?.value.trim() || "";
      if (!type) {
        toast.warning("Please select a team type.");
        return;
      }

      const visibility = (content!.querySelector<HTMLSelectElement>(
        '[data-field="visibility"]',
      )?.value || "PUBLIC") as "PUBLIC" | "PRIVATE" | "LIMITED";

      const citySelect = content!.querySelector<HTMLSelectElement>(
        'select[data-field="city"]',
      );
      const city_id = citySelect ? citySelect.value : "";
      if (!city_id) {
        toast.warning("Please select a city.");
        return;
      }

      const product_service =
        content!.querySelector<HTMLSelectElement>('[data-field="product"]')
          ?.value || "";

      const saveBtn = content?.querySelector<HTMLButtonElement>(
        "[data-save-team-btn]",
      );
      if (saveBtn) {
        await withLoading(saveBtn, async () => {
          try {
            if (teamId) {
              const updated = await teamService.update(teamId, {
                name,
                type,
                visibility,
                city_id,
                product_service:
                  product_service === "None" ? null : product_service,
              });
              const idx = teams.findIndex((t) => t.id === teamId);
              if (idx !== -1) {
                teams[idx] = updated;
              }
              activeTeamId = teamId;
              render();
              closeModal();
              toast.success(`"${name}" has been updated.`);
            } else {
              const created = await teamService.create({
                name,
                type,
                visibility,
                city_id,
                product_service:
                  product_service === "None" ? null : product_service,
              });
              teams.push({
                id: created.id,
                name: created.name,
                type: created.type,
                city_id: created.city_id,
                visibility: created.visibility || "PUBLIC",
              });
              activeTeamId = created.id;
              render();
              closeModal();
              toast.success(`"${name}" has been added successfully.`);
            }
          } catch (err) {
            toast.error("Failed to save the team.");
            console.error(err);
          }
        });
      }
    });

  // ── Add Member ──
  content
    ?.querySelector("[data-add-member]")
    ?.addEventListener("click", async () => {
      const team_id =
        content!.querySelector<HTMLSelectElement>('[data-field="teamId"]')
          ?.value ||
        activeTeamId ||
        "";

      const toggleExisting = content!.querySelector(
        '[data-member-mode="existing"]',
      );

      let fullname: string;
      let profile_image: string = DEFAULT_AVATAR;

      // Is an existing user
      if (toggleExisting?.classList.contains("is-active")) {
        if (!selectedUserProfile) {
          toast.warning("Please select an existing user profile.");
          return;
        }
        fullname =
          `${selectedUserProfile.first_name || ""} ${selectedUserProfile.last_name || ""}`.trim();
        profile_image = selectedUserProfile.avatar_url || DEFAULT_AVATAR;

        // Create a new user
      } else {
        fullname =
          content!
            .querySelector<HTMLInputElement>('[data-field="memberName"]')
            ?.value.trim() || "";
        if (!fullname) {
          toast.warning("Please enter a member name.");
          return;
        }
      }

      // Upload de l'avatar vers le bucket Supabase
      const avatarInput = content!.querySelector<HTMLInputElement>(
        '[data-field="memberAvatar"]',
      );
      const file = avatarInput?.files?.[0];

      if (file) {
        const fileExt = file.name.split(".").pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          toast.error("Failed to upload avatar image.");
          console.error("Upload error:", uploadError);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(uploadData.path);

        profile_image = urlData.publicUrl;
      }

      const job_id =
        content!.querySelector<HTMLInputElement>(
          '[data-field="job"] [data-cselect-value]',
        )?.value || "";

      if (!job_id) {
        toast.error("Please select a job.");
        return;
      }

      const addMemberBtn =
        content?.querySelector<HTMLButtonElement>("[data-add-member]");
      if (addMemberBtn) {
        await withLoading(addMemberBtn, async () => {
          try {
            const created = await teamMemberService.create({
              fullname,
              team_id: team_id,
              job_id,
              profile_image,
              is_leader: false,
            });
            members.push(created);
            activeTeamId = team_id || activeTeamId;
            render();
            closeModal();
            toast.success(`"${fullname}" has been added successfully.`);
          } catch (err) {
            console.error("CREATE TEAM MEMBER ERROR:", err);
          }
        });
      }
    });

  // ── Update Member ──
  content
    ?.querySelector("[data-update-member]")
    ?.addEventListener("click", async () => {
      const memberId =
        content!.querySelector<HTMLInputElement>('[data-field="memberId"]')
          ?.value || "";

      const member = members.find((m) => m.id === memberId);
      if (!member) return;

      const fullname =
        content!
          .querySelector<HTMLInputElement>('[data-field="memberName"]')
          ?.value.trim() || member.fullname;

      const job_id =
        content!.querySelector<HTMLInputElement>(
          '[data-field="job"] [data-cselect-value]',
        )?.value || member.job_id;

      // ── Avatar ────────────────────────────────────────────────
      let profile_image = member.profile_image;

      const avatarInput = content!.querySelector<HTMLInputElement>(
        '[data-field="memberAvatar"]',
      );

      const file = avatarInput?.files?.[0];

      if (file) {
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          toast.error("Failed to upload avatar image.");
          console.error("Upload error:", uploadError);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(uploadData.path);

        profile_image = urlData.publicUrl;
      }

      const updateMemberBtn = content?.querySelector<HTMLButtonElement>(
        "[data-update-member]",
      );
      if (updateMemberBtn) {
        await withLoading(updateMemberBtn, async () => {
          try {
            const updated = await teamMemberService.update(memberId, {
              fullname,
              team_id: member.team_id || undefined,
              job_id,
              profile_image,
            });

            const idx = members.findIndex((m) => m.id === memberId);

            if (idx !== -1) {
              members[idx] = updated;
            }

            render();
            closeModal();

            toast.success(`"${fullname}" has been updated successfully.`);
          } catch (err) {
            toast.error("Failed to update the member.");
            console.error(err);
          }
        });
      }
    });

  // ── Save Team Profile ──
  content
    ?.querySelector("[data-save-profile]")
    ?.addEventListener("click", async () => {
      if (!teams.length) {
        toast.error("You need a team before adding a profile.");
        return;
      }
      const team_id =
        content!.querySelector<HTMLSelectElement>('[data-field="teamId"]')
          ?.value ||
        activeTeamId ||
        "";
      const field = (name: string) =>
        content!.querySelector<HTMLTextAreaElement>(`[data-field="${name}"]`)
          ?.value || "";

      const profilePayload = {
        team_id,
        who_we_are: field("who_we_are"),
        what_were_great_at: field("what_were_great_at"),
        team_culture: field("team_culture"),
        how_we_work_together: field("how_we_work_together"),
        this_team_is_not_for_you_if: field("this_team_is_not_for_you_if"),
        how_were_led: field("how_were_led"),
        what_were_solving_now: field("what_were_solving_now"),
        typical_day: field("typical_day"),
        what_we_value: field("what_we_value"),
        growth_here: field("growth_here"),
      };
      const saveProfileBtn = content?.querySelector<HTMLButtonElement>(
        "[data-save-profile]",
      );
      if (saveProfileBtn) {
        await withLoading(saveProfileBtn, async () => {
          try {
            const existing = teamProfiles[team_id];
            if (existing?.id) {
              await teamProfileService.update(existing.id, profilePayload);
            } else {
              const created = await teamProfileService.create(profilePayload);
              (profilePayload as any).id = created.id;
            }
            teamProfiles[team_id] = {
              id: (profilePayload as any).id || teamProfiles[team_id]?.id,
              team_id: team_id,
              who_we_are: field("who_we_are"),
              what_were_great_at: field("what_were_great_at"),
              team_culture: field("team_culture"),
              how_we_work_together: field("how_we_work_together"),
              this_team_is_not_for_you_if: field("this_team_is_not_for_you_if"),
              how_were_led: field("how_were_led"),
              what_were_solving_now: field("what_were_solving_now"),
              typical_day: field("typical_day"),
              what_we_value: field("what_we_value"),
              growth_here: field("growth_here"),
            };
            activeTeamId = team_id;
            render();
            closeModal();
            toast.success("The team profile has been updated.");
          } catch (err) {
            toast.error("Failed to save the profile.");
            console.error(err);
          }
        });
      }
    });

  // ── Add Office/City ──
  content
    ?.querySelectorAll<HTMLButtonElement>("[data-add-item]")
    .forEach((btn) => {
      btn.onclick = async () => {
        const key = btn.dataset.addItem!;
        if (key === "offices") {
          const city_id =
            content!.querySelector<HTMLInputElement>(
              '[data-field="office-city"] [data-cselect-value]',
            )?.value || "";
          const officeType = "MAIN";
          try {
            const office: PostOrganizationOffice = {
              organization_id: myOrganization.id,
              city_id,
              type: officeType,
            };
            const created = await teamOfficeService.create(office);
            offices.push(created);
            renderChips(
              "#caOffices",
              offices.map((o) => ({ id: o.id || o.city_id })),
            );
            closeModal();
            toast.success(`An office has been added.`);
          } catch (err) {
            toast.error("Failed to add the office.");
            console.error(err);
          }
        } else if (
          key === "partners" ||
          key === "customers" ||
          key === "investors" ||
          key === "subsidiaries"
        ) {
          const organization_id =
            content!.querySelector<HTMLInputElement>(
              '[data-field="selectedOrgId"]',
            )?.value || "";
          if (!organization_id) {
            toast.warning("Please select an organization first.");
            return;
          }

          const displayName =
            content!
              .querySelector<HTMLInputElement>('[data-field="orgSearchInput"]')
              ?.value.trim() || key;
          const team_id = activeTeamId || undefined;
          const addBtn = btn;
          await withLoading(addBtn, async () => {
            try {
              if (key === "partners") {
                const created = await teamPartnerService.create({
                  organization_id: myOrganization.id,
                  partner_id: organization_id,
                });
                partners.push(created);
              } else if (key === "customers") {
                const created = await teamCustomerService.create({
                  organization_id: myOrganization.id,
                  customer_id: organization_id,
                });
                customers.push(created);
              } else if (key === "investors") {
                const created = await teamInvestorService.create({
                  organization_id: myOrganization.id,
                  investor_id: organization_id,
                });
                investors.push(created);
              } else {
                const created = await teamSubsidiaryService.create({
                  organization_id: myOrganization.id,
                  subsidiary_id: organization_id,
                });
                subsidiaries.push(created);
              }
              renderStatus();
              closeModal();
              toast.success(`"${displayName}" has been added.`);
            } catch (err) {
              toast.error("Failed to add the item.");
              console.error(err);
            }
          });
        }
      };
    });

  // ── Add Photo ──
  content
    ?.querySelector("[data-add-photo]")
    ?.addEventListener("click", async () => {
      if (photos.length >= 10) {
        toast.warning("You have reached the 10-photo limit.");
        return;
      }
      const fileInput = content!.querySelector<HTMLInputElement>(
        '[data-field="teamPhotoFile"]',
      );
      const file = fileInput?.files?.[0];
      if (!file) {
        toast.warning("Please select a photo to upload.");
        return;
      }

      const addPhotoBtn =
        content?.querySelector<HTMLButtonElement>("[data-add-photo]");
      if (addPhotoBtn) {
        await withLoading(addPhotoBtn, async () => {
          try {
            const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
            const filePath = `${crypto.randomUUID()}.${fileExt}`;

            const { data: uploadData, error: uploadError } =
              await supabase.storage.from("avatars").upload(filePath, file, {
                cacheControl: "3600",
                upsert: false,
              });

            if (uploadError) {
              toast.error("Failed to upload photo.");
              console.error("Upload error:", uploadError);
              return;
            }

            const { data: urlData } = supabase.storage
              .from("avatars")
              .getPublicUrl(uploadData.path);

            const url = urlData.publicUrl;
            const name = `Photo ${photos.length + 1}`;

            const created = await teamPhotoService.create({
              url,
              name,
              organization_id: myOrganization.id,
            });
            photos.push(created);
            renderStatus();
            closeModal();
            toast.success("The photo has been added successfully.");
          } catch (err) {
            toast.error("Failed to add the photo.");
            console.error(err);
          }
        });
      }
    });

  // ── Add Parent ──
  content
    ?.querySelector("[data-add-parent]")
    ?.addEventListener("click", async () => {
      const parentId =
        content!.querySelector<HTMLInputElement>('[data-field="selectedOrgId"]')
          ?.value || "";
      if (!parentId) {
        toast.warning("Please select a parent company first.");
        return;
      }
      const myOrgId = getSession()?.companyId;
      if (!myOrgId) {
        toast.error("Unable to identify your company.");
        return;
      }
      const addParentBtn =
        content?.querySelector<HTMLButtonElement>("[data-add-parent]");
      if (addParentBtn) {
        await withLoading(addParentBtn, async () => {
          try {
            const updated = await organizationService.update(myOrgId, {
              parent_organization_id: parentId,
            });
            myOrganization = updated;
            await renderParentCompany();
            closeModal();
            toast.success("Parent company connected successfully.");
          } catch (err) {
            toast.error("Failed to connect parent company.");
            console.error(err);
          }
        });
      }
    });

  // ── Add Office/City (Add City modal) ──
  content
    ?.querySelector("[data-add-office]")
    ?.addEventListener("click", async () => {
      const city_id =
        content!.querySelector<HTMLInputElement>(
          '[data-field="office-city"] [data-cselect-value]',
        )?.value || "";
      const type =
        content!.querySelector<HTMLSelectElement>('[data-field="officeType"]')
          ?.value || "";

      if (!city_id) {
        toast.warning("Please select a city first.");
        return;
      }
      if (!type) {
        toast.warning("Please select a type of office.");
        return;
      }

      const addOfficeBtn =
        content?.querySelector<HTMLButtonElement>("[data-add-office]");
      if (addOfficeBtn) {
        await withLoading(addOfficeBtn, async () => {
          try {
            const office: PostOrganizationOffice = {
              city_id,
              organization_id: myOrganization.id,
              type,
            };
            const created = await teamOfficeService.create(office);
            offices.push(created);
            renderChips(
              "#caOffices",
              offices.map((o) => ({ id: o.id || o.city_id })),
            );
            closeModal();

            const cityObj = cities.find((c) => c.id === city_id);
            const cityName = cityObj
              ? `${cityObj.name}, ${cityObj.country_name}`
              : "Office";
            toast.success(`"${cityName}" has been added.`);
          } catch (err) {
            toast.error("Failed to add the office.");
            console.error(err);
          }
        });
      }
    });
  // ── Add Product/Service to Portfolio ──
  content
    ?.querySelector("[data-add-product-portfolio]")
    ?.addEventListener("click", async () => {
      const subject_id =
        content!.querySelector<HTMLInputElement>(
          '[data-field="selectedProdId"]',
        )?.value || "";
      const status =
        content!.querySelector<HTMLSelectElement>('[data-field="prodStatus"]')
          ?.value || "";

      if (!activeTeamId) {
        toast.error("Unable to identify your team.");
        return;
      }

      if (!subject_id) {
        toast.warning("Please select a product or service first.");
        return;
      }
      if (!status) {
        toast.warning("Please select a status.");
        return;
      }

      const team_id = activeTeamId;

      const addProdBtn = content?.querySelector<HTMLButtonElement>(
        "[data-add-product-portfolio]",
      );
      if (addProdBtn) {
        await withLoading(addProdBtn, async () => {
          try {
            const created = await teamSubjectService.create({
              team_id,
              subject_id,
              status: status as any,
            });
            teamSubjects.push(created);
            render();
            closeModal();

            const prodName =
              content!.querySelector<HTMLInputElement>(
                '[data-field="prodSearchInput"]',
              )?.value || "Product/Service";
            toast.success(`"${prodName}" has been added.`);
          } catch (err) {
            toast.error("Failed to add the product/service.");
            console.error(err);
          }
        });
      }
    });
  // ── Save Company Logo ──
  content
    ?.querySelector("[data-save-logo]")
    ?.addEventListener("click", async () => {
      const fileInput = content!.querySelector<HTMLInputElement>(
        '[data-field="companyLogoFile"]',
      );
      const file = fileInput?.files?.[0];
      const myOrgId = getSession()?.companyId;
      if (!myOrgId) {
        toast.error("Unable to identify your company.");
        return;
      }
      if (!file) {
        const previewArea = content!.querySelector<HTMLElement>(
          '[data-field="previewArea"]',
        );
        if (previewArea && previewArea.style.display === "none") {
          try {
            const updated = await organizationService.update(myOrgId, {
              avatar_url: null,
            });
            myOrganization = updated;
            render();
            closeModal();
            toast.success("Company logo removed.");
          } catch (err) {
            toast.error("Failed to remove company logo.");
            console.error(err);
          }
        } else {
          toast.warning("Please select a logo to upload.");
        }
        return;
      }

      const saveLogoBtn =
        content?.querySelector<HTMLButtonElement>("[data-save-logo]");
      if (saveLogoBtn) {
        await withLoading(saveLogoBtn, async () => {
          try {
            const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
            const filePath = `logos/${myOrgId}/${crypto.randomUUID()}.${fileExt}`;

            const { data: uploadData, error: uploadError } =
              await supabase.storage.from("avatars").upload(filePath, file, {
                cacheControl: "3600",
                upsert: false,
              });

            if (uploadError) {
              toast.error("Failed to upload logo.");
              console.error("Upload error:", uploadError);
              return;
            }

            const { data: urlData } = supabase.storage
              .from("avatars")
              .getPublicUrl(uploadData.path);

            const avatar_url = urlData.publicUrl;
            const updated = await organizationService.update(myOrgId, {
              avatar_url,
            });
            myOrganization = updated;
            render();
            closeModal();
            toast.success("Company logo updated successfully.");
          } catch (err) {
            toast.error("Failed to save the company logo.");
            console.error(err);
          }
        });
      }
    });

  // ── Update Team ──
  content
    ?.querySelector("[data-update-team]")
    ?.addEventListener("click", async () => {
      const id =
        content!.querySelector<HTMLInputElement>('[data-field="teamId"]')
          ?.value || "";
      const team = teams.find((t) => t.id === id);
      if (!team) return;
      const newName =
        content!
          .querySelector<HTMLInputElement>('[data-field="teamName"]')
          ?.value.trim() || team.name;
      try {
        await teamService.update(id, { name: newName });
        team.name = newName;
        render();
        closeModal();
        toast.success(`"${newName}" has been updated.`);
      } catch (err) {
        toast.error("Failed to update the team.");
        console.error(err);
      }
    });

  // ── Delete Team (from edit modal) ──
  content
    ?.querySelector("[data-delete-team]")
    ?.addEventListener("click", async () => {
      const id =
        content!.querySelector<HTMLInputElement>('[data-field="teamId"]')
          ?.value || "";
      const team = teams.find((t) => t.id === id);
      if (!team) return;

      open("confirm-delete-team");
      const nameLabel = content?.querySelector<HTMLElement>(
        '[data-field="teamNameToDelete"]',
      );
      if (nameLabel) nameLabel.textContent = team.name;

      const confirmBtn = content?.querySelector<HTMLElement>(
        "[data-confirm-delete-team-btn]",
      );
      if (confirmBtn) {
        confirmBtn.onclick = async () => {
          try {
            await teamService.delete(id);
            teams = teams.filter((t) => t.id !== id);
            members = members.filter((m) => m.team_id !== id);
            delete teamProfiles[id];
            activeTeamId = teams[0]?.id || null;
            render();
            closeModal();
            toast.success("The team has been deleted.");
          } catch (err) {
            toast.error("Failed to delete the team.");
            console.error(err);
          }
        };
      }
    });

  // ── Delete Member (from edit modal) ──
  content
    ?.querySelector("[data-delete-member]")
    ?.addEventListener("click", async () => {
      if (!confirmDelete()) return;
      const id =
        content!.querySelector<HTMLInputElement>('[data-field="memberId"]')
          ?.value || "";
      try {
        await teamMemberService.delete(id);
        members = members.filter((m) => m.id !== id);
        render();
        closeModal();
        toast.success("The member has been deleted.");
      } catch (err) {
        toast.error("Failed to delete the member.");
        console.error(err);
      }
    });

  // ── Delete Office (from edit modal) ──
  content
    ?.querySelector("[data-delete-office]")
    ?.addEventListener("click", async () => {
      if (!confirmDelete()) return;
      const id =
        content!.querySelector<HTMLInputElement>('[data-field="officeId"]')
          ?.value || "";
      try {
        await teamOfficeService.delete(id);
        offices = offices.filter((o) => o.id !== id);
        renderChips(
          "#caOffices",
          offices.map((o) => ({ id: o.id || o.city_id })),
        );
        closeModal();
        toast.success("The city has been deleted.");
      } catch (err) {
        toast.error("Failed to delete the office.");
        console.error(err);
      }
    });
}

// ─── Initial data load ────────────────────────────────────────────────────────
async function loadData() {
  const loader = $("#caSkeletonLoader") as HTMLElement | null;
  const realContent = $("#caTeamRealContent") as HTMLElement | null;
  if (loader && realContent) {
    loader.style.display = "block";
    realContent.style.display = "none";
  }

  // Show skeletons on other page elements while loading
  const nameEl = $("[data-company-name]");
  if (nameEl) {
    nameEl.innerHTML =
      '<div class="ca-skeleton-text" style="width: 140px; margin: 0 auto; height: 24px;"></div>';
  }

  const parentContainer = $("#caParentCompanyContainer");
  if (parentContainer) {
    parentContainer.innerHTML =
      '<div class="ca-skeleton-card" style="height: 120px; border-radius: 12px;"></div>';
  }

  const logoBtn = $("#caCompanyLogoBtn");
  if (logoBtn) {
    logoBtn.innerHTML =
      '<div class="ca-skeleton-card" style="width: 100%; height: 100%; border-radius: 12px; margin: 0;"></div>';
  }

  const caOffices = $("#caOffices");
  if (caOffices) {
    caOffices.innerHTML = `
      <div class="ca-skeleton-chip" style="width: 100px;"></div>
      <div class="ca-skeleton-chip" style="width: 80px; margin-left: 8px;"></div>
      <div class="ca-skeleton-chip" style="width: 120px; margin-left: 8px;"></div>
    `;
  }

  const caProducts = $("#caProducts");
  if (caProducts) {
    caProducts.innerHTML = `
      <div class="ca-skeleton-chip" style="width: 130px;"></div>
      <div class="ca-skeleton-chip" style="width: 90px; margin-left: 8px;"></div>
    `;
  }

  const caTeamProfile = $("#caTeamProfile");
  if (caTeamProfile) {
    caTeamProfile.innerHTML = `
      <div class="ca-skeleton-text" style="width: 100%;"></div>
      <div class="ca-skeleton-text" style="width: 95%;"></div>
      <div class="ca-skeleton-text" style="width: 80%;"></div>
    `;
  }

  const caPortfolio = $("#caPortfolio");
  if (caPortfolio) {
    caPortfolio.innerHTML = `
      <div class="ca-org-grid">
        <div class="ca-skeleton-card" style="height: 180px;"></div>
        <div class="ca-skeleton-card" style="height: 180px;"></div>
      </div>
    `;
  }

  const orgSelectors = [
    "#caPartners",
    "#caCustomers",
    "#caInvestors",
    "#caSubsidiaries",
  ];
  orgSelectors.forEach((selector) => {
    const el = $(selector);
    if (el) {
      el.className = "ca-org-grid";
      el.innerHTML = `
        <div class="ca-skeleton-card" style="height: 260px;"></div>
        <div class="ca-skeleton-card" style="height: 260px;"></div>
      `;
    }
  });

  try {
    const myOrgId = getSession()?.companyId;
    const [
      teamsData,
      membersData,
      officesData,
      profilesData,
      photosData,
      partnersData,
      customersData,
      investorsData,
      subsidiariesData,
      citiesData,
      jobsData,
      teamSubjectsData,
      subjectsData,
      orgData,
    ] = await Promise.all([
      teamService.getAll(),
      teamMemberService.getAll(),
      teamOfficeService.getAll(),
      teamProfileService.getAll(),
      teamPhotoService.getAll(),
      teamPartnerService.getAll(),
      teamCustomerService.getAll(),
      teamInvestorService.getAll(),
      teamSubsidiaryService.getAll(),
      cityService.getAll(),
      jobService.getAll(),
      teamSubjectService.getAll(),
      subjectService.getAll(),
      myOrgId ? organizationService.getById(myOrgId) : Promise.resolve(null),
    ]);

    cities = citiesData;
    jobs = jobsData;
    teamSubjects = teamSubjectsData;
    allSubjects = subjectsData;
    myOrganization = orgData;

    teams = teamsData.map((t) => ({
      id: t.id,
      name: t.name,
      type: t.type,
      city_id: t.city_id,
      visibility: t.visibility || "PUBLIC",
    }));

    members = membersData.map((m) => ({
      id: m.id,
      team_id: m.team_id || "",
      fullname: m.fullname,
      job_id: m.job_id,
      profile_image: m.profile_image || DEFAULT_AVATAR,
      is_leader: m.is_leader,
    }));

    offices = officesData.map((o) => ({
      id: o.id,
      city_id: o.city_id,
      organization_id: o.organization_id,
      type: o.type,
    }));

    teamProfiles = {};
    for (const p of profilesData) {
      if (!p.team_id) continue;
      teamProfiles[p.team_id] = {
        id: p.id,
        team_id: p.team_id,
        who_we_are: p.who_we_are || "",
        what_were_great_at: p.what_were_great_at || "",
        team_culture: p.team_culture || "",
        how_we_work_together: p.how_we_work_together || "",
        this_team_is_not_for_you_if: p.this_team_is_not_for_you_if || "",
        how_were_led: p.how_were_led || "",
        what_were_solving_now: p.what_were_solving_now || "",
        typical_day: p.typical_day || "",
        what_we_value: p.what_we_value || "",
        growth_here: p.growth_here || "",
      };
    }

    photos = photosData.map((p) => ({
      id: p.id,
      organization_id: p.organization_id,
      url: p.url,
      name: p.name || "",
    }));

    partners = partnersData.map((p) => ({
      id: p.id,
      organization_id: p.organization_id,
      partner_id: p.partner_id,
    }));

    customers = customersData.map((c) => ({
      id: c.id,
      organization_id: c.organization_id,
      customer_id: c.customer_id,
    }));

    investors = investorsData.map((i) => ({
      id: i.id,
      organization_id: i.organization_id,
      investor_id: i.investor_id,
    }));

    subsidiaries = subsidiariesData.map((s) => ({
      id: s.id,
      organization_id: s.organization_id,
      subsidiary_id: s.subsidiary_id,
    }));

    if (myOrganization) {
      const nameEl = $("[data-company-name]");
      if (nameEl) nameEl.textContent = myOrganization.name;

      const urlTextEl = $("[data-profile-url-text]");
      if (urlTextEl) {
        const defaultSlug = myOrganization.name
          .toLowerCase()
          .replace(/[\s_]+/g, "-");
        urlTextEl.textContent = myOrganization.profile_url || defaultSlug;
      }
    }

    activeTeamId = teams[0]?.id || null;
    renderParentCompany();
    renderStatus();
    render();
  } catch (err) {
    toast.error("Failed to load team data.");
    console.error(err);
  } finally {
    if (loader && realContent) {
      loader.style.display = "none";
      realContent.style.display = "";
    }
  }
}

document.addEventListener("click", (e) => {
  const btn = (e.target as Element)?.closest?.(
    "[data-open-modal]",
  ) as HTMLElement | null;
  if (btn) {
    e.preventDefault();
    open(btn.dataset.openModal!);
  }
});

document.addEventListener(
  "click",
  (e) => {
    const closeBtn = (e.target as Element)?.closest?.(
      "[data-close-modal], .ca-x",
    );
    if (!closeBtn) return;
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  },
  true,
);

function startEditProfile() {
  const teamId = activeTeamId;
  console.log("startEditProfile", { teamId, teamsCount: teams.length });

  if (!teamId) {
    toast.warning("Please create a team first.");
    return;
  }

  const profile = teamProfiles[teamId];

  // On garde une copie pour pouvoir annuler
  originalProfile = profile
    ? structuredClone(profile)
    : {
        id: "",
        team_id: teamId,
        who_we_are: "",
        what_were_great_at: "",
        team_culture: "",
        how_we_work_together: "",
        this_team_is_not_for_you_if: "",
        how_were_led: "",
        what_were_solving_now: "",
        typical_day: "",
        what_we_value: "",
        growth_here: "",
      };

  editMode = true;

  refreshEditUI();
  renderProfile();
}

async function saveEditProfile() {
  const teamId = activeTeamId;
  if (!teamId) return;

  const existing = teamProfiles[teamId];

  const field = (name: keyof TeamProfile) => {
    const el = document.querySelector<HTMLTextAreaElement>(
      `[data-field="${name}"]`,
    );
    if (el) return el.value.trim();
    return (existing?.[name] as string) || "";
  };

  const profilePayload = {
    team_id: teamId,
    who_we_are: field("who_we_are"),
    what_were_great_at: field("what_were_great_at"),
    team_culture: field("team_culture"),
    how_we_work_together: field("how_we_work_together"),
    this_team_is_not_for_you_if: field("this_team_is_not_for_you_if"),
    how_were_led: field("how_were_led"),
    what_were_solving_now: field("what_were_solving_now"),
    typical_day: field("typical_day"),
    what_we_value: field("what_we_value"),
    growth_here: field("growth_here"),
  };

  try {
    if (existing?.id) {
      const updated = await teamProfileService.update(
        existing.id,
        profilePayload,
      );
      teamProfiles[teamId] = updated;
    } else {
      const created = await teamProfileService.create(profilePayload);
      teamProfiles[teamId] = { ...profilePayload, id: created.id };
    }

    originalProfile = null;
    editMode = false;
    refreshEditUI();
    renderProfile();
    toast.success("The team profile has been saved.");
  } catch (err) {
    console.error("SAVE TEAM PROFILE ERROR:", err);
    toast.error("Failed to save the team profile.");
  }
}

function cancelEditProfile() {
  const teamId = activeTeamId;

  if (teamId && originalProfile) {
    teamProfiles[teamId] = structuredClone(originalProfile);
  }

  originalProfile = null;
  editMode = false;

  refreshEditUI();
  renderProfile();

  toast.info("Changes have been cancelled.");
}

$<HTMLButtonElement>("[data-edit-start]")?.addEventListener(
  "click",
  startEditProfile,
);
$<HTMLButtonElement>("[data-edit-save]")?.addEventListener(
  "click",
  saveEditProfile,
);
$<HTMLButtonElement>("[data-edit-cancel]")?.addEventListener(
  "click",
  cancelEditProfile,
);

document.querySelectorAll<HTMLElement>("[data-mode]").forEach((btn) => {
  btn.onclick = () => {
    mode = btn.dataset.mode as "people" | "operate";
    document.querySelectorAll<HTMLElement>("[data-mode]").forEach((item) => {
      item.classList.toggle("is-active", item === btn);
    });
    renderProfile();
  };
});

overlay?.addEventListener("click", (e) => {
  if (e.target === overlay) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadData();

  const leftArrow = $(".ca-tab-arrow.left") as HTMLElement | null;
  const rightArrow = $(".ca-tab-arrow.right") as HTMLElement | null;
  const tabsContainer = $("#caTeamTabs") as HTMLElement | null;
  if (leftArrow && rightArrow && tabsContainer) {
    leftArrow.onclick = () => {
      tabsContainer.scrollBy({ left: -150, behavior: "smooth" });
    };
    rightArrow.onclick = () => {
      tabsContainer.scrollBy({ left: 150, behavior: "smooth" });
    };
  }

  const editUrlBtn = $(".ca-url-edit-btn") as HTMLButtonElement | null;
  const cancelUrlBtn = $(".ca-url-cancel-btn") as HTMLButtonElement | null;
  const saveUrlBtn = $(".ca-url-save-btn") as HTMLButtonElement | null;
  const urlDisplay = $(".ca-profile-url-display") as HTMLElement | null;
  const urlEdit = $(".ca-profile-url-edit") as HTMLElement | null;
  const urlInput = $(".ca-url-input") as HTMLInputElement | null;
  const urlText = $("[data-profile-url-text]");

  if (
    editUrlBtn &&
    cancelUrlBtn &&
    saveUrlBtn &&
    urlDisplay &&
    urlEdit &&
    urlInput &&
    urlText
  ) {
    editUrlBtn.addEventListener("click", () => {
      urlInput.value = urlText.textContent || "";
      urlDisplay.style.display = "none";
      urlEdit.style.display = "flex";
      urlInput.focus();
    });

    cancelUrlBtn.addEventListener("click", () => {
      urlEdit.style.display = "none";
      urlDisplay.style.display = "flex";
    });

    saveUrlBtn.addEventListener("click", async () => {
      const newUrl = urlInput.value
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, "-");
      if (!newUrl) {
        toast.warning("Profile URL slug cannot be empty.");
        return;
      }

      const myOrgId = getSession()?.companyId;
      if (!myOrgId) {
        toast.error("Unable to identify your company.");
        return;
      }

      try {
        saveUrlBtn.setAttribute("disabled", "true");
        saveUrlBtn.style.opacity = "0.5";

        const updated = await organizationService.update(myOrgId, {
          profile_url: newUrl,
        });
        myOrganization = updated;
        urlText.textContent = updated.profile_url || newUrl;

        urlEdit.style.display = "none";
        urlDisplay.style.display = "flex";
        toast.success("Profile URL updated successfully.");
      } catch (err) {
        toast.error("Failed to update Profile URL.");
        console.error(err);
      } finally {
        saveUrlBtn.removeAttribute("disabled");
        saveUrlBtn.style.opacity = "";
      }
    });

    urlInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        saveUrlBtn.click();
      } else if (e.key === "Escape") {
        cancelUrlBtn.click();
      }
    });
  }

  /* =========================================================
     CUSTOM SELECTS
  ========================================================== */
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const trigger = target.closest(".ca-cselect-trigger");
    const opt = target.closest(".ca-cselect-opt");
    const toggle = target.closest(".ca-toggle-btn[data-member-mode]");

    // Close opened selects which do not contain the click.
    document.querySelectorAll(".ca-cselect.is-open").forEach((el) => {
      if (!el.contains(target)) {
        el.classList.remove("is-open");
      }
    });

    // Open / close clicked select.
    if (trigger) {
      const wrap = trigger.closest(".ca-cselect");
      if (wrap) {
        wrap.classList.toggle("is-open");
      }
    }

    // Select an option.
    if (opt) {
      const wrap = opt.closest(".ca-cselect");
      if (!wrap) return;

      const val =
        (opt as HTMLElement).dataset.value !== undefined
          ? (opt as HTMLElement).dataset.value
          : opt.textContent?.trim() || "";

      const label = opt.textContent?.trim() || "";

      const valEl = wrap.querySelector(".ca-cselect-val");
      const hiddenIn = wrap.querySelector<HTMLInputElement>(
        "[data-cselect-value]",
      );

      if (valEl) {
        valEl.textContent = label;
        valEl.classList.remove("is-placeholder");
      }

      if (hiddenIn) {
        hiddenIn.value = val!;
        hiddenIn.dispatchEvent(new Event("change", { bubbles: true }));
      }

      wrap.querySelectorAll(".ca-cselect-opt").forEach((o) => {
        o.classList.toggle("is-selected", o === opt);
      });

      wrap.classList.remove("is-open");
    }

    // Member mode toggle.
    if (toggle) {
      const group = toggle.closest(".ca-toggle-group");
      if (!group) return;

      let modalEl = toggle.closest(".ca-modal, [id^='companyAdmin']");
      if (!modalEl) {
        modalEl = document.getElementById("companyAdminModalContent");
      }

      group.querySelectorAll(".ca-toggle-btn").forEach((b) => {
        b.classList.remove("is-active");
      });

      toggle.classList.add("is-active");

      const modeVal = (toggle as HTMLElement).dataset.memberMode;
      if (modalEl) {
        modalEl.querySelectorAll("[data-member-panel]").forEach((el) => {
          (el as HTMLElement).style.display =
            (el as HTMLElement).dataset.memberPanel === modeVal ? "" : "none";
        });
      }
    }
  });

  /* =========================================================
     IMAGE UPLOAD
  ========================================================== */
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const uploadButton = target.closest('[data-field="uploadButton"]');
    const changeButton = target.closest('[data-action="changeImage"]');
    const removeButton = target.closest('[data-action="removeImage"]');

    if (uploadButton || changeButton) {
      const wrapper = (uploadButton || changeButton)!.closest(
        ".ca-image-upload-wrapper",
      );
      const fileInput = wrapper
        ? wrapper.querySelector<HTMLInputElement>('input[type="file"]')
        : null;
      if (fileInput) {
        fileInput.click();
      }
    }

    if (removeButton) {
      const wrapper = removeButton.closest(".ca-image-upload-wrapper");
      if (!wrapper) return;

      const fileInput =
        wrapper.querySelector<HTMLInputElement>('input[type="file"]');
      const previewArea = wrapper.querySelector<HTMLElement>(
        '[data-field="previewArea"]',
      );
      const uploadBtn = wrapper.querySelector<HTMLElement>(
        '[data-field="uploadButton"]',
      );
      const previewImg = wrapper.querySelector<HTMLImageElement>(
        '[data-field="previewImg"]',
      );

      if (fileInput) fileInput.value = "";
      if (previewImg) previewImg.src = "";
      if (previewArea) previewArea.style.display = "none";
      if (uploadBtn) uploadBtn.style.display = "";
    }
  });

  /* =========================================================
     IMAGE VALIDATION / PREVIEW
  ========================================================== */
  document.addEventListener("change", (e) => {
    const target = e.target as HTMLElement;
    const input = target.closest(
      ".ca-image-upload-wrapper input[type='file']",
    ) as HTMLInputElement | null;

    if (!input || !input.files || !input.files[0]) {
      return;
    }

    const file = input.files[0];
    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      input.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB.");
      input.value = "";
      return;
    }

    const wrapper = input.closest(".ca-image-upload-wrapper");
    if (!wrapper) return;

    const previewImg = wrapper.querySelector<HTMLImageElement>(
      '[data-field="previewImg"]',
    );
    const previewArea = wrapper.querySelector<HTMLElement>(
      '[data-field="previewArea"]',
    );
    const uploadBtn = wrapper.querySelector<HTMLElement>(
      '[data-field="uploadButton"]',
    );

    const reader = new FileReader();
    reader.onload = () => {
      if (previewImg) previewImg.src = reader.result as string;
      if (previewArea) previewArea.style.display = "flex";
      if (uploadBtn) uploadBtn.style.display = "none";
    };
    reader.readAsDataURL(file);
  });

  /* =========================================================
     PROFILE WORD / CHARACTER COUNTER
  ========================================================== */
  document.addEventListener("input", (e) => {
    const target = e.target as HTMLElement;
    const ta = target.closest(
      ".ca-tfield textarea",
    ) as HTMLTextAreaElement | null;
    if (!ta) return;

    const field = ta.closest(".ca-tfield");
    const counter = field && field.querySelector(".ca-wcount");
    if (!counter) return;

    const text = ta.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = ta.value.length;

    counter.textContent = `${words}/30 words · ${chars}/180 chars`;
    ta.style.borderColor = chars > 180 ? "var(--ca-danger)" : "";
  });
});
