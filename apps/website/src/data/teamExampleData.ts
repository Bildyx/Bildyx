export type Member = { name: string; role: string };
export type ProfilePoint = { title: string; text: string; warning?: boolean };
export type TeamExampleTeam = {
  label: string;
  members: Member[];
  products: string[];
  people: ProfilePoint[];
  operate: ProfilePoint[];
};

export const memberImages: Record<string, string> = {
  michael: "michael.png",
  amelia: "amelia.png",
  carlos: "carlos.png",
  hana: "hana.png",
  ethan: "ethan.png",
  naomi: "naomi.png",
  clara: "clara.png",
  omar: "omar.png",
  priya: "priya.png",
  akira: "akira.png",
  elena: "elena.png",
  diego: "diego.png",
};

export const officeImages: Record<string, string> = {
  Tokyo: "city-tokyo.png",
  "New York": "city-new-york.png",
  Istanbul: "city-istanbul.png",
  Seattle: "city-seattle.png",
  "Kuala Lumpur": "city-kuala-lumpur.png",
  "San Francisco": "city-san-francisco.png",
};

export const offices = ["Tokyo", "New York", "Istanbul", "Seattle", "Kuala Lumpur", "San Francisco"];

const alpha: TeamExampleTeam = {
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
  products: ["Marketing Software", "ERP Systems", "Sales Software", "Cloud Infrastructure", "Data Analytics"],
  people: [
    { title: "Who We Are", text: "A mix of senior and emerging talent from startups and global tech. Some with traditional degrees, others self-taught." },
    { title: "What We're Great At", text: "Strong in system design and fast shipping. We value clean code and clear UX." },
    { title: "Team Culture", text: "Collaborative, low politics. Friendly, not forced. Occasional dinners, strong boundaries." },
    { title: "How We Work Together", text: "Hybrid across three cities. Async-first, minimal meetings. Slack and Notion for most communication." },
    { title: "This team is NOT for you if...", text: "You prefer rigid routines or dislike shifting priorities mid-sprint.", warning: true },
  ],
  operate: [
    { title: "How We're Led", text: "Clear ownership, high trust, and direct feedback." },
    { title: "What We Are Solving Now", text: "Scaling the platform while keeping the user experience simple." },
    { title: "A Typical Day", text: "Deep work blocks, short syncs, and protected time for collaboration." },
    { title: "What We Value", text: "Curiosity, accountability, and kindness under pressure." },
    { title: "Growth Here", text: "Mentorship, internal mobility, and visible impact." },
  ],
};

const beta: TeamExampleTeam = {
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
    { title: "Who We Are", text: "Backend-heavy engineers with ML expertise, distributed across two time zones." },
    { title: "What We're Great At", text: "Reliable data pipelines, model delivery, and fast experiments." },
    { title: "Team Culture", text: "Data-driven, candid, and generous with knowledge." },
    { title: "How We Work Together", text: "Mostly remote with written decisions and focused weekly syncs." },
    { title: "This team is NOT for you if...", text: "You need constant guidance or avoid ambiguity.", warning: true },
  ],
  operate: [
    { title: "How We're Led", text: "Flat hierarchy with strong technical direction." },
    { title: "What We Are Solving Now", text: "Recommendation quality, model latency, and reusable data tooling." },
    { title: "A Typical Day", text: "Training reviews, pairing, and independent research blocks." },
    { title: "What We Value", text: "Reproducibility, intellectual honesty, and useful documentation." },
    { title: "Growth Here", text: "Conference support, paper reading groups, and clear IC tracks." },
  ],
};

export const teams: Record<string, TeamExampleTeam> = {
  alpha,
  beta,
  gamma: { ...alpha, label: "Team Gamma" },
  delta: { ...beta, label: "Team Delta" },
};

export const teamOrder = ["alpha", "beta", "gamma", "delta"];
