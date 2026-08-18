import { getSession } from "./helpers";
import { CardService } from "../services/card.service";
import { EmployeeCountRange, OrganizationSubType } from "@prisma/client";
import { getRPCClient } from "@repo/api-client";

const rpc = getRPCClient("http://localhost:3000");
const cardService = new CardService();

const PAGE_SIZE = 6;

type TargetRow = {
  id: string;
  subject_id?: string | null;
  match_category?: "same" | "similar" | "different";
  [key: string]: any;
};

// ─── Scale iframe to fit slot (comme profile.php) ────────────────────────────

function scaleCardInSlot(slot: HTMLElement) {
  const iframe = slot.querySelector("iframe");
  if (!iframe) return;
  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    const wrap = doc?.getElementById("scaleWrap");
    if (!wrap) return;

    wrap.style.height = "auto";
    const mainCard = wrap.querySelector<HTMLElement>(".main-card");
    if (mainCard) mainCard.style.setProperty("height", "auto", "important");

    const cardWidth = wrap.offsetWidth || 500;
    const cardHeight = wrap.scrollHeight || 400;
    const containerWidth = slot.clientWidth || 300;
    const padding = 16;
    const availableWidth = containerWidth - padding;
    const scale = Math.min(availableWidth / cardWidth, 1);
    const scaledHeight = cardHeight * scale;
    const requiredHeight = scaledHeight + padding;

    slot.style.height = `${requiredHeight}px`;
    iframe.style.height = `${requiredHeight}px`;

    const heightNeeded = (requiredHeight - padding) / scale;
    wrap.style.height = `${heightNeeded}px`;
    wrap.style.transform = `scale(${scale})`;
    wrap.style.top = `${padding / 2}px`;
    wrap.style.left = `${(containerWidth - cardWidth * scale) / 2}px`;

    if (mainCard) mainCard.style.setProperty("height", "100%", "important");
  } catch (err) {
    console.error("scaleCardInSlot error:", err);
  }
}

// ─── Helpers DOM ──────────────────────────────────────────────

function getCheckedValues(name: string): string[] {
  return Array.from(
    document.querySelectorAll<HTMLInputElement>(
      `[data-filter="${name}"]:checked`,
    ),
  ).map((i) => i.value);
}

function debounce(fn: () => void, ms = 350) {
  let t: number | undefined;
  return () => {
    window.clearTimeout(t);
    t = window.setTimeout(fn, ms);
  };
}

// ─── Loaders de cartes ───────────────────────────────────────

async function loadOrgCard(slot: HTMLElement, id: string) {
  try {
    const html = await cardService.getOrganization(id);
    slot.classList.remove("is-loading");
    slot.classList.add("is-filled");
    const iframe = document.createElement("iframe");
    iframe.className = "org-card-frame";
    iframe.style.pointerEvents = "none";
    iframe.srcdoc = `<html><head><style>html,body{margin:0;padding:0;overflow:hidden;font-family:"Plus Jakarta Sans",system-ui,sans-serif}.scale-wrap{position:absolute;top:0;left:0;transform-origin:top left;width:500px}.main-card{height:100%!important;box-sizing:border-box}.footer-row{margin-top:auto!important}</style></head><body><div class="scale-wrap" id="scaleWrap">${html}</div></body></html>`;
    iframe.addEventListener("load", () => scaleCardInSlot(slot));
    slot.innerHTML = "";
    slot.appendChild(iframe);
  } catch {
    slot.classList.remove("is-loading");
    slot.classList.add("is-error");
    slot.textContent = "Failed to load";
  }
}

