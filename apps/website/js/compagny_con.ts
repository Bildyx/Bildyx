// @ts-nocheck
(() => {
  "use strict";

  const memberImages = {
    michael: "images/michael.png",
    amelia: "images/amelia.png",
    carlos: "images/carlos.png",
    hana: "images/hana.png",
    ethan: "images/ethan.png",
    naomi: "images/naomi.png",
    clara: "images/clara.png",
    omar: "images/omar.png",
    priya: "images/priya.png",
    akira: "images/akira.png",
    elena: "images/elena.png",
    diego: "images/diego.png",
  };

  const officeImages = {
    Tokyo: "images/city-tokyo.png",
    "New York": "images/city-new-york.png",
    Istanbul: "images/city-istanbul.png",
    Seattle: "images/city-seattle.png",
    "Kuala Lumpur": "images/city-kuala-lumpur.png",
    "San Francisco": "images/city-san-francisco.png",
  };

  const teams = {
    alpha: {
      label: "Team Alpha",
      members: [
        { name: "Michael", role: "VP Marketing" },
        { name: "Amelia", role: "Product Manager" },
        { name: "Carlos", role: "Lead Engineer" },
        { name: "Hana", role: "UX Designer" },
        { name: "Ethan", role: "Data Analyst" },
        { name: "Naomi", role: "QA Lead" },
        { name: "Clara", role: "Scrum Master" },
        { name: "Omar", role: "DevOps Engineer" },
        { name: "Priya", role: "Backend Developer" },
        { name: "Akira", role: "Frontend Developer" },
        { name: "Elena", role: "Operations Manager" },
        { name: "Diego", role: "Customer Success" },
      ],
      products: [
        "Marketing Software",
        "ERP Systems",
        "Sales Software",
        "Cloud Infrastructure",
        "Data Analytics",
      ],
      people: [
        {
          title: "â™Ÿ Who We Are",
          text: "A mix of senior and emerging talent from startups and global tech. Some with traditional degrees, others self-taught.",
        },
        {
          title: "â˜† What We're Great At",
          text: "Strong in system design and fast shipping. We value clean code and clear UX.",
        },
        {
          title: "â™¡ Team Culture",
          text: "Collaborative, low politics. Friendly, not forced. Occasional dinners, strong boundaries.",
        },
        {
          title: "â—‡ How We Work Together",
          text: "Hybrid across three cities. Async-first, minimal meetings. Slack and Notion for most communication.",
        },
        {
          title: "â–³ This team is NOT for you if...",
          text: "You prefer rigid routines or dislike shifting priorities mid-sprint.",
          warning: true,
        },
      ],
      operate: [
        {
          title: "â—‡ How We're Led",
          text: "Clear ownership, high trust, and direct feedback.",
        },
        {
          title: "â˜† What We Are Solving Now",
          text: "Scaling the platform while keeping the user experience simple.",
        },
        {
          title: "▣ A Typical Day",
          text: "Deep work blocks, short syncs, and protected time for collaboration.",
        },
        {
          title: "â™¡ What We Value",
          text: "Curiosity, accountability, and kindness under pressure.",
        },
        {
          title: "â†— Growth Here",
          text: "Mentorship, internal mobility, and visible impact.",
        },
      ],
    },

    beta: {
      label: "Team Beta",
      members: [
        { name: "Elena", role: "Engineering Manager" },
        { name: "Omar", role: "Senior Backend Dev" },
        { name: "Hana", role: "Product Designer" },
        { name: "Diego", role: "Mobile Developer" },
        { name: "Naomi", role: "Data Engineer" },
        { name: "Akira", role: "ML Engineer" },
        { name: "Clara", role: "Technical Writer" },
        { name: "Michael", role: "Growth Lead" },
      ],
      products: ["Search Engine Software", "Data Analytics", "AI Software"],
      people: [
        {
          title: "â™Ÿ Who We Are",
          text: "Backend-heavy engineers with ML expertise, distributed across two time zones.",
        },
        {
          title: "â˜† What We're Great At",
          text: "Reliable data pipelines, model delivery, and fast experiments.",
        },
        {
          title: "â™¡ Team Culture",
          text: "Data-driven, candid, and generous with knowledge.",
        },
        {
          title: "â—‡ How We Work Together",
          text: "Mostly remote with written decisions and focused weekly syncs.",
        },
        {
          title: "â–³ This team is NOT for you if...",
          text: "You need constant guidance or avoid ambiguity.",
          warning: true,
        },
      ],
      operate: [
        {
          title: "â—‡ How We're Led",
          text: "Flat hierarchy with strong technical direction.",
        },
        {
          title: "â˜† What We Are Solving Now",
          text: "Recommendation quality, model latency, and reusable data tooling.",
        },
        {
          title: "▣ A Typical Day",
          text: "Training reviews, pairing, and independent research blocks.",
        },
        {
          title: "â™¡ What We Value",
          text: "Reproducibility, intellectual honesty, and useful documentation.",
        },
        {
          title: "â†— Growth Here",
          text: "Conference support, paper reading groups, and clear IC tracks.",
        },
      ],
    },
  };

  teams.gamma = { ...teams.alpha, label: "Team Gamma" };
  teams.delta = { ...teams.beta, label: "Team Delta" };

  const offices = [
    "Tokyo",
    "New York",
    "Istanbul",
    "Seattle",
    "Kuala Lumpur",
    "San Francisco",
  ];

  let currentTeam = "alpha";
  let currentMode = "people";

  const membersElement = document.getElementById("teMembers");
  const officesElement = document.getElementById("teOffices");
  const productsElement = document.getElementById("teProducts");
  const badgeElement = document.getElementById("teTeamBadge");
  const pointsElement = document.getElementById("teProfilePoints");

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderMembers(members) {
    if (!membersElement) return;

    membersElement.innerHTML = members
      .map((member) => {
        const imageKey = member.name.toLowerCase();
        const imageSource = memberImages[imageKey];

        return `
                <article class="te-member-card">
                    <div class="te-member-avatar">
                        <img src="${escapeHtml(imageSource)}" alt="${escapeHtml(member.name)}" loading="lazy">
                    </div>
                    <div class="te-member-content">
                        <div class="te-member-name">${escapeHtml(member.name)}</div>
                        <div class="te-member-role">${escapeHtml(member.role)}</div>
                    </div>
                </article>
            `;
      })
      .join("");
  }

  function renderOffices() {
    if (!officesElement) return;

    officesElement.innerHTML = offices
      .map((office) => {
        const activeClass = office === "Seattle" ? " is-active" : "";

        return `
                <article class="te-office${activeClass}">
                    <div class="te-office-dot">
                        <img src="${escapeHtml(officeImages[office])}" alt="${escapeHtml(office)}" loading="lazy">
                    </div>
                    <span>${escapeHtml(office)}</span>
                </article>
            `;
      })
      .join("");
  }

  function renderProducts(products) {
    if (!productsElement) return;

    productsElement.innerHTML = products
      .map(
        (product, index) => `
            <button class="te-product-chip${index === 0 ? " is-active" : ""}" type="button">
                <span aria-hidden="true">▣</span>
                ${escapeHtml(product)}
            </button>
        `,
      )
      .join("");
  }

  function renderProfile() {
    const team = teams[currentTeam];
    if (!team || !badgeElement || !pointsElement) return;

    badgeElement.textContent = team.label;
    pointsElement.innerHTML = team[currentMode]
      .map(
        (point) => `
            <section class="te-profile-point${point.warning ? " is-warning" : ""}">
                <h3>${escapeHtml(point.title)}</h3>
                <p>${escapeHtml(point.text)}</p>
            </section>
        `,
      )
      .join("");
  }

  function renderTeam() {
    const team = teams[currentTeam];
    if (!team) return;

    renderMembers(team.members);
    renderProducts(team.products);
    renderProfile();
  }

  document.querySelectorAll(".te-team-tab").forEach((button) => {
    button.addEventListener("click", () => {
      const requestedTeam = button.dataset.team;
      if (!teams[requestedTeam]) return;

      currentTeam = requestedTeam;

      document.querySelectorAll(".te-team-tab").forEach((tab) => {
        const isActive = tab === button;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
      });

      renderTeam();
    });
  });

  document.querySelectorAll(".te-profile-button").forEach((button) => {
    button.addEventListener("click", () => {
      const requestedMode = button.dataset.profileMode;
      if (!["people", "operate"].includes(requestedMode)) return;

      currentMode = requestedMode;

      document
        .querySelectorAll(".te-profile-button")
        .forEach((profileButton) => {
          const isActive = profileButton === button;
          profileButton.classList.toggle("is-active", isActive);
          profileButton.setAttribute("aria-pressed", String(isActive));
        });

      renderProfile();
    });
  });

  window.BildyxTeamExample = {
    mountCard(slotId, html) {
      const slot = document.getElementById(slotId);
      if (!slot) return false;

      slot.innerHTML = html;
      slot.classList.add("has-content");
      return true;
    },

    clearCard(slotId) {
      const slot = document.getElementById(slotId);
      if (!slot) return false;

      slot.replaceChildren();
      slot.classList.remove("has-content");
      return true;
    },
  };

  renderOffices();
  renderTeam();
})();


window.BildyxCompagnyCon = window.BildyxTeamExample;
