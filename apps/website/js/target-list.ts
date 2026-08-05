import { getSession } from "./helpers";
import { OrganizationService } from "../services/organization.service";
import { CardService } from "../services/card.service";
import { UserProfileService } from "../services/user-profile.service";

const organizationService = new OrganizationService();
const cardService = new CardService();
const profileService = new UserProfileService();

function alignCardHeight(slot: HTMLElement) {
  const iframe = slot.querySelector("iframe");
  if (!iframe) return;
  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    const wrap = doc?.getElementById("scaleWrap");
    if (!wrap) return;

    wrap.style.height = "auto";
    const mainCard = wrap.querySelector(".main-card") as HTMLElement | null;
    if (mainCard) {
      mainCard.style.setProperty("height", "auto", "important");
    }

    const cardWidth = wrap.offsetWidth || 500;
    const cardHeight = wrap.scrollHeight || 400;
    const containerWidth = slot.clientWidth || iframe.clientWidth || 250;

    const scale = Math.min(containerWidth / cardWidth, 1);
    const scaledHeight = cardHeight * scale;

    slot.style.minHeight = "auto";
    slot.style.height = `${scaledHeight}px`;
    iframe.style.height = `${scaledHeight}px`;

    const heightNeeded = scaledHeight / scale;
    wrap.style.height = `${heightNeeded}px`;

    wrap.style.transform = `scale(${scale})`;
    wrap.style.top = `0px`;
    wrap.style.left = `${(containerWidth - cardWidth * scale) / 2}px`;

    if (mainCard) {
      mainCard.style.setProperty("height", "100%", "important");
    }
  } catch (err) {
    console.error("[target-list] Error aligning card height:", err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const companiesRow = document.querySelector(
    '[data-target-list="companies"]',
  ) as HTMLElement | null;
  const governmentRow = document.querySelector(
    '[data-target-list="government"]',
  ) as HTMLElement | null;
  const input = document.querySelector(
    "#targetCity",
  ) as HTMLInputElement | null;

  const session = getSession();
  if (!session?.userId) {
    window.location.href = "login.php";
    return;
  }

  const PAGE_SIZE = 4;
  let companiesList: any[] = [];
  let governmentList: any[] = [];
  let filteredCompanies: any[] = [];
  let filteredGovernment: any[] = [];
  let currentCompaniesPage = 1;
  let currentGovernmentPage = 1;

  // ─── Load Card Function ──────────────────────────────────
  async function loadCard(slot: HTMLElement, id: string, score: number) {
    try {
      const html = await cardService.getOrganization(id);

      slot.classList.remove("is-loading");
      slot.classList.add("is-filled");

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
                            width: 500px;
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
                    <div class="scale-wrap" id="scaleWrap">${html}</div>
                </body>
                </html>
            `;

      iframe.addEventListener("load", () => {
        alignCardHeight(slot);
      });

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
      slot.textContent = `⚠ Failed to load card`;
      slot.classList.add("is-error");
    }
  }

  // ─── Render Page Function ────────────────────────────────
  function renderPage(type: "companies" | "government", list: any[]) {
    const row = type === "companies" ? companiesRow : governmentRow;
    const pagination = document.querySelector(
      `[data-pagination-for="${type}"]`,
    ) as HTMLElement | null;
    if (!row) return;

    row.innerHTML = "";
    row.classList.remove("is-empty");

    const totalItems = list.length;
    const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;
    const currentPage =
      type === "companies" ? currentCompaniesPage : currentGovernmentPage;

    const pageToRender = Math.min(currentPage, totalPages);
    if (type === "companies") currentCompaniesPage = pageToRender;
    else currentGovernmentPage = pageToRender;

    if (totalItems === 0) {
      row.classList.add("is-empty");
      if (pagination) pagination.style.display = "none";
      return;
    }

    if (pagination) {
      pagination.style.display = totalPages > 1 ? "flex" : "none";
      const prevBtn = pagination.querySelector(
        ".is-prev",
      ) as HTMLButtonElement | null;
      const nextBtn = pagination.querySelector(
        ".is-next",
      ) as HTMLButtonElement | null;
      const info = pagination.querySelector(
        ".tl-page-info",
      ) as HTMLElement | null;

      if (prevBtn) prevBtn.disabled = pageToRender <= 1;
      if (nextBtn) nextBtn.disabled = pageToRender >= totalPages;
      if (info) info.textContent = `Page ${pageToRender} of ${totalPages}`;
    }

    const startIndex = (pageToRender - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const pageItems = list.slice(startIndex, endIndex);

    const cardPromises: Promise<void>[] = [];

    pageItems.forEach(({ org, score }) => {
      if (!org.id) return;
      const slot = document.createElement("div");
      slot.className = "backend-slot is-loading";
      slot.innerHTML = '<div class="skeleton-loader skeleton-card"></div>';
      row.appendChild(slot);

      cardPromises.push(loadCard(slot, org.id, score));
    });

    // Batch all card requests in parallel with proper error handling
    Promise.allSettled(cardPromises).then((results) => {
      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        console.warn(`[target-list] ${failed.length}/${results.length} card(s) failed to load`);
      }
    });
  }

  // ─── Setup Pagination Listeners ──────────────────────────
  const setupPaginationListeners = (type: "companies" | "government") => {
    const pagination = document.querySelector(
      `[data-pagination-for="${type}"]`,
    );
    if (!pagination) return;

    const prevBtn = pagination.querySelector(".is-prev");
    const nextBtn = pagination.querySelector(".is-next");

    prevBtn?.addEventListener("click", () => {
      if (type === "companies") {
        if (currentCompaniesPage > 1) {
          currentCompaniesPage--;
          renderPage("companies", filteredCompanies);
        }
      } else {
        if (currentGovernmentPage > 1) {
          currentGovernmentPage--;
          renderPage("government", filteredGovernment);
        }
      }
    });

    nextBtn?.addEventListener("click", () => {
      const list =
        type === "companies" ? filteredCompanies : filteredGovernment;
      const currentPage =
        type === "companies" ? currentCompaniesPage : currentGovernmentPage;
      const totalPages = Math.ceil(list.length / PAGE_SIZE);

      if (currentPage < totalPages) {
        if (type === "companies") {
          currentCompaniesPage++;
          renderPage("companies", filteredCompanies);
        } else {
          currentGovernmentPage++;
          renderPage("government", filteredGovernment);
        }
      }
    });
  };

  const userExperienceKeywords = new Set<string>();
  let userWorkOrgIds: string[] = [];

  const performSearch = async (query: string) => {
    if (companiesRow) {
      companiesRow.innerHTML = `
        <div class="backend-slot is-loading"><div class="skeleton-loader skeleton-card"></div></div>
        <div class="backend-slot is-loading"><div class="skeleton-loader skeleton-card"></div></div>
      `;
      companiesRow.classList.remove("is-empty");
    }
    if (governmentRow) {
      governmentRow.innerHTML = `
        <div class="backend-slot is-loading"><div class="skeleton-loader skeleton-card"></div></div>
        <div class="backend-slot is-loading"><div class="skeleton-loader skeleton-card"></div></div>
      `;
      governmentRow.classList.remove("is-empty");
    }

    try {
      const orgs = await organizationService.getAll({
        city: query || undefined,
      });

      // Map to compute compatibility score and filter/sort
      const matchedOrgs = orgs
        .map((org) => {
          if (!org.id) return null;
          if (userWorkOrgIds.includes(org.id)) return null;

          const orgServices = Array.isArray(org.services) ? org.services : [];
          const keywords = orgServices
            .map((k) => k.toLowerCase().trim())
            .filter(Boolean);

          const matchingKeywords = keywords.filter((kw) =>
            userExperienceKeywords.has(kw),
          );
          const matchCount = matchingKeywords.length;
          if (matchCount === 0) return null;

          // Score is the percentage of matching keywords relative to organization keywords
          const score =
            keywords.length > 0
              ? Math.round((matchCount / keywords.length) * 100)
              : 0;
          return { org, score };
        })
        .filter((item): item is { org: any; score: number } => item !== null);

      // Sort by score descending (highest score first)
      matchedOrgs.sort((a, b) => b.score - a.score);

      companiesList = matchedOrgs.filter(
        ({ org }) =>
          ![
            "GOVERNMENT",
            "STATE_GOVERNMENT",
            "CITY_GOVERNMENT",
            "CENTRAL_BANK",
            "COURT",
            "EMBASSY",
          ].includes(org.subtype || ""),
      );
      governmentList = matchedOrgs.filter(({ org }) =>
        [
          "GOVERNMENT",
          "STATE_GOVERNMENT",
          "CITY_GOVERNMENT",
          "CENTRAL_BANK",
          "COURT",
          "EMBASSY",
        ].includes(org.subtype || ""),
      );

      filteredCompanies = [...companiesList];
      filteredGovernment = [...governmentList];

      currentCompaniesPage = 1;
      currentGovernmentPage = 1;

      renderPage("companies", filteredCompanies);
      renderPage("government", filteredGovernment);
    } catch (err) {
      console.error("Failed to load target list data:", err);
    }
  };

  setupPaginationListeners("companies");
  setupPaginationListeners("government");

  try {
    const fullProfile = await profileService.getFullProfileByUserId(
      session.userId,
    );
    if (fullProfile) {
      // Extract unique organization IDs from user's experiences
      userWorkOrgIds = Array.from(
        new Set(
          (fullProfile.experiences || [])
            .map((exp: any) => exp.organization_id)
            .filter(Boolean),
        ),
      ) as string[];

      // Fetch details of those organizations
      const userWorkOrgs = await Promise.all(
        userWorkOrgIds.map((id) =>
          organizationService.getById(id).catch(() => null),
        ),
      );

      // Collect only services (exclude research areas)
      userWorkOrgs.forEach((org) => {
        if (!org) return;
        if (Array.isArray(org.services)) {
          org.services.forEach((s) => {
            if (s) userExperienceKeywords.add(s.toLowerCase().trim());
          });
        }
      });
    }

    await performSearch("");
  } catch (err) {
    console.error("Failed to fetch initial data:", err);
  }

  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        performSearch(input.value.trim());
      }
    });
  }

  // ─── Window Resize Alignment ─────────────────────────────
  window.addEventListener("resize", () => {
    const slots = Array.from(
      document.querySelectorAll(".backend-slot.is-filled"),
    ) as HTMLElement[];
    slots.forEach(alignCardHeight);
  });
});
