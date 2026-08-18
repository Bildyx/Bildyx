import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePageMeta } from "../hooks/usePageMeta";
import "../css/microresume.css";

export default function Microresume() {
  usePageMeta(
    "MicroResume — Bildyx",
    "Turn your resume into a scannable signal system with Bildyx MicroResume.",
  );

  function handleAnchorClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
  ) {
    const target = document.getElementById(targetId);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const centerNav = (
    <nav className="mr-header-nav" aria-label="MicroResume navigation">
      <a
        href="#why-microresume"
        onClick={(e) => handleAnchorClick(e, "why-microresume")}
      >
        Why MicroResume
      </a>
      <a
        href="#how-it-works"
        onClick={(e) => handleAnchorClick(e, "how-it-works")}
      >
        How it works
      </a>
    </nav>
  );

  return (
    <>
      <Header brandSuffix="MicroResume" centerNav={centerNav} />

      <main className="mr-page">
        <section className="mr-hero" aria-labelledby="mr-hero-title">
          <div className="mr-shell mr-hero__inner">
            <div className="mr-hero__copy">
              <p className="mr-kicker">
                <span aria-hidden="true">——</span> Built for the 6-second
                recruiter scan
              </p>
              <h1 id="mr-hero-title">
                Turn your resume into a
                <br />
                scannable signal
                <br />
                system.
              </h1>
              <p className="mr-hero__lead">
                Bildyx MicroResume is a condensed, card-based professional
                profile designed for how recruiters actually work: scanning,
                pattern-matching, and reducing uncertainty in seconds.
              </p>

              <ul className="mr-bullet-list">
                <li>
                  Make your key signals — roles, companies, products, impact —
                  instantly visible.
                </li>
                <li>
                  Add missing context so unknown universities and companies
                  don&apos;t hold you back.
                </li>
                <li>
                  Standardize messy job titles into clear, comparable role
                  profiles.
                </li>
              </ul>

              <div className="mr-actions">
                <Link
                  className="mr-button mr-button--primary"
                  to="/microresume-example"
                >
                  See MicroResume example
                </Link>
              </div>
              <p className="mr-note">
                Designed to sit on top of your existing resume — not replace it.
              </p>
            </div>
          </div>
        </section>

        <section
          className="mr-blue mr-problems"
          id="why-microresume"
          aria-labelledby="mr-problems-title"
        >
          <div className="mr-shell">
            <header className="mr-section-heading mr-section-heading--light">
              <h2 id="mr-problems-title">
                The three core problems in modern hiring.
              </h2>
              <p>
                Hiring is rapid uncertainty reduction under time pressure.
                Traditional resumes weren&apos;t
                <br className="mr-desktop-only" /> built for 6-second scans,
                missing context, or chaotic job titles.
              </p>
            </header>

            <div className="mr-problem-grid">
              <article className="mr-problem-card">
                <span className="mr-card-label">Problem 1</span>
                <h3>The 6-second reality</h3>
                <p>
                  You spend hours crafting your resume. Recruiters skim it in
                  6–7 seconds. They scan, pattern-match, and look for fast
                  signals — not nuance.
                </p>
                <ul>
                  <li>Candidates optimize for completeness.</li>
                  <li>Recruiters optimize for quick elimination.</li>
                  <li>
                    If title, company, dates, and results aren&apos;t obvious,
                    you&apos;re filtered out.
                  </li>
                </ul>
              </article>

              <article className="mr-problem-card">
                <span className="mr-card-label">Problem 2</span>
                <h3>Missing context creates bias</h3>
                <p>
                  A job title alone means little without the story behind it.
                  Unknown universities and companies feel risky when context is
                  missing.
                </p>
                <ul>
                  <li>
                    Recruiters rely on brands, logos, and familiar institutions.
                  </li>
                  <li>
                    Strong candidates from lesser-known places are quietly
                    ignored.
                  </li>
                  <li>
                    Not for lack of skill — but lack of recognizable signals.
                  </li>
                </ul>
              </article>

              <article className="mr-problem-card">
                <span className="mr-card-label">Problem 3</span>
                <h3>Title inflation &amp; ambiguity</h3>
                <p>
                  &quot;VP&quot; at a 15-person startup. &quot;Lead&quot; with
                  no reports. &quot;Code ninja&quot; in a job ad. Titles alone
                  don&apos;t describe real scope or impact.
                </p>
                <ul>
                  <li>No standard for seniority, scope, or leadership.</li>
                  <li>Candidates get mis-leveled or misunderstood.</li>
                  <li>Ambiguity increases uncertainty — and slows trust.</li>
                </ul>
              </article>
            </div>

            <div className="mr-underlying">
              <p className="mr-kicker mr-kicker--light">
                <span aria-hidden="true">——</span> The underlying issue
              </p>
              <h2>
                Hiring is rapid uncertainty reduction
                <br />
                under time pressure.
              </h2>
              <p>
                To cope, recruiters rely on speed-based scanning, brand
                recognition, and title familiarity.
                <br className="mr-desktop-only" /> When resumes lack clear,
                standardized context, the system defaults to shortcuts.
              </p>
            </div>
          </div>
        </section>

        <section
          className="mr-solution"
          id="how-it-works"
          aria-labelledby="mr-solution-title"
        >
          <div className="mr-shell">
            <header className="mr-section-heading">
              <h2 id="mr-solution-title">The Bildyx MicroResume solution.</h2>
              <p>
                A condensed, modular, card-based professional profile that sits
                on top of your existing
                <br className="mr-desktop-only" /> resume. Built to match real
                recruiter behavior.
              </p>
            </header>

            <div className="mr-feature-grid">
              <article>
                <h3>Built for the 6-second scan</h3>
                <p>
                  MicroResume compresses your story into structured cards that
                  surface role, context, and impact immediately.
                </p>
              </article>
              <article>
                <h3>Context built in</h3>
                <p>
                  Each card carries the missing pieces: company size, industry,
                  product type, scope, certifications, and more. No Googling. No
                  guesswork.
                </p>
              </article>
              <article>
                <h3>Standardized titles</h3>
                <p>
                  Chaotic job titles translate into clear role profiles that
                  show what you do, what you ship, and which tools you use.
                </p>
              </article>
              <article>
                <h3>From paragraphs to structured signal units</h3>
                <p>
                  Instead of dense text blocks, recruiters see modular signal
                  cards: Company, Role, Product, Certification, Education,
                  Skills, and Impact.
                </p>
              </article>
              <article>
                <h3>Modular &amp; adaptable</h3>
                <p>
                  Stack relevant cards per application so each MicroResume feels
                  targeted without rewriting your entire story.
                </p>
              </article>
              <article>
                <h3>Reduces brand bias</h3>
                <p>
                  When structured context is visible, evaluation shifts from
                  logo recognition to substance — skills, scope, and outcomes.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="mr-blue mr-advantage"
          aria-labelledby="mr-advantage-title"
        >
          <div className="mr-shell">
            <header className="mr-section-heading mr-section-heading--light">
              <h2 id="mr-advantage-title">
                The core advantage: less guessing, more clarity.
              </h2>
              <p>
                Traditional resumes increase uncertainty through ambiguous
                titles, unknown brands,
                <br className="mr-desktop-only" /> dense formatting, and hidden
                impact. Bildyx reduces uncertainty by standardizing how
                <br className="mr-desktop-only" /> your story is read.
              </p>
            </header>

            <div className="mr-advantage-grid">
              <article>
                <h3>Traditional resumes rely on</h3>
                <p>
                  Brand recognition, formatting tricks, and keyword stuffing —
                  all weak proxies for actual fit.
                </p>
              </article>
              <article>
                <h3>Why it matters</h3>
                <p>
                  The best candidate shouldn&apos;t just be the one with the
                  most famous logo or most polished formatting. They should be
                  the one whose skills, experience, and impact actually match
                  the role.
                </p>
              </article>
              <article>
                <h3>Bildyx MicroResume focuses on</h3>
                <p>
                  Structured signals: context, scope, tools, products, and
                  impact — the things that really define your work.
                </p>
              </article>
              <article>
                <h3>Being qualified isn&apos;t enough</h3>
                <p>
                  In modern hiring you also need to be legible. MicroResume
                  helps you be understood — instantly.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="mr-final" aria-labelledby="mr-final-title">
          <div className="mr-shell mr-final__inner">
            <h2 id="mr-final-title">Build your first Bildyx MicroResume.</h2>
            <p>
              If you&apos;re tired of being overlooked because your story
              doesn&apos;t fit
              <br className="mr-desktop-only" /> into a 6-second skim,
              MicroResume is for you. Turn your
              <br className="mr-desktop-only" /> experience into a clear,
              scannable signal system.
            </p>
            <p className="mr-note">
              No spam. Just occasional progress updates and an invite when
              we&apos;re ready.
            </p>
          </div>
        </section>
      </main>

      <Footer brandSuffix="MicroResume" />
    </>
  );
}
