import {
  organizationService,
  subjectService,
  jobService,
  industryService,
  degreeService,
  certificationService,
  cardService,
  skillService,
  cityService,
  countryService,
} from "./services";
import { $ } from "../helpers";
import {
  updateProfileMetaSummary,
  scheduleAutosave,
  showToast,
  escapeHtml,
} from "../profile";
import { alignCardsHeight } from "./rendering";

interface SlotConfig {
  title: string;
  placeholder: string;
  searchEndpoint: string;
  cardEndpointPrefix: string;
  displayProp: string;
  subProp: string;
  toastSuccess: string;
}

export const SLOT_MAPPING: Record<string, SlotConfig> = {
  "company-card": {
    title: "Select an Organisation",
    placeholder: "Search for a company...",
    searchEndpoint: "/organizations",
    cardEndpointPrefix: "/cards/organization/",
    displayProp: "name",
    subProp: "subtype",
    toastSuccess: "Organisation card updated!",
  },
  "product-card": {
    title: "Select a Product / Service",
    placeholder: "Search for a product or service...",
    searchEndpoint: "/subjects",
    cardEndpointPrefix: "/cards/product/",
    displayProp: "name",
    subProp: "category",
    toastSuccess: "Product card updated!",
  },
  "role-card": {
    title: "Select a Role / Position",
    placeholder: "Search for a role...",
    searchEndpoint: "/jobs",
    cardEndpointPrefix: "/cards/job/",
    displayProp: "title",
    subProp: "category",
    toastSuccess: "Role card updated!",
  },
  "brand-card": {
    title: "Select a Brand",
    placeholder: "Search for a brand...",
    searchEndpoint: "/subjects",
    cardEndpointPrefix: "/cards/product/",
    displayProp: "name",
    subProp: "category",
    toastSuccess: "Brand card updated!",
  },
  "client-card": {
    title: "Select a Sector / Industry",
    placeholder: "Search for an industry...",
    searchEndpoint: "/industries",
    cardEndpointPrefix: "/cards/industry/",
    displayProp: "name",
    subProp: "description",
    toastSuccess: "Industry card updated!",
  },
  "degree-card": {
    title: "Select a Degree",
    placeholder: "Search for a degree...",
    searchEndpoint: "/degrees",
    cardEndpointPrefix: "/cards/degree/",
    displayProp: "name",
    subProp: "level",
    toastSuccess: "Degree card updated!",
  },
  "certification-card": {
    title: "Select a Certification",
    placeholder: "Search for a certification...",
    searchEndpoint: "/certifications",
    cardEndpointPrefix: "/cards/certification/",
    displayProp: "name",
    subProp: "level",
    toastSuccess: "Certification card updated!",
  },
  "university-card": {
    title: "Select a University",
    placeholder: "Search for a university...",
    searchEndpoint: "/universities",
    cardEndpointPrefix: "/cards/organization/",
    displayProp: "name",
    subProp: "subtype",
    toastSuccess: "University card updated!",
  },
};

let targetSlotForModal: HTMLElement | null = null;
let orgSearchDebounceTimer: number | null = null;

// Helper to handle dynamic search mapping
export async function searchEntities(
  endpoint: string,
  query: string,
): Promise<any[]> {
  if (endpoint === "/organizations") {
    return await organizationService.getAll({ name: query });
  } else if (endpoint === "/universities") {
    return await organizationService.getAll({
      name: query,
      subtype: "UNIVERSITY",
    });
  } else if (endpoint === "/subjects") {
    return await subjectService.getAll({ name: query });
  } else if (endpoint === "/jobs") {
    return await jobService.getAll({ name: query });
  } else if (endpoint === "/industries") {
    return await industryService.getAll({ name: query });
  } else if (endpoint === "/degrees") {
    return await degreeService.getAll({ name: query });
  } else if (endpoint === "/certifications") {
    const list = await certificationService.getAll();
    return list.filter((c: any) =>
      c.name.toLowerCase().includes(query.toLowerCase()),
    );
  }
  return [];
}

