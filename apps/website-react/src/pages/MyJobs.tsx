import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePageMeta } from "../hooks/usePageMeta";
import { companyGroups, jobs } from "../data/myJobsData";
import "../css/my-jobs.css";
import ProfileAside from "../components/ProfileAside";

const SCORE_LABEL: Record<string, string> = { high: "H", medium: "M", empty: "–" };

export default function MyJobs() {
  usePageMeta("My Jobs — Bildyx", "Recommended teams and jobs based on your Bildyx MicroResume.");

  const [activeCompany, setActiveCompany] = useState("pekamix");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(
    () => new Set(Object.values(jobs).filter((j) => j.appliedByDefault).map((j) => j.id)),
  );

  const selectedJob = selectedJobId ? jobs[selectedJobId] : null;

  const groupForJob = useMemo(() => {
    const map: Record<string, string> = {};
    companyGroups.forEach((group) => group.jobIds.forEach((id) => (map[id] = group.key)));
    return map;
  }, []);

  function openJob(jobId: string) {
    setSelectedJobId(jobId);
    setActiveCompany(groupForJob[jobId]);
  }

  function selectCompany(companyKey: string) {
    setActiveCompany(companyKey);
    const group = companyGroups.find((g) => g.key === companyKey);
    if (group?.jobIds.length) openJob(group.jobIds[0]);
  }

  function toggleApply(jobId: string, event: React.MouseEvent) {
    event.stopPropagation();
    setAppliedIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  }

  return (
    <>
      <Header />

      <main className="mj-page">
        <div className="mj-shell">
          <aside className="mj-recommendation-rail" aria-label="Recommended jobs and teams">
            <div className="mj-rail-header">
              <button
                className={`mj-company-tab${activeCompany === "pekamix" ? " is-active" : ""}`}
                type="button"
                aria-pressed={activeCompany === "pekamix"}
                onClick={() => selectCompany("pekamix")}
              >
                <span aria-hidden="true">▥</span>
                Pekamix
              </button>
              <button
                className="mj-clear-button"
                type="button"
                aria-label="Clear selected job"
                onClick={() => setSelectedJobId(null)}
              >
                C
              </button>
            </div>

            {companyGroups.map((group) => (
              <div className="mj-company-group" key={group.key}>
                <button
                  className={`mj-company-tab mj-company-tab--sub${activeCompany === group.key ? " is-active" : ""}`}
                  type="button"
                  aria-pressed={activeCompany === group.key}
                  onClick={() => selectCompany(group.key)}
                >
                  <span aria-hidden="true">▥</span>
                  {group.label}
                </button>

                {group.jobIds.map((jobId) => {
                  const job = jobs[jobId];
                  const isApplied = appliedIds.has(jobId);
                  return (
                    <article
                      className={`mj-job-card${selectedJobId === jobId ? " is-active" : ""}`}
                      tabIndex={0}
                      role="button"
                      aria-pressed={selectedJobId === jobId}
                      key={jobId}
                      onClick={() => openJob(jobId)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openJob(jobId);
                        }
                      }}
                    >
                      <div className="mj-line-row">
                        <span>Team:</span>
                        <strong>{job.team}</strong>
                      </div>
                      <div className="mj-score-row" aria-label="Recommendation scores">
                        {job.scores.map((score, i) => (
                          <span className={`mj-score mj-score--${score}`} key={i}>
                            {SCORE_LABEL[score]}
                          </span>
                        ))}
                      </div>
                      <div className="mj-score-labels" aria-hidden="true">
                        <span>O</span>
                        <span>T</span>
                        <span>M</span>
                        <span>J</span>
                      </div>
                      {job.job && (
                        <div className="mj-line-row">
                          <span>Job:</span>
                          <strong>{job.job}</strong>
                        </div>
                      )}
                      {job.product && (
                        <div className="mj-line-row">
                          <span>Product:</span>
                          <strong>{job.product}</strong>
                        </div>
                      )}
                      {(job.job || job.product) && (
                        <button className="mj-apply-button" type="button" onClick={(e) => toggleApply(jobId, e)}>
                          {isApplied ? "Applied" : "Apply"}
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>
            ))}
          </aside>

          <section className="mj-main-card" aria-labelledby="my-jobs-title">
            <div className="mj-preview" aria-live="polite">
              <h1 id="my-jobs-title">My Jobs</h1>
              <p className="mj-lead">
                Recommended teams and jobs based on your MicroResume. Select a recommendation on the left to preview
                the team profile.
              </p>

              {!selectedJob ? (
                <div className="mj-empty-state">Click on a team in the left sidebar to view its full profile here.</div>
              ) : (
                <article className="mj-preview-card">
                  <header className="mj-preview-header">
                    <div>
                      <h2>
                        {selectedJob.company} - {selectedJob.team}
                      </h2>
                      <p>
                        {selectedJob.job} · {selectedJob.product}
                      </p>
                    </div>
                    <span className="mj-match-badge">{selectedJob.match}</span>
                  </header>
                  <div className="mj-preview-grid">
                    <section className="mj-preview-box">
                      <h3>Team summary</h3>
                      <p>{selectedJob.summary}</p>
                    </section>
                    <section className="mj-preview-box">
                      <h3>Why it matches you</h3>
                      <ul>
                        {selectedJob.why.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </section>
                    <section className="mj-preview-box">
                      <h3>How they work</h3>
                      <p>{selectedJob.work}</p>
                    </section>
                    <section className="mj-preview-box">
                      <h3>Next step</h3>
                      <p>Review the team profile, compare fit signals, then apply when the match feels right.</p>
                    </section>
                  </div>
                  <div className="mj-preview-actions">
                    <button className="mj-primary-action" type="button" onClick={(e) => toggleApply(selectedJob.id, e)}>
                      {appliedIds.has(selectedJob.id) ? "Applied" : "Apply"}
                    </button>
                    <button className="mj-secondary-action" type="button" onClick={() => setSelectedJobId(null)}>
                      Close preview
                    </button>
                  </div>
                </article>
              )}
            </div>
          </section>

          <ProfileAside activePage="my-jobs" />
        </div>
      </main>

      <Footer />
    </>
  );
}
