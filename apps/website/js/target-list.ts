import { getSession } from "./helpers";
import { OrganizationService } from "../services/organization.service";
import { CardService } from "../services/card.service";
import { EmployeeCountRange, OrganizationSubType } from "@prisma/client";

const WORK_FOR_SUBTYPES: Record<string, OrganizationSubType[]> = {
  companies: [
    "COMPANY",
    "PUBLIC_COMPANY",
    "SOE",
    "CLUB",
    "SOCIETY",
    "CHAMBER_OF_COMMERCE",
  ],
  government: [
    "GOVERNMENT",
    "STATE_GOVERNMENT",
    "CITY_GOVERNMENT",
    "CENTRAL_BANK",
    "COURT",
    "ARMY",
    "NATIONAL_AUDIT_OFFICE",
    "OMBUDSMAN",
  ],
  healthcare: ["HOSPITAL"],
  education: [
    "UNIVERSITY",
    "RESEARCH_INSTITUTE",
    "PRIMARY_SCHOOLS",
    "SECONDARY_SCHOOLS",
    "THINK_TANK",
  ],
  nonprofit: ["NON_PROFIT", "NGO", "FOUNDATION", "ASSOCIATION"],
  international: ["INTERNATIONAL_ORGANIZATION", "EMBASSY"],
  culture: ["MUSEUM", "NATIONAL_PARK", "PUBLIC_PARKS", "LIBRARY"],
};

const organizationService = new OrganizationService();
const cardService = new CardService();

const GOVERNMENT_SUBTYPES = [
  "GOVERNMENT",
  "STATE_GOVERNMENT",
  "CITY_GOVERNMENT",
  "CENTRAL_BANK",
  "COURT",
  "EMBASSY",
];

const PAGE_SIZE = 4;

type TargetType = "companies" | "government";
type MatchedOrg = {
  org: any;
  score: number;
  keywords: string[];
  matchCount: number;
};

// ─── Helpers: text / matching ────────────────────────────────

function normalizeText(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function toTextList(value: unknown) {
  if (Array.isArray(value)) return value.map(normalizeText).filter(Boolean);
  if (typeof value === "string")
    return value.split(/[;,|]/).map(normalizeText).filter(Boolean);
  return [];
}

function getOrgKeywords(org: any) {
  const meta = org.metadata || {};
  return Array.from(
    new Set(
      [
        ...toTextList(org.services),
        ...toTextList(meta.services),
        ...toTextList(org.products),
        ...toTextList(meta.products),
      ].filter(Boolean),
    ),
  );
}

function getOrgText(org: any) {
  const meta = org.metadata || {};
  return normalizeText(
    [
      org.name,
      org.display_name,
      org.title,
      org.city,
      meta.city,
      org.country,
      meta.country,
      org.location,
      meta.location,
      org.type,
      org.subtype,
      org.category,
      org.industry,
      meta.industries ? meta.industries.join(" ") : "",
      org.description,
      org.summary,
      ...getOrgKeywords(org),
    ].join(" "),
  );
}

// ─── Helpers: org classification ─────────────────────────────

function getWorkForGroup(org: any) {
  const text = getOrgText(org);
  const subtype = normalizeText(org.subtype);

  if (
    GOVERNMENT_SUBTYPES.includes(String(org.subtype || "")) ||
    subtype.includes("government") ||
    text.includes("government") ||
    text.includes("public service") ||
    text.includes("public sector") ||
    text.includes("embassy") ||
    text.includes("court")
  )
    return "government";

  if (
    text.includes("hospital") ||
    text.includes("healthcare") ||
    text.includes("health care") ||
    text.includes("medical") ||
    text.includes("clinic")
  )
    return "healthcare";

  if (
    text.includes("education") ||
    text.includes("research") ||
    text.includes("university") ||
    text.includes("school") ||
    text.includes("laboratory")
  )
    return "education";

  if (
    text.includes("non-profit") ||
    text.includes("nonprofit") ||
    text.includes("ngo") ||
    text.includes("community") ||
    text.includes("advocacy")
  )
    return "nonprofit";

  if (
    text.includes("international") ||
    text.includes("diplomatic") ||
    text.includes("united nations") ||
    text.includes("embassy")
  )
    return "international";

  if (
    text.includes("culture") ||
    text.includes("museum") ||
    text.includes("heritage") ||
    text.includes("park")
  )
    return "culture";

  return "companies";
}

// ─── Helpers: DOM / misc ──────────────────────────────────────

function getCheckedValues(name: string) {
  return Array.from(
    document.querySelectorAll<HTMLInputElement>(
      `[data-filter="${name}"]:checked`,
    ),
  ).map((i) => i.value);
}

function debounce(callback: () => void, delay = 350) {
  let timeoutId: number | undefined;
  return () => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(callback, delay);
  };
}