// Helper to handle dynamic card HTML loading
export async function fetchCardHtml(
  cardSlot: string,
  entityId: string,
): Promise<string> {
  if (cardSlot === "company-card" || cardSlot === "university-card") {
    return await cardService.getOrganization(entityId);
  } else if (cardSlot === "product-card" || cardSlot === "brand-card") {
    return await cardService.getSubject(entityId);
  } else if (cardSlot === "role-card") {
    return await cardService.getJob(entityId);
  } else if (cardSlot === "client-card") {
    return await cardService.getIndustry(entityId);
  } else if (cardSlot === "degree-card") {
    return await cardService.getDegree(entityId);
  } else if (cardSlot === "certification-card") {
    return await cardService.getCertification(entityId);
  }
  return "";
}

// ─── Language Modal ───
let _languagesCache: string[] | null = null;

export async function getLanguages() {
  if (_languagesCache) return _languagesCache;
  _languagesCache = [
    "ENGLISH",
    "FRENCH",
    "SPANISH",
    "GERMAN",
    "CHINESE_MANDARIN",
    "CHINESE_CANTONESE",
    "JAPANESE",
    "KOREAN",
    "ITALIAN",
    "PORTUGUESE",
    "RUSSIAN",
    "ARABIC",
  ].map(formatLanguageLabel);
  return _languagesCache;
}

