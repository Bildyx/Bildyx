// @ts-nocheck
document.addEventListener("DOMContentLoaded", () => {
  const jobs = {
    "pekamix-alpha": {
      company: "Pekamix",
      team: "SuperTeam",
      job: "Software Engineer",
      product: "SalesPro",
      match: "Strong match",
      summary:
        "A product engineering team building sales software for international B2B clients.",
      why: [
        "Strong fit with programming and customer-service skills.",
        "Good match with software engineering experience.",
        "Team culture is fast-moving, practical, and collaborative.",
      ],
      work: "Two-week sprints, daily standups, product demos, and direct collaboration with Tokyo and US stakeholders.",
    },
    "pekamix-beta": {
      company: "Pekamix",
      team: "Core Platform",
      job: "Backend Developer",
      product: "Analytics Tools",
      match: "High technical fit",
      summary:
        "A backend-heavy team focused on data pipelines, APIs, and internal product reliability.",
      why: [
        "Good fit for backend development and performance optimization.",
        "Useful for candidates who like structured systems.",
        "Best for people comfortable with technical ownership.",
      ],
      work: "Async-first collaboration, code reviews, weekly technical planning, and clear ownership per service.",
    },
    "rakuten-superteam": {
      company: "Rakuten",
      team: "SuperTeam",
      job: "Frontend Engineer",
      product: "Marketplace UI",
      match: "Good team fit",
      summary:
        "A customer-facing team working on marketplace pages, components, and conversion flows.",
      why: [
        "Good fit with product thinking and fast iteration.",
        "Strong team score for communication and growth.",
        "Useful for candidates who enjoy visible user impact.",
      ],
      work: "Design reviews, frontend pairing, analytics checks, and short weekly releases.",
    },
    "rakuten-maj2023": {
      company: "Rakuten",
      team: "Maj2023Time",
      job: "Data Analyst",
      product: "Commerce Insights",
      match: "Balanced match",
      summary:
        "A data-oriented team turning product behavior and customer signals into actionable insights.",
      why: [
        "Good fit with analytical work and cross-team collaboration.",
        "Medium-to-high match across organization, team, and mission.",
        "Best for people who like dashboards, signals, and experiments.",
      ],
      work: "Weekly insight reviews, experiment tracking, and close collaboration with product managers.",
    },
    "rakuten-2maj": {
      company: "Rakuten",
      team: "2.Maj",
      job: "Video",
      product: "rakuten.com",
      match: "Applied",
      summary:
        "A media and commerce team connecting video content with product discovery.",
      why: [
        "Good match with creative product environments.",
        "Solid fit if you like mixed product and content workflows.",
        "Useful for candidates comfortable with changing priorities.",
      ],
      work: "Campaign planning, video asset coordination, and product-page optimization.",
    },
    "rakuten-games": {
      company: "Rakuten",
      team: "RakutenGames",
      job: "Game Product Assistant",
      product: "Mobile Games",
      match: "Medium match",
      summary:
        "A games team working on mobile game operations, campaigns, and player engagement.",
      why: [
        "Interesting fit for candidates who like gaming and product operations.",
        "Balanced match across job, mission, and team style.",
        "Best for people who enjoy fast campaign cycles.",
      ],
      work: "Event calendars, player feedback reviews, content coordination, and performance follow-up.",
    },
  };

  const preview = document.getElementById("jobPreview");
  const jobCards = Array.from(document.querySelectorAll(".mj-job-card"));
  const companyTabs = Array.from(document.querySelectorAll(".mj-company-tab"));
  const clearButton = document.getElementById("clearJobSelection");

  function setActiveCompany(company) {
    companyTabs.forEach((tab) => {
      const isActive = tab.dataset.company === company;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-pressed", String(isActive));
    });
  }

  function renderEmpty() {
    jobCards.forEach((card) => {
      card.classList.remove("is-active");
      card.setAttribute("aria-pressed", "false");
    });

    preview.innerHTML = `
            <h1 id="my-jobs-title">My Jobs</h1>
            <p class="mj-lead">Recommended teams and jobs based on your MicroResume. Select a recommendation on the left to preview the team profile.</p>
            <div class="mj-empty-state">Click on a team in the left sidebar to view its full profile here.</div>
        `;
  }

  function renderJob(jobId) {
    const job = jobs[jobId];
    if (!job) return;

    jobCards.forEach((card) => {
      const isActive = card.dataset.job === jobId;
      card.classList.toggle("is-active", isActive);
      card.setAttribute("aria-pressed", String(isActive));
    });

    const activeCard = document.querySelector(`[data-job="${jobId}"]`);
    const group = activeCard
      ? activeCard.closest("[data-company-group]")
      : null;
    if (group) setActiveCompany(group.dataset.companyGroup);

    preview.innerHTML = `
            <h1 id="my-jobs-title">My Jobs</h1>
            <p class="mj-lead">Recommended teams and jobs based on your MicroResume. Select a recommendation on the left to preview the team profile.</p>
            <article class="mj-preview-card">
                <header class="mj-preview-header">
                    <div>
                        <h2>${job.company} - ${job.team}</h2>
                        <p>${job.job} · ${job.product}</p>
                    </div>
                    <span class="mj-match-badge">${job.match}</span>
                </header>
                <div class="mj-preview-grid">
                    <section class="mj-preview-box">
                        <h3>Team summary</h3>
                        <p>${job.summary}</p>
                    </section>
                    <section class="mj-preview-box">
                        <h3>Why it matches you</h3>
                        <ul>
                            ${job.why.map((item) => `<li>${item}</li>`).join("")}
                        </ul>
                    </section>
                    <section class="mj-preview-box">
                        <h3>How they work</h3>
                        <p>${job.work}</p>
                    </section>
                    <section class="mj-preview-box">
                        <h3>Next step</h3>
                        <p>Review the team profile, compare fit signals, then apply when the match feels right.</p>
                    </section>
                </div>
                <div class="mj-preview-actions">
                    <button class="mj-primary-action" type="button" data-preview-apply="${jobId}">Apply</button>
                    <button class="mj-secondary-action" type="button" data-preview-close>Close preview</button>
                </div>
            </article>
        `;
  }

  jobCards.forEach((card) => {
    const open = () => renderJob(card.dataset.job);
    card.addEventListener("click", (event) => {
      if (event.target.closest(".mj-apply-button")) return;
      open();
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });

  companyTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const company = tab.dataset.company;
      setActiveCompany(company);
      const firstCard = document.querySelector(
        `[data-company-group="${company}"] .mj-job-card`,
      );
      if (firstCard) renderJob(firstCard.dataset.job);
    });
  });

  document.addEventListener("click", (event) => {
    const applyButton = event.target.closest(
      "[data-apply], [data-preview-apply]",
    );
    if (applyButton) {
      event.stopPropagation();
      applyButton.classList.toggle("is-applied");
      applyButton.textContent = applyButton.classList.contains("is-applied")
        ? "Applied"
        : "Apply";
      return;
    }

    if (event.target.closest("[data-preview-close]")) {
      renderEmpty();
    }
  });

  if (clearButton) clearButton.addEventListener("click", renderEmpty);
});
