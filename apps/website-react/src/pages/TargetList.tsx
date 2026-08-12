import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import OrgCard from "../components/OrgCard";
import { usePageMeta } from "../hooks/usePageMeta";
import { useDebouncedCallback } from "../hooks/useDebouncedCallback";
import { computeMatches, normalizeText, PAGE_SIZE, WORK_FOR_SUBTYPES, type MatchedOrg } from "../lib/targetListMatching";
import { OrganizationService } from "../services/organization.service";
import "../css/target-list.css";

const organizationService = new OrganizationService();

const SIZE_OPTIONS = [
  { value: "RANGE_1_10", label: "Micro", hint: "1–10 employees" },
  { value: "RANGE_11_50", label: "Small", hint: "11–50 employees" },
  { value: "RANGE_51_200", label: "Medium-sized", hint: "51–200 employees" },
  { value: "RANGE_201_1000", label: "Mid-Market", hint: "201–1,000 employees" },
  { value: "RANGE_1001_5000", label: "Big", hint: "1,001–5,000 employees" },
  { value: "RANGE_5000_PLUS", label: "Large, established", hint: "5,000+ employees" },
];

const PRODUCT_OPTIONS = [
  { value: "same", label: "Same as I used to work on." },
  { value: "similar", label: "Similar to the ones that I used to work on." },
  { value: "different", label: "Different from the ones that I used to work on." },
];

const WORK_FOR_OPTIONS = [
  { value: "companies", label: "Companies" },
  { value: "government", label: "Government & Public Services" },
  { value: "healthcare", label: "Hospitals & Healthcare Providers" },
  { value: "education", label: "Education & Research" },
  { value: "nonprofit", label: "Non-Profit, Community & Advocacy" },
  { value: "international", label: "International & Diplomatic Organizations" },
  { value: "culture", label: "Culture, Parks & Heritage" },
];

type DropdownName = "sizes" | "products" | "workFor";

function getSession(): { userId?: string } | null {
  const raw = sessionStorage.getItem("bildyx_session") || localStorage.getItem("bildyx_session") || localStorage.getItem("bildyx_user");
  return raw ? JSON.parse(raw) : null;
}

