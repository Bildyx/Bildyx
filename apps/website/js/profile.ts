import {
  currentProfile,
  deletedEducations,
  deletedCertifications,
  deletedExperiences,
  deletedLanguages,
  deletedSkills,
} from "./profile/state";
import {
  openLanguageModal,
  openSkillModal,
  openOrgModal,
} from "./profile/modals";
import { loadUserData } from "./profile/rendering";
import { saveProfile } from "./profile/saving";
import { $, $$ } from "./helpers";
import { userService } from "./profile/services";

const panels = ["profilePanel", "testsPanel", "jobsPanel", "settingsPanel"];

let toastTimer: number | null = null;
let autosaveTimer: number | null = null;

// ─── Toast ────────────────────────────────────────────────
export function showToast(message: string, type = "default") {
  let toast = $(".profile-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "profile-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `profile-toast ${type === "error" ? "is-error" : ""}`;
  toast.classList.add("is-visible");
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2400);
}

// ─── Management des Panneaux ─────────────────────────────
export function showPanel(panelId: string) {
  panels.forEach((id) => {
    const panel = document.getElementById(id);
    if (panel) panel.hidden = id !== panelId;
  });

  $$(".side-nav-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.panel === panelId);
  });
}

// ─── Word / char counters ─────────────────────────────────
export function countWords(value: string): number {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function updateWordCounter(textarea: HTMLTextAreaElement) {
  const max = Number(textarea.getAttribute("maxlength")) || 600;
  const maxWords = max >= 600 ? 60 : 50;
  const wordsCount = countWords(textarea.value);
  const counter = textarea.nextElementSibling;
  if (!counter || !counter.classList.contains("word-counter")) return;
  counter.textContent = `${wordsCount}/${maxWords} words`;
  if (wordsCount > maxWords) {
    textarea.classList.add("is-overflow");
    counter.classList.add("is-overflow");
  } else {
    textarea.classList.remove("is-overflow");
    counter.classList.remove("is-overflow");
  }
}

export function setAreaEditable(areaName: string, editable: boolean) {
  const area = document.querySelector(
    `[data-edit-area="${areaName}"]`,
  ) as HTMLElement | null;
  if (!area) return;

  $$("[data-editable]", area).forEach((element) => {
    element.setAttribute("contenteditable", editable ? "true" : "false");
  });
}

export function toggleEdit(button: HTMLElement) {
  const target = button.dataset.editTarget;
  if (!target) return;
  const isEditing = !button.classList.contains("is-editing");
  button.classList.toggle("is-editing", isEditing);
  button.textContent = isEditing ? "✓" : "✎";
  setAreaEditable(target, isEditing);
  showToast(isEditing ? "Editing enabled." : "Changes saved locally.");
}

// ─── Auto-save ─────────────────────────────────────────────
export function scheduleAutosave() {
  if (autosaveTimer) window.clearTimeout(autosaveTimer);
  autosaveTimer = window.setTimeout(() => {
    if (currentProfile?.id) {
      saveProfile();
    }
  }, 1200);
}

// ─── Helper : remplit un champ [data-field] ───────────────
export function setField(fieldName: string, value: string) {
  const el = document.querySelector(`[data-field="${fieldName}"]`);
  if (!el) return;
  el.textContent = value || "";
}

export function getSession() {
  const raw = sessionStorage.getItem("bildyx_session");
  return raw ? JSON.parse(raw) : null;
}

export function escapeHtml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Top Skills & Languages Chips ──────────────────────────
export function addChip(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const limit = Number(container.dataset.chipLimit || 99);
  const current = container.querySelectorAll(".chip").length;

  if (current >= limit) {
    showToast(`Maximum ${limit} items.`);
    return;
  }

  if (containerId === "languageChips") {
    openLanguageModal((lang: string, level: string) => {
      let levelClass = "";
      if (level === "Native") {
        levelClass = "is-native";
      } else if (level === "Fluent") {
        levelClass = "is-fluent";
      } else {
        levelClass = "is-intermediate";
      }
      const label = lang;

      // Prevent duplicate chips
      const exists = Array.from(container.querySelectorAll(".chip")).some(
        (c) =>
          c.childNodes[0]?.textContent?.trim().toLowerCase() ===
          label.toLowerCase(),
      );
      if (exists) {
        showToast("Already added!", "error");
        return;
      }

      const chip = document.createElement("span");
      chip.className = `chip is-filled ${levelClass}`.trim();
      chip.dataset.unsaved = "true";
      chip.innerHTML = `${escapeHtml(label)} <button type="button" aria-label="Remove ${escapeHtml(label)}">×</button>`;
      container.appendChild(chip);
      showToast("Language added.");
      updateProfileMetaSummary();
      scheduleAutosave();
    });
  } else if (containerId === "skillChips") {
    openSkillModal((skillName: string) => {
      // Prevent duplicate chips
      const exists = Array.from(container.querySelectorAll(".chip")).some(
        (c) =>
          c.childNodes[0]?.textContent?.trim().toLowerCase() ===
          skillName.toLowerCase(),
      );
      if (exists) {
        showToast("Already added!", "error");
        return;
      }

      const chip = document.createElement("span");
      chip.className = "chip is-outline";
      chip.dataset.unsaved = "true";
      chip.innerHTML = `${escapeHtml(skillName)} <button type="button" aria-label="Remove ${escapeHtml(skillName)}">×</button>`;
      container.appendChild(chip);
      showToast("Skill added.");
      updateProfileMetaSummary();
      scheduleAutosave();
    });
  } else {
    const val = window.prompt("Name of the new item:");
    if (!val || !val.trim()) return;
    const label = val.trim();

    // Prevent duplicate chips
    const exists = Array.from(container.querySelectorAll(".chip")).some(
      (c) =>
        c.childNodes[0]?.textContent?.trim().toLowerCase() ===
        label.toLowerCase(),
    );
    if (exists) {
      showToast("Already added!", "error");
      return;
    }

    const chip = document.createElement("span");
    chip.className = "chip is-outline";
    chip.dataset.unsaved = "true";
    chip.innerHTML = `${escapeHtml(label)} <button type="button" aria-label="Remove ${escapeHtml(label)}">×</button>`;
    container.appendChild(chip);
    showToast("Item added.");
    updateProfileMetaSummary();
    scheduleAutosave();
  }
}

export function removeChip(button: HTMLElement) {
  const chip = button.closest<HTMLElement>(".chip");
  if (chip) {
    const id = chip.dataset.id;
    const container = chip.closest(".chip-row");
    const containerId = container?.id;
    if (id && chip.dataset.unsaved !== "true") {
      if (containerId === "languageChips") {
        deletedLanguages.push(id);
      } else if (containerId === "skillChips") {
        deletedSkills.push(id);
      }
    }
    chip.remove();
    showToast("Removed.");
    scheduleAutosave();
  }
}

export function toggleSelectableSkill(button: HTMLElement) {
  const container = button.closest("[data-selectable-skills]");
  if (!container) return;

  const isActive = button.classList.contains("is-active");
  const activeCount = container.querySelectorAll(
    ".is-selectable.is-active",
  ).length;

  if (!isActive && activeCount >= 5) {
    showToast("Maximum 5 skills allowed.", "error");
    return;
  }

  button.classList.toggle("is-active");

  const countEl = container.closest(".entry-skills")?.querySelector("small");
  const newCount = container.querySelectorAll(
    ".is-selectable.is-active",
  ).length;
  if (countEl) countEl.textContent = `${newCount}/5 selected`;
}

// ─── Add Experience Card ───────────────────────────────────
export function addExperience() {
  const list = document.getElementById("experienceList");
  if (!list) return;

  const emptyMsg = list.querySelector(".empty-message");
  if (emptyMsg) emptyMsg.remove();

  const count = list.querySelectorAll('[data-entry="experience"]').length;

  const article = document.createElement("article");
  article.className = "entry-card";
  article.dataset.entry = "experience";
  article.dataset.unsaved = "true";
  article.innerHTML = `
            <div class="entry-toolbar">
                <h3>Work Experience ${count + 1}</h3>
                <div>
                    <button class="entry-tool js-collapse" type="button" aria-label="Collapse or expand work experience">＋</button>
                    <button class="entry-tool js-remove-entry" type="button" aria-label="Remove work experience">×</button>
                </div>
            </div>
            <div class="entry-body">
                <div class="entry-header-line">
                    <div class="entry-controls" style="width: 100%;">
                        <div class="date-row" style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                <label style="font-size: 0.85em; opacity: 0.8;">Start Year</label>
                                <input type="number" class="start-year" placeholder="YYYY" min="1900" max="2099" style="width: 110px;" />
                            </div>
                            <span style="align-self: flex-end; margin-bottom: 8px;">–</span>
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                <label style="font-size: 0.85em; opacity: 0.8;">End Year</label>
                                <input type="number" class="end-year" placeholder="YYYY" min="1900" max="2099" style="width: 110px;" />
                            </div>
                            <label class="current-label" style="margin-left: 12px; align-self: flex-end; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 6px; font-size: 0.95em; cursor: pointer; user-select: none;">
                                <input type="checkbox" class="exp-current" /> Current
                            </label>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px;">
                            <label style="font-size: 0.85em; opacity: 0.8;">Role Title</label>
                            <input type="text" class="exp-role-title" placeholder="Add role title..." style="width: 100%;" />
                        </div>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px;">
                    <label style="font-size: 0.85em; opacity: 0.8;">Work Summary</label>
                    <textarea maxlength="600" data-word-counter placeholder="Add work summary..."></textarea>
                </div>
                <p class="word-counter">0/60 words</p>
                <div class="backend-grid backend-grid--three">
                    <section><h4>Company</h4><div class="backend-slot" data-card-slot="company-card">Company card</div></section>
                    <section><h4>Product/Service</h4><div class="backend-slot" data-card-slot="product-card">Product/Service card</div></section>
                    <section><h4>Role</h4><div class="backend-slot" data-card-slot="role-card">Role card</div></section>
                </div>
                <div class="backend-grid backend-grid--two">
                    <section><h4>Brands</h4><button class="inline-link" type="button">Add brand (optional)...</button><div class="backend-slot backend-slot--small" data-card-slot="brand-card">Brand card</div></section>
                    <section><h4>Client/Industry</h4><button class="inline-link" type="button">Add client/industry...</button><div class="backend-slot backend-slot--small" data-card-slot="client-card">Client/Industry card</div></section>
                </div>
            </div>
        `;
  list.appendChild(article);

  const txt = article.querySelector("textarea");
  if (txt) {
    txt.addEventListener("input", () => updateWordCounter(txt));
  }

  const currentCheckbox =
    article.querySelector<HTMLInputElement>(".exp-current");
  const endYearInput = article.querySelector<HTMLInputElement>(".end-year");
  if (currentCheckbox && endYearInput) {
    currentCheckbox.addEventListener("change", () => {
      if (currentCheckbox.checked) {
        endYearInput.disabled = true;
        endYearInput.value = "";
      } else {
        endYearInput.disabled = false;
      }
    });
  }

  showToast("Experience added.");
}

// ─── Add Education Card ────────────────────────────────────
export function addEducation() {
  const list = document.getElementById("educationList");
  if (!list) return;

  const emptyMsg = list.querySelector(".empty-message");
  if (emptyMsg) emptyMsg.remove();

  const article = document.createElement("article");
  article.className = "entry-card";
  article.dataset.entry = "education";
  article.dataset.unsaved = "true";
  article.innerHTML = `
            <div class="entry-toolbar">
                <h3>Education</h3>
                <div>
                    <button class="entry-tool js-collapse" type="button" aria-label="Collapse or expand education">＋</button>
                    <button class="entry-tool js-remove-entry" type="button" aria-label="Remove education">×</button>
                </div>
            </div>
            <div class="entry-body">
                <div class="education-form-line" style="width: 100%;">
                    <div class="education-fields" style="width: 100%;">
                        <div class="date-row" style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                <label style="font-size: 0.85em; opacity: 0.8;">Start Year</label>
                                <input type="number" class="start-year" placeholder="YYYY" min="1900" max="2099" style="width: 110px;" />
                            </div>
                            <span style="align-self: flex-end; margin-bottom: 8px;">–</span>
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                <label style="font-size: 0.85em; opacity: 0.8;">End Year</label>
                                <input type="number" class="end-year" placeholder="YYYY" min="1900" max="2099" style="width: 110px;" />
                            </div>
                            <label class="graduated-label" style="margin-left: 12px; align-self: flex-end; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 6px; font-size: 0.95em; cursor: pointer; user-select: none;">
                                <input type="checkbox" class="edu-graduated" checked /> Graduated
                            </label>
                        </div>
                    </div>
                </div>
                <div class="backend-grid backend-grid--two">
                    <div class="backend-slot backend-slot--education" data-card-slot="university-card">University card</div>
                    <div class="backend-slot backend-slot--education" data-card-slot="degree-card">Degree card</div>
                </div>
            </div>
        `;
  list.appendChild(article);

  const txt = article.querySelector("textarea");
  if (txt) {
    txt.addEventListener("input", () => updateWordCounter(txt));
  }

  showToast("Education added.");
}

// ─── Add Certification Card ────────────────────────────────
export function addCertification() {
  const grid =
    document.querySelector(".cert-grid") ||
    document.getElementById("certificationList");
  if (!grid) return;

  const emptyMsg = grid.querySelector(".empty-message");
  if (emptyMsg) emptyMsg.remove();

  const article = document.createElement("article");
  article.className = "entry-card cert-card";
  article.dataset.entry = "certification";
  article.dataset.unsaved = "true";
  article.innerHTML = `
            <div class="entry-toolbar">
                <h3 class="cert-name" data-placeholder="New Certification">New Certification</h3>
                <button class="entry-tool js-remove-entry" type="button" aria-label="Remove certification">×</button>
            </div>
            <div class="entry-body">
                <div class="cert-date-row" style="display: flex; gap: 12px; margin-bottom: 12px;">
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                        <label style="font-size: 0.85em; opacity: 0.8;">Obtained at</label>
                        <input type="date" class="cert-obtained-at" style="width: 100%;" />
                    </div>
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <label style="font-size: 0.85em; opacity: 0.8;">Expires at</label>
                            <label class="never-expire-label" style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.85em; cursor: pointer; user-select: none; opacity: 0.9;">
                                <input type="checkbox" class="cert-never-expire" checked /> Never
                            </label>
                        </div>
                        <input type="date" class="cert-expires-at" style="width: 100%;" disabled />
                    </div>
                </div>
                <div class="backend-grid">
                    <div class="backend-slot backend-slot--certification" data-card-slot="certification-card">Certification card</div>
                </div>
            </div>
        `;
  grid.appendChild(article);
  showToast("Certification added.");
}

// ─── Entry collapse and delete triggers ───────────────────
export function collapseEntry(button: HTMLElement) {
  const entry = button.closest(".entry-card");
  if (!entry) return;
  const body = $(".entry-body", entry as HTMLElement);
  if (!body) return;
  body.classList.toggle("is-collapsed");
  button.textContent = body.classList.contains("is-collapsed") ? "▾" : "＋";
}

export function renumberExperiences() {
  $$('#experienceList [data-entry="experience"]').forEach((entry, index) => {
    const title = entry.querySelector(".entry-toolbar h3");
    if (title) title.textContent = `Work Experience ${index + 1}`;
  });
}

export function removeEntry(button: HTMLElement) {
  const entry = button.closest<HTMLElement>("[data-entry], .entry-card");
  if (!entry) return;

  const id = entry.dataset.id;
  const type = entry.dataset.entry;

  if (id && entry.dataset.unsaved !== "true") {
    if (type === "education") deletedEducations.push(id);
    if (type === "certification") deletedCertifications.push(id);
    if (type === "experience") deletedExperiences.push(id);
  }

  entry.remove();
  renumberExperiences();
  updateProfileMetaSummary();
  showToast("Item removed.");
  scheduleAutosave();
}

export function fillBackendSlot(slot: HTMLElement) {
  const slotType = slot.dataset.cardSlot;
  if (slotType) {
    openOrgModal(slot);
  }
}

// ─── Meta Summary calculation ──────────────────────────────
export function updateProfileMetaSummary() {
  const workedInSpan = document.querySelector('[data-field="meta-worked-in"]');
  const studiedInSpan = document.querySelector(
    '[data-field="meta-studied-in"]',
  );
  const companiesSpan = document.querySelector('[data-field="meta-companies"]');
  const productsSpan = document.querySelector('[data-field="meta-products"]');
  const jobsSpan = document.querySelector('[data-field="meta-jobs"]');
  const degreesSpan = document.querySelector('[data-field="meta-degrees"]');
  const certsSpan = document.querySelector(
    '[data-field="meta-certifications"]',
  );

  const getUniqueValues = (selector: string, datasetKey: string): string[] => {
    const values = new Set<string>();
    $$(selector).forEach((el) => {
      const val = el.dataset[datasetKey];
      if (val) values.add(val.trim());
    });
    return Array.from(values);
  };

  const countries = getUniqueValues(
    '.backend-slot[data-card-slot="company-card"].is-filled',
    "countryName",
  );
  if (workedInSpan) {
    workedInSpan.innerHTML =
      countries.length > 0
        ? countries.map((c) => `<span>${escapeHtml(c)}</span>`).join(", ")
        : "—";
  }

  const studiedIn = getUniqueValues(
    '.backend-slot[data-card-slot="university-card"].is-filled',
    "entityName",
  );
  if (studiedInSpan) {
    studiedInSpan.innerHTML =
      studiedIn.length > 0
        ? studiedIn.map((u) => `<span>${escapeHtml(u)}</span>`).join(", ")
        : "—";
  }

  const companies = getUniqueValues(
    '.backend-slot[data-card-slot="company-card"].is-filled',
    "entityName",
  );
  if (companiesSpan) {
    companiesSpan.innerHTML =
      companies.length > 0
        ? companies.map((c) => `<span>${escapeHtml(c)}</span>`).join(", ")
        : "—";
  }

  const products = [
    ...getUniqueValues(
      '.backend-slot[data-card-slot="product-card"].is-filled',
      "entityName",
    ),
    ...getUniqueValues(
      '.backend-slot[data-card-slot="brand-card"].is-filled',
      "entityName",
    ),
  ];
  const uniqueProducts = Array.from(new Set(products));
  if (productsSpan) {
    productsSpan.innerHTML =
      uniqueProducts.length > 0
        ? uniqueProducts.map((p) => `<span>${escapeHtml(p)}</span>`).join(", ")
        : "—";
  }

  const jobs = new Set<string>();
  $$('.entry-card[data-entry="experience"]').forEach((card) => {
    const roleSlot = card.querySelector<HTMLElement>(
      '.backend-slot[data-card-slot="role-card"].is-filled',
    );
    if (roleSlot && roleSlot.dataset.entityName) {
      jobs.add(roleSlot.dataset.entityName.trim());
    } else {
      const inputVal =
        card.querySelector<HTMLInputElement>(".exp-role-title")?.value;
      if (inputVal && inputVal.trim()) {
        jobs.add(inputVal.trim());
      }
    }
  });
  if (jobsSpan) {
    jobsSpan.innerHTML =
      jobs.size > 0
        ? Array.from(jobs)
            .map((j) => `<span>${escapeHtml(j)}</span>`)
            .join(", ")
        : "—";
  }

  const degrees = getUniqueValues(
    '.backend-slot[data-card-slot="degree-card"].is-filled',
    "entityName",
  );
  if (degreesSpan) {
    degreesSpan.innerHTML =
      degrees.length > 0
        ? degrees.map((d) => `<span>${escapeHtml(d)}</span>`).join(", ")
        : "—";
  }

  const certs = getUniqueValues(
    '.backend-slot[data-card-slot="certification-card"].is-filled',
    "entityName",
  );
  if (certsSpan) {
    certsSpan.innerHTML =
      certs.length > 0
        ? certs.map((c) => `<span>${escapeHtml(c)}</span>`).join(", ")
        : "—";
  }

  const summaryEl = document.querySelector(".meta-summary");
  if (summaryEl) {
    let totalCards = $$(".backend-slot.is-filled").length;
    summaryEl.textContent = `Profile loaded with ${totalCards} cards.`;
  }
}

// ─── Profile Avatar Chooser ──────────────────────────────
(() => {
  const profileAvatar = document.getElementById("profileAvatar");
  const avatarInput = document.getElementById(
    "avatarInput",
  ) as HTMLInputElement | null;

  if (profileAvatar && avatarInput) {
    profileAvatar.style.cursor = "pointer";
    profileAvatar.addEventListener("click", () => {
      avatarInput.click();
    });

    avatarInput.addEventListener("change", async () => {
      const file = avatarInput.files && avatarInput.files[0];
      if (!file) return;

      const session = getSession();
      if (!session || !session.userId) {
        showToast("Error: no active session.", "error");
        return;
      }

      showToast("Uploading avatar...");

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          await userService.update(session.userId, {
            avatar_url: base64,
          });
          profileAvatar.style.backgroundImage = `url("${base64}")`;
          profileAvatar.style.backgroundSize = "cover";
          profileAvatar.style.backgroundPosition = "center";
          profileAvatar.textContent = "";
          showToast("Profile avatar updated successfully!");
        } catch (err) {
          console.error("Failed to update profile avatar:", err);
          showToast("Failed to upload avatar.", "error");
        }
      };
      reader.readAsDataURL(file);
    });
  }
})();

