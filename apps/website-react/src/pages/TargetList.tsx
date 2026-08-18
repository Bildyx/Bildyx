import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { EmployeeCountRange, OrganizationSubType } from "@prisma/client";
import { getRPCClient } from "@repo/api-client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePageMeta } from "../hooks/usePageMeta";
import { CardService } from "../services/card.service";
import "../css/target-list.css";

const rpc = getRPCClient("http://localhost:3000");
const cardService = new CardService();

const PAGE_SIZE = 6;

const SIZE_OPTIONS = [
  {
    value: "RANGE_1_10",
    label: "Micro",
    hint: "1–10 employees",
  },
  {
    value: "RANGE_11_50",
    label: "Small",
    hint: "11–50 employees",
  },
  {
    value: "RANGE_51_200",
    label: "Medium-sized",
    hint: "51–200 employees",
  },
  {
    value: "RANGE_201_1000",
    label: "Mid-Market",
    hint: "201–1,000 employees",
  },
  {
    value: "RANGE_1001_5000",
    label: "Big",
    hint: "1,001–5,000 employees",
  },
  {
    value: "RANGE_5000_PLUS",
    label: "Large, established",
    hint: "5,000+ employees",
  },
] as const;

const PRODUCT_OPTIONS = [
  {
    value: "same",
    label: "Same as I used to work on.",
  },
  {
    value: "similar",
    label: "Similar to the ones that I used to work on.",
  },
  {
    value: "different",
    label: "Different from the ones that I used to work on.",
  },
] as const;

const WORK_FOR_OPTIONS = [
  {
    value: "companies",
    label: "Companies",
  },
  {
    value: "government",
    label: "Government & Public Services",
  },
  {
    value: "healthcare",
    label: "Hospitals & Healthcare Providers",
  },
  {
    value: "education",
    label: "Education & Research",
  },
  {
    value: "nonprofit",
    label: "Non-Profit, Community & Advocacy",
  },
  {
    value: "international",
    label: "International & Diplomatic Organizations",
  },
  {
    value: "culture",
    label: "Culture, Parks & Heritage",
  },
] as const;

type DropdownName = "sizes" | "products" | "workFor";

type MatchCategory = "same" | "similar" | "different";

type TargetRow = {
  id: string;
  subject_id?: string | null;
  match_category?: MatchCategory | null;

  website_url?: string | null;
  website?: string | null;

  [key: string]: unknown;
};

type Session = {
  userId?: string;
  profileId?: string;
};

type GetTargetsParams = {
  userProfileId: string;
  city?: string;
  country?: string;
  sizes?: EmployeeCountRange[];
  subtypes?: OrganizationSubType[];
  matchFilter?: MatchCategory;
};