function alignCardHeight(slot: HTMLElement) {
  const iframe = slot.querySelector("iframe");
  if (!iframe) return;
  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    const wrap = doc?.getElementById("scaleWrap");
    if (!wrap) return;

    wrap.style.height = "auto";
    const mainCard = wrap.querySelector(".main-card") as HTMLElement | null;
    if (mainCard) mainCard.style.setProperty("height", "auto", "important");

    const cardWidth = wrap.offsetWidth || 500;
    const cardHeight = wrap.scrollHeight || 400;
    const containerWidth = slot.clientWidth || iframe.clientWidth || 250;
    const scale = Math.min(containerWidth / cardWidth, 1);
    const scaledHeight = cardHeight * scale;

    slot.style.minHeight = "auto";
    slot.style.height = `${scaledHeight}px`;
    iframe.style.height = `${scaledHeight}px`;
    wrap.style.height = `${scaledHeight / scale}px`;
    wrap.style.transform = `scale(${scale})`;
    wrap.style.top = "0px";
    wrap.style.left = `${(containerWidth - cardWidth * scale) / 2}px`;

    if (mainCard) mainCard.style.setProperty("height", "100%", "important");
  } catch (err) {
    console.error("[target-list] Error aligning card height:", err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const companiesRow = document.querySelector(
    '[data-target-list="companies"]',
  ) as HTMLElement | null;
  const cityInput = document.querySelector(
    "#targetCity",
  ) as HTMLInputElement | null;
  const countryInput = document.querySelector(
    "#targetCountry",
  ) as HTMLInputElement | null;
  const keywordInput = document.querySelector(
    "#targetKeyword",
  ) as HTMLInputElement | null;
  const resetFiltersButton = document.querySelector(
    "#resetTargetFilters",
  ) as HTMLButtonElement | null;

  const session = getSession();
  if (!session?.userId) {
    window.location.href = "login.php";
    return;
  }

  let allMatchedOrgs: MatchedOrg[] = [];
  let filteredCompanies: MatchedOrg[] = [];
  let currentCompaniesPage = 1;
  let userWorkOrgIds: string[] = [];
  const userExperienceKeywords = new Set<string>();

  // ─── Window Resize Alignment ─────────────────────────────
  window.addEventListener("resize", () => {
    const slots = Array.from(
      document.querySelectorAll<HTMLElement>(".backend-slot.is-filled"),
    );
    slots.forEach(alignCardHeight);
  });

  function setLoadingState() {
    const html =
      '<div class="backend-slot is-loading"><div class="skeleton-loader skeleton-card"></div></div><div class="backend-slot is-loading"><div class="skeleton-loader skeleton-card"></div></div>';
    if (companiesRow) {
      companiesRow.innerHTML = html;
      companiesRow.classList.remove("is-empty");
    }
  }

  async function loadCard(slot: HTMLElement, id: string, score: number) {
    try {
      const html = await cardService.getOrganization(id);
      slot.classList.remove("is-loading");
      slot.classList.add("is-filled");

      const iframe = document.createElement("iframe");
      iframe.className = "org-card-frame";
      iframe.srcdoc = `<html><head><style>html,body{margin:0;padding:0;overflow:hidden;font-family:"Plus Jakarta Sans",system-ui,sans-serif}.scale-wrap{position:absolute;top:0;left:0;transform-origin:top left;width:500px}.main-card{height:100%!important;box-sizing:border-box}.footer-row{margin-top:auto!important}</style></head><body><div class="scale-wrap" id="scaleWrap">${html}</div></body></html>`;
      iframe.addEventListener("load", () => alignCardHeight(slot));

      slot.innerHTML = "";
      slot.appendChild(iframe);

      const badge = document.createElement("span");
      badge.className = "tl-match-badge";
      badge.textContent = `${score}% Match`;
      slot.appendChild(badge);
    } catch (err: any) {
      console.warn(
        `[target-list.ts] Could not load card organization/${id}:`,
        err.message,
      );
      slot.classList.remove("is-loading");
      slot.classList.add("is-error");
      slot.textContent = "Failed to load card";
    }
  }

  function renderPage(type: TargetType, list: MatchedOrg[]) {
    const row = companiesRow;
    const pagination = document.querySelector(
      `[data-pagination-for="${type}"]`,
    ) as HTMLElement | null;
    if (!row) return;

    row.innerHTML = "";
    row.classList.remove("is-empty");

    const total = list.length;
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    const page = Math.min(currentCompaniesPage, totalPages);
    currentCompaniesPage = page;

    if (total === 0) {
      row.classList.add("is-empty");
      if (pagination) pagination.style.display = "none";
      return;
    }

    if (pagination) {
      pagination.style.display = totalPages > 1 ? "flex" : "none";
      const prev = pagination.querySelector(
        ".is-prev",
      ) as HTMLButtonElement | null;
      const next = pagination.querySelector(
        ".is-next",
      ) as HTMLButtonElement | null;
      const info = pagination.querySelector(
        ".tl-page-info",
      ) as HTMLElement | null;
      if (prev) prev.disabled = page <= 1;
      if (next) next.disabled = page >= totalPages;
      if (info) info.textContent = `Page ${page} of ${totalPages}`;
    }

    list
      .slice((page - 1) * PAGE_SIZE, (page - 1) * PAGE_SIZE + PAGE_SIZE)
      .forEach(({ org, score }) => {
        if (!org.id) return;
        const slot = document.createElement("div");
        slot.className = "backend-slot is-loading";
        slot.innerHTML = '<div class="skeleton-loader skeleton-card"></div>';
        row.appendChild(slot);
        loadCard(slot, org.id, score);
      });
  }

  function updateFilterCounts() {
    ["size", "products", "workFor"].forEach((name) => {
      const counter = document.querySelector(
        `[data-filter-count="${name}"]`,
      ) as HTMLElement | null;
      if (counter) {
        const count = getCheckedValues(name).length;
        counter.textContent = count ? `(${count})` : "";
      }
    });
  }

  function matchesProductFilter(item: MatchedOrg, selected: string[]) {
    if (selected.length === 0) return true;
    const exact = item.matchCount > 0;
    const partial = item.keywords.some((k) =>
      Array.from(userExperienceKeywords).some(
        (u) =>
          k.includes(u) ||
          u.includes(k) ||
          k.split(" ").some((p) => p.length > 3 && u.includes(p)),
      ),
    );
    return selected.some((f) =>
      f === "same"
        ? exact
        : f === "similar"
          ? exact || partial
          : f === "different"
            ? !exact
            : true,
    );
  }

  async function performSearch() {
    setLoadingState();
    updateFilterCounts();

    try {
      const workForSelected = getCheckedValues("workFor");
      const subtypes = workForSelected.flatMap(
        (group) => WORK_FOR_SUBTYPES[group] || [],
      );

      const filters = {
        city: normalizeText(cityInput?.value || ""),
        country: normalizeText(countryInput?.value || ""),
        keyword: normalizeText(keywordInput?.value || ""),
        sizes: getCheckedValues("sizes") as EmployeeCountRange[],
        products: getCheckedValues("products"),
        workFor: workForSelected,
        subtypes,
      };
      console.log("FILTERS:", filters);
      const orgs = await organizationService.getAll(filters as any);

      allMatchedOrgs = orgs
        .map((org: any) => {
          if (!org.id || userWorkOrgIds.includes(org.id)) return null;
          const keywords = getOrgKeywords(org);
          const matchCount = keywords.filter((k) =>
            userExperienceKeywords.has(k),
          ).length;
          const score =
            keywords.length > 0
              ? Math.round((matchCount / keywords.length) * 100)
              : 0;
          return { org, score, keywords, matchCount };
        })
        .filter(
          (x: any): x is MatchedOrg =>
            x !== null && (x.score > 0 || userExperienceKeywords.size === 0),
        );

      filteredCompanies = allMatchedOrgs
        .filter((item) => {
          const org = item.org;
          const text = getOrgText(org);

          if (filters.keyword && !text.includes(filters.keyword)) return false;
          if (
            filters.workFor.length &&
            !filters.workFor.includes(getWorkForGroup(org))
          )
            return false;
          if (!matchesProductFilter(item, filters.products)) return false;

          return true;
        })
        .sort((a, b) => b.score - a.score);
      currentCompaniesPage = 1;
      renderPage("companies", filteredCompanies);
    } catch (err) {
      console.error("Failed to load target list data:", err);
      allMatchedOrgs = [];
      filteredCompanies = [];
      currentCompaniesPage = 1;
      renderPage("companies", filteredCompanies);
    }
  }

  function setupDropdowns() {
    document
      .querySelectorAll<HTMLElement>("[data-filter-dropdown]")
      .forEach((dropdown) => {
        const toggle = dropdown.querySelector<HTMLButtonElement>(
          "[data-filter-toggle]",
        );
        const panel = dropdown.querySelector<HTMLElement>(
          "[data-filter-panel]",
        );
        if (!toggle || !panel) return;

        toggle.addEventListener("click", (e) => {
          e.stopPropagation();
          document
            .querySelectorAll<HTMLElement>("[data-filter-panel].is-open")
            .forEach((p) => {
              if (p !== panel) p.classList.remove("is-open");
            });
          document
            .querySelectorAll<HTMLButtonElement>("[data-filter-toggle].is-open")
            .forEach((t) => {
              if (t !== toggle) {
                t.classList.remove("is-open");
                t.setAttribute("aria-expanded", "false");
              }
            });
          const open = panel.classList.toggle("is-open");
          toggle.classList.toggle("is-open", open);
          toggle.setAttribute("aria-expanded", String(open));
        });
        panel.addEventListener("click", (e) => e.stopPropagation());
      });

    document.addEventListener("click", () => {
      document
        .querySelectorAll<HTMLElement>("[data-filter-panel].is-open")
        .forEach((p) => p.classList.remove("is-open"));
      document
        .querySelectorAll<HTMLButtonElement>("[data-filter-toggle].is-open")
        .forEach((t) => {
          t.classList.remove("is-open");
          t.setAttribute("aria-expanded", "false");
        });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      document
        .querySelectorAll<HTMLElement>("[data-filter-panel].is-open")
        .forEach((p) => p.classList.remove("is-open"));
    });
  }

  function setupPaginationListeners(type: TargetType) {
    const pagination = document.querySelector(
      `[data-pagination-for="${type}"]`,
    );
    if (!pagination) return;

    pagination.querySelector(".is-prev")?.addEventListener("click", () => {
      if (type === "companies" && currentCompaniesPage > 1) {
        currentCompaniesPage--;
        renderPage("companies", filteredCompanies);
      }
    });

    pagination.querySelector(".is-next")?.addEventListener("click", () => {
      if (
        type === "companies" &&
        currentCompaniesPage < Math.ceil(filteredCompanies.length / PAGE_SIZE)
      ) {
        currentCompaniesPage++;
        renderPage("companies", filteredCompanies);
      }
    });
  }

  setupDropdowns();
  setupPaginationListeners("companies");

  const debouncedSearch = debounce(performSearch, 350);
  const debouncedKeywordSearch = debounce(performSearch, 250);

  document
    .querySelectorAll<HTMLInputElement>("[data-filter]")
    .forEach((i) => i.addEventListener("change", performSearch));

  cityInput?.addEventListener("input", debouncedSearch);
  countryInput?.addEventListener("input", debouncedSearch);
  keywordInput?.addEventListener("input", debouncedKeywordSearch);

  [cityInput, countryInput, keywordInput].forEach((input) =>
    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        performSearch();
      }
    }),
  );

  resetFiltersButton?.addEventListener("click", () => {
    if (cityInput) cityInput.value = "";
    if (countryInput) countryInput.value = "";
    if (keywordInput) keywordInput.value = "";
    document
      .querySelectorAll<HTMLInputElement>("[data-filter]")
      .forEach((i) => (i.checked = false));
    performSearch();
  });

  // ─── Initial load ─────────────────────────────────────────
  try {
    const cachedKeywords = sessionStorage.getItem("user_experience_keywords");
    const cachedWorkOrgIds = sessionStorage.getItem("user_work_org_ids");

    if (cachedKeywords && cachedWorkOrgIds) {
      JSON.parse(cachedKeywords).forEach((k: string) =>
        userExperienceKeywords.add(k),
      );
      userWorkOrgIds = JSON.parse(cachedWorkOrgIds);
    }
  } catch (err) {
    console.error("Failed to read cached target list data:", err);
  }

  await performSearch();
});
