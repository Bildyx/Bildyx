import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePageMeta } from "../hooks/usePageMeta";
import { officeCities, people, productChips, teamOrder, teams } from "../data/whyTeamsData";
import "../css/why-teams.css";

type ProfileMode = "overview" | "operate";

export default function WhyTeams() {
  usePageMeta("Why Teams — Bildyx", "People do not join companies. They join teams.");

  const [activeTeamKey, setActiveTeamKey] = useState("alpha");
  const [profileMode, setProfileMode] = useState<ProfileMode>("overview");

  function handleAnchorClick(event: React.MouseEvent<HTMLAnchorElement>, targetId: string) {
    const target = document.getElementById(targetId);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const centerNav = (
    <nav className="wt-main-nav" aria-label="Why Teams navigation">
      <a href="#why-teams" onClick={(e) => handleAnchorClick(e, "why-teams")}>
        Why Teams
      </a>
      <Link to="/coming-soon/customers">Customers</Link>
    </nav>
  );

  const activeTeam = teams[activeTeamKey];
  const activePoints = useMemo(
    () => (profileMode === "operate" ? activeTeam.operate : activeTeam.overview),
    [activeTeam, profileMode],
  );

  return (
    <>
      <Header centerNav={centerNav} />

      <main className="wt-page">
        <section className="wt-hero" aria-labelledby="wt-hero-title">
          <div className="wt-container wt-hero__grid">
            <div className="wt-hero__copy">
              <p className="wt-kicker">A fit for common ground that builds teams</p>
              <h1 id="wt-hero-title">
                People Don&apos;t Join
                <br />
                Companies. They Join
                <br />
                Teams.
              </h1>
              <p className="wt-hero__lead">
                Job seekers care less about logos and perks and more about the people they&apos;ll work with every
                day. Teams—not companies—are the true magnets for top talent.
              </p>
              <div className="wt-button-row">
                <Link className="wt-button wt-button--primary" to="/coming-soon/create-profile">
                  Create Profile <span aria-hidden="true">→</span>
                </Link>
                <Link className="wt-button wt-button--secondary" to="/team-example">
                  See Team Example
                </Link>
              </div>
            </div>

            <figure className="wt-hero__media">
              <img src="/images/team-meeting.jpg" alt="Team collaborating in a modern office" />
            </figure>
          </div>
        </section>

        <section className="wt-blue-section wt-benefits" id="why-teams" aria-labelledby="wt-benefits-title">
          <div className="wt-container">
            <header className="wt-section-heading wt-section-heading--light">
              <h2 id="wt-benefits-title">Why Teams Matter More Than Companies</h2>
              <p>
                Candidates choose the team that makes them feel connected, valued, and empowered
                <br className="wt-desktop-break" /> to make an impact.
              </p>
            </header>

            <div className="wt-benefit-grid">
              <article className="wt-benefit-card">
                <span className="wt-line-icon" aria-hidden="true">♡</span>
                <h3>Connection &amp; Belonging</h3>
                <p>Teams foster genuine human relationships that drive engagement.</p>
              </article>
              <article className="wt-benefit-card">
                <span className="wt-line-icon" aria-hidden="true">↗</span>
                <h3>Impact &amp; Growth</h3>
                <p>Leaders who listen, mentor, and empower create a sense of real contribution.</p>
              </article>
              <article className="wt-benefit-card">
                <span className="wt-line-icon" aria-hidden="true">⬡</span>
                <h3>Psychological Safety</h3>
                <p>A supportive team culture can buffer corporate dysfunction.</p>
              </article>
              <article className="wt-benefit-card">
                <span className="wt-line-icon" aria-hidden="true">♙</span>
                <h3>Retention Drivers</h3>
                <p>People leave managers and teams, not companies. Salary attracts, but culture retains.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="wt-showcase-section" id="team-example" aria-labelledby="wt-showcase-title">
          <div className="wt-container wt-container--wide">
            <header className="wt-section-heading">
              <h2 id="wt-showcase-title">Show Your Teams Before Candidates Apply.</h2>
              <p>
                Give job seekers a richer view of your teams: team profiles, products and services, how
                <br className="wt-desktop-break" /> your team works, and where they are located.
              </p>
            </header>

            <article className="wt-team-card" aria-label="Interactive team profile example">
              <div className="wt-team-overview">
                <h3>Our Teams</h3>

                <div className="wt-team-tabs" role="tablist" aria-label="Choose a team">
                  {teamOrder.map((key) => (
                    <button
                      key={key}
                      className={`wt-team-tab${key === activeTeamKey ? " is-active" : ""}`}
                      type="button"
                      role="tab"
                      aria-selected={key === activeTeamKey}
                      onClick={() => {
                        setActiveTeamKey(key);
                        setProfileMode("overview");
                      }}
                    >
                      {teams[key].label}
                    </button>
                  ))}
                </div>

                <div className="wt-team-members" aria-live="polite">
                  {activeTeam.members.map((key) => {
                    const person = people[key];
                    return (
                      <article className="wt-member" key={key}>
                        <img src={`/images/${person.image}`} alt={person.name} />
                        <strong>{person.name}</strong>
                        <span>{person.role}</span>
                      </article>
                    );
                  })}
                </div>

                <section className="wt-team-subsection">
                  <h4>Our Offices</h4>
                  <div className="wt-office-cities">
                    {officeCities.map((city) => (
                      <button
                        className={`wt-city${city.id === activeTeam.city ? " is-active" : ""}`}
                        type="button"
                        key={city.id}
                      >
                        <span className="wt-city-photo">
                          <img src={`/images/${city.image}`} alt="" />
                        </span>
                        <span>{city.label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="wt-team-subsection">
                  <h4>Main Products / Services</h4>
                  <div className="wt-product-list">
                    {productChips.map((product) => (
                      <button
                        className={`wt-product-chip${product.id === activeTeam.product ? " is-active" : ""}`}
                        type="button"
                        key={product.id}
                      >
                        <span aria-hidden="true">{product.icon}</span> {product.label}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="wt-team-profile" aria-live="polite">
                <h3>Team Profile</h3>
                <span className="wt-team-badge">{activeTeam.label}</span>
                <div className="wt-profile-points">
                  {activePoints.map((point) => (
                    <section
                      className={`wt-profile-point${point.warning ? " wt-profile-point--warning" : ""}`}
                      key={point.title}
                    >
                      <h4>
                        <span aria-hidden="true">{point.icon}</span> {point.title}
                      </h4>
                      <p>{point.text}</p>
                    </section>
                  ))}
                </div>
                <div className="wt-team-actions" aria-label="Team profile mode">
                  <button
                    type="button"
                    className={`wt-profile-button${profileMode === "overview" ? " is-active" : ""}`}
                    aria-pressed={profileMode === "overview"}
                    onClick={() => setProfileMode("overview")}
                  >
                    Team Overview
                  </button>
                  <button
                    type="button"
                    className={`wt-profile-button${profileMode === "operate" ? " is-active" : ""}`}
                    aria-pressed={profileMode === "operate"}
                    onClick={() => setProfileMode("operate")}
                  >
                    How We Operate
                  </button>
                </div>
              </aside>
            </article>
          </div>
        </section>

        <section className="wt-blue-section wt-magnet-section" aria-labelledby="wt-magnet-title">
          <div className="wt-container wt-magnet-grid">
            <div className="wt-magnet-copy">
              <h2 id="wt-magnet-title">The Magnet Effect</h2>
              <p>
                High-performing teams attract top talent. A-players gravitate toward teams where high performance,
                creativity, and a relentless culture of excellence thrive.
              </p>
              <ul>
                <li><span aria-hidden="true">✣</span> Showcase impact. Your work is your product&apos;s best pitch.</li>
                <li><span aria-hidden="true">☆</span> Growth: Learning opportunities with strong peers.</li>
                <li><span aria-hidden="true">♡</span> Cohesion: A sense of belonging your hiring page.</li>
              </ul>
            </div>

            <div className="wt-stat-grid">
              <article className="wt-stat-card">
                <strong>92%</strong>
                <p>of candidates prioritize team culture over large perks</p>
              </article>
              <article className="wt-stat-card">
                <strong>60%</strong>
                <p>lower turnover in positively aligned teams</p>
              </article>
            </div>
          </div>
        </section>

        <section className="wt-candidate-section" aria-labelledby="wt-candidate-title">
          <div className="wt-container wt-candidate-grid">
            <figure className="wt-candidate-media">
              <img src="/images/candidate-browser.png" alt="Professional browsing team profiles" />
            </figure>

            <div className="wt-candidate-copy">
              <h2 id="wt-candidate-title">What Candidates Look For</h2>
              <p>Before applying, job seekers increasingly want to know who they&apos;ll work with and how they fit in.</p>
              <div className="wt-checklist-card">
                <h3><span aria-hidden="true">⌕</span> The Search Checklist</h3>
                <ul>
                  <li>Who they&apos;ll work with and their experience, skills, and interests</li>
                  <li>Team culture, collaboration style, and workflow</li>
                  <li>Access to leaders who act as mentors, not just managers</li>
                  <li>A shared mission where contributions are visible and valued</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="wt-blue-section wt-shine-section" aria-labelledby="wt-shine-title">
          <div className="wt-container">
            <header className="wt-section-heading wt-section-heading--light">
              <h2 id="wt-shine-title">BILDYX: Where Teams Shine</h2>
              <p>
                At Bildyx, we believe people don&apos;t just join companies—they join teams. Bildyx puts
                <br className="wt-desktop-break" /> teams at the center of every company profile.
              </p>
            </header>

            <div className="wt-shine-grid">
              <article className="wt-shine-card">
                <h3>Give Your Team the Spotlight</h3>
                <p>Small or large, every team has a story. Bildyx is your platform to share the people, work, and culture that define you.</p>
                <div className="wt-shine-list">
                  <span>♙ Your Teams</span>
                  <span>⬡ Products / Services</span>
                  <span>◎ Cities &amp; Locations</span>
                  <span>◇ Partners &amp; Customers</span>
                </div>
              </article>

              <article className="wt-shine-card">
                <h3>Help Job Seekers Find Their Fit</h3>
                <p>Candidates want to know who they&apos;ll work with before making a move. Help people feel the team&apos;s energy from the first click.</p>
                <div className="wt-shine-list">
                  <span>▥ Collaboration &amp; Culture</span>
                  <span>↗ Real Impact</span>
                  <span>☆ Shared Mission</span>
                  <span>▣ Growth &amp; Mentorship</span>
                </div>
                <Link className="wt-button wt-button--primary" to="/coming-soon/start-profile">
                  Start Your Profile <span aria-hidden="true">→</span>
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section className="wt-cta-section" aria-labelledby="wt-cta-title">
          <div className="wt-container">
            <h2 id="wt-cta-title">Ready to showcase your team?</h2>
            <p>
              Show your team, their culture, and their work so talent chooses you for the
              <br className="wt-desktop-break" /> people—not just the brand.
            </p>
            <Link className="wt-button wt-button--primary" to="/coming-soon/get-started">
              Get Started for Free
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
