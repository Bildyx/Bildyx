const teams = {
    alpha: {
        name: "Team Alpha",
        activeCity: "istanbul",
        activeProduct: "ai",
        members: [
            ["Michael", "VP Marketing", "michael.png"],
            ["Amelia", "Product Manager", "amelia.png"],
            ["Carlos", "Lead Engineer", "carlos.png"],
            ["Hana", "UX Designer", "hana.png"],
            ["Ethan", "Data Analyst", "ethan.png"],
            ["Naomi", "QA Lead", "naomi.png"],
            ["Clara", "Scrum Master", "clara.png"],
            ["Omar", "DevOps Engineer", "omar.png"],
            ["Priya", "Backend Dev", "priya.png"],
            ["Akira", "Frontend Dev", "akira.png"],
            ["Elena", "Ops Manager", "elena.png"],
            ["Diego", "Customer Success", "diego.png"]
        ],
        overviewPoints: [
            ["♙", "Who We Are", "A cross-functional squad of engineers, designers, and PMs shipping user-facing products."],
            ["☆", "What We're Great At", "Rapid prototyping, data-driven decisions, and shipping high-quality features fast."],
            ["♡", "Team Culture", "Open feedback, async-first communication, weekly demos, and blameless retros."],
            ["◇", "How We Work Together", "Two-week sprints with daily standups. We pair-program and run design critiques weekly."],
            ["⬡", "This Team is NOT For You If...", "You prefer rigid routines or dislike shifting priorities mid-sprint.", true]
        ],
        operatePoints: [
            ["♢", "How We're Led", "Hands-on when needed, high trust by default. Clear goals, strong ownership. Manager as coach, not micromanager."],
            ["☆", "What We're Solving Now", "Scaling infrastructure, reducing tech debt, improving retention, and migrating from monolith to microservices."],
            ["♙", "A Typical Day", "Deep work mornings, collaboration afternoons. 15-minute standup. Protected focus time. Most log off by 5–6 PM."],
            ["♡", "What We Value", "Direct communication, low ego, high ownership. It's safe to disagree. We care about impact more than hours worked."],
            ["↗", "Growth Here", "Learning budget for everyone. Clear promotion paths. Prefer internal growth. Mentorship is both formal and informal."]
        ]
    },
    beta: {
        name: "Team Beta",
        activeCity: "tokyo",
        activeProduct: "search",
        members: [
            ["Elena", "Engineering Manager", "elena.png"],
            ["Omar", "Senior Backend Dev", "omar.png"],
            ["Hana", "Product Designer", "hana.png"],
            ["Diego", "Mobile Developer", "diego.png"],
            ["Naomi", "Data Engineer", "naomi.png"],
            ["Akira", "ML Engineer", "akira.png"],
            ["Clara", "Technical Writer", "clara.png"],
            ["Michael", "Growth Lead", "michael.png"]
        ],
        overviewPoints: [
            ["♙", "Who We Are", "Backend-heavy engineers with ML expertise. Distributed across 2 time zones with 5+ years average experience."],
            ["☆", "What We're Great At", "Building reliable data pipelines and ML models at scale. Fast iteration on experiments."],
            ["♡", "Team Culture", "Data-driven decisions. We celebrate failed experiments as learning. Weekly knowledge-sharing sessions."],
            ["◇", "How We Work Together", "Mostly remote. Daily async updates. Weekly sync calls. Heavy use of Jupyter notebooks and shared docs."],
            ["⬡", "This Team is NOT For You If...", "You need constant guidance or struggle with ambiguity in problem-solving.", true]
        ],
        operatePoints: [
            ["♢", "How We're Led", "Flat hierarchy. The tech lead sets direction, but everyone contributes to architecture decisions. Quarterly OKRs."],
            ["☆", "What We're Solving Now", "Real-time recommendation engine, reducing model latency by 40%, and building a feature store for cross-team use."],
            ["♙", "A Typical Day", "Morning: model training reviews. Afternoon: pair programming or experimentation. Fridays: research time."],
            ["♡", "What We Value", "Intellectual curiosity, reproducibility, and shipping over perfection. We document everything."],
            ["↗", "Growth Here", "Conference budget, paper reading groups, and internal tech talks. Clear IC and management tracks."]
        ]
    },
    gamma: {
        name: "Team Gamma",
        activeCity: "new-york",
        activeProduct: "sales",
        members: [
            ["Carlos", "Engineering Lead", "carlos.png"],
            ["Hana", "UX Researcher", "hana.png"],
            ["Priya", "Full Stack Dev", "priya.png"],
            ["Michael", "Product Lead", "michael.png"],
            ["Akira", "Frontend Dev", "akira.png"],
            ["Naomi", "QA Engineer", "naomi.png"],
            ["Omar", "Platform Engineer", "omar.png"],
            ["Clara", "Content Designer", "clara.png"]
        ],
        overviewPoints: [
            ["♙", "Who We Are", "A product-focused team building clear, useful experiences for fast-moving sales organizations."],
            ["☆", "What We're Great At", "Customer discovery, rapid prototyping, accessible interfaces, and measurable product outcomes."],
            ["♡", "Team Culture", "Curious, practical, and candid. We share early work and improve it together."],
            ["◇", "How We Work Together", "Small project squads, written decisions, and frequent user feedback."],
            ["⬡", "This Team is NOT For You If...", "You prefer perfect plans over fast learning and direct customer feedback.", true]
        ],
        operatePoints: [
            ["♢", "How We're Led", "Product and engineering share ownership. Leads set context, then teams choose the best path to the outcome."],
            ["☆", "What We're Solving Now", "Simplifying onboarding, improving conversion, and creating clearer workflows for international customers."],
            ["♙", "A Typical Day", "Customer interviews, focused build time, design reviews, and short written updates instead of long meetings."],
            ["♡", "What We Value", "Clarity, empathy, experimentation, and evidence over assumptions."],
            ["↗", "Growth Here", "Cross-functional mentoring, product workshops, and regular opportunities to lead small initiatives."]
        ]
    },
    delta: {
        name: "Team Delta",
        activeCity: "san-francisco",
        activeProduct: "cloud",
        members: [
            ["Omar", "Cloud Lead", "omar.png"],
            ["Elena", "Program Manager", "elena.png"],
            ["Carlos", "Solutions Architect", "carlos.png"],
            ["Ethan", "Data Analyst", "ethan.png"],
            ["Michael", "Partnerships", "michael.png"],
            ["Priya", "Backend Dev", "priya.png"],
            ["Diego", "Support Engineer", "diego.png"],
            ["Akira", "Frontend Dev", "akira.png"]
        ],
        overviewPoints: [
            ["♙", "Who We Are", "Infrastructure specialists delivering dependable services for global product teams."],
            ["☆", "What We're Great At", "Cloud architecture, observability, incident response, and performance optimization."],
            ["♡", "Team Culture", "Calm under pressure, documentation-first, and generous with knowledge."],
            ["◇", "How We Work Together", "Rotating ownership, blameless reviews, and strong automation."],
            ["⬡", "This Team is NOT For You If...", "You dislike operational responsibility or documenting your decisions.", true]
        ],
        operatePoints: [
            ["♢", "How We're Led", "Clear service ownership with rotating technical leadership. Decisions are documented and reviewed openly."],
            ["☆", "What We're Solving Now", "Improving reliability, reducing deployment time, and standardizing observability across services."],
            ["♙", "A Typical Day", "Focused platform work, short operational reviews, pairing on incidents, and scheduled improvement time."],
            ["♡", "What We Value", "Reliability, calm communication, automation, and learning from every incident."],
            ["↗", "Growth Here", "Cloud certifications, architecture reviews, incident leadership, and mentorship across product teams."]
        ]
    },
    fusion: {
        name: "Team Fusion",
        activeCity: "seoul",
        activeProduct: "analytics",
        members: [
            ["Naomi", "Head of QA", "naomi.png"],
            ["Carlos", "Architect", "carlos.png"],
            ["Hana", "Creative Director", "hana.png"],
            ["Diego", "Support Lead", "diego.png"],
            ["Omar", "Cloud Architect", "omar.png"],
            ["Elena", "HR Manager", "elena.png"],
            ["Akira", "Full Stack Dev", "akira.png"]
        ],
        overviewPoints: [
            ["♙", "Who We Are", "Quality and reliability champions. Diverse backgrounds from gaming, fintech, and healthcare."],
            ["☆", "What We're Great At", "End-to-end test automation, accessibility audits, and building quality into the development process."],
            ["♡", "Team Culture", "Supportive and patient. We mentor junior members actively. Monthly hackathons and innovation days."],
            ["◇", "How We Work Together", "Fully remote across 5 time zones. Overlap hours 10 AM–2 PM ET. Strong async documentation culture."],
            ["⬡", "This Team is NOT For You If...", "You cut corners on quality or see testing as someone else's job.", true]
        ],
        operatePoints: [
            ["♢", "How We're Led", "Shared leadership between quality, product, and engineering. Ownership follows the problem, not the title."],
            ["☆", "What We're Solving Now", "Expanding automated coverage, improving accessibility, and making quality signals visible earlier."],
            ["♙", "A Typical Day", "Async check-ins, focused test and development work, paired reviews, and a short overlap window for decisions."],
            ["♡", "What We Value", "Patience, precision, accessibility, and helping every teammate build quality into their work."],
            ["↗", "Growth Here", "Quality engineering mentorship, accessibility training, and opportunities to lead cross-team improvements."]
        ]
    }
};

