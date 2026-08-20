import React, { useEffect, useRef, useState } from "react";
import { CardService } from "../../services/card.service";
import { CardPopover } from "./CardPopover";
import type { TargetRow } from "./types";

const cardService = new CardService();

interface SubjectCardProps {
  row: TargetRow;
}

export function SubjectCard({ row }: SubjectCardProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    if (!row.subject_id || !hovered) return;
    cardService
      .getSubject(row.subject_id)
      .then((h: string) => {
        if (!cancelled) setHtml(h);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [row.subject_id, hovered]);

  const name = row.subject_name ?? "Subject\u2026";
  const desc = row.subject_description;

  return (
    <div
      ref={cardRef}
      className="tl-inline-card tl-inline-card--subject"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="tl-inline-card__body">
        <strong className="tl-inline-card__name">{name}</strong>
        {desc && (
          <p className="tl-inline-card__desc">
            {desc.slice(0, 110)}
            {desc.length > 110 ? "…" : ""}
          </p>
        )}
      </div>

      {hovered && (
        <CardPopover
          html={html}
          title={`Subject — ${name}`}
          anchorEl={cardRef.current}
        />
      )}
    </div>
  );
}