async function loadSubjectCard(slot: HTMLElement, id: string) {
  try {
    const html = await cardService.getSubject(id);
    slot.classList.remove("is-loading");
    slot.classList.add("is-filled");
    const iframe = document.createElement("iframe");
    iframe.className = "org-card-frame";
    iframe.srcdoc = `<html><head><style>html,body{margin:0;padding:0;overflow:hidden;font-family:"Plus Jakarta Sans",system-ui,sans-serif}.scale-wrap{position:absolute;top:0;left:0;transform-origin:top left;width:500px}.main-card{height:100%!important;box-sizing:border-box}.footer-row{margin-top:auto!important}</style></head><body><div class="scale-wrap" id="scaleWrap">${html}</div></body></html>`;
    iframe.addEventListener("load", () => scaleCardInSlot(slot));
    slot.innerHTML = "";
    slot.appendChild(iframe);
  } catch {
    slot.classList.remove("is-loading");
    slot.classList.add("is-error");
    slot.textContent = "Failed to load";
  }
}

// ─── Render d'une section (Same / Similar / Different) ──────────────────────

function renderSection(
  container: HTMLElement,
  category: "same" | "similar" | "different",
  orgs: TargetRow[],
) {
  const section = document.createElement("div");
  section.className = "tl-match-section";
  section.dataset.category = category;

  // ── Title display in English ──
  let label = "";
  if (category === "same") {
    label = "Same";
  } else if (category === "similar") {
    label = "Similar";
  } else {
    label = "Different";
  }

  // ── Header de section ──
  const header = document.createElement("div");
  header.className = "tl-match-section__header";
  header.innerHTML = `
    <h2 class="tl-match-section__title">${label}</h2>
    <span class="tl-match-section__count">${orgs.length}</span>
  `;
  section.appendChild(header);

  // ── Body ──
  const body = document.createElement("div");
  body.className = "tl-match-section__body";

  if (orgs.length === 0) {
    body.innerHTML = `<p class="tl-no-results">No results in this category</p>`;
  } else {
    orgs.forEach((row) => {
      const rowEl = document.createElement("div");
      rowEl.className = "tl-company-row";

      const orgSlot = document.createElement("div");
      orgSlot.className = "backend-slot is-loading";
      orgSlot.innerHTML = '<div class="skeleton-loader skeleton-card"></div>';

      // ── Ajout du clic vers le site web ──
      const url = row.website_url || row.website;
      if (url) {
        orgSlot.style.cursor = "pointer";
        orgSlot.title = `Open ${url}`;
        orgSlot.addEventListener("click", () => {
          const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
          window.open(formattedUrl, "_blank", "noopener,noreferrer");
        });
      }

      rowEl.appendChild(orgSlot);
      loadOrgCard(orgSlot, row.id);

      const subjSlot = document.createElement("div");
      subjSlot.className = "backend-slot is-loading";
      subjSlot.innerHTML = '<div class="skeleton-loader skeleton-card"></div>';
      rowEl.appendChild(subjSlot);

      if (row.subject_id) {
        loadSubjectCard(subjSlot, row.subject_id);
      } else {
        subjSlot.classList.remove("is-loading");
        subjSlot.classList.add("is-empty-slot");
        subjSlot.textContent = "No subject";
      }

      body.appendChild(rowEl);
    });
  }

  section.appendChild(body);
  container.appendChild(section);
}

