import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePageMeta } from "../hooks/usePageMeta";
import { officeCities, productChips, teamOrder, teams } from "../data/teams";

type ProfileMode = "overview" | "operate";

export default function Home() {
  usePageMeta("Bildyx — Home", "Bildyx — professional team profiles and MicroResumes.");

  const [activeTeamKey, setActiveTeamKey] = useState("alpha");
  const [profileMode, setProfileMode] = useState<ProfileMode>("overview");

  const activeTeam = teams[activeTeamKey];
  const activePoints = useMemo(
    () => (profileMode === "operate" ? activeTeam.operatePoints : activeTeam.overviewPoints),
    [activeTeam, profileMode],
  );

  return (
    <>
      <Header />

      <main className="home-layout">
        <section className="home-panel home-panel--teams">
          <div className="panel-inner teams-inner">
            <div className="intro-block">
              <span className="eyebrow">For teams &amp; companies</span>
              <h1>Create Team Profile</h1>
              <p>Showcase your organization&apos;s collective talent. Manage team credentials and verified profiles in one place.</p>
              <Link to="/why-teams" className="primary-button">
                <span className="button-icon" aria-hidden="true">
                  <img src="/images/bildyx-icon.png" alt="Bildyx" />
                </span>
                Create Team Profile
              </Link>
            </div>

            <article className="team-showcase">
              <div className="team-overview">
                <h2>Our Teams</h2>

                <div className="team-tabs" role="tablist" aria-label="Choose a team">
                  {teamOrder.map((key) => (
                    <button
                      key={key}
                      className={`team-tab${key === activeTeamKey ? " active" : ""}`}
                      type="button"
                      role="tab"
                      aria-selected={key === activeTeamKey}
                      onClick={() => setActiveTeamKey(key)}
                    >
                      {teams[key].name}
                    </button>
                  ))}
                </div>

                <div className="team-members" aria-live="polite">
                  {activeTeam.members.map((member) => (
                    <div className="member-card" key={member.name}>
                      <img className="member-avatar" src={`/images/${member.image}`} alt={member.name} />
                      <strong>{member.name}</strong>
                      <span>{member.role}</span>
                    </div>
                  ))}
                </div>

                <section className="team-subsection offices">
                  <h3>Our Offices</h3>
                  <div className="office-cities">
                    {officeCities.map((city) => (
                      <div className={`city${city.id === activeTeam.activeCity ? " active" : ""}`} key={city.id}>
                        <div className="city-photo">
                          <img src={`/images/${city.image}`} alt={city.label} />
                        </div>
                        <span>{city.label}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="team-subsection products">
                  <h3>Main Products / Services</h3>
                  <div className="product-list">
                    {productChips.map((product) => (
                      <span className={`product-chip${product.id === activeTeam.activeProduct ? " active" : ""}`} key={product.id}>
                        <span aria-hidden="true">{product.icon}</span> {product.label}
                      </span>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="team-profile" aria-live="polite">
                <h2>Team Profile</h2>
                <span className="team-badge">{activeTeam.name}</span>

                <div className="profile-points">
                  {activePoints.map((point) => (
                    <section className={`profile-point${point.danger ? " profile-point--danger" : ""}`} key={point.title}>
                      <h3>
                        <span aria-hidden="true">{point.icon}</span>
                        {point.title}
                      </h3>
                      <p>{point.description}</p>
                    </section>
                  ))}
                </div>

                <div className="team-actions" aria-label="Team profile view">
                  <button
                    type="button"
                    className={`profile-button${profileMode === "overview" ? " active" : ""}`}
                    aria-pressed={profileMode === "overview"}
                    onClick={() => setProfileMode("overview")}
                  >
                    Team Overview
                  </button>
                  <button
                    type="button"
                    className={`profile-button${profileMode === "operate" ? " active" : ""}`}
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

        <section className="home-panel home-panel--resume">
          <div className="panel-inner resume-inner">
            <div className="intro-block intro-block--light">
              <span className="eyebrow eyebrow--light">For professionals</span>
              <h1>Create MicroResume</h1>
              <p>Build a verified, concise professional profile that highlights your core skills and achievements in seconds.</p>
              <Link to="/microresume" className="secondary-button">
                Create MicroResume
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <article className="resume-card">
              <div className="resume-title-row">
                <h2>Hanako Kingswell</h2>
                <span className="resume-type">MicroResume</span>
              </div>

              <div className="resume-summary">
                <img src="/images/hanako.png" alt="Hanako Kingswell" className="resume-avatar" />
                <p>
                  Results-driven Software Engineer with experience at Pekamix, contributing to the development and
                  enhancement of Sales Software solutions. Skilled in designing scalable business applications,
                  improving system performance, and collaborating across cross-functional global teams to deliver
                  high-quality software products. Bilingual in Japanese and English.
                </p>
              </div>

              <div className="resume-grid">
                <section>
                  <h3>Software Engineer</h3>
                  <p className="mini-label">
                    <span aria-hidden="true">◉</span> Languages
                  </p>
                  <div className="tag-list">
                    <span className="tag tag--filled">Japanese</span>
                    <span className="tag tag--filled">English</span>
                    <span className="tag tag--outlined">German</span>
                  </div>
                </section>

                <section>
                  <h4>Top Skills</h4>
                  <div className="skill-list">
                    <span className="tag tag--filled">Software Development</span>
                    <span className="tag tag--filled">Team Building</span>
                    <span className="tag tag--filled">Problem Solving</span>
                    <span className="tag tag--filled">CRM Integration</span>
                    <span className="tag tag--filled">Performance Optimization</span>
                  </div>
                </section>
              </div>

              <ul className="resume-meta">
                <li><span aria-hidden="true">◎</span> Countries: USA</li>
                <li><span aria-hidden="true">▥</span> Companies: Pekamix</li>
                <li><span aria-hidden="true">▦</span> Products: Sales Software</li>
                <li><span aria-hidden="true">▣</span> Job Occupations: Software Engineer</li>
              </ul>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
