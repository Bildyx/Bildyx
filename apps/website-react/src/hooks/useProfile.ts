import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSession } from "../lib/session";
import { toast } from "../lib/toast";
import { UserService } from "../services/user.service";
import { UserProfileService } from "../services/user-profile.service";
import { UserLanguageService } from "../services/user-language.service";
import { UserSkillService } from "../services/user-skill.service";
import { UserExperienceService } from "../services/user-experience.service";
import { UserEducationService } from "../services/user-education.service";
import { UserCertificationService } from "../services/user-certification.service";
import { SkillService } from "../services/skill.service";
import { OrganizationService } from "../services/organization.service";
import { CityService } from "../services/city.service";
import { CountryService } from "../services/country.service";
import { JobService } from "../services/job.service";
import { SubjectService } from "../services/subject.service";
import { DegreeService } from "../services/degree.service";
import { CertificationService } from "../services/certification.service";
import type { UserLanguage } from "@repo/models/user_languages";
import type { UserSkill } from "@repo/models/user_skills";
import type { ExperienceCardData } from "../components/cards/ExperienceCard";
import type { EducationCardData } from "../components/cards/EducationCard";
import type { CertificationCardData } from "../components/cards/CertificationCard";

function uid() {
  return `local-${Math.random().toString(36).slice(2)}`;
}

const userService = new UserService();
const userProfileService = new UserProfileService();
const userLanguageService = new UserLanguageService();
const userSkillService = new UserSkillService();
const userExperienceService = new UserExperienceService();
const userEducationService = new UserEducationService();
const userCertificationService = new UserCertificationService();
const skillService = new SkillService();
const organizationService = new OrganizationService();
const cityService = new CityService();
const countryService = new CountryService();
const jobService = new JobService();
const subjectService = new SubjectService();
const degreeService = new DegreeService();
const certificationService = new CertificationService();

