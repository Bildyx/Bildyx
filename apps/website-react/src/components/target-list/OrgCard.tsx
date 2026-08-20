import React, { useEffect, useRef, useState, useCallback } from "react";
import { CardService } from "../../services/card.service";
import { CardPopover } from "./CardPopover";
import type { TargetRow } from "./types";

const cardService = new CardService();

const EMP_LABELS: Record<string, string> = {
  RANGE_1_10: "1–10 employees",
  RANGE_11_50: "11–50 employees",
  RANGE_51_200: "51–200 employees",
  RANGE_201_1000: "201–1,000 employees",
  RANGE_1001_5000: "1,001–5,000 employees",
  RANGE_5000_PLUS: "5,000+ employees",
};

function formatWebsiteUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

interface OrgCardProps {
  row: TargetRow;
}

export function OrgCard({ row }: OrgCardProps) {
  const website =
    typeof row.website_url === "string"
      ? row.website_url
      : typeof row.website === "string"
        ? row.website
        : null;

  const empLabel = row.numberOfEmployees
    ? (EMP_LABELS[String(row.numberOfEmployees)] ?? null)
    : null;

  const [html, setHtml] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    cardService
      .getOrganization(row.id)
      .then((h: string) => {
        if (!cancelled) setHtml(h);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [row.id]);

  const handleClick = useCallback(() => {
    if (!website) return;
    const url = formatWebsiteUrl(website);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }, [website]);

  return (
    <div
      ref={cardRef}
      className={`tl-inline-card tl-inline-card--org${website ? " is-clickable" : ""}`}
      onClick={website ? handleClick : undefined}
      role={website ? "link" : undefined}
      tabIndex={website ? 0 : undefined}
      onKeyDown={(e) => {
        if (website && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleClick();
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={website ? `Open ${website}` : undefined}
    >
      <div className="tl-inline-card__body">
        <strong className="tl-inline-card__name">
          {row.name ?? "Unknown"}
        </strong>
        {row.subtype && (
          <span className="tl-inline-card__tag">
            {String(row.subtype).replace(/_/g, " ")}
          </span>
        )}
        {empLabel && <span className="tl-inline-card__meta">{empLabel}</span>}
        {row.description && (
          <p className="tl-inline-card__desc">
            {String(row.description).slice(0, 110)}
            {String(row.description).length > 110 ? "…" : ""}
          </p>
        )}
      </div>

      {website && (
        <i className="bi bi-box-arrow-up-right tl-inline-card__link-icon" />
      )}

      {hovered && (
        <CardPopover
          html={html}
          title={`Organization — ${row.name ?? row.id}`}
          anchorEl={cardRef.current}
        />
      )}
    </div>
  );
}
