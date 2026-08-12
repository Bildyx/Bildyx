import {
  userService,
  profileService,
  organizationService,
  degreeService,
  certificationService,
} from "./services";
import { setCurrentProfile } from "./state";
import {
  formatLanguageLabel,
  formatProficiency,
  fetchAndRenderCardSlot,
} from "./modals";
import { $, $$ } from "../helpers";
import {
  showToast,
  escapeHtml,
  updateWordCounter,
  setField,
  getSession,
} from "../profile";

export function alignCardsHeight(grid: HTMLElement | null) {
  if (!grid) return;

  const slots = $$(".backend-slot.is-filled", grid);
  if (slots.length === 0) return;

  slots.forEach((slot) => {
    const iframe = slot.querySelector("iframe");
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      const wrap = doc?.getElementById("scaleWrap");
      if (!wrap) return;

      wrap.style.height = "auto";
      const mainCard = wrap.querySelector<HTMLElement>(".main-card");
      if (mainCard) {
        mainCard.style.setProperty("height", "auto", "important");
      }

      const cardWidth = wrap.offsetWidth || 500;
      const cardHeight = wrap.scrollHeight || 400;
      const containerWidth = slot.clientWidth || iframe.clientWidth || 250;

      const padding = 16;
      const availableWidth = containerWidth - padding;
      const scale = Math.min(availableWidth / cardWidth, 1);
      const scaledHeight = cardHeight * scale;
      const requiredHeight = scaledHeight + padding;

      slot.style.minHeight = "auto";
      slot.style.height = `${requiredHeight}px`;
      iframe.style.height = `${requiredHeight}px`;

      const heightNeeded = (requiredHeight - padding) / scale;
      wrap.style.height = `${heightNeeded}px`;

      wrap.style.transform = `scale(${scale})`;
      wrap.style.top = `${padding / 2}px`;
      wrap.style.left = `${(containerWidth - cardWidth * scale) / 2}px`;

      if (mainCard) {
        mainCard.style.setProperty("height", "100%", "important");
      }
    } catch (err) {
      console.error("Erreur lors de la mesure de la carte :", err);
    }
  });
}

export async function loadUserData() {
  try {
    const session = getSession();
    if (!session?.userId) return;

    // 1. Récupération parallèle de l'utilisateur et du profil AGRÉGÉ
    const [user, fullProfile] = await Promise.all([
      userService.getById(session.userId),
      profileService.getFullProfileByUserId(session.userId),
    ]);

    if (!user || !fullProfile) return;

    setCurrentProfile(fullProfile);

    const displayName =
      fullProfile.display_name ||
      [fullProfile.first_name, fullProfile.last_name]
        .filter(Boolean)
        .join(" ") ||
      user.email;

    setField("name", displayName);

    const avatarEl = document.getElementById("profileAvatar");
    if (avatarEl) {
      if (fullProfile.avatar_url) {
        avatarEl.style.backgroundImage = `url('${fullProfile.avatar_url}')`;
        avatarEl.style.backgroundSize = "cover";
        avatarEl.style.backgroundPosition = "center";
        avatarEl.textContent = "";
      } else {
        avatarEl.style.backgroundImage = "";
        avatarEl.textContent =
          [fullProfile.first_name?.[0], fullProfile.last_name?.[0]]
            .filter(Boolean)
            .join("")
            .toUpperCase() || "?";
      }
    }

    setField("summary", fullProfile.biography || "");
    setField("role", fullProfile.role || "");

    // const locationEl = document.querySelector(".location-line");
    // if (locationEl) {
    //   locationEl.textContent = meta.location
    //     ? `⌾ ${meta.location}`
    //     : "⌾ Add location...";
    // }

    // 2. Rendu ultra-rapide en utilisant les données déjà présentes dans fullProfile
    renderLanguages(fullProfile.languages || []);
    renderSkills(fullProfile.skills || []);
    await renderExperiences(fullProfile.experiences || []);
    await renderEducations(fullProfile.educations || []);
    await renderCertifications(fullProfile.certifications || []);
  } catch (err) {
    console.error("[profile.ts] Load profile error:", err);
    showToast("Failed to load user profile.", "error");
  }
}

