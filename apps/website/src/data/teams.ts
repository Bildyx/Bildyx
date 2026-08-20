export type TeamMember = {
  name: string;
  role: string;
  image: string;
};

export type ProfilePoint = {
  icon: string;
  title: string;
  description: string;
  danger?: boolean;
};

export type Team = {
  key: string;
  name: string;
  activeCity: string;
  activeProduct: string;
  members: TeamMember[];
  overviewPoints: ProfilePoint[];
  operatePoints: ProfilePoint[];
};

export const teams: Record<string, Team> = {
  alpha: {
    key: "alpha",
    name: "Team Alpha",
    activeCity: "istanbul",
    activeProduct: "ai",
    members: [
      { name: "Michael", role: "VP Marketing", image: "michael.png" },
      { name: "Amelia", role: "Product Manager", image: "amelia.png" },
      { name: "Carlos", role: "Lead Engineer", image: "carlos.png" },
      { name: "Hana", role: "UX Designer", image: "hana.png" },
      { name: "Ethan", role: "Data Analyst", image: "ethan.png" },
      { name: "Naomi", role: "QA Lead", image: "naomi.png" },
      { name: "Clara", role: "Scrum Master", image: "clara.png" },
      { name: "Omar", role: "DevOps Engineer", image: "omar.png" },
      { name: "Priya", role: "Backend Dev", image: "priya.png" },
      { name: "Akira", role: "Frontend Dev", image: "akira.png" },
      { name: "Elena", role: "Ops Manager", image: "elena.png" },
      { name: "Diego", role: "Customer Success", image: "diego.png" },
    ],
    overviewPoints: [
      {
        icon: "",
        title: "Who We Are",
        description:
          "A cross-functional squad of engineers, designers, and PMs shipping user-facing products.",
      },
      {
        icon: "",
        title: "What We're Great At",
        description:
          "Rapid prototyping, data-driven decisions, and shipping high-quality features fast.",
      },
      {
        icon: "",
        title: "Team Culture",
        description:
          "Open feedback, async-first communication, weekly demos, and blameless retros.",
      },
      {
        icon: "",
        title: "How We Work Together",
        description:
          "Two-week sprints with daily standups. We pair-program and run design critiques weekly.",
      },
      {
        icon: "",
        title: "This Team is NOT For You If...",
        description: "You prefer rigid routines or dislike shifting priorities mid-sprint.",
        danger: true,
      },
    ],
    operatePoints: [
      {
        icon: "",
        title: "How We're Led",
        description:
          "Hands-on when needed, high trust by default. Clear goals, strong ownership. Manager as coach, not micromanager.",
      },
      {
        icon: "",
        title: "What We're Solving Now",
        description:
          "Scaling infrastructure, reducing tech debt, improving retention, and migrating from monolith to microservices.",
      },
      {
        icon: "",
        title: "A Typical Day",
        description:
          "Deep work mornings, collaboration afternoons. 15-minute standup. Protected focus time. Most log off by 5-6 PM.",
      },
      {
        icon: "",
        title: "What We Value",
        description:
          "Direct communication, low ego, high ownership. It's safe to disagree. We care about impact more than hours worked.",
      },
      {
        icon: "",
        title: "Growth Here",
        description:
          "Learning budget for everyone. Clear promotion paths. Prefer internal growth. Mentorship is both formal and informal.",
      },
    ],
  },
  beta: {
    key: "beta",
    name: "Team Beta",
    activeCity: "tokyo",
    activeProduct: "search",
    members: [
      { name: "Elena", role: "Engineering Manager", image: "elena.png" },
      { name: "Omar", role: "Senior Backend Dev", image: "omar.png" },
      { name: "Hana", role: "Product Designer", image: "hana.png" },
      { name: "Diego", role: "Mobile Developer", image: "diego.png" },
      { name: "Naomi", role: "Data Engineer", image: "naomi.png" },
      { name: "Akira", role: "ML Engineer", image: "akira.png" },
      { name: "Clara", role: "Technical Writer", image: "clara.png" },
      { name: "Michael", role: "Growth Lead", image: "michael.png" },
    ],
    overviewPoints: [
      {
        icon: "",
        title: "Who We Are",
        description:
          "Backend-heavy engineers with ML expertise. Distributed across 2 time zones with 5+ years average experience.",
      },
      {
        icon: "",
        title: "What We're Great At",
        description:
          "Building reliable data pipelines and ML models at scale. Fast iteration on experiments.",
      },
      {
        icon: "",
        title: "Team Culture",
        description:
          "Data-driven decisions. We celebrate failed experiments as learning. Weekly knowledge-sharing sessions.",
      },
      {
        icon: "",
        title: "How We Work Together",
        description:
          "Mostly remote. Daily async updates. Weekly sync calls. Heavy use of Jupyter notebooks and shared docs.",
      },
      {
        icon: "",
        title: "This Team is NOT For You If...",
        description: "You need constant guidance or struggle with ambiguity in problem-solving.",
        danger: true,
      },
    ],
    operatePoints: [
      {
        icon: "",
        title: "How We're Led",
        description:
          "Flat hierarchy. The tech lead sets direction, but everyone contributes to architecture decisions. Quarterly OKRs.",
      },
      {
        icon: "",
        title: "What We're Solving Now",
        description:
          "Real-time recommendation engine, reducing model latency by 40%, and building a feature store for cross-team use.",
      },
      {
        icon: "",
        title: "A Typical Day",
        description:
          "Morning: model training reviews. Afternoon: pair programming or experimentation. Fridays: research time.",
      },
      {
        icon: "",
        title: "What We Value",
        description:
          "Intellectual curiosity, reproducibility, and shipping over perfection. We document everything.",
      },
      {
        icon: "",
        title: "Growth Here",
        description:
          "Conference budget, paper reading groups, and internal tech talks. Clear IC and management tracks.",
      },
    ],
  },
  gamma: {
    key: "gamma",
    name: "Team Gamma",
    activeCity: "new-york",
    activeProduct: "sales",
    members: [
      { name: "Carlos", role: "Engineering Lead", image: "carlos.png" },
      { name: "Hana", role: "UX Researcher", image: "hana.png" },
      { name: "Priya", role: "Full Stack Dev", image: "priya.png" },
      { name: "Michael", role: "Product Lead", image: "michael.png" },
      { name: "Akira", role: "Frontend Dev", image: "akira.png" },
      { name: "Naomi", role: "QA Engineer", image: "naomi.png" },
      { name: "Omar", role: "Platform Engineer", image: "omar.png" },
      { name: "Clara", role: "Content Designer", image: "clara.png" },
    ],
    overviewPoints: [
      {
        icon: "",
        title: "Who We Are",
        description:
          "A product-focused team building clear, useful experiences for fast-moving sales organizations.",
      },
      {
        icon: "",
        title: "What We're Great At",
        description:
          "Customer discovery, rapid prototyping, accessible interfaces, and measurable product outcomes.",
      },
      {
        icon: "",
        title: "Team Culture",
        description: "Curious, practical, and candid. We share early work and improve it together.",
      },
      {
        icon: "",
        title: "How We Work Together",
        description: "Small project squads, written decisions, and frequent user feedback.",
      },
      {
        icon: "",
        title: "This Team is NOT For You If...",
        description: "You prefer perfect plans over fast learning and direct customer feedback.",
        danger: true,
      },
    ],
    operatePoints: [
      {
        icon: "",
        title: "How We're Led",
        description:
          "Product and engineering share ownership. Leads set context, then teams choose the best path to the outcome.",
      },
      {
        icon: "",
        title: "What We're Solving Now",
        description:
          "Simplifying onboarding, improving conversion, and creating clearer workflows for international customers.",
      },
      {
        icon: "",
        title: "A Typical Day",
        description:
          "Customer interviews, focused build time, design reviews, and short written updates instead of long meetings.",
      },
      {
        icon: "",
        title: "What We Value",
        description: "Clarity, empathy, experimentation, and evidence over assumptions.",
      },
      {
        icon: "",
        title: "Growth Here",
        description:
          "Cross-functional mentoring, product workshops, and regular opportunities to lead small initiatives.",
      },
    ],
  },
  delta: {
    key: "delta",
    name: "Team Delta",
    activeCity: "san-francisco",
    activeProduct: "cloud",
    members: [
      { name: "Omar", role: "Cloud Lead", image: "omar.png" },
      { name: "Elena", role: "Program Manager", image: "elena.png" },
      { name: "Carlos", role: "Solutions Architect", image: "carlos.png" },
      { name: "Ethan", role: "Data Analyst", image: "ethan.png" },
      { name: "Michael", role: "Partnerships", image: "michael.png" },
      { name: "Priya", role: "Backend Dev", image: "priya.png" },
      { name: "Diego", role: "Support Engineer", image: "diego.png" },
      { name: "Akira", role: "Frontend Dev", image: "akira.png" },
    ],
    overviewPoints: [
      {
        icon: "",
        title: "Who We Are",
        description: "Infrastructure specialists delivering dependable services for global product teams.",
      },
      {
        icon: "",
        title: "What We're Great At",
        description: "Cloud architecture, observability, incident response, and performance optimization.",
      },
      {
        icon: "",
        title: "Team Culture",
        description: "Calm under pressure, documentation-first, and generous with knowledge.",
      },
      {
        icon: "",
        title: "How We Work Together",
        description: "Rotating ownership, blameless reviews, and strong automation.",
      },
      {
        icon: "",
        title: "This Team is NOT For You If...",
        description: "You dislike operational responsibility or documenting your decisions.",
        danger: true,
      },
    ],
    operatePoints: [
      {
        icon: "",
        title: "How We're Led",
        description:
          "Clear service ownership with rotating technical leadership. Decisions are documented and reviewed openly.",
      },
      {
        icon: "",
        title: "What We're Solving Now",
        description:
          "Improving reliability, reducing deployment time, and standardizing observability across services.",
      },
      {
        icon: "",
        title: "A Typical Day",
        description:
          "Focused platform work, short operational reviews, pairing on incidents, and scheduled improvement time.",
      },
      {
        icon: "",
        title: "What We Value",
        description: "Reliability, calm communication, automation, and learning from every incident.",
      },
      {
        icon: "",
        title: "Growth Here",
        description:
          "Cloud certifications, architecture reviews, incident leadership, and mentorship across product teams.",
      },
    ],
  },
  fusion: {
    key: "fusion",
    name: "Team Fusion",
    activeCity: "seoul",
    activeProduct: "analytics",
    members: [
      { name: "Naomi", role: "Head of QA", image: "naomi.png" },
      { name: "Carlos", role: "Architect", image: "carlos.png" },
      { name: "Hana", role: "Creative Director", image: "hana.png" },
      { name: "Diego", role: "Support Lead", image: "diego.png" },
      { name: "Omar", role: "Cloud Architect", image: "omar.png" },
      { name: "Elena", role: "HR Manager", image: "elena.png" },
      { name: "Akira", role: "Full Stack Dev", image: "akira.png" },
    ],
    overviewPoints: [
      {
        icon: "",
        title: "Who We Are",
        description: "Quality and reliability champions. Diverse backgrounds from gaming, fintech, and healthcare.",
      },
      {
        icon: "",
        title: "What We're Great At",
        description:
          "End-to-end test automation, accessibility audits, and building quality into the development process.",
      },
      {
        icon: "",
        title: "Team Culture",
        description:
          "Supportive and patient. We mentor junior members actively. Monthly hackathons and innovation days.",
      },
      {
        icon: "",
        title: "How We Work Together",
        description:
          "Fully remote across 5 time zones. Overlap hours 10 AM-2 PM ET. Strong async documentation culture.",
      },
      {
        icon: "",
        title: "This Team is NOT For You If...",
        description: "You cut corners on quality or see testing as someone else's job.",
        danger: true,
      },
    ],
    operatePoints: [
      {
        icon: "",
        title: "How We're Led",
        description:
          "Shared leadership between quality, product, and engineering. Ownership follows the problem, not the title.",
      },
      {
        icon: "",
        title: "What We're Solving Now",
        description: "Expanding automated coverage, improving accessibility, and making quality signals visible earlier.",
      },
      {
        icon: "",
        title: "A Typical Day",
        description:
          "Async check-ins, focused test and development work, paired reviews, and a short overlap window for decisions.",
      },
      {
        icon: "",
        title: "What We Value",
        description: "Patience, precision, accessibility, and helping every teammate build quality into their work.",
      },
      {
        icon: "",
        title: "Growth Here",
        description:
          "Quality engineering mentorship, accessibility training, and opportunities to lead cross-team improvements.",
      },
    ],
  },
};

export const teamOrder = ["alpha", "beta", "gamma", "delta", "fusion"];

export const officeCities = [
  { id: "tokyo", label: "Tokyo", image: "city-tokyo.png" },
  { id: "new-york", label: "New York", image: "city-new-york.png" },
  { id: "seoul", label: "Seoul", image: "city-seoul.png" },
  { id: "kuala-lumpur", label: "Kuala Lumpur", image: "city-kuala-lumpur.png" },
  { id: "san-francisco", label: "San Francisco", image: "city-san-francisco.png" },
  { id: "istanbul", label: "Istanbul", image: "city-istanbul.png" },
];

export const productChips = [
  { id: "ai", icon: "▣", label: "AI Software" },
  { id: "search", icon: "⌕", label: "Search Engine Software" },
  { id: "sales", icon: "▽", label: "Sales Software" },
  { id: "cloud", icon: "⌒", label: "Cloud Infrastructure" },
  { id: "analytics", icon: "▥", label: "Data Analytics" },
];
