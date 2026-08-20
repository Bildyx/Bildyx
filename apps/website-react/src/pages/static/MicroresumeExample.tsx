import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { usePageMeta } from "../../hooks/usePageMeta";
import "../../css/microresume-example.css";

/**
 * Card slots below (`data-card-slot`) are placeholders for future backend
 * data, exactly as in the original — kept empty for the same reason (see
 * window.BildyxMicroResume.mountCard in js/microresume-example.ts).
 */
export default function MicroresumeExample() {
  usePageMeta(
    "MicroResume Example — Bildyx",
    "Example of a structured Bildyx MicroResume profile.",
  );

  return (
    <>
      <Header simpleAccountIcon />

      <main className="mre-page">
        <article className="mre-resume" aria-labelledby="mre-name">
          <header className="mre-profile-header">
            <div className="mre-name-pill">
              <h1 id="mre-name">Hanako Kingswell</h1>
              <span>MicroResume</span>
            </div>

            <div className="mre-introduction">
              <img
                className="mre-avatar"
                src="/images/hanako.png"
                alt="Portrait of Hanako Kingswell"
              />
              <p>
                Results-driven Software Engineer with experience at Pekamix,
                contributing to the development and enhancement of Sales
                Software solutions. Skilled in designing scalable business
                applications, improving system performance, and collaborating
                across cross-functional global teams to deliver high-quality
                software products. Bilingual in Japanese and English, enabling
                effective communication with international stakeholders,
                bridging technical and business requirements across diverse
                markets.
              </p>
            </div>

            <div className="mre-profile-grid">
              <section aria-labelledby="mre-role-title">
                <h2 id="mre-role-title">Software Engineer</h2>
                <p className="mre-meta-label">◐ Languages</p>
                <div className="mre-tags" aria-label="Languages">
                  <span>Japanese</span>
                  <span>English</span>
                  <span>German</span>
                </div>

                <ul className="mre-summary-list">
                  <li>Countries: USA</li>
                  <li>Companies: Pekamix</li>
                  <li>Products: Sales Software</li>
                  <li>Job Occupations: Software Engineer</li>
                </ul>
              </section>

              <section aria-labelledby="mre-skills-title">
                <h3 id="mre-skills-title">Top skills</h3>
                <div className="mre-skill-tags">
                  <span>Software Development</span>
                  <span>Team Building</span>
                  <span>Problem Solving</span>
                  <span>CRM Integration</span>
                  <span>Performance Optimization</span>
                </div>
              </section>
            </div>
          </header>

          <section
            className="mre-section"
            aria-labelledby="mre-experiences-title"
          >
            <h2 id="mre-experiences-title">Experiences</h2>

            <div className="mre-entry-heading">
              <div className="mre-entry-icon">
                <img src="/images/city-seattle.png" alt="Seattle" />
              </div>
              <div>
                <strong>Jan 2015–Now</strong>
                <span>Seattle, Washington</span>
                <span>Pekamix</span>
                <a href="#">Software Engineer</a>
              </div>
            </div>

            <p className="mre-entry-description">
              I did various jobs in Pekamix. Mainly software developer. I also
              supported Japanese clients in USA and collaborated with the Tokyo
              office. My main languages are Java, C++ and Python.
            </p>

            <div className="mre-card-grid mre-card-grid--three">
              <section className="mre-card-column">
                <h3>Company</h3>
                <div
                  className="mre-card-slot"
                  data-card-slot="experience-company"
                  aria-label="Company card placeholder"
                />
              </section>

              <section className="mre-card-column">
                <h3>Product/Service</h3>
                <div
                  className="mre-card-slot"
                  data-card-slot="experience-product"
                  aria-label="Product or service card placeholder"
                />
              </section>

              <section className="mre-card-column">
                <h3>Role</h3>
                <div
                  className="mre-card-slot"
                  data-card-slot="experience-role"
                  aria-label="Role card placeholder"
                />
              </section>
            </div>

            <div
              className="mre-tags mre-tags--experience"
              aria-label="Experience skills"
            >
              <span>Code Optimization</span>
              <span>Refactoring</span>
              <span>Debugging</span>
              <span>DevOps</span>
              <span>Project Management</span>
            </div>
          </section>

          <section
            className="mre-section"
            aria-labelledby="mre-education-title"
          >
            <h2 id="mre-education-title">Education</h2>
            <p className="mre-entry-description">
              I was top student. I was on dean list many times. I got
              scholarship for academic achievement. I was active in Asian Club,
              debate club, sailing and hiking.
            </p>

            <article className="mre-education-entry">
              <header className="mre-education-heading">
                <div className="mre-entry-icon" aria-hidden="true">
                  ◆
                </div>
                <div>
                  <h3>Master</h3>
                  <span>University</span>
                </div>
                <time dateTime="2010/2012">2010–2012</time>
              </header>

              <div className="mre-card-grid mre-card-grid--two">
                <div
                  className="mre-card-slot mre-card-slot--education"
                  data-card-slot="master-university"
                  aria-label="Master university card placeholder"
                />
                <div
                  className="mre-card-slot mre-card-slot--education"
                  data-card-slot="master-degree"
                  aria-label="Master degree card placeholder"
                />
              </div>
            </article>

            <article className="mre-education-entry">
              <header className="mre-education-heading">
                <div className="mre-entry-icon" aria-hidden="true">
                  ◆
                </div>
                <div>
                  <h3>Bachelor</h3>
                  <span>University</span>
                </div>
                <time dateTime="2006/2010">2006–2010</time>
              </header>

              <div className="mre-card-grid mre-card-grid--two">
                <div
                  className="mre-card-slot mre-card-slot--education"
                  data-card-slot="bachelor-university"
                  aria-label="Bachelor university card placeholder"
                />
                <div
                  className="mre-card-slot mre-card-slot--education"
                  data-card-slot="bachelor-degree"
                  aria-label="Bachelor degree card placeholder"
                />
              </div>
            </article>
          </section>
        </article>
      </main>

      <Footer />
    </>
  );
}
