import { UserProfileService } from "../services/user-profile.service";
import { getSession } from "./helpers";

const profileService = new UserProfileService();

(function () {
  const STORAGE_KEY = "bildyx_big5_answers";

  const form = document.getElementById("big5Form") as HTMLFormElement | null;
  if (!form) return;

  const buttons = Array.from(
    document.querySelectorAll(".tp-rating-button"),
  ) as HTMLButtonElement[];
  const progress = document.getElementById("big5Progress");
  const navLinks = Array.from(
    document.querySelectorAll(".big5-question-list a"),
  ) as HTMLAnchorElement[];
  const discardBtn = document.getElementById(
    "big5Discard",
  ) as HTMLButtonElement | null;

  const reverseItems = new Set([
    6, 16, 26, 36, 46, 2, 12, 22, 32, 8, 18, 28, 38, 9, 19, 10, 20, 30,
  ]);
  const dimensions: Record<string, number[]> = {
    Extraversion: [1, 6, 11, 16, 21, 26, 31, 36, 41, 46],
    Agreeableness: [2, 7, 12, 17, 22, 27, 32, 37, 42, 47],
    Conscientiousness: [3, 8, 13, 18, 23, 28, 33, 38, 43, 48],
    "Emotional Stability": [4, 9, 14, 19, 24, 29, 34, 39, 44, 49],
    Openness: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
  };

  function getAnswers(): Record<string, string> {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (_) {
      return {};
    }
  }

  function setAnswers(answers: Record<string, string>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }

  function refreshProgress() {
    const answers = getAnswers();
    const answered = Object.keys(answers).filter((key) => answers[key]).length;
    if (progress) progress.textContent = `${answered}/50 answered`;

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const id = href ? href.replace("#question-", "") : "";
      link.classList.toggle("is-answered", Boolean(answers[id]));
    });
  }

  function restoreAnswers() {
    const answers = getAnswers();

    buttons.forEach((button) => {
      const q = button.dataset.question || "";
      const value = button.dataset.value || "";
      const selected = String(answers[q] || "") === String(value);
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");

      const input = form?.querySelector(
        `input[name="q${q}"]`,
      ) as HTMLInputElement | null;
      if (input && selected) input.value = value;
    });

    refreshProgress();
  }

  function scoreTrait(items: number[], answers: Record<string, string>) {
    const values = items
      .map((number) => {
        const raw = Number(answers[number]);
        if (!raw) return null;
        return reverseItems.has(number) ? 6 - raw : raw;
      })
      .filter((value) => value !== null) as number[];

    if (!values.length) return null;
    const total = values.reduce((sum, value) => sum + value, 0);
    return Math.round((total / (values.length * 5)) * 100);
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const question = button.dataset.question || "";
      const value = button.dataset.value || "";
      const answers = getAnswers();

      answers[question] = value;
      setAnswers(answers);

      buttons
        .filter((item) => item.dataset.question === question)
        .forEach((item) => {
          const selected = item === button;
          item.classList.toggle("is-selected", selected);
          item.setAttribute("aria-pressed", selected ? "true" : "false");
        });

      const input = form?.querySelector(
        `input[name="q${question}"]`,
      ) as HTMLInputElement | null;
      if (input) input.value = value;

      refreshProgress();
    });
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      const target = href ? document.querySelector(href) : null;
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  if (discardBtn) {
    discardBtn.addEventListener("click", async () => {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("bildyx_big5_scores");
      form.reset();
      buttons.forEach((button) => {
        button.classList.remove("is-selected");
        button.setAttribute("aria-pressed", "false");
      });
      refreshProgress();

      // Effacer aussi les scores côté API
      try {
        const session = getSession();
        if (session?.profileId) {
          const profile = await profileService.getById(session.profileId);
          const existingMetadata =
            (profile?.metadata as Record<string, any>) ?? {};
          delete existingMetadata.big5Scores;
          delete existingMetadata.big5Answers;
          await profileService.update(session.profileId, {
            metadata: existingMetadata,
          });
        } else {
          throw new Error("No session found");
        }
      } catch (err: any) {
        console.warn(
          "[tests-preferences.ts] Could not clear API scores:",
          err?.message,
        );
      }
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const answers = getAnswers();
    const answered = Object.keys(answers).filter((key) => answers[key]).length;

    const scores: Record<string, number | null> = {};
    Object.entries(dimensions).forEach(([trait, items]) => {
      scores[trait] = scoreTrait(items, answers);
    });

    // Sauvegarder localement
    localStorage.setItem("bildyx_big5_scores", JSON.stringify(scores));

    const scoreText = Object.entries(scores)
      .map(
        ([trait, value]) =>
          `${trait}: ${value === null ? "not enough answers" : value + "%"}`,
      )
      .join("\n");

    // Sauvegarder via API si disponible
    try {
      const session = getSession();
      if (session?.profileId) {
        let existingMetadata: Record<string, any> = {};
        const profile = await profileService.getById(session.profileId);
        existingMetadata = (profile?.metadata as Record<string, any>) ?? {};

        await profileService.update(session.profileId, {
          metadata: {
            ...existingMetadata,
            big5Scores: scores,
            big5Answers: answers,
            big5AnsweredAt: new Date().toISOString(),
          },
        });

        alert(
          `Big 5 updated & saved to your profile.\n${answered}/50 questions answered.\n\n${scoreText}`,
        );
        return;
      } else {
        throw new Error("No session found");
      }
    } catch (err) {
      console.error("[tests-preferences.ts] API save error:", err);
    }

    // Fallback local
    alert(
      `Big 5 updated (saved locally).\n${answered}/50 questions answered.\n\n${scoreText}`,
    );
  });

  // ─── Chargement initial depuis l'API ──────────────────────
  async function loadFromProfile() {
    try {
      const session = getSession();
      if (!session?.profileId) {
        restoreAnswers();
        return;
      }

      const profile = await profileService.getById(session.profileId);
      const savedAnswers = (profile?.metadata as any)?.big5Answers;

      if (savedAnswers) {
        setAnswers(savedAnswers);
      }

      restoreAnswers();
    } catch (err: any) {
      console.warn(
        "[tests-preferences.ts] Could not load profile answers:",
        err?.message,
      );
      restoreAnswers();
    }
  }

  loadFromProfile();
})();
