import React from "react";
import { OrgCard } from "./OrgCard";
import { SubjectCard } from "./SubjectCard";
import type { MatchCategory, TargetRow } from "./types";

interface MatchSectionProps {
  category: MatchCategory;
  rows: TargetRow[];
}

const SECTION_CONFIG: Record<
  MatchCategory,
  { label: string; badge: string; description: string }
> = {
  same: {
    label: "Same Industry & Domain",
    badge: "Perfect Match",
    description: "Same industry and domain as your work experience",
  },
  similar: {
    label: "Same Industry",
    badge: "Similar",
    description: "Same industry, different domain",
  },
  different: {
    label: "Different Industry",
    badge: "Different",
    description: "Different industry from your experience",
  },
};

export function MatchSection({ category, rows }: MatchSectionProps) {
  const config = SECTION_CONFIG[category];

  if (rows.length === 0) return null;

  return (
    <div className="tl-match-section" data-category={category}>
      <div className="tl-match-section__header">
        <span className="tl-match-section__badge">{config.badge}</span>
        <h2 className="tl-match-section__title">{config.label}</h2>
        <span className="tl-match-section__count">{rows.length}</span>
      </div>

      <p className="tl-match-section__desc">{config.description}</p>

      <div className="tl-match-section__body">
        {rows.map((row) => (
          <div
            className="tl-company-row"
            key={`${row.id}-${row.subject_id ?? "no-subj"}`}
          >
            <OrgCard row={row} />
            {row.subject_id ? <SubjectCard row={row} /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
