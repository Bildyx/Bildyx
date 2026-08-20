import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { usePageMeta } from "../../hooks/usePageMeta";
import "../../css/company-archives.css";

/**
 * The `data-card-slot` divs below are placeholders the future backend fills
 * in (see window.BildyxCompanyArchives.mount/clear in the original
 * js/company-archives.ts). They're kept empty here for the same reason —
 * there's no data source wired up yet.
 */
export default function CompanyArchives() {
  usePageMeta(
    "Pekamix Company Archives — Bildyx",
    "Historical company information for Pekamix.",
  );

  return (
    <>
      <Header />

      <main className="ca-archive-page">
        <div className="ca-company-bar">PEKAMIX</div>

        <div className="ca-layout">
          <aside className="ca-rail" aria-label="Company placeholders">
            <div
              className="ca-company-placeholder"
              data-card-slot="current-company"
            />

            <h1 className="ca-rail-title">Parent Company</h1>

            <div
              className="ca-company-placeholder"
              data-card-slot="parent-company"
            />

            <a className="ca-archive-link is-active" href="/company-archives">
              <span aria-hidden="true">▣</span>
              Company Archives
            </a>
          </aside>

          <section className="ca-content">
            <div className="ca-panel">
              <h2>HISTORY</h2>

              <section className="ca-section">
                <h3>Founding Team</h3>
                <div className="ca-card-frame">
                  <div className="ca-people-grid ca-people-grid--founders">
                    <article className="ca-person-card">
                      <img src="/images/robert.png" alt="Robert" />
                      <div>
                        <strong>Robert</strong>
                        <span>Founder &amp; CEO</span>
                      </div>
                    </article>
                    <article className="ca-person-card">
                      <img src="/images/sarah.png" alt="Sarah" />
                      <div>
                        <strong>Sarah</strong>
                        <span>Co-Founder, CTO</span>
                      </div>
                    </article>
                    <article className="ca-person-card">
                      <img src="/images/marco.png" alt="Marco" />
                      <div>
                        <strong>Marco</strong>
                        <span>Chief Architect</span>
                      </div>
                    </article>
                    <article className="ca-person-card">
                      <img src="/images/mei.png" alt="Mei" />
                      <div>
                        <strong>Mei</strong>
                        <span>Head of Product</span>
                      </div>
                    </article>
                    <article className="ca-person-card">
                      <img src="/images/james.png" alt="James" />
                      <div>
                        <strong>James</strong>
                        <span>VP Sales</span>
                      </div>
                    </article>
                    <article className="ca-person-card">
                      <img src="/images/grace.png" alt="Grace" />
                      <div>
                        <strong>Grace</strong>
                        <span>VP Operations</span>
                      </div>
                    </article>
                  </div>
                </div>
              </section>

              <section className="ca-section">
                <h3>Alumni</h3>
                <div className="ca-card-frame">
                  <div className="ca-people-grid ca-people-grid--alumni">
                    <article className="ca-person-card">
                      <img src="/images/david.png" alt="David" />
                      <div>
                        <strong>David</strong>
                        <span>Former Engineer</span>
                      </div>
                    </article>
                    <article className="ca-person-card">
                      <img src="/images/anna.png" alt="Anna" />
                      <div>
                        <strong>Anna</strong>
                        <span>Former Designer</span>
                      </div>
                    </article>
                    <article className="ca-person-card">
                      <img src="/images/rahul.png" alt="Rahul" />
                      <div>
                        <strong>Rahul</strong>
                        <span>Former QA Lead</span>
                      </div>
                    </article>
                  </div>
                </div>
              </section>

              <section className="ca-section">
                <h3>Former Office Locations</h3>
                <div className="ca-office-grid">
                  <article className="ca-office-card">
                    <img src="/images/london.png" alt="London" />
                    <span>London</span>
                  </article>
                  <article className="ca-office-card">
                    <img src="/images/paris.png" alt="Paris" />
                    <span>Paris</span>
                  </article>
                  <article className="ca-office-card">
                    <img src="/images/berlin.png" alt="Berlin" />
                    <span>Berlin</span>
                  </article>
                </div>
              </section>

              <section className="ca-section">
                <h3>Former Parent Company</h3>
                <article className="ca-info-card ca-info-card--compact">
                  <div className="ca-info-card__title">
                    <span aria-hidden="true">▣</span>
                    <strong>Vanguard Holdings (1995–2005)</strong>
                  </div>
                  <div className="ca-info-card__meta">
                    <div>
                      <b>Industry</b>
                      <span>Conglomerate</span>
                    </div>
                    <div>
                      <b>HQ</b>
                      <span>New York, NY</span>
                    </div>
                  </div>
                </article>
              </section>

              <section className="ca-section">
                <h3>Retired Product and Service Portfolio</h3>
                <div className="ca-inline-list">
                  <span>▤ Legacy Hosting v1</span>
                  <span>▤ On-Premise CRM</span>
                </div>
              </section>

              <section className="ca-section">
                <span className="ca-archive-pill">Retired Brands</span>
                <div className="ca-card-frame ca-card-frame--brands">
                  <article className="ca-brand-card">
                    <div className="ca-brand-icon">A</div>
                    <div>
                      <strong>AlphaTech</strong>
                      <dl>
                        <div>
                          <dt>Status</dt>
                          <dd>Active</dd>
                        </div>
                        <div>
                          <dt>Years</dt>
                          <dd>2003–2010</dd>
                        </div>
                      </dl>
                    </div>
                  </article>
                  <article className="ca-brand-card">
                    <div className="ca-brand-icon">☁</div>
                    <div>
                      <strong>CloudSprint</strong>
                      <dl>
                        <div>
                          <dt>Status</dt>
                          <dd>Active</dd>
                        </div>
                        <div>
                          <dt>Years</dt>
                          <dd>2011–2015</dd>
                        </div>
                      </dl>
                    </div>
                  </article>
                </div>
              </section>

              <section className="ca-section">
                <span className="ca-archive-pill">Photos (Historical)</span>
                <div className="ca-photo-grid">
                  <img
                    src="/images/historical-office.png"
                    alt="Historical open-space office"
                  />
                  <img
                    src="/images/historical-datacenter.png"
                    alt="Historical data center"
                  />
                </div>
              </section>

              <section className="ca-section">
                <span className="ca-archive-pill">Former Partners</span>
                <article className="ca-detail-card">
                  <strong>DataLink Corp</strong>
                  <div>
                    <b>Partnership</b>
                    <span>2005–2012</span>
                  </div>
                </article>
              </section>

              <section className="ca-section">
                <span className="ca-archive-pill">Former Customers</span>
                <article className="ca-detail-card">
                  <strong>GlobalNet</strong>
                  <div>
                    <b>Client Years</b>
                    <span>2008–2015</span>
                  </div>
                </article>
              </section>

              <section className="ca-section">
                <span className="ca-archive-pill">Former Investors</span>
                <article className="ca-detail-card">
                  <strong>SeedCap Partners</strong>
                  <div>
                    <b>Investment</b>
                    <span>Series A</span>
                  </div>
                </article>
              </section>

              <section className="ca-section">
                <span className="ca-archive-pill">Former Subsidiaries</span>
                <article className="ca-detail-card">
                  <strong>Pekamix Mobile</strong>
                  <div>
                    <b>Status</b>
                    <span>Merged (2018)</span>
                  </div>
                </article>
              </section>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