export function formatLanguageLabel(key: string): string {
  const SPECIAL: Record<string, string> = {
    CHINESE_MANDARIN: "Chinese (Mandarin)",
    CHINESE_CANTONESE: "Chinese (Cantonese)",
    HAITIAN_CREOLE: "Haitian Creole",
    AMBONESE_MALAY: "Ambonese Malay",
    BAJAN_CREOLE: "Bajan Creole",
    GUYANESE_CREOLE: "Guyanese Creole",
    SCOTTISH_GAELIC: "Scottish Gaelic",
    SEYCHELLOIS_CREOLE: "Seychellois Creole",
  };
  if (SPECIAL[key]) return SPECIAL[key];
  return key
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatProficiency(prof: string): string {
  const map: Record<string, string> = {
    NATIVE: "Native",
    FLUENT: "Fluent",
    CONVERSATIONAL: "Intermediate",
    BASIC: "Basic",
    PROFESSIONAL: "Professional",
  };
  return map[prof] || prof;
}

export async function openLanguageModal(
  onConfirm: (lang: string, level: string) => void,
) {
  const languages = await getLanguages();

  let overlay = document.getElementById(
    "langModalOverlay",
  ) as HTMLDivElement | null;
  if (!overlay) {
    overlay = document.createElement("div") as HTMLDivElement;
    overlay.id = "langModalOverlay";
    overlay.className = "lang-modal-overlay";
    overlay.innerHTML = `
              <div class="lang-modal" role="dialog" aria-modal="true" aria-labelledby="langModalTitle">
                  <h3 id="langModalTitle">Add a Language</h3>
                  <label for="langSelect">Language</label>
                  <select id="langSelect">
                      <option value="">— Select a language —</option>
                  </select>
                  <label>Level</label>
                  <div class="lang-level-grid">
                      <button type="button" class="lang-level-btn" data-level="Native">Native</button>
                      <button type="button" class="lang-level-btn is-active" data-level="Fluent">Fluent</button>
                      <button type="button" class="lang-level-btn" data-level="Intermediate">Intermediate</button>
                  </div>
                  <div class="lang-modal-actions">
                      <button type="button" class="lang-modal-cancel" id="langModalCancel">Cancel</button>
                      <button type="button" class="lang-modal-confirm" id="langModalConfirm">Add Language</button>
                  </div>
              </div>`;
    document.body.appendChild(overlay);

    overlay.querySelectorAll(".lang-level-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        overlay
          ?.querySelectorAll(".lang-level-btn")
          .forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
      });
    });

    overlay
      .querySelector("#langModalCancel")
      ?.addEventListener("click", () => closeLangModal());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeLangModal();
    });
  }

  const select = overlay.querySelector(
    "#langSelect",
  ) as HTMLSelectElement | null;
  if (select) {
    select.innerHTML =
      '<option value="">— Select a language —</option>' +
      languages
        .map(
          (l) => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`,
        )
        .join("");
    select.value = "";
  }

  overlay
    .querySelectorAll(".lang-level-btn")
    .forEach((b) => b.classList.remove("is-active"));
  overlay.querySelector('[data-level="Fluent"]')?.classList.add("is-active");

  const confirmBtn = overlay.querySelector("#langModalConfirm");
  if (confirmBtn) {
    const newConfirm = confirmBtn.cloneNode(true);
    confirmBtn.parentNode?.replaceChild(newConfirm, confirmBtn);
    newConfirm.addEventListener("click", () => {
      const lang = (
        overlay?.querySelector("#langSelect") as HTMLSelectElement | null
      )?.value;
      if (!lang) {
        showToast("Please select a language.", "error");
        return;
      }
      const level =
        overlay
          ?.querySelector(".lang-level-btn.is-active")
          ?.getAttribute("data-level") || "Fluent";
      closeLangModal();
      onConfirm(lang, level);
    });
  }

  requestAnimationFrame(() => overlay?.classList.add("is-open"));
}

export function closeLangModal() {
  const overlay = document.getElementById("langModalOverlay");
  if (overlay) {
    overlay.classList.remove("is-open");
  }
}

// ─── Skill Modal ───
let _skillsCache: string[] | null = null;
async function getSkills() {
  if (_skillsCache) return _skillsCache;
  try {
    const list = await skillService.getAll();
    _skillsCache = list.map((s: any) => s.name).sort();
  } catch (e) {
    console.error("Failed to load skills:", e);
    _skillsCache = [];
  }
  return _skillsCache;
}

export async function openSkillModal(onConfirm: (skillName: string) => void) {
  const skills = await getSkills();

  let overlay = document.getElementById(
    "skillModalOverlay",
  ) as HTMLDivElement | null;
  if (!overlay) {
    overlay = document.createElement("div") as HTMLDivElement;
    overlay.id = "skillModalOverlay";
    overlay.className = "lang-modal-overlay";
    overlay.innerHTML = `
              <div class="lang-modal" role="dialog" aria-modal="true" aria-labelledby="skillModalTitle">
                  <h3 id="skillModalTitle">Add a Skill</h3>
                  <label for="skillSelect">Select Skill</label>
                  <select id="skillSelect">
                      <option value="">— Select a skill —</option>
                  </select>
                  <div class="lang-modal-actions" style="margin-top: 24px;">
                      <button type="button" class="lang-modal-cancel" id="skillModalCancel">Cancel</button>
                      <button type="button" class="lang-modal-confirm" id="skillModalConfirm">Add Skill</button>
                  </div>
              </div>`;
    document.body.appendChild(overlay);

    overlay
      .querySelector("#skillModalCancel")!
      .addEventListener("click", () => closeSkillModal());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeSkillModal();
    });
  }

  const select = overlay.querySelector("#skillSelect") as HTMLSelectElement;
  select.innerHTML =
    '<option value="">— Select a skill —</option>' +
    skills
      .map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`)
      .join("");

  select.value = "";

  const confirmBtn = overlay.querySelector("#skillModalConfirm")!;
  const newConfirm = confirmBtn.cloneNode(true);
  confirmBtn.parentNode!.replaceChild(newConfirm, confirmBtn);
  newConfirm.addEventListener("click", () => {
    const skill = (overlay!.querySelector("#skillSelect") as HTMLSelectElement)
      .value;
    if (!skill) {
      showToast("Please select a skill.", "error");
      return;
    }
    closeSkillModal();
    onConfirm(skill);
  });

  requestAnimationFrame(() => overlay!.classList.add("is-open"));
}

export function closeSkillModal() {
  const overlay = document.getElementById("skillModalOverlay");
  if (overlay) {
    overlay.classList.remove("is-open");
  }
}

