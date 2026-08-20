import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EmployeeCountRange, OrganizationSubType } from "@prisma/client";
import {
  TargetListService,
  GetTargetsParams,
} from "../../services/target-list.service";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { usePageMeta } from "../../hooks/usePageMeta";
import { MatchSection } from "../../components/target-list/MatchSection";
export type MatchCategory = "same" | "similar" | "different";

export type TargetRow = {
  id: string;
  name?: string;
  description?: string | null;
  subtype?: string | null;
  numberOfEmployees?: string | null;
  avatar_url?: string | null;
  website_url?: string | null;
  website?: string | null;
  founded?: string | null;
  subject_id?: string | null;
  subject_category_id?: string | null;
  subject_name?: string | null;
  subject_description?: string | null;
  subject_logo_url?: string | null;
  match_category?: MatchCategory | null;
  [key: string]: unknown;
};

import "../../css/target-list.css";
import { getSession } from "../../lib/session";
import ProfileAside from "../../components/ProfileAside";
import { FilterDropdown } from "../../components/target-list/FilterDropdown";
import { LoadingResults } from "../../components/target-list/LoadingResults";

const targetListService = new TargetListService();

type DropdownName = "sizes" | "products" | "workFor";

type Session = {
  userId?: string;
  profileId?: string;
};

export default function TargetList() {
  usePageMeta(
    "My Target List — Bildyx",
    "Saved target companies and opportunities on Bildyx.",
  );

  const PAGE_SIZE = 10;

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
    const workForSubtypes: Record<string, OrganizationSubType[]> = {
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
    return workFor.flatMap(
      (group) => workForSubtypes[group] ?? [],
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

        city: city.trim().toLowerCase() || undefined,

        country: country.trim().toLowerCase() || undefined,

        sizes: selectedSizes.length > 0 ? selectedSizes : undefined,

        subtypes: subtypeFilter.length > 0 ? subtypeFilter : undefined,

        /*
         * On envoie matchFilter uniquement si une seule catégorie
         * est sélectionnée. Sinon, le backend renvoie tout et on
         * filtre côté client par match_category.
         */
        matchFilter:
          selectedProducts.length === 1 ? selectedProducts[0] : undefined,

        keyword: keyword.trim().toLowerCase() || undefined,
      };

      const all = await targetListService.getTargets(params);

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
                    {[
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
                    ].map((option) => (
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

                    {[
                      { value: "same", label: "Same as I used to work on." },
                      {
                        value: "similar",
                        label: "Similar to the ones that I used to work on.",
                      },
                      {
                        value: "different",
                        label:
                          "Different from the ones that I used to work on.",
                      },
                    ].map((option) => (
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

                    {[
                      { value: "companies", label: "Companies" },
                      {
                        value: "government",
                        label: "Government & Public Services",
                      },
                      {
                        value: "healthcare",
                        label: "Hospitals & Healthcare Providers",
                      },
                      { value: "education", label: "Education & Research" },
                      {
                        value: "nonprofit",
                        label: "Non-Profit, Community & Advocacy",
                      },
                      {
                        value: "international",
                        label: "International & Diplomatic Organizations",
                      },
                      { value: "culture", label: "Culture, Parks & Heritage" },
                    ].map((option) => (
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
