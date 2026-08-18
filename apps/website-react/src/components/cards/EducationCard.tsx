import React from "react";
import BackendCardSlot from "./BackendCardSlot";

export type EducationCardData = {
  id: string;
  start_year?: number | null;
  end_year?: number | null;
  graduated?: boolean;

  organization_id?: string | null;
  university_name?: string | null;

  degree_id?: string | null;
  degree_name?: string | null;
};

type Props = {
  education: EducationCardData;
  onChange?: (education: EducationCardData) => void;
  onDelete?: () => void;
  onCollapse?: (button: HTMLButtonElement) => void;
  onSlotClick?: (slot: HTMLElement) => void;
};

export default function EducationCard({
  education,
  onChange,
  onDelete,
  onCollapse,
  onSlotClick,
}: Props) {
  const update = (patch: Partial<EducationCardData>) => {
    onChange?.({ ...education, ...patch });
  };

  return (
    <article
      className="entry-card"
      data-entry="education"
      data-id={education.id}
    >
      <div className="entry-toolbar">
        <h3>Education</h3>
        <div>
          <button
            className="entry-tool js-collapse"
            type="button"
            aria-label="Collapse or expand education"
            onClick={(e) => onCollapse?.(e.currentTarget)}
          >
            ＋
          </button>
          <button
            className="entry-tool js-remove-entry"
            type="button"
            aria-label="Remove education"
            onClick={onDelete}
          >
            ×
          </button>
        </div>
      </div>

      <div className="entry-body">
        <div className="education-form-line" style={{ width: "100%" }}>
          <div className="education-fields" style={{ width: "100%" }}>
            <div
              className="date-row"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: "0.85em", opacity: 0.8 }}>
                  Start Year
                </label>
                <input
                  type="number"
                  className="start-year"
                  placeholder="YYYY"
                  min={1900}
                  max={2099}
                  style={{ width: 110 }}
                  value={education.start_year ?? ""}
                  onChange={(e) =>
                    update({
                      start_year: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                />
              </div>

              <span style={{ alignSelf: "flex-end", marginBottom: 8 }}>–</span>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: "0.85em", opacity: 0.8 }}>
                  End Year
                </label>
                <input
                  type="number"
                  className="end-year"
                  placeholder="YYYY"
                  min={1900}
                  max={2099}
                  style={{ width: 110 }}
                  value={education.end_year ?? ""}
                  onChange={(e) =>
                    update({
                      end_year: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>

              <label
                className="graduated-label"
                style={{
                  marginLeft: 12,
                  alignSelf: "flex-end",
                  marginBottom: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.95em",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  className="edu-graduated"
                  checked={education.graduated !== false}
                  onChange={(e) => update({ graduated: e.target.checked })}
                />
                Graduated
              </label>
            </div>
          </div>
        </div>

        <div className="backend-grid backend-grid--two">
          <BackendCardSlot
            slotType="university-card"
            entityId={education.organization_id}
            placeholderText="University card"
            onClick={(slot) => onSlotClick?.(slot)}
          />

          <BackendCardSlot
            slotType="degree-card"
            entityId={education.degree_id}
            placeholderText="Degree card"
            onClick={(slot) => onSlotClick?.(slot)}
          />
        </div>
      </div>
    </article>
  );
}