// ─── Organization Modal ───
export function getOrCreateOrgModal(): HTMLElement {
  const existingModal = document.getElementById("orgSearchModal");
  if (existingModal) return existingModal;

  const modal = document.createElement("div");
  modal.id = "orgSearchModal";
  modal.className = "org-modal-overlay";
  modal.hidden = true;
  modal.innerHTML = `
              <div class="org-modal-card">
                  <div class="org-modal-header">
                      <h3>Select an Organisation</h3>
                      <button type="button" class="org-modal-close js-close-org-modal" aria-label="Close">&times;</button>
                  </div>
                  <div class="org-modal-body">
                      <div class="org-search-wrapper">
                          <input type="text" id="orgSearchInput" placeholder="Search..." autocomplete="off" />
                      </div>
                      <ul id="orgSearchResults" class="org-results-list" hidden></ul>
                  </div>
              </div>`;
  document.body.appendChild(modal);

  const closeBtn = $(".js-close-org-modal", modal);
  if (closeBtn) closeBtn.addEventListener("click", () => closeOrgModal());

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeOrgModal();
  });

  const input = $("#orgSearchInput", modal) as HTMLInputElement | null;
  if (input) {
    input.addEventListener("input", (e) => {
      const query = (e.target as HTMLInputElement).value.trim();
      if (orgSearchDebounceTimer) window.clearTimeout(orgSearchDebounceTimer);

      if (query.length < 2) {
        const resultsList = $("#orgSearchResults", modal);
        if (resultsList) {
          resultsList.innerHTML = "";
          resultsList.hidden = true;
        }
        return;
      }

      orgSearchDebounceTimer = window.setTimeout(() => {
        fetchOrganizations(query);
      }, 300);
    });
  }
  return modal;
}

export function openOrgModal(slotElement: HTMLElement) {
  if (!slotElement) return;
  targetSlotForModal = slotElement;

  const slotType = slotElement.dataset.cardSlot || "company-card";
  const config = SLOT_MAPPING[slotType] || SLOT_MAPPING["company-card"];

  const modal = getOrCreateOrgModal();
  const titleEl = modal.querySelector(".org-modal-header h3");
  if (titleEl) titleEl.textContent = config.title;

  const input = $("#orgSearchInput", modal) as HTMLInputElement | null;
  if (input) {
    input.value = "";
    input.placeholder = config.placeholder;
  }

  const results = $("#orgSearchResults", modal);
  if (results) {
    results.innerHTML = "";
    results.hidden = true;
  }

  modal.hidden = false;
  modal.style.display = "flex";

  setTimeout(() => input?.focus(), 50);
}

export function closeOrgModal() {
  const modal = document.getElementById("orgSearchModal");
  if (modal) {
    modal.hidden = true;
    modal.style.display = "none";
    modal.classList.remove("is-visible", "show", "active");
  }
}

export async function fetchOrganizations(query: string) {
  if (!targetSlotForModal) return;
  const slotType = targetSlotForModal.dataset.cardSlot || "company-card";
  const config = SLOT_MAPPING[slotType] || SLOT_MAPPING["company-card"];

  const modal = document.getElementById("orgSearchModal");
  if (!modal) return;
  const resultsList = $("#orgSearchResults", modal);
  if (!resultsList) return;

  try {
    resultsList.innerHTML = '<li class="org-result-loading">Searching...</li>';
    resultsList.hidden = false;

    const data = await searchEntities(config.searchEndpoint, query);

    resultsList.innerHTML = "";

    if (!data || data.length === 0) {
      resultsList.innerHTML =
        '<li class="org-result-empty">No results found</li>';
      return;
    }

    data.forEach((item: any) => {
      const li = document.createElement("li");
      li.className = "org-result-item";

      const displayText = item[config.displayProp] || "";

      li.innerHTML = `
                  <div class="org-item-name">${escapeHtml(displayText)}</div>
              `;
      li.addEventListener("click", () => selectOrganization(item.id));
      resultsList.appendChild(li);
    });
  } catch (err) {
    console.error("Erreur lors de la recherche :", err);
    resultsList.innerHTML =
      '<li class="org-result-error">Erreur de chargement</li>';
  }
}