const membersContainer = document.getElementById("teamMembers");
const profilePoints = document.getElementById("profilePoints");
const teamBadge = document.getElementById("teamBadge");
const tabs = document.querySelectorAll(".team-tab");
const cities = document.querySelectorAll(".city");
const products = document.querySelectorAll(".product-chip");
const modeButtons = document.querySelectorAll("[data-profile-mode]");

let currentTeamKey = "alpha";
let currentProfileMode = "overview";

function renderProfile() {
    const team = teams[currentTeamKey];
    const points = currentProfileMode === "operate"
        ? team.operatePoints
        : team.overviewPoints;

    profilePoints.innerHTML = points.map(([icon, title, description, danger]) => `
        <section class="profile-point${danger ? " profile-point--danger" : ""}">
            <h3><span aria-hidden="true">${icon}</span>${title}</h3>
            <p>${description}</p>
        </section>
    `).join("");

    modeButtons.forEach((button) => {
        const isActive = button.dataset.profileMode === currentProfileMode;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

function renderTeam(teamKey) {
    const team = teams[teamKey];
    if (!team) return;

    currentTeamKey = teamKey;

    membersContainer.innerHTML = team.members.map(([name, role, image]) => `
        <div class="member-card">
            <img class="member-avatar" src="images/${image}" alt="${name}" />
            <strong>${name}</strong>
            <span>${role}</span>
        </div>
    `).join("");

    teamBadge.textContent = team.name;

    cities.forEach((city) => {
        city.classList.toggle("active", city.dataset.city === team.activeCity);
    });

    products.forEach((product) => {
        product.classList.toggle("active", product.dataset.product === team.activeProduct);
    });

    renderProfile();
}

tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        tabs.forEach((item) => {
            const isActive = item === tab;
            item.classList.toggle("active", isActive);
            item.setAttribute("aria-selected", String(isActive));
        });

        renderTeam(tab.dataset.team);
    });
});

modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        currentProfileMode = button.dataset.profileMode;
        renderProfile();
    });
});

renderTeam(currentTeamKey);