export function useProfile() {
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
  const [experiences, setExperiences] = useState<ExperienceCardData[]>([]);
  const [educations, setEducations] = useState<EducationCardData[]>([]);
  const [certifications, setCertifications] = useState<CertificationCardData[]>(
    [],
  );

  const [entityModalOpen, setEntityModalOpen] = useState(false);
  const [entityModalSlot, setEntityModalSlot] = useState<string | null>(null);
  const [entityModalEntryId, setEntityModalEntryId] = useState<string | null>(
    null,
  );
  const [entityModalEntryType, setEntityModalEntryType] = useState<
    "experience" | "education" | "certification" | null
  >(null);

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

  const lastSavedRef = useRef({
    name: "",
    role: "",
    summary: "",
    avatarUrl: null as string | null,
  });
  const modifiedCardIdsRef = useRef<Set<string>>(new Set());

  const nameRef = useRef(name);
  nameRef.current = name;
  const roleRef = useRef(role);
  roleRef.current = role;
  const summaryRef = useRef(summary);
  summaryRef.current = summary;
  const avatarUrlRef = useRef(avatarUrl);
  avatarUrlRef.current = avatarUrl;

  const languagesRef = useRef(languages);
  languagesRef.current = languages;
  const skillsRef = useRef(skills);
  skillsRef.current = skills;
  const experiencesRef = useRef(experiences);
  experiencesRef.current = experiences;
  const educationsRef = useRef(educations);
  educationsRef.current = educations;
  const certificationsRef = useRef(certifications);
  certificationsRef.current = certifications;

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
        const resolvedName =
          fullProfile.display_name ||
          [fullProfile.first_name, fullProfile.last_name]
            .filter(Boolean)
            .join(" ") ||
          user.email ||
          "";
        const resolvedRole = fullProfile.role || "";
        const resolvedSummary = fullProfile.biography || "";

        setName(resolvedName);
        setRole(resolvedRole);
        setSummary(resolvedSummary);

        lastSavedRef.current = {
          name: resolvedName,
          role: resolvedRole,
          summary: resolvedSummary,
          avatarUrl: fullProfile.avatar_url || null,
        };
        setAvatarUrl(fullProfile.avatar_url || null);
        setLanguages(fullProfile.languages || []);
        setSkills(fullProfile.skills || []);

        const resolvedExperiences = await Promise.all(
          ((fullProfile.experiences as ExperienceCardData[]) || []).map(
            async (exp) => {
              let companyName = exp.company_name || "";
              let countryName = "";
              let roleTitle = exp.role_title || "";
              let subjectName = exp.subject_name || "";

              if (exp.organization_id) {
                try {
                  const org = await organizationService.getById(
                    exp.organization_id,
                  );
                  if (org) {
                    companyName = org.name;
                    if (org.city_id) {
                      const city = await cityService.getById(org.city_id);
                      if (city && city.country_id) {
                        const country = await countryService.getById(
                          city.country_id,
                        );
                        if (country) {
                          countryName = country.name;
                        }
                      }
                    }
                  }
                } catch {}
              }

              if (exp.job_id && !roleTitle) {
                try {
                  const job = await jobService.getById(exp.job_id);
                  if (job) roleTitle = job.title;
                } catch {}
              }

              if (exp.subject_id && !subjectName) {
                try {
                  const subject = await subjectService.getById(exp.subject_id);
                  if (subject) subjectName = subject.name;
                } catch {}
              }

              return {
                ...exp,
                company_name: companyName,
                role_title: roleTitle,
                subject_name: subjectName,
                country_name: countryName,
              } as any;
            },
          ),
        );

        const resolvedEducations = await Promise.all(
          ((fullProfile.educations as EducationCardData[]) || []).map(
            async (edu) => {
              let universityName = edu.university_name || "";
              let countryName = "";
              let degreeName = edu.degree_name || "";

              if (edu.organization_id) {
                try {
                  const org = await organizationService.getById(
                    edu.organization_id,
                  );
                  if (org) {
                    universityName = org.name;
                    if (org.city_id) {
                      const city = await cityService.getById(org.city_id);
                      if (city && city.country_id) {
                        const country = await countryService.getById(
                          city.country_id,
                        );
                        if (country) {
                          countryName = country.name;
                        }
                      }
                    }
                  }
                } catch {}
              }

              if (edu.degree_id && !degreeName) {
                try {
                  const deg = await degreeService.getById(edu.degree_id);
                  if (deg) degreeName = deg.name;
                } catch {}
              }

              return {
                ...edu,
                university_name: universityName,
                degree_name: degreeName,
                country_name: countryName,
              } as any;
            },
          ),
        );

        const resolvedCertifications = await Promise.all(
          ((fullProfile.certifications as CertificationCardData[]) || []).map(
            async (cert) => {
              let certificationName = cert.certification_name || "";

              if (cert.certification_id && !certificationName) {
                try {
                  const c = await certificationService.getById(
                    cert.certification_id,
                  );
                  if (c) certificationName = c.name;
                } catch {}
              }

              return {
                ...cert,
                certification_name: certificationName,
              } as any;
            },
          ),
        );

        setExperiences(resolvedExperiences);
        setEducations(resolvedEducations);
        setCertifications(resolvedCertifications);
      } catch (err) {
        console.error("[Profile] Failed to load profile:", err);
        toast.error(
          "Could not load your profile from the API — showing an empty MicroResume you can fill in manually.",
        );
      } finally {
        setLoaded(true);
      }
    })();
  }, [navigate]);

  function openEntityModal(
    slotType: string,
    entryId: string,
    entryType: "experience" | "education" | "certification",
  ) {
    setEntityModalSlot(slotType);
    setEntityModalEntryId(entryId);
    setEntityModalEntryType(entryType);
    setEntityModalOpen(true);
  }

  function handleSlotClick(slot: HTMLElement) {
    const slotType = slot.dataset.cardSlot;
    const entryCard = slot.closest(".entry-card") as HTMLElement | null;

    if (!slotType || !entryCard) {
      return;
    }

    const entryId = entryCard.dataset.id;
    const entryType = entryCard.dataset.entry;

    if (!entryId) {
      return;
    }

    if (
      entryType !== "experience" &&
      entryType !== "education" &&
      entryType !== "certification"
    ) {
      return;
    }

    openEntityModal(slotType, entryId, entryType);
  }

  async function handleEntitySelect(entityId: string, entity: any) {
    if (!entityModalEntryId || !entityModalEntryType || !entityModalSlot) {
      return;
    }

    modifiedCardIdsRef.current.add(entityModalEntryId);

    let resolvedCountryName = "";
    if (
      entityModalSlot === "company-card" ||
      entityModalSlot === "university-card"
    ) {
      try {
        const org = await organizationService.getById(entityId);
        if (org && org.city_id) {
          const city = await cityService.getById(org.city_id);
          if (city && city.country_id) {
            const country = await countryService.getById(city.country_id);
            if (country) {
              resolvedCountryName = country.name;
            }
          }
        }
      } catch {}
    }

    if (entityModalEntryType === "experience") {
      setExperiences((prev) =>
        prev.map((experience) => {
          if (experience.id !== entityModalEntryId) {
            return experience;
          }

          if (entityModalSlot === "company-card") {
            return {
              ...experience,
              organization_id: entityId,
              company_name: entity.name,
              country_name: resolvedCountryName,
            } as any;
          }

          if (entityModalSlot === "subject-card") {
            return {
              ...experience,
              subject_id: entityId,
              subject_name: entity.name,
            };
          }

          if (entityModalSlot === "role-card") {
            return {
              ...experience,
              job_id: entityId,
              role_title: entity.title,
            };
          }

          return experience;
        }),
      );
    }

    if (entityModalEntryType === "education") {
      setEducations((prev) =>
        prev.map((education) => {
          if (education.id !== entityModalEntryId) {
            return education;
          }

          if (entityModalSlot === "university-card") {
            return {
              ...education,
              organization_id: entityId,
              university_name: entity.name,
              country_name: resolvedCountryName,
            } as any;
          }

          if (entityModalSlot === "degree-card") {
            return {
              ...education,
              degree_id: entityId,
              degree_name: entity.name,
            };
          }

          return education;
        }),
      );
    }

    if (entityModalEntryType === "certification") {
      setCertifications((prev) =>
        prev.map((certification) => {
          if (certification.id !== entityModalEntryId) {
            return certification;
          }

          if (entityModalSlot === "certification-card") {
            return {
              ...certification,
              certification_id: entityId,
              certification_name: entity.name,
            };
          }

          return certification;
        }),
      );
    }

    setEntityModalOpen(false);
    setEntityModalSlot(null);
    setEntityModalEntryId(null);
    setEntityModalEntryType(null);
    setTimeout(() => handleSave(true), 0);
  }

  function addLanguage(language: string, level: string) {
    let levelEnum = level.toUpperCase();
    if (levelEnum === "INTERMEDIATE") {
      levelEnum = "CONVERSATIONAL";
    }
    setLanguages((prev) => [
      ...prev,
      {
        id: uid(),
        user_profile_id: profileId || "",
        language: language as any,
        proficiency: levelEnum as any,
      },
    ]);
    setShowLangModal(false);
    setTimeout(() => handleSave(true), 0);
  }

  function removeLanguage(id: string) {
    if (!id.startsWith("local-")) deletedIds.current.languages.push(id);
    setLanguages((prev) => prev.filter((l) => l.id !== id));
    setTimeout(() => handleSave(true), 0);
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

  async function addSkill(skillName: string) {
    let skillId = "";
    try {
      const list = await skillService.getAll();
      const existing = list.find(
        (s: any) => s.name.toLowerCase() === skillName.toLowerCase(),
      );
      if (existing) {
        skillId = existing.id;
      } else {
        const res = await skillService.create({
          name: skillName.trim(),
          serial_number:
            "SKI-" + Math.random().toString(36).substring(2, 11).toUpperCase(),
        });
        skillId = res.id;
      }
    } catch (err) {
      console.error("Failed to resolve or create skill:", err);
      toast.error("Failed to add skill.");
      return;
    }

    setSkills((prev) => [
      ...prev,
      {
        id: uid(),
        user_profile_id: profileId || "",
        skill_id: skillId,
        name: skillName,
      } as any,
    ]);
    setShowSkillModal(false);
    setTimeout(() => handleSave(true), 0);
  }

  function removeSkill(id: string) {
    if (!id.startsWith("local-")) deletedIds.current.skills.push(id);
    setSkills((prev) => prev.filter((s) => s.id !== id));
    setTimeout(() => handleSave(true), 0);
  }

  function addExperience() {
    setExperiences((prev) => [
      ...prev,
      { id: uid(), userProfileId: profileId || "" },
    ]);
  }

  function removeExperience(id: string) {
    if (!id.startsWith("local-")) deletedIds.current.experiences.push(id);
    setExperiences((prev) => prev.filter((e) => e.id !== id));
    setTimeout(() => handleSave(true), 0);
  }

  function addEducation() {
    setEducations((prev) => [
      ...prev,
      { id: uid(), userProfileId: profileId || "" },
    ]);
  }

  function removeEducation(id: string) {
    if (!id.startsWith("local-")) deletedIds.current.educations.push(id);
    setEducations((prev) => prev.filter((e) => e.id !== id));
    setTimeout(() => handleSave(true), 0);
  }

  function addCertification() {
    setCertifications((prev) => [
      ...prev,
      { id: uid(), userProfileId: profileId || "" },
    ]);
  }

  function removeCertification(id: string) {
    if (!id.startsWith("local-")) deletedIds.current.certifications.push(id);
    setCertifications((prev) => prev.filter((c) => c.id !== id));
    setTimeout(() => handleSave(true), 0);
  }

  function updateExperience(next: ExperienceCardData) {
    modifiedCardIdsRef.current.add(next.id);
    setExperiences((prev) =>
      prev.map((item) => (item.id === next.id ? next : item)),
    );
  }

  function updateEducation(next: EducationCardData) {
    modifiedCardIdsRef.current.add(next.id);
    setEducations((prev) =>
      prev.map((item) => (item.id === next.id ? next : item)),
    );
  }

  function updateCertification(next: CertificationCardData) {
    modifiedCardIdsRef.current.add(next.id);
    setCertifications((prev) =>
      prev.map((item) => (item.id === next.id ? next : item)),
    );
  }

  function closeEntityModal() {
    setEntityModalOpen(false);
    setEntityModalSlot(null);
    setEntityModalEntryId(null);
    setEntityModalEntryType(null);
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setAvatarUrl(b64);
      setTimeout(() => handleSave(true, undefined, b64), 0);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave(
    silent: boolean = false,
    overrides?: { name?: string; role?: string; summary?: string },
    overrideAvatarUrl?: string,
  ) {
    const activeName =
      overrides?.name !== undefined ? overrides.name : nameRef.current;
    const activeRole =
      overrides?.role !== undefined ? overrides.role : roleRef.current;
    const activeSummary =
      overrides?.summary !== undefined ? overrides.summary : summaryRef.current;

    const activeAvatar =
      overrideAvatarUrl !== undefined
        ? overrideAvatarUrl
        : avatarUrlRef.current;

    if (!profileId) {
      localStorage.setItem(
        "bildyx_profile_draft",
        JSON.stringify({
          savedAt: new Date().toISOString(),
          name: activeName,
          summary: activeSummary,
          role: activeRole,
          avatarUrl: activeAvatar,
        }),
      );
      if (!silent) {
        toast("Profile saved locally (offline)");
      }
      return;
    }

    setIsSaving(true);
    try {
      const jobs: Promise<unknown>[] = [];

      // Only update name, role, summary, and avatar if they changed
      const profilePatch: Record<string, string> = {};
      if (activeName !== lastSavedRef.current.name) {
        profilePatch.display_name = activeName;
      }
      if (activeRole !== lastSavedRef.current.role) {
        profilePatch.role = activeRole;
      }
      if (activeSummary !== lastSavedRef.current.summary) {
        profilePatch.biography = activeSummary;
      }
      if (activeAvatar !== lastSavedRef.current.avatarUrl) {
        profilePatch.avatar_url = activeAvatar || "";
      }

      if (Object.keys(profilePatch).length > 0) {
        jobs.push(userProfileService.update(profileId, profilePatch));
      }

      deletedIds.current.languages.forEach((id) =>
        jobs.push(userLanguageService.delete(id)),
      );
      deletedIds.current.skills.forEach((id) =>
        jobs.push(userSkillService.delete(id)),
      );
      deletedIds.current.experiences.forEach((id) =>
        jobs.push(userExperienceService.delete(id)),
      );
      deletedIds.current.educations.forEach((id) =>
        jobs.push(userEducationService.delete(id)),
      );
      deletedIds.current.certifications.forEach((id) =>
        jobs.push(userCertificationService.delete(id)),
      );

      languagesRef.current.forEach((lang) => {
        if (lang.id.startsWith("local-"))
          jobs.push(
            userLanguageService.create({
              user_profile_id: profileId,
              language: lang.language,
              proficiency: lang.proficiency,
            }),
          );
      });
      skillsRef.current.forEach((skill) => {
        if (skill.id.startsWith("local-"))
          jobs.push(
            userSkillService.create({
              user_profile_id: profileId,
              skill_id: skill.skill_id,
            }),
          );
      });
      experiencesRef.current.forEach((exp) => {
        const payload = { ...exp, user_profile_id: profileId };
        if (exp.id.startsWith("local-")) {
          jobs.push(userExperienceService.create(payload));
        } else if (modifiedCardIdsRef.current.has(exp.id)) {
          jobs.push(userExperienceService.update(exp.id, payload));
        }
      });
      educationsRef.current.forEach((edu) => {
        const payload = { ...edu, user_profile_id: profileId };
        if (edu.id.startsWith("local-")) {
          jobs.push(userEducationService.create(payload));
        } else if (modifiedCardIdsRef.current.has(edu.id)) {
          jobs.push(userEducationService.update(edu.id, payload));
        }
      });
      certificationsRef.current.forEach((cert) => {
        if (!cert.certification_id) return;

        const obtained_at = cert.obtained_at
          ? new Date(cert.obtained_at)
          : null;
        const expires_at = cert.expires_at ? new Date(cert.expires_at) : null;

        if (cert.id.startsWith("local-")) {
          jobs.push(
            userCertificationService.create({
              user_profile_id: profileId!,
              certification_id: cert.certification_id,
              obtained_at,
              expires_at,
            }),
          );
        } else if (modifiedCardIdsRef.current.has(cert.id)) {
          jobs.push(
            userCertificationService.update(cert.id, {
              obtained_at,
              expires_at,
            }),
          );
        }
      });

      if (jobs.length > 0) {
        await Promise.all(jobs);
      }

      // Update baseline after successful save
      lastSavedRef.current = {
        name: activeName,
        role: activeRole,
        summary: activeSummary,
        avatarUrl: activeAvatar,
      };
      modifiedCardIdsRef.current.clear();

      deletedIds.current = {
        languages: [],
        skills: [],
        experiences: [],
        educations: [],
        certifications: [],
      };
      if (!silent) {
        toast.success("Profile saved.");
      }
    } catch (err) {
      console.error("[Profile] Save error:", err);
      toast.error("Could not save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return {
    profileId,
    loaded,
    isSaving,
    name,
    setName,
    role,
    setRole,
    summary,
    setSummary,
    avatarUrl,
    setAvatarUrl,
    languages,
    setLanguages,
    skills,
    setSkills,
    experiences,
    setExperiences,
    educations,
    setEducations,
    certifications,
    setCertifications,
    entityModalOpen,
    setEntityModalOpen,
    entityModalSlot,
    entityModalEntryId,
    entityModalEntryType,
    showLangModal,
    setShowLangModal,
    showSkillModal,
    setShowSkillModal,
    skillSuggestions,
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
    modifiedCardIdsRef,
    updateExperience,
    updateEducation,
    updateCertification,
    closeEntityModal,
  };
}