export async function selectOrganization(orgId: string) {
  const slotToUpdate = targetSlotForModal;

  if (!slotToUpdate) {
    console.error("Erreur : Aucun emplacement (slot) valide n'a été trouvé.");
    showToast("Error: slot not found.", "error");
    closeOrgModal();
    return;
  }

  const slotType = slotToUpdate.dataset.cardSlot || "company-card";
  const config = SLOT_MAPPING[slotType] || SLOT_MAPPING["company-card"];

  targetSlotForModal = null;
  closeOrgModal();
  showToast("Loading card...");

  try {
    const entryCard = slotToUpdate.closest(".entry-card");
    if (entryCard) {
      entryCard.setAttribute("data-dirty", "true");
      try {
        if (slotType === "company-card") {
          const el = entryCard.querySelector(".exp-company");
          const org = await organizationService.getById(orgId);
          if (el && org) el.textContent = org.name;
        } else if (slotType === "university-card") {
          const el = entryCard.querySelector(".edu-university");
          const org = await organizationService.getById(orgId);
          if (el && org) el.textContent = org.name;
        } else if (slotType === "degree-card") {
          const el = entryCard.querySelector(".edu-degree");
          const deg = await degreeService.getById(orgId);
          if (el && deg) el.textContent = deg.name;
        } else if (slotType === "role-card") {
          const el =
            entryCard.querySelector<HTMLInputElement>(".exp-role-title");
          const job = await jobService.getById(orgId);
          if (el && job) el.value = job.title;
        } else if (slotType === "certification-card") {
          const el = entryCard.querySelector(".cert-name");
          const cert = await certificationService.getById(orgId);
          if (el && cert) el.textContent = cert.name;
          if (cert?.issuing_organization_id) {
            const issuerEl = entryCard.querySelector(".cert-issuer");
            const org = await organizationService.getById(
              cert.issuing_organization_id,
            );
            if (issuerEl && org) issuerEl.textContent = org.name;
          }
        }
      } catch (err) {
        console.warn("Failed to update text field for selected card:", err);
      }
    }

    if (slotType === "role-card") {
      (async () => {
        try {
          const job = await jobService.getById(orgId);
          const currentEntryCard = slotToUpdate.closest(".entry-card");
          if (currentEntryCard) {
            const skillsSection =
              currentEntryCard.querySelector(".entry-skills");
            if (skillsSection) {
              skillsSection.classList.add("is-visible");

              const chipRow = skillsSection.querySelector(
                "[data-selectable-skills]",
              );
              const countEl = skillsSection.querySelector("small");

              if (chipRow) {
                chipRow.innerHTML = "";
                const tools: string[] = job?.tools_and_tech || [];
                tools.forEach((tool) => {
                  const btn = document.createElement("button");
                  btn.className = "chip is-outline is-selectable";
                  btn.type = "button";
                  btn.textContent = tool;
                  chipRow.appendChild(btn);
                });
              }
              if (countEl) {
                countEl.textContent = "0/5 selected";
              }
            }
          }
        } catch (err) {
          console.error(
            "Erreur lors de la récupération des tools & tech du rôle :",
            err,
          );
        }
      })();
    }

    await fetchAndRenderCardSlot(slotToUpdate, slotType, orgId);
    showToast(config.toastSuccess);
    updateProfileMetaSummary();
    scheduleAutosave();
  } catch (err) {
    console.error("Erreur sélection organisation :", err);
    showToast("Failed to update the card.", "error");
  }
}

