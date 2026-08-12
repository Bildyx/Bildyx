export type Job = {
  id: string;
  company: "Pekamix" | "Rakuten";
  team: string;
  job?: string;
  product?: string;
  match: string;
  summary: string;
  why: string[];
  work: string;
  scores: ("high" | "medium" | "empty")[]; // Organization, Team, Mission, Job
  appliedByDefault?: boolean;
};

export const jobs: Record<string, Job> = {
  "pekamix-alpha": {
    id: "pekamix-alpha",
    company: "Pekamix",
    team: "SuperTeam",
    job: "Software Engineer",
    product: "SalesPro",
    match: "Strong match",
    summary: "A product engineering team building sales software for international B2B clients.",
    why: [
      "Strong fit with programming and customer-service skills.",
      "Good match with software engineering experience.",
      "Team culture is fast-moving, practical, and collaborative.",
    ],
    work: "Two-week sprints, daily standups, product demos, and direct collaboration with Tokyo and US stakeholders.",
    scores: ["medium", "high", "high", "empty"],
    appliedByDefault: true,
  },
  "pekamix-beta": {
    id: "pekamix-beta",
    company: "Pekamix",
    team: "Core Platform",
    job: "Backend Developer",
    product: "Analytics Tools",
    match: "High technical fit",
    summary: "A backend-heavy team focused on data pipelines, APIs, and internal product reliability.",
    why: [
      "Good fit for backend development and performance optimization.",
      "Useful for candidates who like structured systems.",
      "Best for people comfortable with technical ownership.",
    ],
    work: "Async-first collaboration, code reviews, weekly technical planning, and clear ownership per service.",
    scores: ["high", "medium", "high", "medium"],
  },
  "rakuten-superteam": {
    id: "rakuten-superteam",
    company: "Rakuten",
    team: "SuperTeam",
    match: "Good team fit",
    summary: "A customer-facing team working on marketplace pages, components, and conversion flows.",
    why: [
      "Good fit with product thinking and fast iteration.",
      "Strong team score for communication and growth.",
      "Useful for candidates who enjoy visible user impact.",
    ],
    work: "Design reviews, frontend pairing, analytics checks, and short weekly releases.",
    scores: ["medium", "high", "high", "empty"],
  },
  "rakuten-maj2023": {
    id: "rakuten-maj2023",
    company: "Rakuten",
    team: "Maj2023Time",
    match: "Balanced match",
    summary: "A data-oriented team turning product behavior and customer signals into actionable insights.",
    why: [
      "Good fit with analytical work and cross-team collaboration.",
      "Medium-to-high match across organization, team, and mission.",
      "Best for people who like dashboards, signals, and experiments.",
    ],
    work: "Weekly insight reviews, experiment tracking, and close collaboration with product managers.",
    scores: ["medium", "medium", "high", "empty"],
  },
  "rakuten-2maj": {
    id: "rakuten-2maj",
    company: "Rakuten",
    team: "2.Maj",
    job: "Video",
    product: "rakuten.com",
    match: "Applied",
    summary: "A media and commerce team connecting video content with product discovery.",
    why: [
      "Good match with creative product environments.",
      "Solid fit if you like mixed product and content workflows.",
      "Useful for candidates comfortable with changing priorities.",
    ],
    work: "Campaign planning, video asset coordination, and product-page optimization.",
    scores: ["medium", "medium", "high", "medium"],
    appliedByDefault: true,
  },
  "rakuten-games": {
    id: "rakuten-games",
    company: "Rakuten",
    team: "RakutenGames",
    job: "Game Product Assistant",
    product: "Mobile Games",
    match: "Medium match",
    summary: "A games team working on mobile game operations, campaigns, and player engagement.",
    why: [
      "Interesting fit for candidates who like gaming and product operations.",
      "Balanced match across job, mission, and team style.",
      "Best for people who enjoy fast campaign cycles.",
    ],
    work: "Event calendars, player feedback reviews, content coordination, and performance follow-up.",
    scores: ["medium", "medium", "medium", "medium"],
  },
};

export const companyGroups: { key: string; label: string; jobIds: string[] }[] = [
  { key: "pekamix", label: "Pekamix", jobIds: ["pekamix-alpha", "pekamix-beta"] },
  { key: "rakuten", label: "Rakuten", jobIds: ["rakuten-superteam", "rakuten-maj2023", "rakuten-2maj", "rakuten-games"] },
];
