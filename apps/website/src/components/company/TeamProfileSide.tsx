import React from "react";
import type { TeamProfile } from "@repo/models/team_profiles";

const PROFILE_FIELDS_PEOPLE: [string, keyof TeamProfile, boolean?][] = [
  ["Who We Are", "who_we_are"],
  ["What We're Great At", "what_were_great_at"],
  ["Team Culture", "team_culture"],
  ["How We Work Together", "how_we_work_together"],
  ["This team is NOT for you if...", "this_team_is_not_for_you_if", true],
];

const PROFILE_FIELDS_OPERATE: [string, keyof TeamProfile][] = [
  ["How We're Led", "how_were_led"],
  ["What We're Solving Now", "what_were_solving_now"],
  ["A Typical Day", "typical_day"],
  ["What We Value", "what_we_value"],
  ["Growth Here", "growth_here"],
];

type Props = {
  isAdminMode: boolean;
  isEditingProfile: boolean;
  startEditProfile: () => void;
  activeTeam: any;
  mode: "people" | "operate";
  setMode: (mode: "people" | "operate") => void;
  teamProfile: any;
  profileDraft: any;
  setProfileDraft: (draft: any) => void;
  setIsEditingProfile: (val: boolean) => void;
};

export default function TeamProfileSide({
  isAdminMode,
  isEditingProfile,
  startEditProfile,
  activeTeam,
  mode,
  setMode,
  teamProfile,
  profileDraft,
  setProfileDraft,
}: Props) {
  return (
    <aside className="ca-profile-side">
      <div>
        <h3>Team Profile</h3>
        {isAdminMode && !isEditingProfile && (
          <button onClick={startEditProfile} disabled={!activeTeam}>
            + Add
          </button>
        )}
      </div>

      <div>
        {!activeTeam ? (
          <p className="ca-profile-empty">
            No team profile added yet.
          </p>
        ) : isEditingProfile ? (
          <div className="ca-profile-points is-editing">
            {(mode === "operate"
              ? PROFILE_FIELDS_OPERATE
              : PROFILE_FIELDS_PEOPLE
            ).map(([title, field, danger]) => (
              <section
                className={`ca-point ca-point-editing${danger ? " danger" : ""}`}
                key={field}
              >
                <h4>{title}</h4>
                <textarea
                  className="ca-profile-input"
                  rows={2}
                  value={profileDraft[field] || ""}
                  onChange={(e) =>
                    setProfileDraft({
                      ...profileDraft,
                      [field]: e.target.value,
                    })
                  }
                />
              </section>
            ))}
          </div>
        ) : !teamProfile ? (
          <p className="ca-profile-empty">
            No team profile added yet.
          </p>
        ) : (
          <div className="ca-profile-points">
            {(mode === "operate"
              ? PROFILE_FIELDS_OPERATE
              : PROFILE_FIELDS_PEOPLE
            )
              .filter(([, field]) =>
                String(teamProfile[field] || "").trim(),
              )
              .map(([title, field, danger]) => (
                <section
                  className={`ca-point${danger ? " danger" : ""}`}
                  key={field}
                >
                  <h4>{title}</h4>
                  <p>{teamProfile[field]}</p>
                </section>
              ))}
          </div>
        )}
      </div>

      <footer>
        <button
          className={mode === "people" ? "is-active" : ""}
          onClick={() => setMode("people")}
        >
          People
        </button>
        <button
          className={mode === "operate" ? "is-active" : ""}
          onClick={() => setMode("operate")}
        >
          How We Operate
        </button>
      </footer>
    </aside>
  );
}