export async function resolveAndSetSlotMetadata(
  slot: HTMLElement,
  slotType: string,
  entityId: string,
) {
  try {
    if (slotType === "company-card" || slotType === "university-card") {
      const org = await organizationService.getById(entityId);
      if (org) {
        slot.dataset.entityName = org.name;
        if (org.city_id) {
          const city = await cityService.getById(org.city_id);
          if (city && city.country_id) {
            const country = await countryService.getById(city.country_id);
            if (country) {
              slot.dataset.countryName = country.name;
            }
          }
        }
      }
    } else if (slotType === "product-card" || slotType === "brand-card") {
      const subj = await subjectService.getById(entityId);
      if (subj) slot.dataset.entityName = subj.name;
    } else if (slotType === "role-card") {
      const job = await jobService.getById(entityId);
      if (job) slot.dataset.entityName = job.title;
    } else if (slotType === "degree-card") {
      const deg = await degreeService.getById(entityId);
      if (deg) slot.dataset.entityName = deg.name;
    } else if (slotType === "certification-card") {
      const cert = await certificationService.getById(entityId);
      if (cert) slot.dataset.entityName = cert.name;
    } else if (slotType === "client-card") {
      const ind = await industryService.getById(entityId);
      if (ind) slot.dataset.entityName = ind.name;
    }
  } catch (err) {
    console.warn("[resolveAndSetSlotMetadata] Failed:", err);
  }
}

export async function fetchAndRenderCardSlot(
  slotToUpdate: HTMLElement,
  slotType: string,
  entityId: string,
) {
  if (!entityId || !slotToUpdate) return;

  await resolveAndSetSlotMetadata(slotToUpdate, slotType, entityId);

  if (slotType === "company-card") slotToUpdate.dataset.orgId = entityId;
  else if (slotType === "product-card" || slotType === "brand-card")
    slotToUpdate.dataset.productId = entityId;
  else if (slotType === "role-card") slotToUpdate.dataset.roleId = entityId;
  else if (slotType === "client-card")
    slotToUpdate.dataset.industryId = entityId;
  else if (slotType === "university-card")
    slotToUpdate.dataset.universityId = entityId;
  else if (slotType === "degree-card") slotToUpdate.dataset.degreeId = entityId;
  else if (slotType === "certification-card")
    slotToUpdate.dataset.certificationId = entityId;

  const config = SLOT_MAPPING[slotType];
  if (!config) return;

  slotToUpdate.classList.remove("is-filled");
  slotToUpdate.classList.add("is-loading");
  slotToUpdate.innerHTML =
    '<div class="skeleton-loader skeleton-card" style="height: 100%; min-height: inherit; border-radius: 14px;"></div>';

  try {
    const htmlCard = await fetchCardHtml(slotType, entityId);

    if (!htmlCard) {
      slotToUpdate.classList.remove("is-loading");
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
      slotToUpdate.innerHTML = placeholderText;
      return;
    }

    slotToUpdate.classList.remove("is-loading");
    slotToUpdate.classList.add("is-filled");

    const iframe = document.createElement("iframe");
    iframe.className = "org-card-frame";
    iframe.srcdoc = `
              <html>
              <head>
                  <style>
                      html, body {
                          margin: 0;
                          padding: 0;
                          overflow: hidden;
                          font-family: "Plus Jakarta Sans", system-ui, sans-serif;
                      }
                      .scale-wrap {
                          position: absolute;
                          top: 0;
                          left: 0;
                          transform-origin: top left;
                          width: var(--card-width, 500px);
                      }
                      .main-card {
                          height: 100% !important;
                          box-sizing: border-box;
                      }
                      .footer-row {
                          margin-top: auto !important;
                      }
                  </style>
              </head>
              <body>
                  <div class="scale-wrap" id="scaleWrap">${htmlCard}</div>
              </body>
              </html>
          `;

    iframe.addEventListener("load", () => {
      alignCardsHeight(slotToUpdate.closest<HTMLElement>(".backend-grid"));
      updateProfileMetaSummary();
    });

    slotToUpdate.innerHTML = "";
    slotToUpdate.appendChild(iframe);

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "slot-clear-btn";
    clearBtn.innerHTML = "×";
    clearBtn.title = "Remove card";
    slotToUpdate.appendChild(clearBtn);

    updateProfileMetaSummary();
  } catch (err) {
    slotToUpdate.classList.remove("is-loading");
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
    slotToUpdate.innerHTML = placeholderText;

    console.error(
      "Erreur récupération carte HTML pour le slot :",
      slotType,
      err,
    );
  }
}