// ─── Main ─────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
  const listEl = document.querySelector(
    '[data-target-list="companies"]',
  ) as HTMLElement | null;
  const cityInput = document.querySelector(
    "#targetCity",
  ) as HTMLInputElement | null;
  const countryInput = document.querySelector(
    "#targetCountry",
  ) as HTMLInputElement | null;
  const resetBtn = document.querySelector(
    "#resetTargetFilters",
  ) as HTMLButtonElement | null;

  const session = getSession();
  if (!session?.userId) {
    window.location.href = "login.php";
    return;
  }

  const profileId: string | null = session.profileId ?? null;

  window.addEventListener("resize", () => {
    document
      .querySelectorAll<HTMLElement>(".backend-slot.is-filled")
      .forEach(scaleCardInSlot);
  });

  function setLoading() {
    if (!listEl) return;
    listEl.innerHTML = `
      <div class="tl-match-section">
        <div class="tl-match-section__header tl-skeleton-header">
          <div class="skeleton-loader" style="width:200px;height:22px;border-radius:6px"></div>
        </div>
        <div class="tl-company-row">
          <div class="backend-slot is-loading"><div class="skeleton-loader skeleton-card"></div></div>
          <div class="backend-slot is-loading"><div class="skeleton-loader skeleton-card"></div></div>
        </div>
      </div>`;
    listEl.classList.remove("is-empty");
  }

  async function performSearch() {
    if (!profileId) {
      if (listEl)
        listEl.innerHTML = `<p class="tl-no-results">Sign in required to view targets.</p>`;
      return;
    }
    setLoading();

    const matchFilters = getCheckedValues("products");
    const workForSelected = getCheckedValues("workFor");
    const sizes = getCheckedValues("sizes") as EmployeeCountRange[];
    const subtypeFilter = workForSelected.flatMap(
      (g) => WORK_FOR_SUBTYPES[g] ?? [],
    ) as OrganizationSubType[];

    try {
      const params: Record<string, any> = {
        userProfileId: profileId,
        city: cityInput?.value?.trim() || undefined,
        country: countryInput?.value?.trim() || undefined,
        sizes: sizes.length ? sizes : undefined,
        subtypes: subtypeFilter.length ? subtypeFilter : undefined,
        matchFilter: matchFilters.length === 1 ? matchFilters[0] : undefined,
      };

      const all = (await (rpc as any).target_list.getTargets(
        params,
      )) as TargetRow[];

      if (!listEl) return;
      listEl.innerHTML = "";
      listEl.classList.remove("is-empty");

      // ── Grouper par catégorie ──────────────────────────────────────────────
      const groups: Record<"same" | "similar" | "different", TargetRow[]> = {
        same: [],
        similar: [],
        different: [],
      };
      all.forEach((row) => {
        const cat = row.match_category ?? "different";
        groups[cat as keyof typeof groups].push(row);
      });

      // ── Si un filtre est sélectionné, n'afficher que sa section ──────────
      const categoriesToShow: Array<"same" | "similar" | "different"> =
        matchFilters.length === 1
          ? [matchFilters[0] as "same" | "similar" | "different"]
          : ["same", "similar", "different"];

      let hasAny = false;
      categoriesToShow.forEach((cat) => {
        renderSection(listEl!, cat, groups[cat]);
        if (groups[cat].length > 0) hasAny = true;
      });

      if (!hasAny) {
        listEl.innerHTML = `<p class="tl-no-results">No results found.</p>`;
      }
    } catch (err) {
      console.error("[target-list] Search failed:", err);
      if (listEl)
        listEl.innerHTML = `<p class="tl-no-results">Error performing search.</p>`;
    }
  }

  // ─── Dropdown setup ──────────────────────────────────────────
  document
    .querySelectorAll<HTMLElement>("[data-filter-dropdown]")
    .forEach((dropdown) => {
      const toggle = dropdown.querySelector<HTMLButtonElement>(
        "[data-filter-toggle]",
      );
      const panel = dropdown.querySelector<HTMLElement>("[data-filter-panel]");
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

  const debouncedSearch = debounce(performSearch, 350);
  document
    .querySelectorAll<HTMLInputElement>("[data-filter]")
    .forEach((i) => i.addEventListener("change", performSearch));
  cityInput?.addEventListener("input", debouncedSearch);
  countryInput?.addEventListener("input", debouncedSearch);
  [cityInput, countryInput].forEach((input) =>
    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        performSearch();
      }
    }),
  );
  resetBtn?.addEventListener("click", () => {
    if (cityInput) cityInput.value = "";
    if (countryInput) countryInput.value = "";
    document
      .querySelectorAll<HTMLInputElement>("[data-filter]")
      .forEach((i) => (i.checked = false));
    performSearch();
  });

  await performSearch();
});

// ─── Subtypes map ─────────────────────────────────────────────
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