export default function TargetList() {
  usePageMeta("My Target List — Bildyx", "Saved target companies and opportunities on Bildyx.");
  const navigate = useNavigate();

  const [checkedOn, setCheckedOn] = useState(false);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [workFor, setWorkFor] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<DropdownName | null>(null);

  const [results, setResults] = useState<MatchedOrg[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const userExperienceKeywords = useRef<Set<string>>(new Set());
  const userWorkOrgIds = useRef<string[]>([]);

  useEffect(() => {
    const session = getSession();
    if (!session?.userId) {
      navigate("/login");
      return;
    }
    setCheckedOn(true);

    try {
      const cachedKeywords = sessionStorage.getItem("user_experience_keywords");
      const cachedWorkOrgIds = sessionStorage.getItem("user_work_org_ids");
      if (cachedKeywords) JSON.parse(cachedKeywords).forEach((k: string) => userExperienceKeywords.current.add(k));
      if (cachedWorkOrgIds) userWorkOrgIds.current = JSON.parse(cachedWorkOrgIds);
    } catch (err) {
      console.error("Failed to read cached target list data:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const performSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      const subtypes = workFor.flatMap((group) => WORK_FOR_SUBTYPES[group] || []);
      const filters = {
        city: normalizeText(city),
        country: normalizeText(country),
        keyword: normalizeText(keyword),
        sizes,
        products,
        workFor,
      };

      const orgs = await organizationService.getAll({ ...filters, subtypes });
      const matched = computeMatches(orgs, filters, userExperienceKeywords.current, userWorkOrgIds.current);
      setResults(matched);
      setPage(1);
    } catch (err) {
      console.error("Failed to load target list data:", err);
      setResults([]);
      setPage(1);
    } finally {
      setIsLoading(false);
    }
  }, [city, country, keyword, sizes, products, workFor]);

  const debouncedSearch = useDebouncedCallback(performSearch, 350);
  const debouncedKeywordSearch = useDebouncedCallback(performSearch, 250);

  useEffect(() => {
    if (checkedOn) performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedOn, sizes, products, workFor]);

  function toggleFilter(name: DropdownName, value: string) {
    const setter = name === "sizes" ? setSizes : name === "products" ? setProducts : setWorkFor;
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  function resetFilters() {
    setCity("");
    setCountry("");
    setKeyword("");
    setSizes([]);
    setProducts([]);
    setWorkFor([]);
  }

  const totalPages = Math.ceil(results.length / PAGE_SIZE) || 1;
  const currentPage = Math.min(page, totalPages);
  const pageItems = results.slice((currentPage - 1) * PAGE_SIZE, (currentPage - 1) * PAGE_SIZE + PAGE_SIZE);

  function renderDropdown(name: DropdownName, label: string, icon: string, count: number, panelClassName: string, children: React.ReactNode) {
    return (
      <div className="tl-filter-dropdown">
        <button
          className="tl-filter-chip"
          type="button"
          aria-expanded={openDropdown === name}
          onClick={(e) => {
            e.stopPropagation();
            setOpenDropdown((cur) => (cur === name ? null : name));
          }}
        >
          <span aria-hidden="true">{icon}</span> {label} <strong>{count ? `(${count})` : ""}</strong> <span aria-hidden="true">⌄</span>
        </button>
        <div
          className={`tl-filter-panel${panelClassName ? ` ${panelClassName}` : ""}${openDropdown === name ? " is-open" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />

      <main className="tl-page" onClick={() => setOpenDropdown(null)}>
        <div className="tl-shell">
          <section className="tl-card" aria-labelledby="tl-title">
            <header className="tl-header">
              <h1 id="tl-title">My Target List</h1>

              <form
                className="tl-filter-bar"
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  performSearch();
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
                    onChange={(e) => {
                      setCity(e.target.value);
                      debouncedSearch();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        performSearch();
                      }
                    }}
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
                    onChange={(e) => {
                      setCountry(e.target.value);
                      debouncedSearch();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        performSearch();
                      }
                    }}
                  />

                  {renderDropdown(
                    "sizes",
                    "Organization Size",
                    "♙",
                    sizes.length,
                    "",
                    <>
                      {SIZE_OPTIONS.map((opt) => (
                        <label className="tl-filter-option" key={opt.value}>
                          <input type="checkbox" checked={sizes.includes(opt.value)} onChange={() => toggleFilter("sizes", opt.value)} />
                          <span />
                          <strong>{opt.label}</strong>
                          <small>{opt.hint}</small>
                        </label>
                      ))}
                    </>,
                  )}
                </div>

                <div className="tl-filter-line">
                  {renderDropdown(
                    "products",
                    "Products and Services",
                    "▣",
                    products.length,
                    "tl-filter-panel--wide",
                    <>
                      <p>Products and Services</p>
                      {PRODUCT_OPTIONS.map((opt) => (
                        <label className="tl-filter-option tl-filter-option--sentence" key={opt.value}>
                          <input type="checkbox" checked={products.includes(opt.value)} onChange={() => toggleFilter("products", opt.value)} />
                          <span />
                          <strong>{opt.label}</strong>
                        </label>
                      ))}
                    </>,
                  )}

                  <label className="tl-keyword-chip" htmlFor="targetKeyword">
                    <span aria-hidden="true">♡</span>
                    <strong>I like to work on</strong>
                    <input
                      id="targetKeyword"
                      type="search"
                      placeholder="enter keyword"
                      autoComplete="off"
                      value={keyword}
                      onChange={(e) => {
                        setKeyword(e.target.value);
                        debouncedKeywordSearch();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          performSearch();
                        }
                      }}
                    />
                  </label>

                  {renderDropdown(
                    "workFor",
                    "I would like to work for",
                    "▥",
                    workFor.length,
                    "tl-filter-panel--work",
                    <>
                      <p>I would like to work for</p>
                      {WORK_FOR_OPTIONS.map((opt) => (
                        <label className="tl-filter-option tl-filter-option--sentence" key={opt.value}>
                          <input type="checkbox" checked={workFor.includes(opt.value)} onChange={() => toggleFilter("workFor", opt.value)} />
                          <span />
                          <strong>{opt.label}</strong>
                        </label>
                      ))}
                    </>,
                  )}

                  <button className="tl-reset-filters" type="button" onClick={resetFilters}>
                    Reset filters
                  </button>
                </div>
              </form>
            </header>

            <section className="tl-target-section" aria-labelledby="tl-company-title">
              <h2 id="tl-company-title" className="tl-section-icon" aria-label="Companies">
                ▥
              </h2>

              <div className={`tl-card-row${results.length === 0 && !isLoading ? " is-empty" : ""}`}>
                {isLoading ? (
                  <>
                    <div className="backend-slot is-loading">
                      <div className="skeleton-loader skeleton-card" />
                    </div>
                    <div className="backend-slot is-loading">
                      <div className="skeleton-loader skeleton-card" />
                    </div>
                  </>
                ) : (
                  pageItems.map(({ org, score }) => org.id && <OrgCard key={org.id} organizationId={org.id} score={score} />)
                )}
              </div>

              {results.length > 0 && (
                <div className="tl-pagination" style={{ display: totalPages > 1 ? "flex" : "none" }}>
                  <button className="tl-page-btn is-prev" type="button" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>
                    ‹ Prev
                  </button>
                  <span className="tl-page-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button className="tl-page-btn is-next" type="button" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)}>
                    Next ›
                  </button>
                </div>
              )}
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
              <br /> Preferences
            </Link>
            <Link className="side-nav-button" to="/coming-soon/settings">
              <span aria-hidden="true">⚙</span> Settings
            </Link>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
