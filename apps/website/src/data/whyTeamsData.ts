export type Person = { name: string; role: string; image: string };
export type ProfilePoint = { icon: string; title: string; text: string; warning?: boolean };
export type WhyTeamsTeam = {
  label: string;
  members: string[]; // keys into `people`
  city: string;
  product: string;
  overview: ProfilePoint[];
  operate: ProfilePoint[];
};

export const people: Record<string, Omit<Person, "name"> & { name: string }> = {
  michael: { name: "Michael", role: "VP Marketing", image: "michael.png" },
  amelia: { name: "Amelia", role: "Product Manager", image: "amelia.png" },
  carlos: { name: "Carlos", role: "Lead Engineer", image: "carlos.png" },
  hana: { name: "Hana", role: "UX Designer", image: "hana.png" },
  ethan: { name: "Ethan", role: "Data Analyst", image: "ethan.png" },
  naomi: { name: "Naomi", role: "QA Lead", image: "naomi.png" },
  clara: { name: "Clara", role: "Scrum Master", image: "clara.png" },
  omar: { name: "Omar", role: "DevOps Engineer", image: "omar.png" },
  priya: { name: "Priya", role: "Backend Dev", image: "priya.png" },
  akira: { name: "Akira", role: "Frontend Dev", image: "akira.png" },
  elena: { name: "Elena", role: "Ops Manager", image: "elena.png" },
  diego: { name: "Diego", role: "Customer Success", image: "diego.png" },
};