export function renderLanguages(userLangs: any[]) {
  const langRow = document.getElementById("languageChips");
  if (!langRow) return;
  langRow
    .querySelectorAll(".chip, .skeleton-loader")
    .forEach((c) => c.remove());

  const fragment = document.createDocumentFragment();

  userLangs.forEach((ul) => {
    let levelClass = "";
    const prof = ul.proficiency || "FLUENT";
    if (prof === "NATIVE") levelClass = "is-native";
    else if (prof === "FLUENT") levelClass = "is-fluent";
    else if (prof === "CONVERSATIONAL" || prof === "PROFESSIONAL")
      levelClass = "is-intermediate";

    const text = formatLanguageLabel(ul.language);

    const chip = document.createElement("span");
    chip.className = `chip is-filled ${levelClass}`.trim();
    chip.dataset.id = ul.id;
    chip.dataset.unsaved = "false";
    chip.innerHTML = `${escapeHtml(text)} <button type="button" aria-label="Remove ${escapeHtml(text)}">×</button>`;
    fragment.appendChild(chip);
  });

  langRow.appendChild(fragment);
}

export function renderSkills(userSkills: any[]) {
  const skillRow = document.getElementById("skillChips");
  if (!skillRow) return;
  skillRow
    .querySelectorAll(".chip, .skeleton-loader")
    .forEach((c) => c.remove());

  const fragment = document.createDocumentFragment();

  userSkills.forEach((us) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.dataset.id = us.id;
    chip.dataset.unsaved = "false";
    const label = us.name || "Unknown Skill";
    chip.innerHTML = `${escapeHtml(label)} <button type="button" aria-label="Remove ${escapeHtml(label)}">×</button>`;
    fragment.appendChild(chip);
  });

  skillRow.appendChild(fragment);
}

