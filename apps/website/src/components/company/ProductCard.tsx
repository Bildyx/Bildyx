import React from "react";
import { TeamSubject } from "@repo/models/team_subjects";
import { Subject } from "@repo/models/subjects";

interface ProductCardProps {
  ts: TeamSubject;
  subject?: Subject;
  isAdminMode: boolean;
  onRemove: () => void;
}

export function ProductCard({
  ts,
  subject,
  isAdminMode,
  onRemove,
}: ProductCardProps) {
  return (
    <div className="ca-chip">
      {isAdminMode && (
        <div className="ca-item-actions">
          <button
            className="ca-item-action danger"
            type="button"
            onClick={onRemove}
          >
            ×
          </button>
        </div>
      )}
      <span>{subject ? subject.name : "Product"}</span>
    </div>
  );
}