export const teams: Record<string, WhyTeamsTeam> = {
  alpha: {
    label: "Team Alpha",
    members: ["michael", "amelia", "carlos", "hana", "ethan", "naomi", "clara", "omar", "priya", "akira", "elena", "diego"],
    city: "istanbul",
    product: "ai",
    overview: [
      { icon: "", title: "Who We Are", text: "A cross-functional squad of engineers, designers, and PMs shipping user-facing products." },
      { icon: "", title: "What We're Great At", text: "Rapid prototyping, data-driven decisions, and shipping high-quality features fast." },
      { icon: "", title: "Team Culture", text: "Open feedback, async-first communication, weekly demos, and blameless retros." },
      { icon: "", title: "How We Work Together", text: "Two-week sprints with daily standups. We pair-program and run design critiques weekly." },
      { icon: "", title: "This Team is NOT For You If...", text: "You prefer rigid routines or dislike shifting priorities mid-sprint.", warning: true },
    ],
    operate: [
      { icon: "", title: "How We're Led", text: "Hands-on when needed, high trust by default. Clear goals, strong ownership. Managers coach, not micromanage." },
      { icon: "", title: "What We're Solving Now", text: "Scaling infrastructure, reducing tech debt, improving retention, migrating from monolith to microservices." },
      { icon: "", title: "A Typical Day", text: "Deep work mornings, collaboration afternoons, 15-minute standup. Protected focus time. Most log off by 5-6 PM." },
      { icon: "", title: "What We Value", text: "Direct communication, low ego, high ownership. It's safe to disagree. We care about impact more than hours worked." },
      { icon: "", title: "Growth Here", text: "Learning budget for everyone. Clear promotion paths. Prefer internal growth. Mentorship formal and informal." },
    ],
  },
  beta: {
    label: "Team Beta",
    members: ["elena", "omar", "hana", "diego", "naomi", "akira", "clara", "michael"],
    city: "tokyo",
    product: "search",
    overview: [
      { icon: "", title: "Who We Are", text: "Backend-heavy engineers with ML expertise. Distributed across 2 time zones with 5+ years avg experience." },
      { icon: "", title: "What We're Great At", text: "Building reliable data pipelines and ML models at scale. Fast iteration on experiments." },
      { icon: "", title: "Team Culture", text: "Data-driven decisions. We celebrate failed experiments as learning. Weekly knowledge-sharing sessions." },
      { icon: "", title: "How We Work Together", text: "Mostly remote. Daily async updates. Weekly sync calls. Heavy use of Jupyter notebooks and shared docs." },
      { icon: "", title: "This Team is NOT For You If...", text: "You need constant guidance or struggle with ambiguity in problem-solving.", warning: true },
    ],
    operate: [
      { icon: "", title: "How We're Led", text: "Flat hierarchy. Tech lead sets direction, but everyone contributes to architecture decisions. Quarterly OKRs." },
      { icon: "", title: "What We're Solving Now", text: "Real-time recommendation engine, reducing model latency by 40%, building feature store for cross-team use." },
      { icon: "", title: "A Typical Day", text: "Morning: model training reviews. Afternoon: pair programming or experimentation. Fridays: research time." },
      { icon: "", title: "What We Value", text: "Intellectual curiosity, reproducibility, and shipping over perfection. We document everything." },
      { icon: "", title: "Growth Here", text: "Conference budget, paper reading groups, and internal tech talks. Clear IC and management tracks." },
    ],
  },
  gamma: {
    label: "Team Gamma",
    members: ["carlos", "hana", "priya", "akira", "amelia", "ethan", "diego", "naomi"],
    city: "san-francisco",
    product: "sales",
    overview: [
      { icon: "", title: "Who We Are", text: "A product squad connecting customer insight, design, engineering, and go-to-market expertise." },
      { icon: "", title: "What We're Great At", text: "Turning customer feedback into simple, measurable product improvements." },
      { icon: "", title: "Team Culture", text: "Fast feedback, respectful debate, and strong accountability across every discipline." },
      { icon: "", title: "How We Work Together", text: "Weekly customer sessions, focused delivery blocks, and visible decisions in shared documentation." },
      { icon: "", title: "This Team is NOT For You If...", text: "You prefer working without direct customer feedback or measurable goals.", warning: true },
    ],
    operate: [
      { icon: "", title: "How We're Led", text: "Product and engineering share direction while specialists own the execution details." },
      { icon: "", title: "What We're Solving Now", text: "Improving onboarding conversion and making sales workflows easier to customize." },
      { icon: "", title: "A Typical Day", text: "Customer research, design reviews, focused build time, and a short progress sync." },
      { icon: "", title: "What We Value", text: "Clarity, empathy, experimentation, and decisions backed by evidence." },
      { icon: "", title: "Growth Here", text: "Cross-functional mentorship and regular opportunities to own complete product outcomes." },
    ],
  },
  delta: {
    label: "Team Delta",
    members: ["ethan", "clara", "michael", "elena", "omar", "carlos", "amelia", "priya"],
    city: "new-york",
    product: "cloud",
    overview: [
      { icon: "", title: "Who We Are", text: "Infrastructure specialists focused on dependable systems, developer experience, and security." },
      { icon: "", title: "What We're Great At", text: "Automation, observability, incident response, and scalable cloud architecture." },
      { icon: "", title: "Team Culture", text: "Calm under pressure, documentation first, and continuous improvement after every incident." },
      { icon: "", title: "How We Work Together", text: "Rotating ownership, clear escalation paths, and protected time for preventative engineering." },
      { icon: "", title: "This Team is NOT For You If...", text: "You avoid operational ownership or dislike documenting decisions.", warning: true },
    ],
    operate: [
      { icon: "", title: "How We're Led", text: "Leads provide priorities and context. Engineers own systems from design to production." },
      { icon: "", title: "What We're Solving Now", text: "Reducing deployment time, improving reliability, and standardizing platform tooling." },
      { icon: "", title: "A Typical Day", text: "Platform work, operational reviews, pairing, and maintenance windows planned in advance." },
      { icon: "", title: "What We Value", text: "Reliability, transparency, thoughtful automation, and sustainable on-call practices." },
      { icon: "", title: "Growth Here", text: "Cloud certifications, architecture reviews, and mentorship across infrastructure domains." },
    ],
  },
  fusion: {
    label: "Team Fusion",
    members: ["naomi", "carlos", "hana", "diego", "omar", "elena", "akira"],
    city: "seoul",
    product: "analytics",
    overview: [
      { icon: "", title: "Who We Are", text: "Quality and reliability champions. Diverse backgrounds from gaming, fintech, and healthcare." },
      { icon: "", title: "What We're Great At", text: "End-to-end test automation, accessibility audits, and building quality into the dev process." },
      { icon: "", title: "Team Culture", text: "Supportive and patient. We mentor junior members actively. Monthly hackathons and innovation days." },
      { icon: "", title: "How We Work Together", text: "Fully remote across 5 time zones. Overlap hours 10am-2pm ET. Strong async documentation culture." },
      { icon: "", title: "This Team is NOT For You If...", text: "You cut corners on quality or see testing as someone else's job.", warning: true },
    ],
    operate: [
      { icon: "", title: "How We're Led", text: "Quality ownership is shared. Leads unblock the team and keep priorities visible." },
      { icon: "", title: "What We're Solving Now", text: "Expanding automated coverage and improving accessibility across all products." },
      { icon: "", title: "A Typical Day", text: "Async updates, focused test development, product reviews, and cross-team quality coaching." },
      { icon: "", title: "What We Value", text: "Patience, precision, curiosity, and prevention instead of blame." },
      { icon: "", title: "Growth Here", text: "Mentoring, quality leadership projects, and time to explore new testing approaches." },
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
