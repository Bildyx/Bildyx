import { PersonalityService } from "../services/personality.service";
import { getSession } from "./helpers";

const personalityService = new PersonalityService();

(async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const testCode = (urlParams.get("test") || "BIG5").toUpperCase();
  const storageKey = `bildyx_${testCode.toLowerCase()}_answers`;
  const session = getSession();

  if (!session || !session.profileId) {
    window.location.href = "../login.php";
    return;
  }

  const profileId = session.profileId;

  const form = document.getElementById(
    "personalityTestForm",
  ) as HTMLFormElement | null;
  const titleEl = document.getElementById("testTitle");
  const subtitleEl = document.getElementById("testSubtitle");
  const navList = document.getElementById("questionsNavList");
  const container = document.getElementById("questionsContainer");
  const discardBtn = document.getElementById(
    "ptDiscard",
  ) as HTMLButtonElement | null;
  const progress = document.getElementById("ptProgress");

  if (!form || !container || !navList) {
    console.error("[test-form.ts] Required DOM elements not found.");
    return;
  }

  try {
    // 1. Fetch test details from database
    const testResponse = await personalityService.getTestByCode(testCode);
    const testDb = testResponse[0];

    if (!testDb) {
      console.error(
        "[test-form.ts] Test not found in database for code:",
        testCode,
      );
      return;
    }

    if (titleEl) titleEl.textContent = testDb.name;
    if (subtitleEl) subtitleEl.textContent = testDb.description || "";

    // 2. Fetch questions and criteria from database
    const [questionsDb, savedAnswersResponse] = await Promise.all([
      personalityService.getQuestionsByTestId(testDb.id),
      personalityService.getSavedAnswers(profileId, testCode),
    ]);

    const totalQuestions = questionsDb.length;

    // Sort questions by their order
    questionsDb.sort((a, b) => a.order - b.order);

    // Reconstruct answers object
    let answers: Record<string, string | number> = {};
    if (savedAnswersResponse && savedAnswersResponse.answers) {
      // Map API answers back to our local format
      Object.entries(savedAnswersResponse.answers).forEach(([key, val]) => {
        // If yes/no buttons, convert DB 5/1 back to yes/no
        const isYesNo =
          testCode === "ENTREPRENEUR" || testCode === "SELF_MOTIVATION";
        if (isYesNo) {
          if (val === 5) answers[key] = "yes";
          else if (val === 1) answers[key] = "no";
        } else {
          answers[key] = val;
        }
      });
      localStorage.setItem(storageKey, JSON.stringify(answers));
    } else {
      try {
        answers = JSON.parse(localStorage.getItem(storageKey) || "{}");
      } catch (_) {}
    }

    // List of icons to cycle through for questions
    const icons = [
      "✦",
      "♞",
      "▣",
      "⌁",
      "▫",
      "○",
      "♙",
      "♧",
      "☷",
      "☯",
      "✐",
      "⚖",
      "✧",
      "🛡",
      "⚑",
      "⏱",
      "◎",
      "▥",
      "☻",
    ];

    // 3. Render questions and nav links dynamically
    navList.innerHTML = "";
    container.innerHTML = "";

    questionsDb.forEach((q, idx) => {
      const qKey = String(q.order);
      const savedVal = answers[qKey] ?? "";

      // Nav link
      const link = document.createElement("a");
      link.setAttribute("href", `#question-${q.order}`);
      link.id = `nav-q-${q.order}`;
      link.innerHTML = `<strong>${q.order}.</strong> <span>${q.text}</span>`;
      if (savedVal !== "") {
        link.classList.add("is-answered");
      }
      navList.appendChild(link);

      // Question block
      const section = document.createElement("section");
      section.className = "pt-question";
      section.id = `question-${q.order}`;

      const icon = icons[idx % icons.length];
      const isYesNo =
        testCode === "ENTREPRENEUR" || testCode === "SELF_MOTIVATION";

      let scaleHtml = "";
      if (isYesNo) {
        scaleHtml = `
          <div class="pt-scale pt-scale-yesno" role="group" aria-label="${q.text}">
            <button class="pt-answer-button pt-answer-pill ${savedVal === "yes" ? "is-selected" : ""}" type="button" data-question="${q.order}" data-value="yes" aria-pressed="${savedVal === "yes"}">
              <span></span> Yes
            </button>
            <button class="pt-answer-button pt-answer-pill ${savedVal === "no" ? "is-selected" : ""}" type="button" data-question="${q.order}" data-value="no" aria-pressed="${savedVal === "no"}">
              <span></span> No
            </button>
            <input type="hidden" name="q${q.order}" value="${savedVal}">
          </div>
        `;
      } else {
        scaleHtml = `
          <div class="pt-scale" role="group" aria-label="${q.text}">
            <span class="pt-scale-label">Very Inaccurate</span>
            <button class="pt-answer-button pt-rating-button ${savedVal === 1 ? "is-selected" : ""}" type="button" data-question="${q.order}" data-value="1" aria-pressed="${savedVal === 1}">1</button>
            <button class="pt-answer-button pt-rating-button ${savedVal === 2 ? "is-selected" : ""}" type="button" data-question="${q.order}" data-value="2" aria-pressed="${savedVal === 2}">2</button>
            <button class="pt-answer-button pt-rating-button ${savedVal === 3 ? "is-selected" : ""}" type="button" data-question="${q.order}" data-value="3" aria-pressed="${savedVal === 3}">3</button>
            <button class="pt-answer-button pt-rating-button ${savedVal === 4 ? "is-selected" : ""}" type="button" data-question="${q.order}" data-value="4" aria-pressed="${savedVal === 4}">4</button>
            <button class="pt-answer-button pt-rating-button ${savedVal === 5 ? "is-selected" : ""}" type="button" data-question="${q.order}" data-value="5" aria-pressed="${savedVal === 5}">5</button>
            <span class="pt-scale-label">Very Accurate</span>
            <input type="hidden" name="q${q.order}" value="${savedVal}">
          </div>
        `;
      }

      section.innerHTML = `
        <div class="pt-question-title">
          <span class="pt-question-icon" aria-hidden="true">${icon}</span>
          <h2>${q.order}. ${q.text}</h2>
        </div>
        ${scaleHtml}
      `;

      container.appendChild(section);
    });

    // Update progress text and submit button state
    function updateProgress() {
      let answered = 0;
      questionsDb.forEach((q) => {
        const val = answers[String(q.order)];
        if (val !== undefined && val !== null && val !== "") {
          answered++;
        }
      });
      if (progress) {
        progress.textContent = `${answered}/${totalQuestions} answered`;
      }

      // Disable/enable submit button
      const submitBtn = form?.querySelector(
        'button[type="submit"]',
      ) as HTMLButtonElement | null;
      if (submitBtn) {
        if (answered < totalQuestions) {
          submitBtn.disabled = true;
          submitBtn.style.opacity = "0.5";
          submitBtn.style.cursor = "not-allowed";
        } else {
          submitBtn.disabled = false;
          submitBtn.style.opacity = "1";
          submitBtn.style.cursor = "pointer";
        }
      }
    }

    if (discardBtn) {
      discardBtn.disabled = false;
      discardBtn.style.opacity = "1";
      discardBtn.style.cursor = "pointer";
    }

    updateProgress();

    // 4. Setup Answer Button event delegation
    container.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const btn = target.closest(
        ".pt-answer-button",
      ) as HTMLButtonElement | null;
      if (!btn) return;

      const qOrder = btn.dataset.question;
      const rawVal = btn.dataset.value;
      if (!qOrder || !rawVal) return;

      const val =
        testCode === "ENTREPRENEUR" || testCode === "SELF_MOTIVATION"
          ? rawVal
          : Number(rawVal);

      // Save answer
      answers[qOrder] = val;
      localStorage.setItem(storageKey, JSON.stringify(answers));

      // Update hidden input
      const parent = btn.parentElement;
      if (parent) {
        const hidden = parent.querySelector(
          'input[type="hidden"]',
        ) as HTMLInputElement | null;
        if (hidden) hidden.value = String(val);

        // Update button states
        parent.querySelectorAll(".pt-answer-button").forEach((b) => {
          b.classList.remove("is-selected");
          b.setAttribute("aria-pressed", "false");
        });
      }

      btn.classList.add("is-selected");
      btn.setAttribute("aria-pressed", "true");

      // Mark nav link as answered
      const navLink = document.getElementById(`nav-q-${qOrder}`);
      if (navLink) navLink.classList.add("is-answered");

      updateProgress();
    });

    // 5. Discard changes handler
    if (discardBtn) {
      discardBtn.addEventListener("click", async () => {
        if (
          !confirm(
            "Are you sure you want to discard your answers and delete this result?",
          )
        ) {
          return;
        }

        try {
          await personalityService.deleteByTestCode(profileId, testCode);
        } catch (err) {
          console.error(
            "[test-form.ts] Error deleting result on backend:",
            err,
          );
        }

        localStorage.removeItem(storageKey);
        answers = {};

        // Clear UI states
        container.querySelectorAll('input[type="hidden"]').forEach((input) => {
          (input as HTMLInputElement).value = "";
        });

        container.querySelectorAll(".pt-answer-button").forEach((btn) => {
          btn.classList.remove("is-selected");
          btn.setAttribute("aria-pressed", "false");
        });

        navList.querySelectorAll("a").forEach((link) => {
          link.classList.remove("is-answered");
        });

        updateProgress();
      });
    }

    // 6. Submit handler
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      let answered = 0;
      questionsDb.forEach((q) => {
        if (
          answers[String(q.order)] !== undefined &&
          answers[String(q.order)] !== ""
        ) {
          answered++;
        }
      });

      if (answered < totalQuestions) {
        return;
      }

      const submitBtn = form.querySelector(
        'button[type="submit"]',
      ) as HTMLButtonElement | null;
      const loader = document.getElementById("ptLoader");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.7";
        submitBtn.innerHTML =
          '<i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Calculating...';
      }
      if (loader) {
        loader.style.display = "flex";
      }

      try {
        await personalityService.submitResult(profileId, testCode, answers);
        window.location.href = `result.php?test=${testCode}`;
      } catch (err: any) {
        console.error("[test-form.ts] Submit error:", err);
        if (loader) {
          loader.style.display = "none";
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = "1";
          submitBtn.textContent = "Calculate Results";
        }
      }
    });

    window.addEventListener("pageshow", () => {
      const submitBtn = form.querySelector(
        'button[type="submit"]',
      ) as HTMLButtonElement | null;
      const loader = document.getElementById("ptLoader");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
        submitBtn.textContent = "Calculate Results";
      }
      if (loader) {
        loader.style.display = "none";
      }
    });
  } catch (err) {
    console.error("[test-form.ts] Initialization error:", err);
  }
})();
