import { useRef } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { usePageMeta } from "../../hooks/usePageMeta";
import "../../css/profile.css";
import ProfileAside from "../../components/ProfileAside";
import CertificationCard from "../../components/cards/CertificationCard";
import EducationCard from "../../components/cards/EducationCard";
import ExperienceCard from "../../components/cards/ExperienceCard";
import {
  LanguageModal,
  formatLanguageLabel,
} from "../../components/modals/LanguageModal";
import { SkillModal } from "../../components/modals/SkillModal";
import EntitySearchModal from "../../components/modals/EntitySearchModal";
import { useProfile } from "../../hooks/useProfile";

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
    draftExperience,
    addExperience,
    cancelDraftExperience,
    updateDraftExperience,
    saveDraftExperience,
    updateExperience,
    saveExperience,
    removeExperience,
    educations,
    draftEducation,
    addEducation,
    cancelDraftEducation,
    updateDraftEducation,
    saveDraftEducation,
    updateEducation,
    saveEducation,
    removeEducation,
    certifications,
    draftCertification,
    addCertification,
    cancelDraftCertification,
    updateDraftCertification,
    saveDraftCertification,
    updateCertification,
    saveCertification,
    removeCertification,
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
    handleSave,
    handleSlotClick,
    handleEntitySelect,
    handleAvatarChange,
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
      .map((e: any) => e.company_name)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(", "),
    products: experiences
      .map((e: any) => e.subject_name)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(", "),
    jobs: experiences
      .map((e: any) => e.role_title)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(", "),
    degrees: educations
      .map((e: any) => e.degree_name)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(", "),
    certs: certifications
      .map((c: any) => c.certification_name)
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
                    contentEditable
                    data-placeholder="Add your name..."
                    suppressContentEditableWarning
                    onBlur={(event) => {
                      const value = event.currentTarget.textContent || "";
                      setName(value);
                      handleSave(true, { name: value });
                    }}
                  >
                    {loaded ? (
                      name
                    ) : (
                      <span className="skeleton-loader skeleton-name" />
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
                    contentEditable
                    data-placeholder="Add career summary..."
                    suppressContentEditableWarning
                    onBlur={(event) => {
                      const value = event.currentTarget.textContent || "";
                      setSummary(value);
                      handleSave(true, { summary: value });
                    }}
                  >
                    {loaded ? (
                      summary
                    ) : (
                      <span className="skeleton-loader skeleton-summary" />
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
                      contentEditable
                      data-placeholder="Add role title..."
                      suppressContentEditableWarning
                      onBlur={(event) => {
                        const value = event.currentTarget.textContent || "";
                        setRole(value);
                        handleSave(true, { role: value });
                      }}
                    >
                      {loaded ? (
                        role
                      ) : (
                        <span className="skeleton-loader skeleton-role" />
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
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
                        <span className="skeleton-loader skeleton-chip" />
                        <span className="skeleton-loader skeleton-chip" />
                      </>
                    ) : (
                      languages.map((lang) => {
                        const prof = lang.proficiency || "FLUENT";

                        let levelClass = "";

                        if (prof === "NATIVE") {
                          levelClass = "is-native";
                        } else if (prof === "FLUENT") {
                          levelClass = "is-fluent";
                        } else {
                          levelClass = "is-intermediate";
                        }

                        return (
                          <button
                            key={lang.id}
                            type="button"
                            className={`chip language-chip ${levelClass}`}
                            title="Remove language"
                            onClick={() => removeLanguage(lang.id)}
                          >
                            <span>{formatLanguageLabel(lang.language)}</span>
                            <i className="bi bi-trash-fill trash-icon" />
                          </button>
                        );
                      })
                    )}
                  </div>

                  <p className="level-legend">
                    <span />
                    Native
                    <span />
                    Fluent
                    <span />
                    Intermediate
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
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      <strong>Countries:</strong>
                      <span data-field="meta-worked-in">
                        {loaded ? (
                          meta.worked || "—"
                        ) : (
                          <span className="skeleton-loader skeleton-meta" />
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
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                      </svg>
                      <strong>Studied In:</strong>
                      <span data-field="meta-studied-in">
                        {loaded ? (
                          meta.studied || "—"
                        ) : (
                          <span className="skeleton-loader skeleton-meta" />
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
                        <rect x="4" y="2" width="16" height="20" rx="2" />
                        <line x1="9" y1="22" x2="9" y2="16" />
                        <line x1="15" y1="22" x2="15" y2="16" />
                        <line x1="9" y1="16" x2="15" y2="16" />
                        <path d="M8 6h2v2H8V6zm0 4h2v2H8v-2zm8-4h2v2h-2V6zm0 4h2v2h-2v-2z" />
                      </svg>
                      <strong>Companies:</strong>
                      <span data-field="meta-companies">
                        {loaded ? (
                          meta.companies || "—"
                        ) : (
                          <span className="skeleton-loader skeleton-meta" />
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
                        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                        <polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08" />
                        <polygon points="12 22.08 21 17.08 21 6.92 12 12 12 22.08" />
                        <polygon points="12 12 21 6.92 12 1.84 3 6.92 12 12" />
                      </svg>
                      <strong>Products:</strong>
                      <span data-field="meta-products">
                        {loaded ? (
                          meta.products || "—"
                        ) : (
                          <span className="skeleton-loader skeleton-meta" />
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
                        <rect x="2" y="7" width="20" height="14" rx="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                      <strong>Job Occupations:</strong>
                      <span data-field="meta-jobs">
                        {loaded ? (
                          meta.jobs || "—"
                        ) : (
                          <span className="skeleton-loader skeleton-meta" />
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
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                      <strong>Degrees:</strong>
                      <span data-field="meta-degrees">
                        {loaded ? (
                          meta.degrees || "—"
                        ) : (
                          <span className="skeleton-loader skeleton-meta" />
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
                        <circle cx="12" cy="8" r="7" />
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                      </svg>
                      <strong>Certifications:</strong>
                      <span data-field="meta-certifications">
                        {loaded ? (
                          meta.certs || "—"
                        ) : (
                          <span className="skeleton-loader skeleton-meta" />
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
                        <span className="skeleton-loader skeleton-chip" />
                        <span className="skeleton-loader skeleton-chip" />
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
                  disabled={draftExperience !== null}
                  title={
                    draftExperience
                      ? "Please complete or cancel the current draft first"
                      : "Add experience"
                  }
                  style={{
                    opacity: draftExperience !== null ? 0.5 : 1,
                    cursor:
                      draftExperience !== null ? "not-allowed" : "pointer",
                  }}
                >
                  + Add
                </button>
              </div>

              <div className="entry-list" id="experienceList">
                {!loaded ? (
                  <div className="skeleton-loader skeleton-card" />
                ) : (
                  <>
                    {draftExperience && (
                      <ExperienceCard
                        key="draft-experience"
                        experience={draftExperience}
                        index={0}
                        onChange={updateDraftExperience}
                        onBlur={saveDraftExperience}
                        onDelete={cancelDraftExperience}
                        onSlotClick={handleSlotClick}
                      />
                    )}

                    {experiences.map((experience, index) => (
                      <ExperienceCard
                        key={experience.id}
                        experience={experience}
                        index={draftExperience ? index + 1 : index}
                        onChange={updateExperience}
                        onBlur={saveExperience}
                        onDelete={() => removeExperience(experience.id)}
                        onSlotClick={handleSlotClick}
                      />
                    ))}
                  </>
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
                  disabled={draftEducation !== null}
                  title={
                    draftEducation
                      ? "Please complete or cancel the current draft first"
                      : "Add education"
                  }
                  style={{
                    opacity: draftEducation !== null ? 0.5 : 1,
                    cursor: draftEducation !== null ? "not-allowed" : "pointer",
                  }}
                >
                  + Add
                </button>
              </div>

              <div className="entry-list" id="educationList">
                {!loaded ? (
                  <div className="skeleton-loader skeleton-card" />
                ) : (
                  <>
                    {draftEducation && (
                      <EducationCard
                        key="draft-education"
                        education={draftEducation}
                        onChange={updateDraftEducation}
                        onBlur={saveDraftEducation}
                        onDelete={cancelDraftEducation}
                        onSlotClick={handleSlotClick}
                      />
                    )}

                    {educations.map((education) => (
                      <EducationCard
                        key={education.id}
                        education={education}
                        onChange={updateEducation}
                        onBlur={saveEducation}
                        onDelete={() => removeEducation(education.id)}
                        onSlotClick={handleSlotClick}
                      />
                    ))}
                  </>
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
                  disabled={draftCertification !== null}
                  title={
                    draftCertification
                      ? "Please complete or cancel the current draft first"
                      : "Add certification"
                  }
                  style={{
                    opacity: draftCertification !== null ? 0.5 : 1,
                    cursor:
                      draftCertification !== null ? "not-allowed" : "pointer",
                  }}
                >
                  + Add
                </button>
              </div>

              <div className="cert-grid">
                {!loaded ? (
                  <div
                    className="skeleton-loader skeleton-card"
                    style={{ height: "80px" }}
                  />
                ) : (
                  <>
                    {draftCertification && (
                      <CertificationCard
                        key="draft-certification"
                        certification={draftCertification}
                        onChange={updateDraftCertification}
                        onBlur={saveDraftCertification}
                        onDelete={cancelDraftCertification}
                        onSlotClick={handleSlotClick}
                      />
                    )}

                    {certifications.map((certification) => (
                      <CertificationCard
                        key={certification.id}
                        certification={certification}
                        onChange={updateCertification}
                        onBlur={saveCertification}
                        onDelete={() => removeCertification(certification.id)}
                        onSlotClick={handleSlotClick}
                      />
                    ))}
                  </>
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
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <i className="bi bi-floppy-fill me-2" />
                    Save Microresume
                  </>
                )}
              </button>
            </div>
          </article>

          <ProfileAside activePage="profile" />
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
