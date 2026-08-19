import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { EmployeeCountRange, OrganizationSubType } from "@prisma/client";
import { getRPCClient } from "../services/rpc";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePageMeta } from "../hooks/usePageMeta";
import { MatchSection } from "../components/target-list/MatchSection";
import type { MatchCategory, TargetRow } from "../components/target-list/types";
import "../css/target-list.css";
import ProfileAside from "../components/ProfileAside";

const rpc = getRPCClient();

const PAGE_SIZE = 10;

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
  keyword?: string;
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

function LoadingResults() {
  return (
    <div className="tl-match-section">
      <div className="tl-match-section__header tl-skeleton-header">
        <div
          className="skeleton-loader"
          style={{ width: 200, height: 22, borderRadius: 6 }}
        />
      </div>
      <div className="tl-company-row">
        <div className="tl-inline-card">
          <div
            className="skeleton-loader"
            style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              className="skeleton-loader"
              style={{ width: "60%", height: 14, borderRadius: 6 }}
            />
            <div
              className="skeleton-loader"
              style={{ width: "40%", height: 12, borderRadius: 6 }}
            />
          </div>
        </div>
        <div className="tl-inline-card">
          <div
            className="skeleton-loader"
            style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              className="skeleton-loader"
              style={{ width: "60%", height: 14, borderRadius: 6 }}
            />
            <div
              className="skeleton-loader"
              style={{ width: "40%", height: 12, borderRadius: 6 }}
            />
          </div>
        </div>
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

  const [keyword, setKeyword] = useState("");

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
         * On envoie matchFilter uniquement si une seule catégorie
         * est sélectionnée. Sinon, le backend renvoie tout et on
         * filtre côté client par match_category.
         */
        matchFilter:
          selectedProducts.length === 1 ? selectedProducts[0] : undefined,

        keyword: normalizeText(keyword) || undefined,
      };

      const all = (await (rpc as any).target_list.getTargets(
        params,
      )) as TargetRow[];

      // Si plusieurs catégories cochées : filtrage client-side
      const filtered =
        selectedProducts.length > 1
          ? all.filter((r) =>
              selectedProducts.includes(r.match_category ?? "different"),
            )
          : all;

      setResults(Array.isArray(filtered) ? filtered : []);

      setPage(1);
    } catch (err) {
      console.error("[target-list] Search failed:", err);

      setResults([]);
      setPage(1);

      setError("Error performing search.");
    } finally {
      setIsLoading(false);
    }
  }, [
    session?.profileId,
    city,
    country,
    keyword,
    sizes,
    products,
    subtypeFilter,
  ]);

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
  }, [city, country, keyword]);

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
    setKeyword("");
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
                      value={keyword}
                      onChange={(event) => setKeyword(event.target.value)}
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

          <ProfileAside activePage="target-list" />
        </div>
      </main>

      <Footer />
    </>
  );
}
