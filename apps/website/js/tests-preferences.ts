import { PersonalityService } from "../services/personality.service";
import { getSession } from "./helpers";

const personalityService = new PersonalityService();

(async function () {
  const session = getSession();
  const table = document.querySelector(".tp-tests-table");

  console.log(session);
  if (!session) {
    console.warn("[tests-preferences.ts] No active session found.");
    return;
  }

  const profileId = session.profileId;

  try {
    // Fetch Personality Tests Summary from database
    const testSummary = await personalityService.getTestsSummary(profileId);

    // Clear all static rows inside the table (except header)
    if (table) {
      const rows = Array.from(table.querySelectorAll(".tp-test-row, .tp-skeleton-row"));
      rows.forEach((row) => row.remove());
    }

    // Map test codes to Font Awesome icons
    const testIcons: Record<string, string> = {
      BIG5: '<i class="fa-solid fa-brain"></i>',
      ASSERTIVENESS: '<i class="fa-solid fa-wand-magic-sparkles"></i>',
      CREATIVE_ANALYTICAL: '<i class="fa-solid fa-brain"></i>',
      INTELLECTUAL_CURIOSITY: '<i class="fa-solid fa-lightbulb"></i>',
      ENTREPRENEUR: '<i class="fa-solid fa-rocket"></i>',
      SELF_MOTIVATION: '<i class="fa-solid fa-user-group"></i>',
    };

    testSummary.forEach((test) => {
      const iconHtml =
        testIcons[test.code] || '<i class="fa-solid fa-brain"></i>';

      const row = document.createElement("div");
      row.className = "tp-test-row";
      row.setAttribute("role", "row");

      // Clickable test title to go to test questionnaire page
      const testLink = `<a href="tests-preferences/test.php?test=${test.code}" class="tp-test-name-link"><span class="tp-icon">${iconHtml}</span> ${test.name}</a>`;

      // Check progress locally as well
      const localKey = `bildyx_${test.code.toLowerCase()}_answers`;
      const localAnswers = localStorage.getItem(localKey);
      let inProgress = false;
      if (localAnswers) {
        try {
          const parsed = JSON.parse(localAnswers);
          inProgress = Object.keys(parsed).filter((k) => parsed[k]).length > 0;
        } catch (_) {}
      }

      const statusText = test.is_completed
        ? "Completed"
        : inProgress
          ? "In Progress"
          : "Not Started";

      // Render View Result button only if the test is completed
      const summaryBtn = test.is_completed
        ? `<a href="tests-preferences/result.php?test=${test.code}" class="tp-result-button">View Result</a>`
        : "";

      row.innerHTML = `
        <span class="tp-test-name" role="cell">${testLink}</span>
        <span role="cell">Personality Test</span>
        <span class="tp-status" role="cell">${statusText}</span>
        <span role="cell">${summaryBtn}</span>
      `;

      table?.appendChild(row);
    });

    // Handle loading states for View Result buttons
    table?.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const btn = target.closest(".tp-result-button") as HTMLAnchorElement | null;
      if (btn) {
        btn.style.pointerEvents = "none";
        btn.style.opacity = "0.7";
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right: 6px;"></i> Loading...';
      }
    });
  } catch (err: any) {
    console.error("[tests-preferences.ts] Error updating statuses:", err);
  }
})();
