import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { usePageMeta } from "../../hooks/usePageMeta";
import { getSession } from "../../lib/session";
import {
  generatePixelPerfectPdf,
  testDetailsMap,
} from "../../lib/personalityReport";
import { PersonalityService } from "../../services/personality.service";
import "../../css/result.css";
import ProfileAside from "../../components/ProfileAside";

const personalityService = new PersonalityService();

type ScoreCard = {
  label: string;
  rawScore: number;
  maxScore: number;
  percentage: number;
};

/** Loads jsPDF from CDN, same approach as the inline <script> in result.php */
function useJsPdfScript() {
  useEffect(() => {
    if ((window as any).jspdf) return;
    if (document.querySelector('script[src*="jspdf"]')) return;
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    document.head.appendChild(script);
  }, []);
}

export default function ResultTest() {
  usePageMeta("Test Results — Bildyx", "View your personality test results.");
  useJsPdfScript();

  useEffect(() => {
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css";
      document.head.appendChild(link);
    }
  }, []);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const testCode = (searchParams.get("test") || "BIG5").toUpperCase();
  const testDetail = testDetailsMap[testCode];

  const [scoreCards, setScoreCards] = useState<ScoreCard[] | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const generatedForRef = useRef<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session || !session.profileId) {
      navigate("/login");
      return;
    }

    if (!testDetail) {
      console.error("[ResultTest] Unknown test code:", testCode);
      setError("Unknown test code.");
      return;
    }

    if (generatedForRef.current === testCode) return;
    generatedForRef.current = testCode;

    (async () => {
      try {
        const [testResponse, savedAnswersResponse] = await Promise.all([
          personalityService.getTestByCode(testCode),
          personalityService.getSavedAnswers(session.profileId!, testCode),
        ]);

        const testDb = testResponse[0];
        if (!testDb) {
          console.error("[ResultTest] Test not found in database:", testCode);
          setError("Test not found.");
          return;
        }

        const [questionsDb, criteriaDb] = await Promise.all([
          personalityService.getQuestionsByTestId(testDb.id),
          personalityService.getCriteriaByTestId(testDb.id),
        ]);

        const answers = savedAnswersResponse.answers || {};
        const computedScores: Record<
          string,
          { rawScore: number; maxScore: number; percentage: number }
        > = {};

        criteriaDb.forEach((crit) => {
          const critQuestions = questionsDb.filter(
            (q) => q.criterion_id === crit.id,
          );
          let sum = 0;
          let count = 0;

          critQuestions.forEach((q) => {
            const answerVal =
              answers[String(q.order)] ?? answers[`q${q.order}`];
            if (answerVal === undefined || answerVal === null) return;

            let scoreNum = 1;
            if (answerVal === "yes") scoreNum = 5;
            else if (answerVal === "no") scoreNum = 1;
            else scoreNum = Number(answerVal);

            const finalScore = q.reverse_scored ? 6 - scoreNum : scoreNum;
            sum += finalScore;
            count++;
          });

          const maxScore = count * 5;
          const percentage =
            maxScore > 0 ? Math.round((sum / maxScore) * 100) : 0;
          computedScores[crit.code] = { rawScore: sum, maxScore, percentage };
        });

        const cards: ScoreCard[] = criteriaDb.map((crit) => {
          const scoreInfo = computedScores[crit.code] || {
            rawScore: 0,
            maxScore: 50,
            percentage: 0,
          };
          const detailInfo = testDetail.criteria[crit.code] || {
            name: crit.name,
          };
          return { label: detailInfo.name.toUpperCase(), ...scoreInfo };
        });
        setScoreCards(cards);

        const criteriaInput = criteriaDb.map((crit) => ({
          code: crit.code,
          name: (testDetail.criteria[crit.code] || { name: crit.name }).name,
          score: (computedScores[crit.code] || { rawScore: 0 }).rawScore,
          maxScore: (computedScores[crit.code] || { maxScore: 50 }).maxScore,
        }));

        const url = await generatePixelPerfectPdf({
          testCode,
          testName: `Your results · ${testDetail.name} test`,
          criteria: criteriaInput,
          descriptionTitle: testDetail.descriptionTitle,
          descriptionParagraphs: testDetail.descriptionText.split("\n\n"),
          traits: testDetail.traits,
          references: testDetail.references,
        });
        setPdfUrl(url);
      } catch (err) {
        console.error("[ResultTest] Error rendering results:", err);
        setError("Something went wrong while generating your report.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testCode, testDetail, navigate]);

  return (
    <>
      <Header />

      <main className="res-page">
        <div className="res-shell">
          <section className="res-card" aria-labelledby="res-title">
            <header className="res-header">
              <Link
                className="res-back"
                to="/tests-preferences"
                aria-label="Back to tests and preferences"
              >
                ‹
              </Link>
              <div>
                <h1 id="res-title" className="res-test-title">
                  {testDetail?.name || "Loading..."}
                </h1>
                <p className="res-test-subtitle">
                  {testDetail?.subtitle || ""}
                </p>
              </div>
            </header>

            <div className="res-content">
              <div className="res-score-cards">
                {scoreCards?.map((card) => (
                  <div className="res-score-card" key={card.label}>
                    <div className="res-card-label">{card.label}</div>
                    <div className="res-card-score">
                      {card.rawScore}
                      <span>/{card.maxScore}</span>
                    </div>
                    <div className="res-card-progress-bar">
                      <div
                        className="res-card-progress-bar-fill"
                        style={{ width: `${card.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="res-pdf-container"
                style={{ position: "relative" }}
              >
                {!pdfUrl && !error && (
                  <div className="res-pdf-loader">
                    <div className="res-spinner-container">
                      <div className="res-spinner" />
                      <p className="res-loader-text">
                        Generating your report, please wait...
                      </p>
                    </div>
                  </div>
                )}
                {error && (
                  <p style={{ padding: 24, color: "#dc2626" }}>{error}</p>
                )}
                {pdfUrl && (
                  <iframe id="pdfViewer" src={pdfUrl} title="PDF Results" />
                )}
              </div>
            </div>
          </section>

          <ProfileAside activePage="tests-preferences" />
        </div>
      </main>

      <Footer />
    </>
  );
}
