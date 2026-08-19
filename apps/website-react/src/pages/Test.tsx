import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePageMeta } from "../hooks/usePageMeta";
import { getSession } from "../lib/session";
import { PersonalityService } from "../services/personality.service";
import type { PersonalityQuestion } from "@repo/models/personality_questions";
import "../css/personality-test-pages.css";
import ProfileAside from "../components/ProfileAside";

const personalityService = new PersonalityService();

const ICONS = ["✦", "♞", "▣", "⌁", "▫", "○", "♙", "♧", "☷", "☯", "✐", "⚖", "✧", "🛡", "⚑", "⏱", "◎", "▥", "☻"];

type Answers = Record<string, string | number>;

export default function Test() {
  usePageMeta("Personality Test — Bildyx", "Take a personality test on Bildyx.");

  useEffect(() => {
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css";
      document.head.appendChild(link);
    }
  }, []);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const testCode = (searchParams.get("test") || "BIG5").toUpperCase();
  const storageKey = `bildyx_${testCode.toLowerCase()}_answers`;
  const isYesNo = testCode === "ENTREPRENEUR" || testCode === "SELF_MOTIVATION";

  const [testName, setTestName] = useState("Loading...");
  const [testSubtitle, setTestSubtitle] = useState("Loading description...");
  const [questions, setQuestions] = useState<PersonalityQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || !session.profileId) {
      navigate("/login");
      return;
    }
    setProfileId(session.profileId);

    (async () => {
      try {
        const testResponse = await personalityService.getTestByCode(testCode);
        const testDb = testResponse[0];
        if (!testDb) {
          console.error("[Test] Test not found in database for code:", testCode);
          return;
        }

        setTestName(testDb.name);
        setTestSubtitle(testDb.description || "");

        const [questionsDb, savedAnswersResponse] = await Promise.all([
          personalityService.getQuestionsByTestId(testDb.id),
          personalityService.getSavedAnswers(session.profileId!, testCode),
        ]);

        questionsDb.sort((a, b) => a.order - b.order);
        setQuestions(questionsDb);

        let initialAnswers: Answers = {};
        if (savedAnswersResponse?.answers) {
          Object.entries(savedAnswersResponse.answers).forEach(([key, val]) => {
            if (isYesNo) {
              if (val === 5) initialAnswers[key] = "yes";
              else if (val === 1) initialAnswers[key] = "no";
            } else {
              initialAnswers[key] = val;
            }
          });
          localStorage.setItem(storageKey, JSON.stringify(initialAnswers));
        } else {
          try {
            initialAnswers = JSON.parse(localStorage.getItem(storageKey) || "{}");
          } catch {
            // ignore malformed cache
          }
        }
        setAnswers(initialAnswers);
      } catch (err) {
        console.error("[Test] Initialization error:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testCode]);

  const answeredCount = useMemo(() => {
    if (!questions) return 0;
    return questions.filter((q) => {
      const val = answers[String(q.order)];
      return val !== undefined && val !== null && val !== "";
    }).length;
  }, [questions, answers]);

  const allAnswered = questions !== null && answeredCount === questions.length && questions.length > 0;

  function setAnswer(order: number, value: string | number) {
    setAnswers((prev) => {
      const next = { ...prev, [String(order)]: value };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }

  async function handleDiscard() {
    if (!profileId) return;
    if (!window.confirm("Are you sure you want to discard your answers and delete this result?")) return;

    try {
      await personalityService.deleteByTestCode(profileId, testCode);
    } catch (err) {
      console.error("[Test] Error deleting result on backend:", err);
    }

    localStorage.removeItem(storageKey);
    setAnswers({});
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!allAnswered || !profileId) return;

    setIsSubmitting(true);
    try {
      await personalityService.submitResult(profileId, testCode, answers);
      navigate(`/tests-preferences/result?test=${testCode}`);
    } catch (err) {
      console.error("[Test] Submit error:", err);
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Header />

      <main className="pt-page">
        <div className="pt-shell">
          <section className="pt-card" aria-labelledby="pt-title" style={{ position: "relative" }}>
            {isSubmitting && (
              <div className="pt-loader" style={{ display: "flex" }}>
                <div className="pt-spinner-container">
                  <div className="pt-spinner" />
                  <p className="pt-loader-text">Saving answers and calculating results, please wait...</p>
                </div>
              </div>
            )}

            <header className="pt-header">
              <Link className="pt-back" to="/tests-preferences" aria-label="Back to tests and preferences">
                ‹
              </Link>
              <div>
                <h1 id="pt-title">
                  Personality Test: <span>{testName}</span>
                </h1>
                <p>{testSubtitle}</p>
              </div>
            </header>

            <div className="pt-content">
              <aside className="pt-question-nav" aria-label="Questions list">
                <h2>Questions</h2>
                <nav className="pt-question-list">
                  {questions === null
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div className="pt-skeleton-nav-item" key={i}>
                          <span className="pt-skeleton-bar" style={{ width: "75%", height: 14 }} />
                        </div>
                      ))
                    : questions.map((q) => (
                        <a key={q.id} href={`#question-${q.order}`} className={answers[String(q.order)] ? "is-answered" : ""}>
                          <strong>{q.order}.</strong> <span>{q.text}</span>
                        </a>
                      ))}
                </nav>
              </aside>

              <form className="pt-form" onSubmit={handleSubmit}>
                <div className="pt-scroll-area">
                  {questions === null
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <div className="pt-skeleton-question" key={i}>
                          <span className="pt-skeleton-bar" style={{ width: "55%", height: 20, marginBottom: 16 }} />
                          <div style={{ display: "flex", gap: 12, marginLeft: 42 }}>
                            {Array.from({ length: 5 }).map((__, j) => (
                              <div className="pt-skeleton-circle" key={j} />
                            ))}
                          </div>
                        </div>
                      ))
                    : questions.map((q, idx) => {
                        const savedVal = answers[String(q.order)] ?? "";
                        const icon = ICONS[idx % ICONS.length];

                        return (
                          <section className="pt-question" id={`question-${q.order}`} key={q.id}>
                            <div className="pt-question-title">
                              <span className="pt-question-icon" aria-hidden="true">
                                {icon}
                              </span>
                              <h2>
                                {q.order}. {q.text}
                              </h2>
                            </div>

                            {isYesNo ? (
                              <div className="pt-scale pt-scale-yesno" role="group" aria-label={q.text}>
                                <button
                                  type="button"
                                  className={`pt-answer-button pt-answer-pill${savedVal === "yes" ? " is-selected" : ""}`}
                                  aria-pressed={savedVal === "yes"}
                                  onClick={() => setAnswer(q.order, "yes")}
                                >
                                  <span /> Yes
                                </button>
                                <button
                                  type="button"
                                  className={`pt-answer-button pt-answer-pill${savedVal === "no" ? " is-selected" : ""}`}
                                  aria-pressed={savedVal === "no"}
                                  onClick={() => setAnswer(q.order, "no")}
                                >
                                  <span /> No
                                </button>
                              </div>
                            ) : (
                              <div className="pt-scale" role="group" aria-label={q.text}>
                                <span className="pt-scale-label">Very Inaccurate</span>
                                {[1, 2, 3, 4, 5].map((value) => (
                                  <button
                                    key={value}
                                    type="button"
                                    className={`pt-answer-button pt-rating-button${savedVal === value ? " is-selected" : ""}`}
                                    aria-pressed={savedVal === value}
                                    onClick={() => setAnswer(q.order, value)}
                                  >
                                    {value}
                                  </button>
                                ))}
                                <span className="pt-scale-label">Very Accurate</span>
                              </div>
                            )}
                          </section>
                        );
                      })}
                </div>

                <footer className="pt-actions">
                  <p>
                    {answeredCount}/{questions?.length ?? 0} answered
                  </p>

                  <div>
                    <button
                      className="pt-outline-button"
                      type="button"
                      disabled={questions === null}
                      style={questions === null ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                      onClick={handleDiscard}
                    >
                      Discard
                    </button>
                    <button
                      className="pt-primary-button"
                      type="submit"
                      disabled={!allAnswered || isSubmitting}
                      style={!allAnswered || isSubmitting ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                    >
                      {isSubmitting ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} /> Calculating...
                        </>
                      ) : (
                        "Calculate Results"
                      )}
                    </button>
                  </div>
                </footer>
              </form>
            </div>
          </section>

          <ProfileAside activePage="tests-preferences" />
        </div>
      </main>

      <Footer />
    </>
  );
}
