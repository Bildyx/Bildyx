import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePageMeta } from "../hooks/usePageMeta";
import { memberImages, officeImages, offices, teamOrder, teams } from "../data/teamExampleData";
import "../css/team-example.css";

type ProfileMode = "people" | "operate";

/**
 * The `te-backend-slot` divs (company card, portfolio/brand cards, photos,
 * partners) are placeholders for future backend content — kept empty here
 * for the same reason as the original (window.BildyxTeamExample.mountCard).
 * Carousel arrows are rendered but inert, matching the original: no click
 * handlers were ever wired up to them in js/team-example.ts.
 */
export default function TeamExample() {
  usePageMeta("Pekamix Team Example — Bildyx", "Public company and team profile example on Bildyx.");

  const [activeTeamKey, setActiveTeamKey] = useState("alpha");
  const [profileMode, setProfileMode] = useState<ProfileMode>("people");

  const activeTeam = teams[activeTeamKey];
  const activePoints = useMemo(
    () => (profileMode === "operate" ? activeTeam.operate : activeTeam.people),
    [activeTeam, profileMode],
  );

  return (
    <>
      <Header />

      <main className="te-page">
        <div className="te-company-bar" aria-label="Current company">
          PEKAMIX
        </div>

        <div className="te-layout">
          <aside className="te-company-rail" aria-label="Company information">
            <div className="te-backend-slot te-company-card-slot" aria-label="Company profile card reserved for backend content" />

            <h1 className="te-company-rail__title">Parent Company</h1>
            <Link className="te-archive-link" to="/company-archives">
              <span aria-hidden="true">▣</span>
              Company Archives
            </Link>
          </aside>

          <div className="te-content">
            <section className="te-team-panel" aria-labelledby="te-team-title">
              <div className="te-team-main">
                <h2 id="te-team-title">Our Teams</h2>

                <div className="te-team-tabs" role="tablist" aria-label="Choose a team">
                  {teamOrder.map((key) => (
                    <button
                      key={key}
                      className={`te-team-tab${key === activeTeamKey ? " is-active" : ""}`}
                      type="button"
                      role="tab"
                      aria-selected={key === activeTeamKey}
                      onClick={() => setActiveTeamKey(key)}
                    >
                      {teams[key].label}
                    </button>
                  ))}
                </div>

                <div className="te-members" aria-live="polite">
                  {activeTeam.members.map((member) => (
                    <article className="te-member-card" key={member.name}>
                      <div className="te-member-avatar">
                        <img src={`/images/${memberImages[member.name.toLowerCase()]}`} alt={member.name} loading="lazy" />
                      </div>
                      <div className="te-member-content">
                        <div className="te-member-name">{member.name}</div>
                        <div className="te-member-role">{member.role}</div>
                      </div>
                    </article>
                  ))}
                </div>

                <section className="te-subsection" aria-labelledby="te-offices-title">
                  <h3 id="te-offices-title">Our Offices</h3>
                  <div className="te-offices">
                    {offices.map((office) => (
                      <article className={`te-office${office === "Seattle" ? " is-active" : ""}`} key={office}>
                        <div className="te-office-dot">
                          <img src={`/images/${officeImages[office]}`} alt={office} loading="lazy" />
                        </div>
                        <span>{office}</span>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="te-subsection" aria-labelledby="te-products-title">
                  <h3 id="te-products-title">Main Products / Services</h3>
                  <div className="te-products">
                    {activeTeam.products.map((product, index) => (
                      <button className={`te-product-chip${index === 0 ? " is-active" : ""}`} type="button" key={product}>
                        <span aria-hidden="true">▣</span>
                        {product}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="te-team-profile" aria-live="polite">
                <h2>Team Profile</h2>
                <span className="te-team-badge">{activeTeam.label}</span>
                <div className="te-profile-points">
                  {activePoints.map((point) => (
                    <section className={`te-profile-point${point.warning ? " is-warning" : ""}`} key={point.title}>
                      <h3>{point.title}</h3>
                      <p>{point.text}</p>
                    </section>
                  ))}
                </div>
                <div className="te-profile-actions" aria-label="Team profile mode">
                  <button
                    className={`te-profile-button${profileMode === "people" ? " is-active" : ""}`}
                    type="button"
                    aria-pressed={profileMode === "people"}
                    onClick={() => setProfileMode("people")}
                  >
                    People
                  </button>
                  <button
                    className={`te-profile-button${profileMode === "operate" ? " is-active" : ""}`}
                    type="button"
                    aria-pressed={profileMode === "operate"}
                    onClick={() => setProfileMode("operate")}
                  >
                    How We Operate
                  </button>
                </div>
              </aside>
            </section>

            <section className="te-section" aria-labelledby="te-portfolio-title">
              <h2 id="te-portfolio-title">Our Product &amp; Service Portfolio</h2>
              <div className="te-carousel">
                <button className="te-carousel-arrow te-carousel-arrow--left" type="button" aria-label="Previous product">←</button>
                <div className="te-carousel-track">
                  <div className="te-backend-slot te-product-card-slot" />
                </div>
                <button className="te-carousel-arrow te-carousel-arrow--right" type="button" aria-label="Next product">→</button>
              </div>
            </section>

            <section className="te-section" aria-labelledby="te-brands-title">
              <h2 id="te-brands-title">Our Brands</h2>
              <div className="te-carousel">
                <button className="te-carousel-arrow te-carousel-arrow--left" type="button" aria-label="Previous brand">←</button>
                <div className="te-carousel-track te-carousel-track--two">
                  <div className="te-backend-slot te-brand-card-slot" />
                  <div className="te-backend-slot te-brand-card-slot" />
                </div>
                <button className="te-carousel-arrow te-carousel-arrow--right" type="button" aria-label="Next brand">→</button>
              </div>
            </section>

            <section className="te-section te-media-section" aria-labelledby="te-photos-title">
              <span className="te-section-pill" id="te-photos-title">Photos</span>
              <div className="te-carousel te-media-carousel">
                <button className="te-carousel-arrow te-carousel-arrow--left" type="button" aria-label="Previous photo">←</button>
                <div className="te-backend-slot te-media-slot" />
                <button className="te-carousel-arrow te-carousel-arrow--right" type="button" aria-label="Next photo">→</button>
              </div>
            </section>

            <section className="te-section te-media-section" aria-labelledby="te-partners-title">
              <span className="te-section-pill" id="te-partners-title">Partners</span>
              <div className="te-carousel te-media-carousel">
                <button className="te-carousel-arrow te-carousel-arrow--left" type="button" aria-label="Previous partner">←</button>
                <div className="te-backend-slot te-media-slot te-media-slot--short" />
                <button className="te-carousel-arrow te-carousel-arrow--right" type="button" aria-label="Next partner">→</button>
              </div>
            </section>
          </div>

          <aside className="te-tip-card" aria-label="Tip">
            <strong><span aria-hidden="true">✣</span> TIP</strong>
            <p>Job seekers want to know the team before they apply. Create a free team profile on Bildyx Teams and show them yours today.</p>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
