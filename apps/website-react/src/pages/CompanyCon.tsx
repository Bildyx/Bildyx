import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePageMeta } from "../hooks/usePageMeta";
import { readCompanyProfile, COMPANY_PROFILE_STORAGE_KEY, type CompanyConProfile } from "../lib/companyProfile";
import "../css/company_con.css";

type Team = { id: string; name: string };
type TeamProfile = CompanyConProfile["teamProfiles"] extends Record<string, infer P> | undefined ? P : never;
type TeamMember = NonNullable<CompanyConProfile["members"]>[number];
type NamedItem = NonNullable<CompanyConProfile["products"]>[number];

function normalizeAccountType(value: unknown): string {
  return String(value || "").toLowerCase().replace(/[\s_-]/g, "");
}

/** Ported from company_con.php + js/company_con.ts */
export default function CompanyCon() {
  usePageMeta("Company — Bildyx", "Connected company profile page on Bildyx.");
  const navigate = useNavigate();

  const [profile, setProfile] = useState<CompanyConProfile | null>(() => readCompanyProfile());
  const [teamId, setTeamId] = useState<string | null>(null);
  const [mode, setMode] = useState<"people" | "operate">("people");

  // Guard: non-company accounts get redirected to their profile (see inline <script> in company_con.php)
  useEffect(() => {
    const raw = sessionStorage.getItem("bildyx_session") || localStorage.getItem("bildyx_session");
    if (!raw) return;
    try {
      const session = JSON.parse(raw);
      const type = normalizeAccountType(session.accountType || session.role);
      if (type && type !== "company") navigate("/profile");
    } catch {
      // ignore malformed session, matches original try/catch(e){}
    }
  }, [navigate]);

  useEffect(() => {
    function refresh(e: StorageEvent) {
      if (e.key === COMPANY_PROFILE_STORAGE_KEY) setProfile(readCompanyProfile());
    }
    function refreshSameTab() {
      setProfile(readCompanyProfile());
    }
    window.addEventListener("storage", refresh);
    window.addEventListener("bildyx-company-profile-updated", refreshSameTab);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("bildyx-company-profile-updated", refreshSameTab);
    };
  }, []);

  const teams = profile?.teams || [];
  const activeTeam = teams.find((t) => t.id === teamId) || teams[0] || null;
  const effectiveTeamId = activeTeam?.id ?? null;

  const members = (profile?.members || []).filter((m) => !effectiveTeamId || !m.teamId || m.teamId === effectiveTeamId);
  const teamProfile = effectiveTeamId ? profile?.teamProfiles?.[effectiveTeamId] : undefined;

  const points = teamProfile
    ? (mode === "operate"
        ? [
            ["How We're Led", teamProfile.led],
            ["What We're Solving Now", teamProfile.solving],
            ["A Typical Day", teamProfile.day],
            ["What We Value", teamProfile.value],
            ["Growth Here", teamProfile.growth],
          ]
        : [
            ["Who We Are", teamProfile.who],
            ["What We're Great At", teamProfile.great],
            ["Team Culture", teamProfile.culture],
            ["How We Work Together", teamProfile.work],
            ["This team is NOT for you if...", teamProfile.notFor, true],
          ]
      ).filter(([, text]) => String(text || "").trim())
    : [];

  function renderBigSlots(items: NamedItem[] | undefined, count = 2) {
    const list = items || [];
    if (list.length === 0) {
      return Array.from({ length: count }).map((_, i) => <div className="cc-large-slot" key={i} />);
    }
    return list.slice(0, count).map((item, i) => (
      <article className="cc-large-slot cc-summary" key={i}>
        <strong>{item.name}</strong>
        <span>{item.status || "Saved from admin"}</span>
      </article>
    ));
  }

  function renderMediaSummary(items: unknown[] | undefined, label: string) {
    if (!items?.length) return null;
    return (
      <div className="cc-summary">
        <strong>{items.length}</strong>
        <span>{label}</span>
      </div>
    );
  }

  return (
    <>
      <Header />

      <main className="cc-page">
        <div className="cc-company-bar">
          <span>{profile?.companyName || "Company Profile"}</span>
          <Link className="cc-edit-link" to="/company-admin">
            <span>✎</span> Edit
          </Link>
        </div>

        <div className="cc-layout">
          <aside className="cc-left-rail">
            <section className="cc-company-card">
              {profile?.companyName ? (
                <div className="cc-summary">
                  <strong>{profile.companyName}</strong>
                  <span>Company Profile</span>
                </div>
              ) : (
                <div className="cc-empty-slot" />
              )}
            </section>

            <h1>Parent Company</h1>

            <section className="cc-company-card cc-company-card--small">
              {profile?.parentCompany ? (
                <div className="cc-summary">
                  <strong>{profile.parentCompany}</strong>
                  <span>Parent Company</span>
                </div>
              ) : (
                <div className="cc-empty-slot" />
              )}
            </section>

            <Link className="cc-archive-link" to="/company-archive-connected">
              <span>▣</span> Company Archives
            </Link>
          </aside>

          <section className="cc-content">
            <section className="cc-team-panel">
              <div className="cc-team-main">
                <h2>Our Teams</h2>
                <div className="cc-team-tabs">
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      className={`cc-team-tab${team.id === effectiveTeamId ? " is-active" : ""}`}
                      onClick={() => setTeamId(team.id)}
                    >
                      {team.name}
                    </button>
                  ))}
                </div>

                <div className="cc-members">
                  {members.length ? (
                    members.map((member, i) => (
                      <article className="cc-member-card" key={i}>
                        <span />
                        <div className="cc-member-name">{member.name}</div>
                        <div className="cc-member-role">{member.jobTitle}</div>
                      </article>
                    ))
                  ) : (
                    <div className="cc-empty-message">No team members added yet.</div>
                  )}
                </div>

                <section className="cc-subsection">
                  <h3>Our Offices</h3>
                  <div className="cc-offices">
                    {(profile?.offices || []).map((office, i) => (
                      <article className="cc-office" key={i}>
                        <div className="cc-office-dot" />
                        <span>{office.name}</span>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="cc-subsection">
                  <h3>Main Products / Services</h3>
                  <div className="cc-products">
                    {(profile?.products || []).map((product, i) => (
                      <button className={`cc-product-chip${i === 0 ? " is-active" : ""}`} key={i}>
                        {product.name}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="cc-team-profile">
                <h2>Team Profile</h2>
                <span className="cc-team-badge">{activeTeam?.name || "No team selected"}</span>
                <div className="cc-profile-points">
                  {points.length ? (
                    points.map(([title, text, warning]) => (
                      <section className={`cc-profile-point${warning ? " is-warning" : ""}`} key={title as string}>
                        <h3>{title}</h3>
                        <p>{text}</p>
                      </section>
                    ))
                  ) : (
                    <p className="cc-profile-empty">No team profile added yet.</p>
                  )}
                </div>
                <div className="cc-profile-actions">
                  <button
                    className={`cc-profile-button${mode === "people" ? " is-active" : ""}`}
                    type="button"
                    onClick={() => setMode("people")}
                  >
                    People
                  </button>
                  <button
                    className={`cc-profile-button${mode === "operate" ? " is-active" : ""}`}
                    type="button"
                    onClick={() => setMode("operate")}
                  >
                    How We Operate
                  </button>
                </div>
              </aside>
            </section>

            <section className="cc-section">
              <h2>Our Product &amp; Service Portfolio</h2>
              <div className="cc-slot-grid">{renderBigSlots(profile?.products)}</div>
            </section>

            <section className="cc-section">
              <h2>Our Brands</h2>
              <div className="cc-slot-grid">{renderBigSlots(profile?.brands)}</div>
            </section>

            <section className="cc-section">
              <span className="cc-section-pill">Photos</span>
              <div className="cc-media-slot">{renderMediaSummary(profile?.photos, "photo(s) saved from admin")}</div>
            </section>

            <section className="cc-section">
              <span className="cc-section-pill">Partners</span>
              <div className="cc-media-slot">{renderMediaSummary(profile?.partners, "partner(s) saved from admin")}</div>
            </section>

            <section className="cc-section">
              <span className="cc-section-pill">Customers</span>
              <div className="cc-media-slot">{renderMediaSummary(profile?.customers, "customer(s) saved from admin")}</div>
            </section>
          </section>

          <aside className="cc-tip-card">
            <strong>✣ TIP</strong>
            <p>Job seekers want to know the team before they apply. Create a free team profile on Bildyx Teams and show them yours today.</p>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