// ─── Initialisation Sécurisée sans Blocage ────────────────
(async () => {
  try {
    ($$("[data-word-counter]") as HTMLTextAreaElement[]).forEach(
      updateWordCounter,
    );
    await loadUserData();
  } catch (err) {
    console.error("[profile.ts] Initialization error:", err);
  } finally {
    showPanel("profilePanel");
    updateProfileMetaSummary();
  }
})();

// ─── Event Listeners ──────────────────────────────────────
document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const button = target.closest("button");

  if (button?.classList.contains("is-selectable")) {
    toggleSelectableSkill(button);
    return;
  }

  if (target.classList.contains("js-collapse")) {
    collapseEntry(target);
    return;
  }

  if (target.classList.contains("js-remove-entry")) {
    removeEntry(target);
    return;
  }

  if (
    button?.id === "addExperienceButton" ||
    button?.id === "addExperienceTop" ||
    button?.id === "addExperienceBottom"
  ) {
    addExperience();
    updateProfileMetaSummary();
    return;
  }

  if (
    button?.id === "addEducationButton" ||
    button?.id === "addDegreeTop" ||
    button?.id === "addDegreeBottom"
  ) {
    addEducation();
    updateProfileMetaSummary();
    return;
  }

  if (
    button?.id === "addCertificationButton" ||
    button?.id === "addCertificationTop" ||
    button?.id === "addCertificationBottom"
  ) {
    addCertification();
    updateProfileMetaSummary();
    return;
  }

  if (button?.id === "saveProfileButton" || button?.id === "saveProfile") {
    saveProfile();
    return;
  }

  if (button?.id === "avatarButton") {
    const initials = window.prompt(
      "Initials to display in the avatar placeholder:",
      "JT",
    );
    if (initials && initials.trim()) {
      const avatarEl = $("#profileAvatar");
      if (avatarEl)
        avatarEl.textContent = initials.trim().substring(0, 3).toUpperCase();
      showToast("Avatar updated.");
    }
    return;
  }

  if (button?.classList.contains("inline-link")) {
    const value = window.prompt("Text to add:");
    if (value && value.trim()) {
      button.textContent = value.trim();
      button.style.fontStyle = "normal";
      button.style.fontWeight = "700";
      button.style.color = "var(--profile-primary)";
      scheduleAutosave();
    }
    return;
  }

  if (button?.id === "langModalConfirm" || button?.id === "langModalCancel") {
    return;
  }

  if (button?.closest(".side-nav-button")) {
    const navBtn = button.closest(".side-nav-button") as HTMLElement;
    if (navBtn.dataset.panel) showPanel(navBtn.dataset.panel);
    return;
  }

  if (button?.dataset.addChip) {
    addChip(button.dataset.addChip);
    return;
  }

  const chipRemoveBtn = target.closest(".chip button");
  if (chipRemoveBtn) {
    removeChip(chipRemoveBtn as HTMLElement);
    updateProfileMetaSummary();
    return;
  }

  const slot = target.closest<HTMLElement>(".backend-slot");
  if (slot) {
    if (target.classList.contains("slot-clear-btn")) {
      delete slot.dataset.orgId;
      delete slot.dataset.productId;
      delete slot.dataset.roleId;
      delete slot.dataset.industryId;
      delete slot.dataset.universityId;
      delete slot.dataset.degreeId;
      delete slot.dataset.certificationId;
      delete slot.dataset.entityName;
      delete slot.dataset.countryName;

      slot.classList.remove("is-filled", "is-loading");
      const slotType = slot.dataset.cardSlot;
      let placeholderText = "Backend Slot";
      if (slotType === "company-card") placeholderText = "Company card";
      else if (slotType === "product-card")
        placeholderText = "Product/Service card";
      else if (slotType === "role-card") placeholderText = "Role card";
      else if (slotType === "brand-card") placeholderText = "Brand card";
      else if (slotType === "client-card")
        placeholderText = "Client/Industry card";
      else if (slotType === "university-card")
        placeholderText = "University card";
      else if (slotType === "degree-card") placeholderText = "Degree card";
      else if (slotType === "certification-card")
        placeholderText = "Certification card";

      slot.innerHTML = placeholderText;

      const currentEntryCard = slot.closest(".entry-card");
      if (currentEntryCard) {
        currentEntryCard.setAttribute("data-dirty", "true");
        const skillsSec = currentEntryCard.querySelector(".entry-skills");
        if (skillsSec) skillsSec.classList.remove("is-visible");
      }

      updateProfileMetaSummary();
      scheduleAutosave();
      return;
    }

    if (
      !slot.classList.contains("is-filled") &&
      !slot.classList.contains("is-loading")
    ) {
      fillBackendSlot(slot);
    }
  }
});

