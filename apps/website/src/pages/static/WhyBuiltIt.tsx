import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { usePageMeta } from "../../hooks/usePageMeta";
import "../../css/why-built-it.css";

export default function WhyBuiltIt() {
  usePageMeta("Why We Built It — Bildyx", "Why Bildyx was built: clarity, chemistry, and confidence in hiring.");

  return (
    <>
      <Header />

      <main className="why-built-main">
        <section className="why-hero" aria-labelledby="why-title">
          <span className="why-eyebrow">Why we built it</span>
          <h1 id="why-title">Why We Build</h1>
          <p>We built Bildyx because hiring should be about clarity, chemistry, and confidence — not keywords and guesswork.</p>
        </section>

        <section className="why-origin" aria-labelledby="origin-title">
          <div className="why-origin__text">
            <span className="why-eyebrow">The origin</span>
            <h2 id="origin-title">It Started With a Question</h2>
            <p>
              Why is hiring — one of the most important decisions companies and candidates make — still so slow,
              biased, and unclear?
            </p>
            <p>
              We watched brilliant candidates get filtered out by keywords. We saw great companies lose talent to
              noise. Something was clearly off.
            </p>
            <p>So we set out to fix it — an answer at a time.</p>
          </div>

          <aside className="why-origin__timeline" aria-label="Bildyx milestones">
            <ul>
              <li>
                <strong>First candidate saved</strong>
                <span>Structured signal beat keyword sorting.</span>
              </li>
              <li>
                <strong>First company</strong>
                <span>A team that trusted context over CVs.</span>
              </li>
              <li>
                <strong>First framework</strong>
                <span>The MicroResume model was born.</span>
              </li>
              <li>
                <strong>First iteration</strong>
                <span>Real feedback shaped every card.</span>
              </li>
              <li>
                <strong>Products shipped</strong>
                <span>Team profiles, MicroResume, Company Test.</span>
              </li>
              <li>
                <strong>Still going</strong>
                <span>New answers every week.</span>
              </li>
            </ul>
          </aside>
        </section>

        <section className="why-beliefs" aria-labelledby="beliefs-title">
          <div className="why-section-heading why-section-heading--light">
            <span className="why-eyebrow">Our beliefs</span>
            <h2 id="beliefs-title">
              Four beliefs that guide
              <br />
              everything we make
            </h2>
          </div>

          <div className="belief-grid">
            <article className="belief-card">
              <img src="/images/why-purpose.png" alt="" aria-hidden="true" />
              <h3>We Build With Purpose</h3>
              <p>Every feature starts with a clear reason. If it doesn&apos;t move hiring forward for candidates or teams, we don&apos;t ship it.</p>
            </article>

            <article className="belief-card">
              <img src="/images/why-people.png" alt="" aria-hidden="true" />
              <h3>We Build For People</h3>
              <p>Real recruiters, real job seekers, real teams. We design around the humans on both sides of the hiring table.</p>
            </article>

            <article className="belief-card">
              <img src="/images/why-curiosity.png" alt="" aria-hidden="true" />
              <h3>We Build Through Curiosity</h3>
              <p>The best solutions come from asking better questions. We keep learning, testing, and refining what works.</p>
            </article>

            <article className="belief-card">
              <img src="/images/why-together.png" alt="" aria-hidden="true" />
              <h3>We Build Together</h3>
              <p>Great products aren&apos;t built alone. We partner with candidates and companies to shape Bildyx.</p>
            </article>
          </div>
        </section>

        <section className="why-process" aria-labelledby="process-title">
          <div className="why-section-heading">
            <span className="why-eyebrow">How we work</span>
            <h2 id="process-title">The Building Process</h2>
          </div>

          <ol className="process-list">
            <li>
              <span>01</span>
              <strong>Discover</strong>
              <p>Listen to candidates and teams to find what&apos;s actually broken.</p>
            </li>
            <li>
              <span>02</span>
              <strong>Understand</strong>
              <p>Dig into the why behind hiring friction, not just the symptoms.</p>
            </li>
            <li>
              <span>03</span>
              <strong>Create</strong>
              <p>Design solutions that match how hiring really works.</p>
            </li>
            <li>
              <span>04</span>
              <strong>Test</strong>
              <p>Ship early, learn fast, and refine with real users.</p>
            </li>
            <li>
              <span>05</span>
              <strong>Improve</strong>
              <p>Iterate until every touchpoint feels obvious and effortless.</p>
            </li>
            <li>
              <span>06</span>
              <strong>Deliver</strong>
              <p>Roll it out to companies and candidates who need it.</p>
            </li>
          </ol>
        </section>

        <section className="why-iterate" aria-labelledby="iterate-title">
          <div className="why-iterate__intro">
            <div>
              <span className="why-eyebrow">How we iterate</span>
              <h2 id="iterate-title">
                Building is a process,
                <br />
                not a moment.
              </h2>
            </div>
            <p>
              Every version of Bildyx is shaped by conversations with candidates, teams, and recruiters. We keep
              listening — because the moment we stop, we stop building the right thing.
            </p>
          </div>

          <div className="iterate-grid">
            <article className="iterate-card iterate-card--large">
              <p>Sticky notes, whiteboards, and long calls — the real R&amp;D lives here.</p>
            </article>
            <article className="iterate-card">
              <p>Every card, every field, every question — pressure-tested.</p>
            </article>
            <article className="iterate-card iterate-card--blue">
              <blockquote>
                &quot;Fail faster.
                <br />
                Learn deeper.&quot;
              </blockquote>
              <span>— our motto</span>
            </article>
            <article className="iterate-card">
              <p>From sketches to shipped features in weeks — not quarters.</p>
            </article>
            <article className="iterate-card iterate-card--outline">
              <p>Every release is a step closer to hiring without friction.</p>
            </article>
          </div>
        </section>

        <section className="why-stats" aria-label="Bildyx numbers">
          <div>
            <strong>10+</strong>
            <span>Years of hiring experience</span>
          </div>
          <div>
            <strong>50+</strong>
            <span>Teams onboarded</span>
          </div>
          <div>
            <strong>100K+</strong>
            <span>MicroResumes powered</span>
          </div>
        </section>

        <section className="why-testimonials" aria-labelledby="testimonials-title">
          <div className="why-section-heading">
            <span className="why-eyebrow">What people say</span>
            <h2 id="testimonials-title">
              What people say about
              <br />
              the work
            </h2>
          </div>

          <div className="testimonial-grid">
            <article className="testimonial-card">
              <p>&quot;Bildyx made our hiring process feel structured for the first time. We finally see the signal, not the noise.&quot;</p>
              <div>
                <span>S</span>
                <strong>Sarah K.</strong>
                <small>Head of Talent</small>
              </div>
            </article>

            <article className="testimonial-card">
              <p>&quot;As a candidate, I felt seen. The MicroResume put my real story in front of the right teams.&quot;</p>
              <div>
                <span>J</span>
                <strong>James T.</strong>
                <small>Product Designer</small>
              </div>
            </article>

            <article className="testimonial-card">
              <p>&quot;The clarity Bildyx brings to both sides of hiring is the difference between guessing and knowing.&quot;</p>
              <div>
                <span>P</span>
                <strong>Priya S.</strong>
                <small>Founder</small>
              </div>
            </article>
          </div>
        </section>

        <section className="why-cta" aria-labelledby="cta-title">
          <span className="why-eyebrow">Keep going</span>
          <h2 id="cta-title">
            Still building. Still
            <br />
            learning. Still searching
            <br />
            for better answers.
          </h2>
          <p>Bildyx is a living product. If you have an idea, a problem, or a story — we want to hear it.</p>
          <div className="why-cta__actions">
            <Link className="why-button why-button--white" to="/contact">
              Contact us
            </Link>
            <Link className="why-button why-button--ghost" to="/mission">
              See our mission
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
