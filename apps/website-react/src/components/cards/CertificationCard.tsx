import React from "react";
import BackendCardSlot from "./BackendCardSlot";

export type CertificationCardData = {
  id: string;
  obtained_at?: string | null;
  expires_at?: string | null;

  certification_id?: string | null;
  certification_name?: string | null;
};

type Props = {
  certification: CertificationCardData;
  onChange?: (certification: CertificationCardData) => void;
  onDelete?: () => void;
  onSlotClick?: (slot: HTMLElement) => void;
};

export default function CertificationCard({
  certification,
  onChange,
  onDelete,
  onSlotClick,
}: Props) {
  const neverExpire = !certification.expires_at;

  const update = (patch: Partial<CertificationCardData>) => {
    onChange?.({ ...certification, ...patch });
  };

  return (
    <article
      className="entry-card cert-card"
      data-entry="certification"
      data-id={certification.id}
    >
      <div className="entry-toolbar">
        <h3 className="cert-name" data-placeholder="New Certification">
          New Certification
        </h3>

        <button
          className="entry-tool js-remove-entry"
          type="button"
          aria-label="Remove certification"
          onClick={onDelete}
        >
          ×
        </button>
      </div>

      <div className="entry-body">
        <div
          className="cert-date-row"
          style={{ display: "flex", gap: 12, marginBottom: 12 }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <label style={{ fontSize: "0.85em", opacity: 0.8 }}>
              Obtained at
            </label>
            <input
              type="date"
              className="cert-obtained-at"
              style={{ width: "100%" }}
              value={certification.obtained_at || ""}
              onChange={(e) => update({ obtained_at: e.target.value || null })}
            />
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <label style={{ fontSize: "0.85em", opacity: 0.8 }}>
                Expires at
              </label>

              <label
                className="never-expire-label"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: "0.85em",
                  cursor: "pointer",
                  userSelect: "none",
                  opacity: 0.9,
                }}
              >
                <input
                  type="checkbox"
                  className="cert-never-expire"
                  checked={neverExpire}
                  onChange={(e) =>
                    update({
                      expires_at: e.target.checked
                        ? null
                        : certification.expires_at || null,
                    })
                  }
                />
                Never
              </label>
            </div>

            <input
              type="date"
              className="cert-expires-at"
              style={{ width: "100%" }}
              disabled={neverExpire}
              value={certification.expires_at || ""}
              onChange={(e) => update({ expires_at: e.target.value || null })}
            />
          </div>
        </div>

        <div className="backend-grid">
          <BackendCardSlot
            slotType="certification-card"
            entityId={certification.certification_id}
            placeholderText="Certification card"
            onClick={(slot) => onSlotClick?.(slot)}
          />
        </div>
      </div>
    </article>
  );
}
