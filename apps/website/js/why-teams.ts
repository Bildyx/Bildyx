// @ts-nocheck
(() => {
  "use strict";

  const headerContent = document.querySelector(".site-header .header-content");

  if (headerContent && !headerContent.querySelector(".wt-main-nav")) {
    const nav = document.createElement("nav");
    nav.className = "wt-main-nav";
    nav.setAttribute("aria-label", "Why Teams navigation");
    nav.innerHTML = `
            <a href="#why-teams">Why Teams</a>
            <a href="generic.php?page=customers">Customers</a>
        `;
    const authentication = headerContent.querySelector(".nav-buttons");
    headerContent.insertBefore(nav, authentication || null);
  }

  const people = {
    michael: ["Michael", "VP Marketing", "michael.png"],
    amelia: ["Amelia", "Product Manager", "amelia.png"],
    carlos: ["Carlos", "Lead Engineer", "carlos.png"],
    hana: ["Hana", "UX Designer", "hana.png"],
    ethan: ["Ethan", "Data Analyst", "ethan.png"],
    naomi: ["Naomi", "QA Lead", "naomi.png"],
    clara: ["Clara", "Scrum Master", "clara.png"],
    omar: ["Omar", "DevOps Engineer", "omar.png"],
    priya: ["Priya", "Backend Dev", "priya.png"],
    akira: ["Akira", "Frontend Dev", "akira.png"],
    elena: ["Elena", "Ops Manager", "elena.png"],
    diego: ["Diego", "Customer Success", "diego.png"],
  };

  const teams = {
    alpha: {
      label: "Team Alpha",
      members: [
        "michael",
        "amelia",
        "carlos",
        "hana",
        "ethan",
        "naomi",
        "clara",
        "omar",
        "priya",
        "akira",
        "elena",
        "diego",
      ],
      city: "istanbul",
      product: "ai",
      overview: [
        [
          "",
          "Who We Are",
          "A cross-functional squad of engineers, designers, and PMs shipping user-facing products.",
        ],
        [
          "",
          "What We're Great At",
          "Rapid prototyping, data-driven decisions, and shipping high-quality features fast.",
        ],
        [
          "",
          "Team Culture",
          "Open feedback, async-first communication, weekly demos, and blameless retros.",
        ],
        [
          "",
          "How We Work Together",
          "Two-week sprints with daily standups. We pair-program and run design critiques weekly.",
        ],
        [
          "",
          "This Team is NOT For You If...",
          "You prefer rigid routines or dislike shifting priorities mid-sprint.",
          true,
        ],
      ],
      operate: [
        [
          "",
          "How We're Led",
          "Hands-on when needed, high trust by default. Clear goals, strong ownership. Managers coach, not micromanage.",
        ],
        [
          "",
          "What We're Solving Now",
          "Scaling infrastructure, reducing tech debt, improving retention, migrating from monolith to microservices.",
        ],
        [
          "",
          "A Typical Day",
          "Deep work mornings, collaboration afternoons, 15-minute standup. Protected focus time. Most log off by 5-6 PM.",
        ],
        [
          "",
          "What We Value",
          "Direct communication, low ego, high ownership. It's safe to disagree. We care about impact more than hours worked.",
        ],
        [
          "",
          "Growth Here",
          "Learning budget for everyone. Clear promotion paths. Prefer internal growth. Mentorship formal and informal.",
        ],
      ],
    },
    beta: {
      label: "Team Beta",
      members: [
        "elena",
        "omar",
        "hana",
        "diego",
        "naomi",
        "akira",
        "clara",
        "michael",
      ],
      city: "tokyo",
      product: "search",
      overview: [
        [
          "",
          "Who We Are",
          "Backend-heavy engineers with ML expertise. Distributed across 2 time zones with 5+ years avg experience.",
        ],
        [
          "",
          "What We're Great At",
          "Building reliable data pipelines and ML models at scale. Fast iteration on experiments.",
        ],
        [
          "",
          "Team Culture",
          "Data-driven decisions. We celebrate failed experiments as learning. Weekly knowledge-sharing sessions.",
        ],
        [
          "",
          "How We Work Together",
          "Mostly remote. Daily async updates. Weekly sync calls. Heavy use of Jupyter notebooks and shared docs.",
        ],
        [
          "",
          "This Team is NOT For You If...",
          "You need constant guidance or struggle with ambiguity in problem-solving.",
          true,
        ],
      ],
      operate: [
        [
          "",
          "How We're Led",
          "Flat hierarchy. Tech lead sets direction, but everyone contributes to architecture decisions. Quarterly OKRs.",
        ],
        [
          "",
          "What We're Solving Now",
          "Real-time recommendation engine, reducing model latency by 40%, building feature store for cross-team use.",
        ],
        [
          "",
          "A Typical Day",
          "Morning: model training reviews. Afternoon: pair programming or experimentation. Fridays: research time.",
        ],
        [
          "",
          "What We Value",
          "Intellectual curiosity, reproducibility, and shipping over perfection. We document everything.",
        ],
        [
          "",
          "Growth Here",
          "Conference budget, paper reading groups, and internal tech talks. Clear IC and management tracks.",
        ],
      ],
    },
    gamma: {
      label: "Team Gamma",
      members: [
        "carlos",
        "hana",
        "priya",
        "akira",
        "amelia",
        "ethan",
        "diego",
        "naomi",
      ],
      city: "san-francisco",
      product: "sales",
      overview: [
        [
          "",
          "Who We Are",
          "A product squad connecting customer insight, design, engineering, and go-to-market expertise.",
        ],
        [
          "",
          "What We're Great At",
          "Turning customer feedback into simple, measurable product improvements.",
        ],
        [
          "",
          "Team Culture",
          "Fast feedback, respectful debate, and strong accountability across every discipline.",
        ],
        [
          "",
          "How We Work Together",
          "Weekly customer sessions, focused delivery blocks, and visible decisions in shared documentation.",
        ],
        [
          "",
          "This Team is NOT For You If...",
          "You prefer working without direct customer feedback or measurable goals.",
          true,
        ],
      ],
      operate: [
        [
          "",
          "How We're Led",
          "Product and engineering share direction while specialists own the execution details.",
        ],
        [
          "",
          "What We're Solving Now",
          "Improving onboarding conversion and making sales workflows easier to customize.",
        ],
        [
          "",
          "A Typical Day",
          "Customer research, design reviews, focused build time, and a short progress sync.",
        ],
        [
          "",
          "What We Value",
          "Clarity, empathy, experimentation, and decisions backed by evidence.",
        ],
        [
          "",
          "Growth Here",
          "Cross-functional mentorship and regular opportunities to own complete product outcomes.",
        ],
      ],
    },
    delta: {
      label: "Team Delta",
      members: [
        "ethan",
        "clara",
        "michael",
        "elena",
        "omar",
        "carlos",
        "amelia",
        "priya",
      ],
      city: "new-york",
      product: "cloud",
      overview: [
        [
          "",
          "Who We Are",
          "Infrastructure specialists focused on dependable systems, developer experience, and security.",
        ],
        [
          "",
          "What We're Great At",
          "Automation, observability, incident response, and scalable cloud architecture.",
        ],
        [
          "",
          "Team Culture",
          "Calm under pressure, documentation first, and continuous improvement after every incident.",
        ],
        [
          "",
          "How We Work Together",
          "Rotating ownership, clear escalation paths, and protected time for preventative engineering.",
        ],
        [
          "",
          "This Team is NOT For You If...",
          "You avoid operational ownership or dislike documenting decisions.",
          true,
        ],
      ],
      operate: [
        [
          "",
          "How We're Led",
          "Leads provide priorities and context. Engineers own systems from design to production.",
        ],
        [
          "",
          "What We're Solving Now",
          "Reducing deployment time, improving reliability, and standardizing platform tooling.",
        ],
        [
          "",
          "A Typical Day",
          "Platform work, operational reviews, pairing, and maintenance windows planned in advance.",
        ],
        [
          "",
          "What We Value",
          "Reliability, transparency, thoughtful automation, and sustainable on-call practices.",
        ],
        [
          "",
          "Growth Here",
          "Cloud certifications, architecture reviews, and mentorship across infrastructure domains.",
        ],
      ],
    },
    fusion: {
      label: "Team Fusion",
      members: ["naomi", "carlos", "hana", "diego", "omar", "elena", "akira"],
      city: "seoul",
      product: "analytics",
      overview: [
        [
          "",
          "Who We Are",
          "Quality and reliability champions. Diverse backgrounds from gaming, fintech, and healthcare.",
        ],
        [
          "",
          "What We're Great At",
          "End-to-end test automation, accessibility audits, and building quality into the dev process.",
        ],
        [
          "",
          "Team Culture",
          "Supportive and patient. We mentor junior members actively. Monthly hackathons and innovation days.",
        ],
        [
          "",
          "How We Work Together",
          "Fully remote across 5 time zones. Overlap hours 10am-2pm ET. Strong async documentation culture.",
        ],
        [
          "",
          "This Team is NOT For You If...",
          "You cut corners on quality or see testing as someone else's job.",
          true,
        ],
      ],
      operate: [
        [
          "",
          "How We're Led",
          "Quality ownership is shared. Leads unblock the team and keep priorities visible.",
        ],
        [
          "",
          "What We're Solving Now",
          "Expanding automated coverage and improving accessibility across all products.",
        ],
        [
          "",
          "A Typical Day",
          "Async updates, focused test development, product reviews, and cross-team quality coaching.",
        ],
        [
          "",
          "What We Value",
          "Patience, precision, curiosity, and prevention instead of blame.",
        ],
        [
          "",
          "Growth Here",
          "Mentoring, quality leadership projects, and time to explore new testing approaches.",
        ],
      ],
    },
  };

  const membersContainer = document.getElementById("wtTeamMembers");
  const badge = document.getElementById("wtTeamBadge");
  const pointsContainer = document.getElementById("wtProfilePoints");
  const tabs = [...document.querySelectorAll(".wt-team-tab")];
  const modeButtons = [...document.querySelectorAll(".wt-profile-button")];
  const cityButtons = [...document.querySelectorAll(".wt-city")];
  const productButtons = [...document.querySelectorAll(".wt-product-chip")];

  if (!membersContainer || !badge || !pointsContainer || tabs.length === 0) {
    return;
  }

  let currentTeam = "alpha";
  let currentMode = "overview";

  const renderMembers = (memberKeys) => {
    membersContainer.innerHTML = memberKeys
      .map((key) => {
        const [name, role, image] = people[key];
        return `
                <article class="wt-member">
                    <img src="images/${image}" alt="${name}" />
                    <strong>${name}</strong>
                    <span>${role}</span>
                </article>
            `;
      })
      .join("");
  };

  const renderPoints = (points) => {
    pointsContainer.innerHTML = points
      .map(
        ([icon, title, text, warning = false]) => `
            <section class="wt-profile-point${warning ? " wt-profile-point--warning" : ""}">
                <h4><span aria-hidden="true">${icon}</span> ${title}</h4>
                <p>${text}</p>
            </section>
        `,
      )
      .join("");
  };

  const updateActiveButtons = (team) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.team === currentTeam;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });

    modeButtons.forEach((button) => {
      const active = button.dataset.profileMode === currentMode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    cityButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.city === team.city);
    });

    productButtons.forEach((button) => {
      button.classList.toggle(
        "is-active",
        button.dataset.product === team.product,
      );
    });
  };

  const renderTeam = () => {
    const team = teams[currentTeam];
    badge.textContent = team.label;
    renderMembers(team.members);
    renderPoints(team[currentMode]);
    updateActiveButtons(team);
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      currentTeam = tab.dataset.team;
      currentMode = "overview";
      renderTeam();
    });
  });

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentMode = button.dataset.profileMode;
      renderTeam();
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  renderTeam();
})();