export async function renderExperiences(experiences: any[]) {
  const list = document.getElementById("experienceList");
  if (!list) return;
  list.innerHTML = "";

  const userExperienceKeywords = new Set<string>();
  const userWorkOrgIds: string[] = [];

  if (experiences.length === 0) {
    list.innerHTML = '<p class="empty-message">No experiences added yet.</p>';
    sessionStorage.setItem("user_experience_keywords", JSON.stringify([]));
    sessionStorage.setItem("user_work_org_ids", JSON.stringify([]));
    return;
  }

  // Pré-résolution parallèle des noms d'organisations
  const uiExperiences = await Promise.all(
    experiences.map(async (exp) => {
      let companyName = "";
      if (exp.organization_id) {
        userWorkOrgIds.push(exp.organization_id);
        try {
          const org = await organizationService.getById(exp.organization_id);
          if (org) {
            companyName = org.name;
            if (Array.isArray(org.services)) {
              org.services.forEach((s: any) => {
                if (s) userExperienceKeywords.add(s.toLowerCase().trim());
              });
            }
          }
        } catch (_) {}
      }

      return {
        id: exp.id,
        company: companyName,
        companyId: exp.organization_id || "",
        productId: "",
        role: exp.title || "",
        roleId: exp.job_id || "",
        startYear: exp.start_year || "",
        endYear: exp.end_year || "",
        current: !!exp.current,
        summary: exp.description || "",
      };
    }),
  );

  sessionStorage.setItem(
    "user_experience_keywords",
    JSON.stringify(Array.from(userExperienceKeywords)),
  );
  sessionStorage.setItem("user_work_org_ids", JSON.stringify(userWorkOrgIds));

  uiExperiences.forEach((exp, i) => {
    const article = document.createElement("article");
    article.className = "entry-card";
    article.dataset.entry = "experience";
    article.dataset.id = exp.id;
    article.dataset.unsaved = "false";
    article.innerHTML = `
              <div class="entry-toolbar">
                  <h3>Work Experience ${i + 1}</h3>
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
                                  <input type="number" class="start-year" placeholder="YYYY" min="1900" max="2099" value="${escapeHtml(String(exp.startYear))}" style="width: 110px;" />
                              </div>
                              <span style="align-self: flex-end; margin-bottom: 8px;">–</span>
                              <div style="display: flex; flex-direction: column; gap: 4px;">
                                  <label style="font-size: 0.85em; opacity: 0.8;">End Year</label>
                                  <input type="number" class="end-year" placeholder="YYYY" min="1900" max="2099" value="${escapeHtml(String(exp.endYear))}" style="width: 110px;" ${exp.current ? "disabled" : ""} />
                              </div>
                              <label class="current-label" style="margin-left: 12px; align-self: flex-end; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 6px; font-size: 0.95em; cursor: pointer; user-select: none;">
                                  <input type="checkbox" class="exp-current" ${exp.current ? "checked" : ""} /> Current
                              </label>
                          </div>
                          <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px;">
                              <label style="font-size: 0.85em; opacity: 0.8;">Role Title</label>
                              <input type="text" class="exp-role-title" placeholder="Add role title..." value="${escapeHtml(exp.role)}" style="width: 100%;" />
                          </div>
                      </div>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px;">
                      <label style="font-size: 0.85em; opacity: 0.8;">Work Summary</label>
                      <textarea maxlength="600" data-word-counter placeholder="Add work summary...">${escapeHtml(exp.summary)}</textarea>
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
      updateWordCounter(txt);
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

    if (exp.companyId) {
      const slot = article.querySelector<HTMLElement>(
        '[data-card-slot="company-card"]',
      );
      if (slot) fetchAndRenderCardSlot(slot, "company-card", exp.companyId);
    }
    if (exp.roleId) {
      const slot = article.querySelector<HTMLElement>(
        '[data-card-slot="role-card"]',
      );
      if (slot) fetchAndRenderCardSlot(slot, "role-card", exp.roleId);
    }
  });
}

export async function renderEducations(educations: any[]) {
  const list = document.getElementById("educationList");
  if (!list) return;
  list.innerHTML = "";

  if (educations.length === 0) {
    list.innerHTML = '<p class="empty-message">No degrees added yet.</p>';
    return;
  }

  // Résolution parallèle des noms de diplômes et d'universités
  const resolvedEdus = await Promise.all(
    educations.map(async (edu) => {
      let uniName = "";
      let degName = "";
      try {
        const [uni, deg] = await Promise.all([
          edu.organization_id
            ? organizationService.getById(edu.organization_id)
            : Promise.resolve(null),
          edu.degree_id
            ? degreeService.getById(edu.degree_id)
            : Promise.resolve(null),
        ]);
        if (uni) uniName = uni.name;
        if (deg) degName = deg.name;
      } catch (_) {}
      return { edu, uniName, degName };
    }),
  );

  const fragment = document.createDocumentFragment();

  resolvedEdus.forEach(({ edu, uniName, degName }) => {
    const article = document.createElement("article");
    article.className = "entry-card";
    article.dataset.entry = "education";
    article.dataset.id = edu.id;
    article.dataset.unsaved = "false";
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
                                      <input type="number" class="start-year" placeholder="YYYY" min="1900" max="2099" value="${escapeHtml(String(edu.start_year || ""))}" style="width: 110px;" />
                                  </div>
                                  <span style="align-self: flex-end; margin-bottom: 8px;">–</span>
                                  <div style="display: flex; flex-direction: column; gap: 4px;">
                                      <label style="font-size: 0.85em; opacity: 0.8;">End Year</label>
                                      <input type="number" class="end-year" placeholder="YYYY" min="1900" max="2099" value="${escapeHtml(String(edu.end_year || ""))}" style="width: 110px;" />
                                  </div>
                                  <label class="graduated-label" style="margin-left: 12px; align-self: flex-end; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 6px; font-size: 0.95em; cursor: pointer; user-select: none;">
                                      <input type="checkbox" class="edu-graduated" ${edu.graduated ? "checked" : ""} /> Graduated
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
    fragment.appendChild(article);

    const txt = article.querySelector("textarea");
    if (txt) {
      updateWordCounter(txt);
      txt.addEventListener("input", () => updateWordCounter(txt));
    }

    if (edu.organization_id) {
      const uniSlot = article.querySelector<HTMLElement>(
        '[data-card-slot="university-card"]',
      );
      if (uniSlot)
        fetchAndRenderCardSlot(uniSlot, "university-card", edu.organization_id);
    }
    if (edu.degree_id) {
      const degSlot = article.querySelector<HTMLElement>(
        '[data-card-slot="degree-card"]',
      );
      if (degSlot)
        fetchAndRenderCardSlot(degSlot, "degree-card", edu.degree_id);
    }
  });

  list.appendChild(fragment);
}

export async function renderCertifications(userCerts: any[]) {
  const grid =
    document.querySelector(".cert-grid") ||
    document.getElementById("certificationList");
  if (!grid) return;
  grid.innerHTML = "";

  if (userCerts.length === 0) {
    grid.innerHTML =
      '<p class="empty-message">No certifications added yet.</p>';
    return;
  }

  const resolvedCerts = await Promise.all(
    userCerts.map(async (uc) => {
      let certName = "";
      try {
        const cert = await certificationService.getById(uc.certification_id);
        if (cert) certName = cert.name;
      } catch (_) {}
      return { uc, certName };
    }),
  );

  const fragment = document.createDocumentFragment();

  resolvedCerts.forEach(({ uc, certName }) => {
    const article = document.createElement("article");
    article.className = "entry-card cert-card";
    article.dataset.entry = "certification";
    article.dataset.id = uc.id;
    article.dataset.unsaved = "false";
    article.innerHTML = `
                <div class="entry-toolbar">
                    <h3 class="cert-name" data-placeholder="New Certification">${escapeHtml(certName || "New Certification")}</h3>
                    <button class="entry-tool js-remove-entry" type="button" aria-label="Remove certification">×</button>
                </div>
                <div class="entry-body">
                    <div class="cert-date-row" style="display: flex; gap: 12px; margin-bottom: 12px;">
                        <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                            <label style="font-size: 0.85em; opacity: 0.8;">Obtained at</label>
                            <input type="date" class="cert-obtained-at" value="${uc.obtained_at ? new Date(uc.obtained_at).toISOString().split("T")[0] : ""}" style="width: 100%;" />
                        </div>
                        <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <label style="font-size: 0.85em; opacity: 0.8;">Expires at</label>
                                <label class="never-expire-label" style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.85em; cursor: pointer; user-select: none; opacity: 0.9;">
                                    <input type="checkbox" class="cert-never-expire" ${!uc.expires_at ? "checked" : ""} /> Never
                                </label>
                            </div>
                            <input type="date" class="cert-expires-at" value="${uc.expires_at ? new Date(uc.expires_at).toISOString().split("T")[0] : ""}" style="width: 100%;" ${!uc.expires_at ? "disabled" : ""} />
                        </div>
                    </div>
                    <div class="backend-grid">
                        <div class="backend-slot backend-slot--certification" data-card-slot="certification-card">Certification card</div>
                    </div>
                </div>
            `;
    fragment.appendChild(article);

    if (uc.certification_id) {
      const slot = article.querySelector<HTMLElement>(
        '[data-card-slot="certification-card"]',
      );
      if (slot)
        fetchAndRenderCardSlot(slot, "certification-card", uc.certification_id);
    }
  });

  grid.appendChild(fragment);
}
