import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { LanguageModal, SkillModal } from "../components/ProfileModals";
import { CertificationCard, EducationCard, ExperienceCard, type CertificationDraft, type EducationDraft, type ExperienceDraft } from "../components/ProfileEntryCards";
import { usePageMeta } from "../hooks/usePageMeta";
import { getSession } from "../lib/session";
import { toast } from "../lib/toast";
import { UserService } from "../services/user.service";
import {
  skillService,
  userCertificationService,
  userEducationService,
  userExperienceService,
  userLanguageService,
  userProfileService,
  userSkillService,
  type UserLanguage,
  type UserSkill,
} from "../services/profileResources.service";
import "../css/profile.css";

function uid() {
  return `local-${Math.random().toString(36).slice(2)}`;
}

const userService = new UserService();

export default function Profile() {
  usePageMeta("Profile — Bildyx", "Build and edit your Bildyx MicroResume profile.");
  const navigate = useNavigate();

  const [profileId, setProfileId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [summary, setSummary] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [languages, setLanguages] = useState<UserLanguage[]>([]);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [experiences, setExperiences] = useState<ExperienceDraft[]>([]);
  const [educations, setEducations] = useState<EducationDraft[]>([]);
  const [certifications, setCertifications] = useState<CertificationDraft[]>([]);

  const [meta, setMeta] = useState({
    worked: "",
    studied: "",
    companies: "",
    products: "",
    jobs: "",
    degrees: "",
    certs: "",
  });

  const [showLangModal, setShowLangModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);

  const deletedIds = useRef({
    languages: [] as string[],
    skills: [] as string[],
    experiences: [] as string[],
    educations: [] as string[],
    certifications: [] as string[],
  });

  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const session = getSession();
    if (!session?.userId) {
      navigate("/login");
      return;
    }

    (async () => {
      try {
        const [user, fullProfile] = await Promise.all([
          userService.getById(session.userId!),
          userProfileService.getFullProfileByUserId(session.userId!),
        ]);

        if (!fullProfile) {
          setLoaded(true);
          return;
        }

        setProfileId(fullProfile.id);
        setName(fullProfile.display_name || [fullProfile.first_name, fullProfile.last_name].filter(Boolean).join(" ") || user.email || "");
        setRole(fullProfile.role || "");
        setSummary(fullProfile.biography || "");
        setAvatarUrl(fullProfile.avatar_url || null);
        setLanguages(fullProfile.languages || []);
        setSkills(fullProfile.skills || []);
        setExperiences((fullProfile.experiences as ExperienceDraft[]) || []);
        setEducations((fullProfile.educations as EducationDraft[]) || []);
        setCertifications((fullProfile.certifications as CertificationDraft[]) || []);
        setMeta({
          worked: (fullProfile.countries_worked_in || []).join(", "),
          studied: (fullProfile.countries_studied_in || []).join(", "),
          companies: (fullProfile.companies || []).join(", "),
          products: (fullProfile.products || []).join(", "),
          jobs: (fullProfile.job_occupations || []).join(", "),
          degrees: (fullProfile.degrees || []).join(", "),
          certs: (fullProfile.certifications_meta || []).join(", "),
        });
      } catch (err) {
        console.error("[Profile] Failed to load profile:", err);
        toast.error("Could not load your profile from the API — showing an empty MicroResume you can fill in manually.");
      } finally {
        setLoaded(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function addLanguage(language: string, level: string) {
    setLanguages((prev) => [...prev, { id: uid(), userProfileId: profileId || "", language, proficiency: level }]);
    setShowLangModal(false);
  }

  function removeLanguage(id: string) {
    if (!id.startsWith("local-")) deletedIds.current.languages.push(id);
    setLanguages((prev) => prev.filter((l) => l.id !== id));
  }

  async function openSkillPicker() {
    try {
      const all = await skillService.search("");
      setSkillSuggestions(all.map((s) => s.name).sort());
    } catch {
      setSkillSuggestions([]);
    }
    setShowSkillModal(true);
  }

  function addSkill(skillName: string) {
    setSkills((prev) => [...prev, { id: uid(), userProfileId: profileId || "", name: skillName }]);
    setShowSkillModal(false);
  }

  function removeSkill(id: string) {
    if (!id.startsWith("local-")) deletedIds.current.skills.push(id);
    setSkills((prev) => prev.filter((s) => s.id !== id));
  }

  function addExperience() {
    setExperiences((prev) => [...prev, { id: uid(), userProfileId: profileId || "" }]);
  }

  function removeExperience(id: string) {
    if (!id.startsWith("local-")) deletedIds.current.experiences.push(id);
    setExperiences((prev) => prev.filter((e) => e.id !== id));
  }

  function addEducation() {
    setEducations((prev) => [...prev, { id: uid(), userProfileId: profileId || "" }]);
  }

  function removeEducation(id: string) {
    if (!id.startsWith("local-")) deletedIds.current.educations.push(id);
    setEducations((prev) => prev.filter((e) => e.id !== id));
  }

  function addCertification() {
    setCertifications((prev) => [...prev, { id: uid(), userProfileId: profileId || "" }]);
  }

  function removeCertification(id: string) {
    if (!id.startsWith("local-")) deletedIds.current.certifications.push(id);
    setCertifications((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleSave() {
    if (!profileId) {
      localStorage.setItem("bildyx_profile_draft", JSON.stringify({ savedAt: new Date().toISOString(), name, summary, role }));
      toast("Profile saved locally (offline)");
      return;
    }

    setIsSaving(true);
    try {
      const jobs: Promise<unknown>[] = [
        userProfileService.update(profileId, { display_name: name, role, biography: summary }),
      ];

      deletedIds.current.languages.forEach((id) => jobs.push(userLanguageService.delete(id)));
      deletedIds.current.skills.forEach((id) => jobs.push(userSkillService.delete(id)));
      deletedIds.current.experiences.forEach((id) => jobs.push(userExperienceService.delete(id)));
      deletedIds.current.educations.forEach((id) => jobs.push(userEducationService.delete(id)));
      deletedIds.current.certifications.forEach((id) => jobs.push(userCertificationService.delete(id)));

      languages.forEach((lang) => {
        if (lang.id.startsWith("local-")) jobs.push(userLanguageService.create({ userProfileId: profileId, language: lang.language, proficiency: lang.proficiency }));
      });
      skills.forEach((skill) => {
        if (skill.id.startsWith("local-")) jobs.push(userSkillService.create({ userProfileId: profileId, name: skill.name }));
      });
      experiences.forEach((exp) => {
        const payload = { ...exp, userProfileId: profileId };
        jobs.push(exp.id.startsWith("local-") ? userExperienceService.create(payload) : userExperienceService.update(exp.id, payload));
      });
      educations.forEach((edu) => {
        const payload = { ...edu, userProfileId: profileId };
        jobs.push(edu.id.startsWith("local-") ? userEducationService.create(payload) : userEducationService.update(edu.id, payload));
      });
      certifications.forEach((cert) => {
        const payload = { ...cert, userProfileId: profileId };
        jobs.push(cert.id.startsWith("local-") ? userCertificationService.create(payload) : userCertificationService.update(cert.id, payload));
      });

      await Promise.all(jobs);
      deletedIds.current = { languages: [], skills: [], experiences: [], educations: [], certifications: [] };
      toast.success("Profile saved.");
    } catch (err) {
      console.error("[Profile] Save error:", err);
      toast.error("Could not save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Header />

      <main className="profile-shell">
        <div className="profile-workspace">
          <article className="profile-card" aria-labelledby="profileName">
            <header className="profile-top">
              <div className="name-zone">
                <div className="name-pill">
                  <strong id="profileName" contentEditable suppressContentEditableWarning onBlur={(e) => setName(e.currentTarget.textContent || "")}>
                    {loaded ? name || "Add your name..." : <span className="skeleton-loader skeleton-name" />}
                  </strong>
                  <span>MicroResume</span>
                </div>
              </div>

              <section className="summary-block" aria-labelledby="career-summary-title">
                <h2 className="section-mini-title" id="career-summary-title">
                  Career Summary
                </h2>

                <div className="summary-row">
                  <div className="avatar-editor">
                    <div
                      className="profile-avatar"
                      onClick={() => avatarInputRef.current?.click()}
                      style={avatarUrl ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: "cover" } : undefined}
                    />
                    <input ref={avatarInputRef} className="hidden-file-input" type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
                  </div>

                  <p className="summary-text" contentEditable suppressContentEditableWarning onBlur={(e) => setSummary(e.currentTarget.textContent || "")}>
                    {loaded ? summary || "Add career summary..." : <span className="skeleton-loader skeleton-summary" />}
                  </p>
                </div>
              </section>

              <div className="profile-main-grid">
                <section className="profile-core" aria-labelledby="role-title">
                  <div className="title-line">
                    <h1 id="role-title" contentEditable suppressContentEditableWarning onBlur={(e) => setRole(e.currentTarget.textContent || "")}>
                      {loaded ? role || "Add role title..." : <span className="skeleton-loader skeleton-role" />}
                    </h1>
                  </div>

                  <p className="profile-mini-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    Languages
                    <button className="chip-add" type="button" aria-label="Add language" onClick={() => setShowLangModal(true)}>
                      +
                    </button>
                  </p>
                  <div className="chip-row" aria-label="Languages">
                    {!loaded ? (
                      <>
                        <span className="skeleton-loader skeleton-chip" />
                        <span className="skeleton-loader skeleton-chip" />
                      </>
                    ) : (
                      languages.map((lang) => (
                        <span className="chip" key={lang.id}>
                          {lang.language} · {lang.proficiency}
                          <button type="button" aria-label={`Remove ${lang.language}`} onClick={() => removeLanguage(lang.id)}>
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  <p className="level-legend">
                    <span /> Native
                    <span /> Fluent
                    <span /> Intermediate
                  </p>

                  <ul className="profile-meta-list">
                    <li>
                      <strong>Countries:</strong> <span>{loaded ? meta.worked || "—" : <span className="skeleton-loader skeleton-meta" />}</span>
                    </li>
                    <li>
                      <strong>Studied In:</strong> <span>{loaded ? meta.studied || "—" : <span className="skeleton-loader skeleton-meta" />}</span>
                    </li>
                    <li>
                      <strong>Companies:</strong> <span>{loaded ? meta.companies || "—" : <span className="skeleton-loader skeleton-meta" />}</span>
                    </li>
                    <li>
                      <strong>Products:</strong> <span>{loaded ? meta.products || "—" : <span className="skeleton-loader skeleton-meta" />}</span>
                    </li>
                    <li>
                      <strong>Job Occupations:</strong> <span>{loaded ? meta.jobs || "—" : <span className="skeleton-loader skeleton-meta" />}</span>
                    </li>
                    <li>
                      <strong>Degrees:</strong> <span>{loaded ? meta.degrees || "—" : <span className="skeleton-loader skeleton-meta" />}</span>
                    </li>
                    <li>
                      <strong>Certifications:</strong> <span>{loaded ? meta.certs || "—" : <span className="skeleton-loader skeleton-meta" />}</span>
                    </li>
                  </ul>
                </section>

                <section className="skills-box" aria-labelledby="skills-title">
                  <div className="title-line title-line--small" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h2 id="skills-title">Top Skills</h2>
                    <button className="chip-add" type="button" aria-label="Add skill" onClick={openSkillPicker}>
                      +
                    </button>
                  </div>

                  <div className="chip-row skill-row" aria-label="Top skills">
                    {!loaded ? (
                      <>
                        <span className="skeleton-loader skeleton-chip" />
                        <span className="skeleton-loader skeleton-chip" />
                      </>
                    ) : (
                      skills.map((skill) => (
                        <span className="chip" key={skill.id}>
                          {skill.name}
                          <button type="button" aria-label={`Remove ${skill.name}`} onClick={() => removeSkill(skill.id)}>
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </header>

            <hr />

            <section className="builder-section" aria-labelledby="experience-title">
              <div className="section-title-row">
                <h2 id="experience-title">Experiences</h2>
                <button className="outline-button outline-button--small" type="button" onClick={addExperience}>
                  + Add
                </button>
              </div>

              <div className="entry-list">
                {!loaded ? (
                  <div className="skeleton-loader skeleton-card" />
                ) : experiences.length === 0 ? (
                  <p className="empty-message">No experiences added yet.</p>
                ) : (
                  experiences.map((exp, i) => (
                    <ExperienceCard
                      key={exp.id}
                      index={i}
                      entry={exp}
                      onChange={(next) => setExperiences((prev) => prev.map((e) => (e.id === exp.id ? next : e)))}
                      onRemove={() => removeExperience(exp.id)}
                    />
                  ))
                )}
              </div>
            </section>

            <hr />

            <section className="builder-section" aria-labelledby="education-title">
              <div className="section-title-row">
                <h2 id="education-title">Education</h2>
                <button className="outline-button outline-button--small" type="button" onClick={addEducation}>
                  + Add
                </button>
              </div>

              <div className="entry-list">
                {!loaded ? (
                  <div className="skeleton-loader skeleton-card" />
                ) : educations.length === 0 ? (
                  <p className="empty-message">No degrees added yet.</p>
                ) : (
                  educations.map((edu) => (
                    <EducationCard
                      key={edu.id}
                      entry={edu}
                      onChange={(next) => setEducations((prev) => prev.map((e) => (e.id === edu.id ? next : e)))}
                      onRemove={() => removeEducation(edu.id)}
                    />
                  ))
                )}
              </div>
            </section>

            <hr />

            <section className="builder-section" aria-labelledby="certification-title">
              <div className="section-title-row">
                <h2 id="certification-title">Certifications</h2>
                <button className="outline-button outline-button--small" type="button" onClick={addCertification}>
                  + Add
                </button>
              </div>

              <div className="cert-grid">
                {!loaded ? (
                  <div className="skeleton-loader skeleton-card" style={{ height: 80 }} />
                ) : certifications.length === 0 ? (
                  <p className="empty-message">No certifications added yet.</p>
                ) : (
                  certifications.map((cert) => (
                    <CertificationCard
                      key={cert.id}
                      entry={cert}
                      onChange={(next) => setCertifications((prev) => prev.map((c) => (c.id === cert.id ? next : c)))}
                      onRemove={() => removeCertification(cert.id)}
                    />
                  ))
                )}
              </div>
            </section>

            <div className="save-row">
              <button className="save-button" type="button" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "▣ Save Microresume"}
              </button>
            </div>
          </article>

          <aside className="profile-side-nav" aria-label="Profile menu">
            <Link className="side-nav-button is-active" to="/profile">
              <span aria-hidden="true">☻</span>
              Profile
            </Link>
            <Link className="side-nav-button" to="/target-list">
              <span aria-hidden="true">◎</span>
              My Target List
            </Link>
            <Link className="side-nav-button" to="/tests-preferences">
              <span aria-hidden="true">▣</span>
              Tests &amp;
              <br /> Preferences
            </Link>
            <Link className="side-nav-button" to="/coming-soon/settings">
              <span aria-hidden="true">⚙</span>
              Settings
            </Link>
          </aside>
        </div>
      </main>

      {showLangModal && <LanguageModal onConfirm={addLanguage} onClose={() => setShowLangModal(false)} />}
      {showSkillModal && <SkillModal suggestions={skillSuggestions} onConfirm={addSkill} onClose={() => setShowSkillModal(false)} />}

      <Footer />
    </>
  );
}
