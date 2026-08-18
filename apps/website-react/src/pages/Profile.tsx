import { useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePageMeta } from "../hooks/usePageMeta";
import "../css/profile.css";
import CertificationCard from "../components/cards/CertificationCard";
import EducationCard from "../components/cards/EducationCard";
import ExperienceCard from "../components/cards/ExperienceCard";
import {
  LanguageModal,
  formatLanguageLabel,
} from "../components/modals/LanguageModal";
import { SkillModal } from "../components/modals/SkillModal";
import EntitySearchModal from "../components/modals/EntitySearchModal";
import { useProfile } from "../hooks/useProfile";

export default function Profile() {
  usePageMeta(
    "Profile — Bildyx",
    "Build and edit your Bildyx MicroResume profile.",
  );

  const {
    loaded,
    isSaving,
    name,
    setName,
    role,
    setRole,
    summary,
    setSummary,
    avatarUrl,
    languages,
    skills,
    experiences,
    educations,
    certifications,
    entityModalOpen,
    entityModalSlot,
    showLangModal,
    setShowLangModal,
    showSkillModal,
    setShowSkillModal,
    openSkillPicker,
    addLanguage,
    removeLanguage,
    addSkill,
    removeSkill,
    addExperience,
    removeExperience,
    addEducation,
    removeEducation,
    addCertification,
    removeCertification,
    handleSave,
    handleSlotClick,
    handleEntitySelect,
    handleAvatarChange,
    lastSavedRef,
    updateExperience,
    updateEducation,
    updateCertification,
    closeEntityModal,
  } = useProfile();

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const meta = {
    worked: experiences
      .map((e: any) => e.country_name)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(", "),
    studied: educations
      .map((e: any) => e.country_name || e.university_name)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(", "),
    companies: experiences
      .map((e) => e.company_name)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(", "),
    products: experiences
      .map((e) => e.subject_name)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(", "),
    jobs: experiences
      .map((e) => e.role_title)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(", "),
    degrees: educations
      .map((e) => e.degree_name)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(", "),
    certs: certifications
      .map((c) => c.certification_name)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(", "),
  };

  return (
    <>
      <Header />

      <main className="profile-shell">
        <div className="profile-workspace">
          <article
            className="profile-card"
            id="profilePanel"
            aria-labelledby="profileName"
          >
            <header className="profile-top">
              <div className="name-zone">
                <div className="name-pill">
                  <strong
                    id="profileName"
                    data-field="name"
                    contentEditable={true}
                    data-placeholder="Add your name..."
                    suppressContentEditableWarning
                    onBlur={(event) => {
                      const val = event.currentTarget.textContent || "";
                      setName(val);
                      if (val !== lastSavedRef.current.name) {
                        handleSave(true, { name: val });
                      }
                    }}
                  >
                    {loaded ? (
                      name
                    ) : (
                      <span className="skeleton-loader skeleton-name"></span>
                    )}
                  </strong>
                  <span>MicroResume</span>
                </div>
              </div>

              <section
                className="summary-block"
                aria-labelledby="career-summary-title"
              >
                <h2 className="section-mini-title" id="career-summary-title">
                  Career Summary
                </h2>

                <div className="summary-row">
                  <div className="avatar-editor">
                    <button
                      className="profile-avatar"
                      id="profileAvatar"
                      data-field="avatar"
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      aria-label="Change profile picture"
                      style={{
                        backgroundImage: avatarUrl
                          ? `url(${avatarUrl})`
                          : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <input
                      ref={avatarInputRef}
                      className="hidden-file-input"
                      id="avatarInput"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleAvatarChange}
                    />
                  </div>

                  <p
                    className="summary-text"
                    data-field="summary"
                    contentEditable={true}
                    data-placeholder="Add career summary..."
                    suppressContentEditableWarning
                    onBlur={(event) => {
                      const val = event.currentTarget.textContent || "";
                      setSummary(val);
                      if (val !== lastSavedRef.current.summary) {
                        handleSave(true, { summary: val });
                      }
                    }}
                  >
                    {loaded ? (
                      summary
                    ) : (
                      <span className="skeleton-loader skeleton-summary"></span>
                    )}
                  </p>
                </div>
              </section>

              <div className="profile-main-grid">
                <section className="profile-core" aria-labelledby="role-title">
                  <div className="title-line">
                    <h1
                      id="role-title"
                      data-field="role"
                      contentEditable={true}
                      data-placeholder="Add role title..."
                      suppressContentEditableWarning
                      onBlur={(event) => {
                        const val = event.currentTarget.textContent || "";
                        setRole(val);
                        if (val !== lastSavedRef.current.role) {
                          handleSave(true, { role: val });
                        }
                      }}
                    >
                      {loaded ? (
                        role
                      ) : (
                        <span className="skeleton-loader skeleton-role"></span>
                      )}
                    </h1>
                  </div>

                  <p
                    className="mini-label"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <svg
                      className="meta-icon"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Languages
                    <button
                      className="chip-add"
                      type="button"
                      data-add-chip="languageChips"
                      aria-label="Add language"
                      onClick={() => setShowLangModal(true)}
                    >
                      +
                    </button>
                  </p>
                  <div
                    className="chip-row"
                    id="languageChips"
                    aria-label="Languages"
                    data-chip-limit="5"
                  >
                    {!loaded ? (
                      <>
                        <span className="skeleton-loader skeleton-chip"></span>
                        <span className="skeleton-loader skeleton-chip"></span>
                      </>
                    ) : (
                      languages.map((lang) => {
                        let levelClass = "";
                        const prof = lang.proficiency || "FLUENT";
                        if (prof === "NATIVE") levelClass = "is-native";
                        else if (prof === "FLUENT") levelClass = "is-fluent";
                        else levelClass = "is-intermediate";

                        return (
                          <button
                            key={lang.id}
                            type="button"
                            className={`chip ${levelClass}`}
                            title="Remove language"
                            onClick={() => removeLanguage(lang.id)}
                          >
                            {formatLanguageLabel(lang.language)}
                          </button>
                        );
                      })
                    )}
                  </div>

                  <p className="level-legend">
                    <span></span> Native
                    <span></span> Fluent
                    <span></span> Intermediate
                  </p>

                  <ul className="profile-meta-list">
                    <li>
                      <svg
                        className="meta-icon"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                      <strong>Countries:</strong>
                      <span data-field="meta-worked-in">
                        {loaded ? (
                          meta.worked || "—"
                        ) : (
                          <span className="skeleton-loader skeleton-meta"></span>
                        )}
                      </span>
                    </li>
                    <li>
                      <svg
                        className="meta-icon"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>
                      </svg>
                      <strong>Studied In:</strong>
                      <span data-field="meta-studied-in">
                        {loaded ? (
                          meta.studied || "—"
                        ) : (
                          <span className="skeleton-loader skeleton-meta"></span>
                        )}
                      </span>
                    </li>
                    <li>
                      <svg
                        className="meta-icon"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="4"
                          y="2"
                          width="16"
                          height="20"
                          rx="2"
                          ry="2"
                        ></rect>
                        <line x1="9" y1="22" x2="9" y2="16"></line>
                        <line x1="15" y1="22" x2="15" y2="16"></line>
                        <line x1="9" y1="16" x2="15" y2="16"></line>
                        <path d="M8 6h2v2H8V6zm0 4h2v2H8v-2zm8-4h2v2h-2V6zm0 4h2v2h-2v-2z"></path>
                      </svg>
                      <strong>Companies:</strong>
                      <span data-field="meta-companies">
                        {loaded ? (
                          meta.companies || "—"
                        ) : (
                          <span className="skeleton-loader skeleton-meta"></span>
                        )}
                      </span>
                    </li>
                    <li>
                      <svg
                        className="meta-icon"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                        <polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08"></polygon>
                        <polygon points="12 22.08 21 17.08 21 6.92 12 12 12 22.08"></polygon>
                        <polygon points="12 12 21 6.92 12 1.84 3 6.92 12 12"></polygon>
                      </svg>
                      <strong>Products:</strong>
                      <span data-field="meta-products">
                        {loaded ? (
                          meta.products || "—"
                        ) : (
                          <span className="skeleton-loader skeleton-meta"></span>
                        )}
                      </span>
                    </li>
                    <li>
                      <svg
                        className="meta-icon"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="2"
                          y="7"
                          width="20"
                          height="14"
                          rx="2"
                          ry="2"
                        ></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                      </svg>
                      <strong>Job Occupations:</strong>
                      <span data-field="meta-jobs">
                        {loaded ? (
                          meta.jobs || "—"
                        ) : (
                          <span className="skeleton-loader skeleton-meta"></span>
                        )}
                      </span>
                    </li>
                    <li>
                      <svg
                        className="meta-icon"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      <strong>Degrees:</strong>
                      <span data-field="meta-degrees">
                        {loaded ? (
                          meta.degrees || "—"
                        ) : (
                          <span className="skeleton-loader skeleton-meta"></span>
                        )}
                      </span>
                    </li>
                    <li>
                      <svg
                        className="meta-icon"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="8" r="7"></circle>
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                      </svg>
                      <strong>Certifications:</strong>
                      <span data-field="meta-certifications">
                        {loaded ? (
                          meta.certs || "—"
                        ) : (
                          <span className="skeleton-loader skeleton-meta"></span>
                        )}
                      </span>
                    </li>
                  </ul>
                </section>

                <section className="skills-box" aria-labelledby="skills-title">
                  <div
                    className="title-line title-line--small"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <h2 id="skills-title">Top Skills</h2>
                    <button
                      className="chip-add"
                      type="button"
                      data-add-chip="skillChips"
                      aria-label="Add skill"
                      onClick={openSkillPicker}
                    >
                      +
                    </button>
                  </div>

                  <div
                    className="chip-row skill-row"
                    id="skillChips"
                    aria-label="Top skills"
                  >
                    {!loaded ? (
                      <>
                        <span className="skeleton-loader skeleton-chip"></span>
                        <span className="skeleton-loader skeleton-chip"></span>
                      </>
                    ) : (
                      skills.map((skill) => (
                        <button
                          key={skill.id}
                          type="button"
                          className="chip"
                          title="Remove skill"
                          onClick={() => removeSkill(skill.id)}
                        >
                          {(skill as any).name || skill.skill_id} ×
                        </button>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </header>

            <hr />

            <section
              className="builder-section"
              aria-labelledby="experience-title"
            >
              <div className="section-title-row">
                <h2 id="experience-title">Experiences</h2>
                <button
                  className="outline-button outline-button--small"
                  type="button"
                  id="addExperienceButton"
                  onClick={addExperience}
                >
                  + Add
                </button>
              </div>

              <div
                className="entry-list"
                id="experienceList"
                onBlur={() => handleSave(true)}
              >
                {!loaded ? (
                  <div className="skeleton-loader skeleton-card"></div>
                ) : (
                  experiences.map((experience, index) => (
                    <ExperienceCard
                      key={experience.id}
                      experience={experience}
                      index={index}
                      onChange={updateExperience}
                      onDelete={() => removeExperience(experience.id)}
                      onSlotClick={handleSlotClick}
                    />
                  ))
                )}
              </div>
            </section>

            <hr />

            <section
              className="builder-section"
              aria-labelledby="education-title"
            >
              <div className="section-title-row">
                <h2 id="education-title">Education</h2>
                <button
                  className="outline-button outline-button--small"
                  type="button"
                  id="addEducationButton"
                  onClick={addEducation}
                >
                  + Add
                </button>
              </div>

              <div
                className="entry-list"
                id="educationList"
                onBlur={() => handleSave(true)}
              >
                {!loaded ? (
                  <div className="skeleton-loader skeleton-card"></div>
                ) : (
                  educations.map((education) => (
                    <EducationCard
                      key={education.id}
                      education={education}
                      onChange={updateEducation}
                      onDelete={() => removeEducation(education.id)}
                      onSlotClick={handleSlotClick}
                    />
                  ))
                )}
              </div>
            </section>

            <hr />

            <section
              className="builder-section"
              aria-labelledby="certification-title"
            >
              <div className="section-title-row">
                <h2 id="certification-title">Certifications</h2>
                <button
                  className="outline-button outline-button--small"
                  type="button"
                  id="addCertificationButton"
                  onClick={addCertification}
                >
                  + Add
                </button>
              </div>

              <div className="cert-grid" onBlur={() => handleSave(true)}>
                {!loaded ? (
                  <div
                    className="skeleton-loader skeleton-card"
                    style={{ height: "80px" }}
                  ></div>
                ) : (
                  certifications.map((certification) => (
                    <CertificationCard
                      key={certification.id}
                      certification={certification}
                      onChange={updateCertification}
                      onDelete={() => removeCertification(certification.id)}
                      onSlotClick={handleSlotClick}
                    />
                  ))
                )}
              </div>
            </section>

            <div className="save-row">
              <button
                className="save-button"
                type="button"
                id="saveProfileButton"
                onClick={() => handleSave(false)}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "▣ Save Microresume"}
              </button>
            </div>
          </article>

          <aside className="profile-side-nav" aria-label="Profile menu">
            <a className="side-nav-button is-active" href="profile.php">
              <span aria-hidden="true">☻</span>
              Profile
            </a>

            <a className="side-nav-button" href="target-list.php">
              <span aria-hidden="true">◎</span>
              My Target List
            </a>

            <a className="side-nav-button" href="tests-preferences.php">
              <span aria-hidden="true">▣</span>
              Tests &amp;
              <br /> Preferences
            </a>

            <a className="side-nav-button" href="settings.php">
              <span aria-hidden="true">⚙</span>
              Settings
            </a>
          </aside>
        </div>
      </main>

      <div
        className="profile-toast"
        id="profileToast"
        role="status"
        aria-live="polite"
      >
        Profile saved.
      </div>

      <EntitySearchModal
        open={entityModalOpen}
        slotType={entityModalSlot}
        onClose={closeEntityModal}
        onSelect={handleEntitySelect}
      />

      <LanguageModal
        open={showLangModal}
        onClose={() => setShowLangModal(false)}
        onConfirm={addLanguage}
      />
      <SkillModal
        open={showSkillModal}
        onClose={() => setShowSkillModal(false)}
        onConfirm={addSkill}
      />

      <Footer />
    </>
  );
}
