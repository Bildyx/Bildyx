import { useState } from "react";
import type { UserCertification, UserEducation, UserExperience } from "../services/profileResources.service";

// ─── Work Experience ─────────────────────────────────────────
export type ExperienceDraft = UserExperience & {
  companyName?: string;
  startYear?: string;
  endYear?: string;
  current?: boolean;
};

export function ExperienceCard({
  index,
  entry,
  onChange,
  onRemove,
}: {
  index: number;
  entry: ExperienceDraft;
  onChange: (next: ExperienceDraft) => void;
  onRemove: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const words = String(entry.description || "").trim().split(/\s+/).filter(Boolean).length;

  return (
    <article className="entry-card">
      <div className="entry-toolbar">
        <h3>Work Experience {index + 1}</h3>
        <div>
          <button className="entry-tool" type="button" aria-label="Collapse or expand" onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? "＋" : "－"}
          </button>
          <button className="entry-tool" type="button" aria-label="Remove work experience" onClick={onRemove}>
            ×
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="entry-body">
          <div className="entry-header-line">
            <div className="entry-controls" style={{ width: "100%" }}>
              <div className="date-row" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: "0.85em", opacity: 0.8 }}>Start Year</label>
                  <input
                    type="number"
                    placeholder="YYYY"
                    min={1900}
                    max={2099}
                    style={{ width: 110 }}
                    value={entry.startYear || ""}
                    onChange={(e) => onChange({ ...entry, startYear: e.target.value })}
                  />
                </div>
                <span style={{ alignSelf: "flex-end", marginBottom: 8 }}>–</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: "0.85em", opacity: 0.8 }}>End Year</label>
                  <input
                    type="number"
                    placeholder="YYYY"
                    min={1900}
                    max={2099}
                    style={{ width: 110 }}
                    disabled={entry.current}
                    value={entry.current ? "" : entry.endYear || ""}
                    onChange={(e) => onChange({ ...entry, endYear: e.target.value })}
                  />
                </div>
                <label
                  className="current-label"
                  style={{ marginLeft: 12, alignSelf: "flex-end", marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(entry.current)}
                    onChange={(e) => onChange({ ...entry, current: e.target.checked, endYear: e.target.checked ? "" : entry.endYear })}
                  />{" "}
                  Current
                </label>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                <label style={{ fontSize: "0.85em", opacity: 0.8 }}>Role Title</label>
                <input
                  type="text"
                  placeholder="Add role title..."
                  style={{ width: "100%" }}
                  value={entry.title || ""}
                  onChange={(e) => onChange({ ...entry, title: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                <label style={{ fontSize: "0.85em", opacity: 0.8 }}>Company</label>
                <input
                  type="text"
                  placeholder="Add company name..."
                  style={{ width: "100%" }}
                  value={entry.companyName || ""}
                  onChange={(e) => onChange({ ...entry, companyName: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
            <label style={{ fontSize: "0.85em", opacity: 0.8 }}>Work Summary</label>
            <textarea
              maxLength={600}
              placeholder="Add work summary..."
              value={entry.description || ""}
              onChange={(e) => onChange({ ...entry, description: e.target.value })}
            />
          </div>
          <p className={`word-counter${words > 60 ? " is-overflow" : ""}`}>{words}/60 words</p>
        </div>
      )}
    </article>
  );
}

// ─── Education ────────────────────────────────────────────────
export type EducationDraft = UserEducation & {
  universityName?: string;
  degreeName?: string;
  startYear?: string;
  endYear?: string;
  graduated?: boolean;
};

export function EducationCard({
  entry,
  onChange,
  onRemove,
}: {
  entry: EducationDraft;
  onChange: (next: EducationDraft) => void;
  onRemove: () => void;
}) {
  return (
    <article className="entry-card">
      <div className="entry-toolbar">
        <h3>Education</h3>
        <div>
          <button className="entry-tool" type="button" aria-label="Remove education" onClick={onRemove}>
            ×
          </button>
        </div>
      </div>

      <div className="entry-body">
        <div className="education-form-line" style={{ width: "100%" }}>
          <div className="education-fields" style={{ width: "100%" }}>
            <div className="date-row" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: "0.85em", opacity: 0.8 }}>Start Year</label>
                <input
                  type="number"
                  placeholder="YYYY"
                  min={1900}
                  max={2099}
                  style={{ width: 110 }}
                  value={entry.startYear || ""}
                  onChange={(e) => onChange({ ...entry, startYear: e.target.value })}
                />
              </div>
              <span style={{ alignSelf: "flex-end", marginBottom: 8 }}>–</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: "0.85em", opacity: 0.8 }}>End Year</label>
                <input
                  type="number"
                  placeholder="YYYY"
                  min={1900}
                  max={2099}
                  style={{ width: 110 }}
                  value={entry.endYear || ""}
                  onChange={(e) => onChange({ ...entry, endYear: e.target.value })}
                />
              </div>
              <label
                className="graduated-label"
                style={{ marginLeft: 12, alignSelf: "flex-end", marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}
              >
                <input type="checkbox" checked={Boolean(entry.graduated)} onChange={(e) => onChange({ ...entry, graduated: e.target.checked })} /> Graduated
              </label>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: "0.85em", opacity: 0.8 }}>University / School</label>
                <input
                  type="text"
                  placeholder="Add university..."
                  value={entry.universityName || ""}
                  onChange={(e) => onChange({ ...entry, universityName: e.target.value })}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: "0.85em", opacity: 0.8 }}>Degree</label>
                <input
                  type="text"
                  placeholder="Add degree..."
                  value={entry.degreeName || ""}
                  onChange={(e) => onChange({ ...entry, degreeName: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Certification ────────────────────────────────────────────
export type CertificationDraft = UserCertification & {
  certificationName?: string;
  neverExpires?: boolean;
};

export function CertificationCard({
  entry,
  onChange,
  onRemove,
}: {
  entry: CertificationDraft;
  onChange: (next: CertificationDraft) => void;
  onRemove: () => void;
}) {
  return (
    <article className="entry-card cert-card">
      <div className="entry-toolbar">
        <input
          className="cert-name-input"
          type="text"
          placeholder="New Certification"
          value={entry.certificationName || ""}
          onChange={(e) => onChange({ ...entry, certificationName: e.target.value })}
        />
        <button className="entry-tool" type="button" aria-label="Remove certification" onClick={onRemove}>
          ×
        </button>
      </div>

      <div className="entry-body">
        <div className="cert-date-row" style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: "0.85em", opacity: 0.8 }}>Obtained at</label>
            <input
              type="date"
              style={{ width: "100%" }}
              value={entry.issuedDate || ""}
              onChange={(e) => onChange({ ...entry, issuedDate: e.target.value })}
            />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: "0.85em", opacity: 0.8 }}>Expires at</label>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.85em", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={Boolean(entry.neverExpires)}
                  onChange={(e) => onChange({ ...entry, neverExpires: e.target.checked })}
                />{" "}
                Never
              </label>
            </div>
            <input type="date" style={{ width: "100%" }} disabled={entry.neverExpires} />
          </div>
        </div>
      </div>
    </article>
  );
}
