import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePageMeta } from "../hooks/usePageMeta";
import { getSession } from "../lib/session";
import { PersonalityService } from "../services/personality.service";
import type { TestSummaryItem } from "@repo/models/personality_test_results";
import "../css/tests-preferences.css";
import ProfileAside from "../components/ProfileAside";

const personalityService = new PersonalityService();

const TEST_ICONS: Record<string, string> = {
  BIG5: "fa-brain",
  ASSERTIVENESS: "fa-wand-magic-sparkles",
  CREATIVE_ANALYTICAL: "fa-brain",
  INTELLECTUAL_CURIOSITY: "fa-lightbulb",
  ENTREPRENEUR: "fa-rocket",
  SELF_MOTIVATION: "fa-user-group",
};

function isInProgress(code: string): boolean {
  const localKey = `bildyx_${code.toLowerCase()}_answers`;
  const localAnswers = localStorage.getItem(localKey);
  if (!localAnswers) return false;
  try {
    const parsed = JSON.parse(localAnswers);
    return Object.keys(parsed).filter((k) => parsed[k]).length > 0;
  } catch {
    return false;
  }
}

export default function TestsPreferences() {
  usePageMeta("Tests & Preferences — Bildyx", "Manage Bildyx tests and preferences.");

  const [tests, setTests] = useState<TestSummaryItem[] | null>(null);
  const [loadingResult, setLoadingResult] = useState<string | null>(null);

  useEffect(() => {
    // Font Awesome, loaded like the inline <link> in the original tests-preferences.php
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css";
      document.head.appendChild(link);
    }

    const session = getSession();
    if (!session) {
      console.warn("[TestsPreferences] No active session found.");
      return;
    }

    personalityService
      .getTestsSummary(session.profileId || "")
      .then(setTests)
      .catch((err) => console.error("[TestsPreferences] Error updating statuses:", err));
  }, []);

  return (
    <>
      <Header />

      <main className="tp-page">
        <div className="tp-shell">
          <section className="tp-card tp-table-card" aria-labelledby="tp-title">
            <h1 id="tp-title">Tests &amp; Preferences</h1>

            <div className="tp-tests-table" role="table" aria-label="Tests and preferences list">
              <div className="tp-table-head" role="row">
                <span role="columnheader">Name</span>
                <span role="columnheader">Type</span>
                <span role="columnheader">Status</span>
                <span role="columnheader">Summary</span>
              </div>

              {tests === null ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div className="tp-skeleton-row" role="row" key={i}>
                    {Array.from({ length: 4 }).map((__, j) => (
                      <span role="cell" key={j}>
                        <span className="tp-skeleton-bar" style={{ width: "50%" }} />
                      </span>
                    ))}
                  </div>
                ))
              ) : (
                tests.map((test) => {
                  const inProgress = isInProgress(test.code);
                  const statusText = test.is_completed ? "Completed" : inProgress ? "In Progress" : "Not Started";
                  const icon = TEST_ICONS[test.code] || "fa-brain";

                  return (
                    <div className="tp-test-row" role="row" key={test.code}>
                      <span className="tp-test-name" role="cell">
                        <Link to={`/tests-preferences/test?test=${test.code}`} className="tp-test-name-link">
                          <span className="tp-icon">
                            <i className={`fa-solid ${icon}`} />
                          </span>{" "}
                          {test.name}
                        </Link>
                      </span>
                      <span role="cell">Personality Test</span>
                      <span className="tp-status" role="cell">
                        {statusText}
                      </span>
                      <span role="cell">
                        {test.is_completed && (
                          <Link
                            to={`/tests-preferences/result?test=${test.code}`}
                            className="tp-result-button"
                            style={
                              loadingResult === test.code
                                ? { pointerEvents: "none", opacity: 0.7 }
                                : undefined
                            }
                            onClick={() => setLoadingResult(test.code)}
                          >
                            {loadingResult === test.code ? (
                              <>
                                <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 6 }} /> Loading...
                              </>
                            ) : (
                              "View Result"
                            )}
                          </Link>
                        )}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <ProfileAside activePage="tests-preferences" />
        </div>
      </main>

      <Footer />
    </>
  );
}
