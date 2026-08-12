import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePageMeta } from "../hooks/usePageMeta";
import "../css/mission.css";

export default function Mission() {
  usePageMeta("Mission — Bildyx", "Bildyx mission: eliminate friction from hiring for companies and candidates.");

  return (
    <>
      <Header />

      <main className="mission-main">
        <section className="mission-hero" aria-labelledby="mission-title">
          <div className="mission-hero__content">
            <img className="mission-hero__search mission-hero__search--job" src="/images/no-job-search.png" alt="No job search" />

            <div className="mission-hero__text">
              <span className="mission-hero__eyebrow">Our purpose</span>
              <h1 id="mission-title">Our Mission</h1>
              <p>We eliminate friction from hiring — for both sides. Build better teams, hire faster, spend less.</p>
            </div>

            <img
              className="mission-hero__search mission-hero__search--candidate"
              src="/images/no-candidate-search.png"
              alt="No candidate search"
            />
          </div>
        </section>

        <section className="mission-frame" aria-label="Mission details">
          <div className="mission-inner">
            <section className="mission-stats" aria-label="Mission promises">
              <article className="mission-stat">
                <span className="mission-icon">
                  <img src="/images/mission-job.png" alt="" aria-hidden="true" />
                </span>
                <h2>1 week</h2>
                <strong>Find a job</strong>
                <p>Job seekers get matched to the right team — fast.</p>
              </article>

              <article className="mission-stat">
                <span className="mission-icon">
                  <img src="/images/mission-candidate.png" alt="" aria-hidden="true" />
                </span>
                <h2>1 week</h2>
                <strong>Find a candidate</strong>
                <p>Companies discover pre-matched talent — no waiting.</p>
              </article>
            </section>

            <section className="mission-work" aria-labelledby="mission-work-title">
              <span className="mission-section-label" id="mission-work-title">
                What we do
              </span>

              <div className="mission-card-grid">
                <article className="mission-card">
                  <span className="mission-card__icon">
                    <img src="/images/mission-team.png" alt="" aria-hidden="true" />
                  </span>
                  <span className="mission-number">01</span>
                  <h3>Team Building</h3>
                  <p>
                    Help companies build their team. Advise them on what roles they should hire — so every hire fits
                    the team&apos;s needs and growth stage.
                  </p>
                </article>

                <article className="mission-card mission-card--dark">
                  <span className="mission-card__icon mission-card__icon--dark">
                    <img src="/images/mission-lightning.png" alt="" aria-hidden="true" />
                  </span>
                  <span className="mission-number">02</span>
                  <h3>Fast Hiring</h3>
                  <ul>
                    <li>We know candidates. We know companies and teams.</li>
                    <li>We connect the two — directly.</li>
                    <li>Find a job in 1 week. Find a candidate in 1 week.</li>
                  </ul>
                </article>

                <article className="mission-card">
                  <span className="mission-card__icon">
                    <img src="/images/mission-cost.png" alt="" aria-hidden="true" />
                  </span>
                  <span className="mission-number">03</span>
                  <h3>Low Cost Hiring</h3>
                  <p>
                    Make recruitment cheap for companies. No expensive agency fees — just direct, efficient
                    connections between companies and the right talent.
                  </p>
                </article>

                <article className="mission-card mission-card--danger">
                  <span className="mission-card__icon mission-card__icon--danger">
                    <img src="/images/mission-search.png" alt="" aria-hidden="true" />
                  </span>
                  <span className="mission-number">04</span>
                  <h3>Eliminate the Search</h3>
                  <strong>Job Search</strong>
                  <strong>Candidate Search</strong>
                  <p>Instead, Bildyx connects job seekers and companies — no searching required on either side.</p>
                </article>
              </div>
            </section>

            <section className="mission-no-search" aria-labelledby="mission-no-search-title">
              <div className="mission-no-search__intro">
                <h2 id="mission-no-search-title">No more searching.</h2>
                <p>Bildyx replaces the search entirely — for both sides of the hiring equation.</p>
              </div>

              <div className="mission-no-search__rows">
                <div className="mission-row">
                  <span className="mission-row__bad">⊗</span>
                  <strong>
                    Job
                    <br />
                    Search
                  </strong>
                  <span className="mission-row__arrow">→</span>
                  <p>Bildyx connects you to the right team directly.</p>
                </div>

                <div className="mission-row">
                  <span className="mission-row__bad">⊗</span>
                  <strong>
                    Candidate
                    <br />
                    Search
                  </strong>
                  <span className="mission-row__arrow">→</span>
                  <p>Bildyx surfaces the right candidates for your team.</p>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