function getSession(): Session | null {
  try {
    const raw =
      sessionStorage.getItem("bildyx_session") ||
      localStorage.getItem("bildyx_session") ||
      localStorage.getItem("bildyx_user");

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as Session;
  } catch (error) {
    console.error("Failed to read session:", error);
    return null;
  }
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

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

function formatWebsiteUrl(url: string): string {
  const trimmed = url.trim();

  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function SkeletonCard() {
  return (
    <div className="backend-slot is-loading">
      <div className="skeleton-loader skeleton-card" />
    </div>
  );
}

function EmptySubjectCard() {
  return (
    <div className="backend-slot is-empty-slot">
      <span>No subject</span>
    </div>
  );
}

function ErrorCard() {
  return <div className="backend-slot is-error">Failed to load</div>;
}

function TargetOrgCard({
  id,
  website,
}: {
  id: string;
  website?: string | null;
}) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError(false);

        const result = await cardService.getOrganization(id);

        if (!cancelled) {
          setHtml(result);
        }
      } catch (err) {
        console.error(
          `[target-list] Failed to load organization card ${id}:`,
          err,
        );

        if (!cancelled) {
          setError(true);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleClick = useCallback(() => {
    if (!website) {
      return;
    }

    const url = formatWebsiteUrl(website);

    if (!url) {
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }, [website]);

  if (error) {
    return <ErrorCard />;
  }

  if (!html) {
    return <SkeletonCard />;
  }

  /*
   * On garde ici le même comportement visuel que l'ancien
   * target-list.ts : le HTML de la carte est isolé dans son
   * propre document afin de pouvoir le scaler proprement.
   */
  return (
    <div
      className="backend-slot is-filled"
      style={{
        cursor: website ? "pointer" : undefined,
      }}
      title={website ? `Open ${website}` : undefined}
      onClick={handleClick}
      role={website ? "link" : undefined}
      tabIndex={website ? 0 : undefined}
      onKeyDown={(event) => {
        if (website && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          handleClick();
        }
      }}
    >
      <iframe
        className="org-card-frame"
        title={`Organization ${id}`}
        srcDoc={`
          <!doctype html>
          <html>
            <head>
              <meta charset="UTF-8" />
              <style>
                html,
                body {
                  margin: 0;
                  padding: 0;
                  overflow: hidden;
                  font-family:
                    "Plus Jakarta Sans",
                    system-ui,
                    sans-serif;
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
              <div
                class="scale-wrap"
                id="scaleWrap"
              >
                ${html}
              </div>

              <script>
                function scaleCard() {
                  const wrap =
                    document.getElementById("scaleWrap");

                  if (!wrap) {
                    return;
                  }

                  wrap.style.height = "auto";

                  const mainCard =
                    wrap.querySelector(".main-card");

                  if (mainCard) {
                    mainCard.style.setProperty(
                      "height",
                      "auto",
                      "important"
                    );
                  }

                  const cardWidth =
                    wrap.offsetWidth || 500;

                  const cardHeight =
                    wrap.scrollHeight || 400;

                  const padding = 16;

                  const scale =
                    Math.min(
                      (500 - padding) / cardWidth,
                      1
                    );

                  const scaledHeight =
                    cardHeight * scale;

                  const requiredHeight =
                    scaledHeight + padding;

                  const heightNeeded =
                    (requiredHeight - padding) /
                    scale;

                  wrap.style.height =
                    heightNeeded + "px";

                  wrap.style.transform =
                    "scale(" + scale + ")";

                  wrap.style.top =
                    padding / 2 + "px";

                  wrap.style.left =
                    (500 - cardWidth * scale) /
                    2 +
                    "px";

                  if (mainCard) {
                    mainCard.style.setProperty(
                      "height",
                      "100%",
                      "important"
                    );
                  }

                  document.body.dataset.cardHeight =
                    String(requiredHeight);
                }

                window.addEventListener(
                  "load",
                  scaleCard
                );

                window.addEventListener(
                  "resize",
                  scaleCard
                );
              </script>
            </body>
          </html>
        `}
        style={{
          width: "100%",
          minHeight: "400px",
          border: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

function TargetSubjectCard({ id }: { id: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError(false);

        const result = await cardService.getSubject(id);

        if (!cancelled) {
          setHtml(result);
        }
      } catch (err) {
        console.error(`[target-list] Failed to load subject card ${id}:`, err);

        if (!cancelled) {
          setError(true);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return <ErrorCard />;
  }

  if (!html) {
    return <SkeletonCard />;
  }

  return (
    <div className="backend-slot is-filled">
      <iframe
        className="org-card-frame"
        title={`Subject ${id}`}
        srcDoc={`
          <!doctype html>
          <html>
            <head>
              <meta charset="UTF-8" />
              <style>
                html,
                body {
                  margin: 0;
                  padding: 0;
                  overflow: hidden;
                  font-family:
                    "Plus Jakarta Sans",
                    system-ui,
                    sans-serif;
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
              <div
                class="scale-wrap"
                id="scaleWrap"
              >
                ${html}
              </div>

              <script>
                function scaleCard() {
                  const wrap =
                    document.getElementById("scaleWrap");

                  if (!wrap) {
                    return;
                  }

                  wrap.style.height = "auto";

                  const mainCard =
                    wrap.querySelector(".main-card");

                  if (mainCard) {
                    mainCard.style.setProperty(
                      "height",
                      "auto",
                      "important"
                    );
                  }

                  const cardWidth =
                    wrap.offsetWidth || 500;

                  const cardHeight =
                    wrap.scrollHeight || 400;

                  const padding = 16;

                  const scale =
                    Math.min(
                      (500 - padding) / cardWidth,
                      1
                    );

                  const scaledHeight =
                    cardHeight * scale;

                  const requiredHeight =
                    scaledHeight + padding;

                  const heightNeeded =
                    (requiredHeight - padding) /
                    scale;

                  wrap.style.height =
                    heightNeeded + "px";

                  wrap.style.transform =
                    "scale(" + scale + ")";

                  wrap.style.top =
                    padding / 2 + "px";

                  wrap.style.left =
                    (500 - cardWidth * scale) /
                    2 +
                    "px";

                  if (mainCard) {
                    mainCard.style.setProperty(
                      "height",
                      "100%",
                      "important"
                    );
                  }
                }

                window.addEventListener(
                  "load",
                  scaleCard
                );

                window.addEventListener(
                  "resize",
                  scaleCard
                );
              </script>
            </body>
          </html>
        `}
        style={{
          width: "100%",
          minHeight: "400px",
          border: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

function MatchSection({
  category,
  rows,
}: {
  category: MatchCategory;
  rows: TargetRow[];
}) {
  const label = {
    same: "Same",
    similar: "Similar",
    different: "Different",
  }[category];

  return (
    <div className="tl-match-section" data-category={category}>
      <div className="tl-match-section__header">
        <h2 className="tl-match-section__title">{label}</h2>

        <span className="tl-match-section__count">{rows.length}</span>
      </div>

      <div className="tl-match-section__body">
        {rows.length === 0 ? (
          <p className="tl-no-results">No results in this category</p>
        ) : (
          rows.map((row) => {
            const website =
              typeof row.website_url === "string"
                ? row.website_url
                : typeof row.website === "string"
                  ? row.website
                  : null;

            return (
              <div className="tl-company-row" key={row.id}>
                <TargetOrgCard id={row.id} website={website} />

                {row.subject_id ? (
                  <TargetSubjectCard id={row.subject_id} />
                ) : (
                  <EmptySubjectCard />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function LoadingResults() {
  return (
    <div className="tl-match-section">
      <div className="tl-match-section__header tl-skeleton-header">
        <div
          className="skeleton-loader"
          style={{
            width: 200,
            height: 22,
            borderRadius: 6,
          }}
        />
      </div>

      <div className="tl-company-row">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

function FilterDropdown({
  name,
  label,
  icon,
  count,
  openDropdown,
  setOpenDropdown,
  panelClassName = "",
  children,
}: {
  name: DropdownName;
  label: string;
  icon: string;
  count: number;
  openDropdown: DropdownName | null;
  setOpenDropdown: React.Dispatch<React.SetStateAction<DropdownName | null>>;
  panelClassName?: string;
  children: ReactNode;
}) {
  const isOpen = openDropdown === name;

  return (
    <div className="tl-filter-dropdown">
      <button
        className={`tl-filter-chip${isOpen ? " is-open" : ""}`}
        type="button"
        aria-expanded={isOpen}
        onClick={(event) => {
          event.stopPropagation();

          setOpenDropdown((current) => (current === name ? null : name));
        }}
      >
        <span aria-hidden="true">{icon}</span> {label}{" "}
        <strong>{count ? `(${count})` : ""}</strong>{" "}
        <span aria-hidden="true">⌄</span>
      </button>

      <div
        className={`tl-filter-panel${
          panelClassName ? ` ${panelClassName}` : ""
        }${isOpen ? " is-open" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function TargetList() {
  usePageMeta(
    "My Target List — Bildyx",
    "Saved target companies and opportunities on Bildyx.",
  );

  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);

  const [checkedOn, setCheckedOn] = useState(false);

  const [city, setCity] = useState("");

  const [country, setCountry] = useState("");

  const [sizes, setSizes] = useState<string[]>([]);

  const [products, setProducts] = useState<string[]>([]);

  const [workFor, setWorkFor] = useState<string[]>([]);

  const [openDropdown, setOpenDropdown] = useState<DropdownName | null>(null);

  const [results, setResults] = useState<TargetRow[]>([]);

  const [page, setPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /*
   * ---------------------------------------------------------
   * Session
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const currentSession = getSession();

    if (!currentSession?.userId) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    if (!currentSession.profileId) {
      console.error("[target-list] No profileId found in session.");

      setSession(currentSession);
      setCheckedOn(true);

      return;
    }

    setSession(currentSession);
    setCheckedOn(true);
  }, [navigate]);

  /*
   * ---------------------------------------------------------
   * Close dropdowns when clicking outside
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!openDropdown) {
      return;
    }

    const handleClickOutside = () => {
      setOpenDropdown(null);
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openDropdown]);

  /*
   * ---------------------------------------------------------
   * Escape closes dropdown
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * Build backend filters
   * ---------------------------------------------------------
   */

  const subtypeFilter = useMemo(() => {
    return workFor.flatMap(
      (group) => WORK_FOR_SUBTYPES[group] ?? [],
    ) as OrganizationSubType[];
  }, [workFor]);

  /*
   * ---------------------------------------------------------
   * Search
   * ---------------------------------------------------------
   */

  const performSearch = useCallback(async () => {
    const profileId = session?.profileId;

    if (!profileId) {
      setResults([]);
      setError("Sign in required to view targets.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const selectedSizes = sizes as EmployeeCountRange[];

      const selectedProducts = products.filter(
        (value): value is MatchCategory =>
          value === "same" || value === "similar" || value === "different",
      );

      const params: GetTargetsParams = {
        userProfileId: profileId,

        city: normalizeText(city) || undefined,

        country: normalizeText(country) || undefined,

        sizes: selectedSizes.length > 0 ? selectedSizes : undefined,

        subtypes: subtypeFilter.length > 0 ? subtypeFilter : undefined,

        /*
         * Important :
         * le backend historique attend un seul
         * matchFilter.
         *
         * Si plusieurs valeurs sont cochées,
         * on ne transmet donc pas de matchFilter,
         * exactement comme l'ancien target-list.ts.
         */
        matchFilter:
          selectedProducts.length === 1 ? selectedProducts[0] : undefined,
      };

      const all = (await (rpc as any).target_list.getTargets(
        params,
      )) as TargetRow[];

      setResults(Array.isArray(all) ? all : []);

      setPage(1);
    } catch (err) {
      console.error("[target-list] Search failed:", err);

      setResults([]);
      setPage(1);

      setError("Error performing search.");
    } finally {
      setIsLoading(false);
    }
  }, [session?.profileId, city, country, sizes, products, subtypeFilter]);

  /*
   * ---------------------------------------------------------
   * Initial search
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!checkedOn) {
      return;
    }

    void performSearch();
  }, [checkedOn, performSearch]);

  /*
   * ---------------------------------------------------------
   * Debounced city/country search
   *
   * On reproduit ici :
   *
   * cityInput.addEventListener("input", debouncedSearch)
   * countryInput.addEventListener("input", debouncedSearch)
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!checkedOn) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void performSearch();
    }, 350);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [city, country]);

  /*
   * ---------------------------------------------------------
   * Filter toggle
   * ---------------------------------------------------------
   */

  function toggleFilter(name: DropdownName, value: string) {
    const setter =
      name === "sizes"
        ? setSizes
        : name === "products"
          ? setProducts
          : setWorkFor;

    setter((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value],
    );
  }

  /*
   * ---------------------------------------------------------
   * Filter changes
   *
   * Equivalent of:
   *
   * [data-filter].addEventListener(
   *   "change",
   *   performSearch
   * )
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!checkedOn) {
      return;
    }

    void performSearch();
  }, [sizes, products, workFor]);

  /*
   * ---------------------------------------------------------
   * Reset
   * ---------------------------------------------------------
   */

  function resetFilters() {
    setCity("");
    setCountry("");
    setSizes([]);
    setProducts([]);
    setWorkFor([]);
    setPage(1);
    setError(null);
  }

  /*
   * ---------------------------------------------------------
   * Enter on city/country
   * ---------------------------------------------------------
   */

  function handleLocationKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();

    void performSearch();
  }

  /*
   * ---------------------------------------------------------
   * Pagination
   * ---------------------------------------------------------
   */

  const totalPages = Math.ceil(results.length / PAGE_SIZE) || 1;

  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return results.slice(start, start + PAGE_SIZE);
  }, [results, currentPage]);

  function goToPreviousPage() {
    setPage((current) => Math.max(1, current - 1));
  }

  function goToNextPage() {
    setPage((current) => Math.min(totalPages, current + 1));
  }

  /*
   * ---------------------------------------------------------
   * Group Same / Similar / Different
   * ---------------------------------------------------------
   */

  const groups = useMemo(() => {
    const grouped: Record<MatchCategory, TargetRow[]> = {
      same: [],
      similar: [],
      different: [],
    };

    pageItems.forEach((row) => {
      const category = row.match_category ?? "different";

      grouped[category].push(row);
    });

    return grouped;
  }, [pageItems]);

  const selectedSingleProduct =
    products.length === 1 &&
    (products[0] === "same" ||
      products[0] === "similar" ||
      products[0] === "different")
      ? (products[0] as MatchCategory)
      : null;

  const categoriesToShow: MatchCategory[] = selectedSingleProduct
    ? [selectedSingleProduct]
    : ["same", "similar", "different"];

  const hasPageResults = pageItems.length > 0;

  /*
   * ---------------------------------------------------------
   * JSX
   * ---------------------------------------------------------
   */

  return (
    <>
      <Header />

      <main className="tl-page">
        <div className="tl-shell">
          <section className="tl-card" aria-labelledby="tl-title">
            <header className="tl-header">
              <h1 id="tl-title">My Target List</h1>

              <form
                className="tl-filter-bar"
                id="targetFilters"
                role="search"
                onSubmit={(event) => {
                  event.preventDefault();
                  void performSearch();
                }}
              >
                <div className="tl-filter-line tl-filter-line--top">
                  <span className="tl-filter-label">Showing Results for:</span>

                  <label className="tl-visually-hidden" htmlFor="targetCity">
                    City
                  </label>

                  <input
                    id="targetCity"
                    className="tl-search-input"
                    type="search"
                    placeholder="enter a city"
                    autoComplete="off"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    onKeyDown={handleLocationKeyDown}
                  />

                  <label className="tl-visually-hidden" htmlFor="targetCountry">
                    Country
                  </label>

                  <input
                    id="targetCountry"
                    className="tl-search-input"
                    type="search"
                    placeholder="enter a country"
                    autoComplete="off"
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    onKeyDown={handleLocationKeyDown}
                  />

                  <FilterDropdown
                    name="sizes"
                    label="Organization Size"
                    icon="♙"
                    count={sizes.length}
                    openDropdown={openDropdown}
                    setOpenDropdown={setOpenDropdown}
                  >
                    {SIZE_OPTIONS.map((option) => (
                      <label key={option.value} className="tl-filter-option">
                        <input
                          type="checkbox"
                          value={option.value}
                          checked={sizes.includes(option.value)}
                          onChange={() => toggleFilter("sizes", option.value)}
                        />

                        <span />

                        <strong>{option.label}</strong>

                        <small>{option.hint}</small>
                      </label>
                    ))}
                  </FilterDropdown>
                </div>

                <div className="tl-filter-line">
                  <FilterDropdown
                    name="products"
                    label="Products and Services"
                    icon="▣"
                    count={products.length}
                    openDropdown={openDropdown}
                    setOpenDropdown={setOpenDropdown}
                    panelClassName="tl-filter-panel--wide"
                  >
                    <p>Products and Services</p>

                    {PRODUCT_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className="tl-filter-option tl-filter-option--sentence"
                      >
                        <input
                          type="checkbox"
                          value={option.value}
                          checked={products.includes(option.value)}
                          onChange={() =>
                            toggleFilter("products", option.value)
                          }
                        />

                        <span />

                        <strong>{option.label}</strong>
                      </label>
                    ))}
                  </FilterDropdown>

                  <label className="tl-keyword-chip" htmlFor="targetKeyword">
                    <span aria-hidden="true">♡</span>

                    <strong>I like to work on</strong>

                    <input
                      id="targetKeyword"
                      type="search"
                      placeholder="enter keyword"
                      autoComplete="off"
                    />
                  </label>

                  <FilterDropdown
                    name="workFor"
                    label="I would like to work for"
                    icon="▥"
                    count={workFor.length}
                    openDropdown={openDropdown}
                    setOpenDropdown={setOpenDropdown}
                    panelClassName="tl-filter-panel--work"
                  >
                    <p>I would like to work for</p>

                    {WORK_FOR_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className="tl-filter-option tl-filter-option--sentence"
                      >
                        <input
                          type="checkbox"
                          value={option.value}
                          checked={workFor.includes(option.value)}
                          onChange={() => toggleFilter("workFor", option.value)}
                        />

                        <span />

                        <strong>{option.label}</strong>
                      </label>
                    ))}
                  </FilterDropdown>

                  <button
                    className="tl-reset-filters"
                    id="resetTargetFilters"
                    type="button"
                    onClick={resetFilters}
                  >
                    Reset filters
                  </button>
                </div>
              </form>
            </header>

            <section
              className="tl-target-section"
              aria-labelledby="tl-company-title"
            >
              <h2
                id="tl-company-title"
                className="tl-section-icon"
                aria-label="Companies"
              >
                ▥
              </h2>

              <div className="tl-card-row" data-target-list="companies">
                {isLoading ? (
                  <LoadingResults />
                ) : error ? (
                  <p className="tl-no-results">{error}</p>
                ) : !hasPageResults ? (
                  <p className="tl-no-results">No results found.</p>
                ) : (
                  <>
                    {categoriesToShow.map((category) => (
                      <MatchSection
                        key={category}
                        category={category}
                        rows={groups[category]}
                      />
                    ))}
                  </>
                )}
              </div>

              <div className="tl-pagination" data-pagination-for="companies">
                <button
                  className="tl-page-btn is-prev"
                  type="button"
                  onClick={goToPreviousPage}
                  disabled={currentPage <= 1 || isLoading}
                >
                  ‹ Prev
                </button>

                <span className="tl-page-info">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  className="tl-page-btn is-next"
                  type="button"
                  onClick={goToNextPage}
                  disabled={currentPage >= totalPages || isLoading}
                >
                  Next ›
                </button>
              </div>
            </section>
          </section>

          <aside className="profile-side-nav" aria-label="Profile menu">
            <Link className="side-nav-button" to="/profile">
              <span aria-hidden="true">☻</span> Profile
            </Link>

            <Link className="side-nav-button is-active" to="/target-list">
              <span aria-hidden="true">◎</span> My Target List
            </Link>

            <Link className="side-nav-button" to="/tests-preferences">
              <span aria-hidden="true">▣</span> Tests &amp;
              <br />
              Preferences
            </Link>

            <Link className="side-nav-button" to="/settings">
              <span aria-hidden="true">⚙</span> Settings
            </Link>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