function markDirty(target: HTMLElement) {
  const card = target.closest(".entry-card");
  if (card) {
    card.setAttribute("data-dirty", "true");
  } else {
    const isProfileMainField =
      target.id === "role-title" ||
      target.id === "profileName" ||
      target.dataset.field === "summary";

    if (isProfileMainField) {
      const panel = document.getElementById("profilePanel");
      if (panel) {
        panel.setAttribute("data-profile-dirty", "true");
      }
    }
  }
}

document.addEventListener("change", (e) => {
  const target = e.target as HTMLElement;
  markDirty(target);

  if (target.classList.contains("exp-image-input")) {
    const fileInput = target as HTMLInputElement;
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const roundPlace = fileInput.closest<HTMLElement>(".round-place");
      if (roundPlace) {
        roundPlace.classList.add("has-image");
        roundPlace.style.backgroundImage = `url("${reader.result}")`;
        roundPlace.style.backgroundSize = "cover";
        roundPlace.style.backgroundPosition = "center";
        showToast("Experience image updated!");
        updateProfileMetaSummary();
        scheduleAutosave();
      }
    };
    reader.readAsDataURL(file);
    return;
  }

  if (target.classList.contains("cert-never-expire")) {
    const checkbox = target as HTMLInputElement;
    const card = checkbox.closest(".entry-card");
    if (card) {
      const expiresInput =
        card.querySelector<HTMLInputElement>(".cert-expires-at");
      if (expiresInput) {
        if (checkbox.checked) {
          expiresInput.disabled = true;
          expiresInput.value = "";
        } else {
          expiresInput.disabled = false;
        }
      }
    }
  }

  if (
    target.classList.contains("start-year") ||
    target.classList.contains("end-year") ||
    target.classList.contains("exp-current") ||
    target.classList.contains("edu-graduated") ||
    target.classList.contains("cert-obtained-at") ||
    target.classList.contains("cert-expires-at") ||
    target.classList.contains("cert-never-expire") ||
    target.tagName.toLowerCase() === "select"
  ) {
    scheduleAutosave();
  }
});

document.addEventListener("focusout", (e) => {
  const target = e.target as HTMLElement;
  markDirty(target);

  const shouldAutosave =
    target.classList.contains("exp-role-title") ||
    target.tagName.toLowerCase() === "textarea" ||
    target.id === "role-title" ||
    target.id === "profileName" ||
    target.dataset.field === "summary" ||
    (target.hasAttribute("contenteditable") && !target.closest(".entry-card"));

  if (shouldAutosave) {
    if (target.classList.contains("exp-role-title")) {
      updateProfileMetaSummary();
    }
    scheduleAutosave();
  }
});

window.addEventListener("beforeunload", () => {
  if (autosaveTimer) {
    saveProfile();
  }
});
