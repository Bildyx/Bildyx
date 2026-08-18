import React, { useEffect, useRef } from "react";
import BackendCardSlot from "./BackendCardSlot";

export type ExperienceCardData = {
  id: string;
  start_year?: number | null;
  end_year?: number | null;
  current?: boolean;
  role_title?: string | null;
  summary?: string | null;

  organization_id?: string | null;
  company_name?: string | null;

  subject_id?: string | null;
  subject_name?: string | null;

  job_id?: string | null;
};

type Props = {
  experience: ExperienceCardData;
  index: number;
  onChange?: (experience: ExperienceCardData) => void;
  onDelete?: () => void;
  onCollapse?: (button: HTMLButtonElement) => void;
  onSlotClick?: (slot: HTMLElement) => void;
};

export default function ExperienceCard({
  experience,
  index,
  onChange,
  onDelete,
  onCollapse,
  onSlotClick,
}: Props) {
  const summaryRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (summaryRef.current) {
      const words = (experience.summary || "").trim()
        ? (experience.summary || "").trim().split(/\s+/).length
        : 0;
      const counter = summaryRef.current.nextElementSibling;
      if (counter?.classList.contains("word-counter")) {
        counter.textContent = `${words}/60 words`;
      }
    }
  }, [experience.summary]);

  const update = (patch: Partial<ExperienceCardData>) => {
    onChange?.({ ...experience, ...patch });
  };

  return (
    <article
      className="entry-card"
      data-entry="experience"
      data-id={experience.id}
    >
      <div className="entry-toolbar">
        <h3>Work Experience {index + 1}</h3>
        <div>
          <button
            className="entry-tool js-collapse"
            type="button"
            aria-label="Collapse or expand work experience"
            onClick={(e) => onCollapse?.(e.currentTarget)}
          >
            ＋
          </button>
          <button
            className="entry-tool js-remove-entry"
            type="button"
            aria-label="Remove work experience"
            onClick={onDelete}
          >
            ×
          </button>
        </div>
      </div>

      <div className="entry-body">
        <div className="entry-header-line">
          <div className="entry-controls" style={{ width: "100%" }}>
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
                  value={experience.start_year ?? ""}
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
                  disabled={!!experience.current}
                  value={experience.end_year ?? ""}
                  onChange={(e) =>
                    update({
                      end_year: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>

              <label
                className="current-label"
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
                  className="exp-current"
                  checked={!!experience.current}
                  onChange={(e) =>
                    update({
                      current: e.target.checked,
                      end_year: e.target.checked ? null : experience.end_year,
                    })
                  }
                />
                Current
              </label>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                marginBottom: 12,
              }}
            >
              <label style={{ fontSize: "0.85em", opacity: 0.8 }}>
                Role Title
              </label>
              <input
                type="text"
                className="exp-role-title"
                placeholder="Add role title..."
                style={{ width: "100%" }}
                value={experience.role_title || ""}
                onChange={(e) => update({ role_title: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            marginBottom: 12,
          }}
        >
          <label style={{ fontSize: "0.85em", opacity: 0.8 }}>
            Work Summary
          </label>
          <textarea
            ref={summaryRef}
            maxLength={600}
            data-word-counter
            placeholder="Add work summary..."
            value={experience.summary || ""}
            onChange={(e) => update({ summary: e.target.value })}
          />
        </div>

        <p className="word-counter">0/60 words</p>

        <div className="backend-grid backend-grid--three">
          <section>
            <h4>Company</h4>
            <BackendCardSlot
              slotType="company-card"
              entityId={experience.organization_id}
              placeholderText="Company card"
              onClick={(slot) => onSlotClick?.(slot)}
            />
          </section>

          <section>
            <h4>Product/Service</h4>
            <BackendCardSlot
              slotType="subject-card"
              entityId={experience.subject_id}
              placeholderText="Product/Service card"
              onClick={(slot) => onSlotClick?.(slot)}
            />
          </section>

          <section>
            <h4>Role</h4>
            <BackendCardSlot
              slotType="role-card"
              entityId={experience.job_id}
              placeholderText="Role card"
              onClick={(slot) => onSlotClick?.(slot)}
            />
          </section>
        </div>
      </div>
    </article>
  );
}
