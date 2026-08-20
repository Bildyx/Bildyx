import React from "react";
import { OrganizationOffice } from "@repo/models/organization_offices";
import { CityListItem } from "@repo/models/cities";

interface OfficeCardProps {
  office: OrganizationOffice;
  city?: CityListItem;
  isMain: boolean;
  isAdminMode: boolean;
  onRemove: () => void;
}

export function OfficeCard({
  office,
  city,
  isMain,
  isAdminMode,
  onRemove,
}: OfficeCardProps) {
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
      <span
        style={{
          background: "#94a3b8",
          display: "grid",
          placeItems: "center",
          boxShadow: isMain
            ? "0 0 0 2px #fff, 0 0 0 4px var(--ca-blue)"
            : undefined,
        }}
      >
        <i
          className="bi bi-building"
          style={{ fontSize: 20, color: "#fff" }}
        ></i>
      </span>
      <div
        style={{
          textAlign: "center",
          marginTop: 4,
          fontWeight: 500,
          fontSize: 11,
          color: "var(--ca-muted)",
        }}
      >
        {city ? `${city.name}, ${city.country_name}` : "Office"}
      </div>
    </div>
  );
}
