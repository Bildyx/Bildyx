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
import type { UserExperience } from "@repo/models/user_experiences";
import type {
  PutUserEducation,
  UserEducation,
} from "@repo/models/user_educations";
import type {
  PutUserCertification,
  UserCertification,
} from "@repo/models/user_certifications";
const getProficiencyWeight = (prof?: string | null): number => {
  if (prof === "NATIVE") return 3;
  if (prof === "FLUENT") return 2;
  return 1;
};

const sortLanguages = (langs: UserLanguage[]): UserLanguage[] => {
  return [...langs].sort((a, b) => getProficiencyWeight(b.proficiency) - getProficiencyWeight(a.proficiency));
};

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
  const [experiences, setExperiences] = useState<UserExperience[]>([]);
  const [educations, setEducations] = useState<UserEducation[]>([]);
  const [certifications, setCertifications] = useState<UserCertification[]>([]);

  // Drafts
  const [draftExperience, setDraftExperience] = useState<UserExperience | null>(
    null,
  );
  const [draftEducation, setDraftEducation] = useState<UserEducation | null>(
    null,
  );
  const [draftCertification, setDraftCertification] =
    useState<UserCertification | null>(null);

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

  const hasLoaded = useRef(false);

  const loadData = async () => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    const session = getSession();

    if (!session?.userId) {
      navigate("/login");
      return;
    }

    try {
      const [user, fullProfile] = await Promise.all([
        userService.getById(session.userId),
        userProfileService.getFullProfileByUserId(session.userId),
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

      setName(resolvedName);
      setRole(fullProfile.role || "");
      setSummary(fullProfile.biography || "");
      setAvatarUrl(fullProfile.avatar_url || null);

      setLanguages(sortLanguages(fullProfile.languages || []));
      setSkills(fullProfile.skills || []);

      const resolvedExperiences = await Promise.all(
        ((fullProfile.experiences as UserExperience[]) || []).map(
          async (experience) => {
            let companyName = (experience as any).company_name;
            let countryName = "";
            let roleTitle = experience.title;
            let subjectName = (experience as any).subject_name;

            if (experience.organization_id) {
              try {
                const organization = await organizationService.getById(
                  experience.organization_id,
                );

                if (organization) {
                  companyName = organization.name;

                  if (organization.city_id) {
                    const city = await cityService.getById(
                      organization.city_id,
                    );

                    if (city?.country_id) {
                      const country = await countryService.getById(
                        city.country_id,
                      );

                      if (country) {
                        countryName = country.name;
                      }
                    }
                  }
                }
              } catch {
                // Ignore failure
              }
            }

            if (experience.job_id && !roleTitle) {
              try {
                const job = await jobService.getById(experience.job_id);
                if (job) {
                  roleTitle = job.title;
                }
              } catch {
                // Ignore failure
              }
            }

            if (experience.subject_id && !subjectName) {
              try {
                const subject = await subjectService.getById(
                  experience.subject_id,
                );
                if (subject) {
                  subjectName = subject.name;
                }
              } catch {
                // Ignore failure
              }
            }

            return {
              ...experience,
              company_name: companyName,
              role_title: roleTitle,
              subject_name: subjectName,
              country_name: countryName,
            } as any;
          },
        ),
      );

      const resolvedEducations = await Promise.all(
        ((fullProfile.educations as UserEducation[]) || []).map(
          async (education) => {
            let universityName = (education as any).university_name;
            let countryName = "";
            let degreeName = (education as any).degree_name;

            if (education.organization_id) {
              try {
                const organization = await organizationService.getById(
                  education.organization_id,
                );

                if (organization) {
                  universityName = organization.name;

                  if (organization.city_id) {
                    const city = await cityService.getById(
                      organization.city_id,
                    );

                    if (city?.country_id) {
                      const country = await countryService.getById(
                        city.country_id,
                      );

                      if (country) {
                        countryName = country.name;
                      }
                    }
                  }
                }
              } catch {
                // Ignore failure
              }
            }

            if (education.degree_id && !degreeName) {
              try {
                const degree = await degreeService.getById(education.degree_id);
                if (degree) {
                  degreeName = degree.name;
                }
              } catch {
                // Ignore failure
              }
            }

            return {
              ...education,
              university_name: universityName,
              degree_name: degreeName,
              country_name: countryName,
            } as any;
          },
        ),
      );

      const resolvedCertifications = await Promise.all(
        ((fullProfile.certifications as UserCertification[]) || []).map(
          async (certification) => {
            let certificationName = (certification as any).certification_name;

            if (certification.certification_id && !certificationName) {
              try {
                const result = await certificationService.getById(
                  certification.certification_id,
                );
                if (result) {
                  certificationName = result.name;
                }
              } catch {
                // Ignore failure
              }
            }

            return {
              ...certification,
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
  };

  useEffect(() => {
    loadData();
  }, [navigate]);

  /**
   * Entity Modal
   */
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

    if (!slotType || !entryCard) return;

    const entryId = entryCard.dataset.id || "draft";
    const entryType = entryCard.dataset.entry;

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
    if (!entityModalEntryId || !entityModalEntryType || !entityModalSlot)
      return;

    const entryId = entityModalEntryId;
    const entryType = entityModalEntryType;
    const slotType = entityModalSlot;

    try {
      let resolvedCountryName = "";

      if (slotType === "company-card" || slotType === "university-card") {
        try {
          const organization = await organizationService.getById(entityId);
          if (organization?.city_id) {
            const city = await cityService.getById(organization.city_id);
            if (city?.country_id) {
              const country = await countryService.getById(city.country_id);
              if (country) resolvedCountryName = country.name;
            }
          }
        } catch {
          // Optionnel
        }
      }

      if (entryType === "experience") {
        const isDraft = entryId === "draft";
        const currentExp = isDraft
          ? draftExperience
          : experiences.find((i) => i.id === entryId);
        if (!currentExp || !profileId) return;

        let nextExperience: UserExperience = { ...currentExp };

        if (slotType === "company-card") {
          nextExperience = {
            ...nextExperience,
            organization_id: entityId,
            company_name: entity.name,
            country_name: resolvedCountryName,
          } as any;
        }

        if (slotType === "subject-card") {
          nextExperience = {
            ...nextExperience,
            subject_id: entityId,
            subject_name: entity.name,
          } as any;
        }

        if (slotType === "role-card") {
          nextExperience = {
            ...nextExperience,
            job_id: entityId,
            role_title: entity.title,
          } as any;
        }

        if (isDraft) {
          // Création directe en BDD dès la sélection
          const created = await userExperienceService.create({
            user_profile_id: profileId,
            organization_id: nextExperience.organization_id ?? null,
            subject_id: nextExperience.subject_id ?? null,
            job_id: nextExperience.job_id ?? null,
            title: nextExperience.title ?? null,
            description: nextExperience.description ?? null,
            start_year: nextExperience.start_year ?? null,
            end_year: nextExperience.end_year ?? null,
            current: nextExperience.current ?? false,
          });

          setExperiences((prev) => [
            ...prev,
            { ...nextExperience, id: created.id },
          ]);
          setDraftExperience(null);
        } else {
          setExperiences((prev) =>
            prev.map((item) => (item.id === entryId ? nextExperience : item)),
          );
          await saveExperience(nextExperience);
        }
      }

      if (entryType === "education") {
        const isDraft = entryId === "draft";
        const currentEdu = isDraft
          ? draftEducation
          : educations.find((i) => i.id === entryId);
        if (!currentEdu || !profileId) return;

        let nextEducation: UserEducation = { ...currentEdu };

        if (slotType === "university-card") {
          nextEducation = {
            ...nextEducation,
            organization_id: entityId,
            university_name: entity.name,
            country_name: resolvedCountryName,
          } as any;
        }

        if (slotType === "degree-card") {
          nextEducation = {
            ...nextEducation,
            degree_id: entityId,
            degree_name: entity.name,
          } as any;
        }

        if (isDraft) {
          // Création directe en BDD dès la sélection
          const created = await userEducationService.create({
            user_profile_id: profileId,
            start_year: nextEducation.start_year ?? null,
            end_year: nextEducation.end_year ?? null,
            degree_id: nextEducation.degree_id ?? null,
            organization_id: nextEducation.organization_id ?? null,
            graduated: nextEducation.graduated ?? false,
          } as any);

          setEducations((prev) => [
            ...prev,
            { ...nextEducation, id: created.id },
          ]);
          setDraftEducation(null);
        } else {
          setEducations((prev) =>
            prev.map((item) => (item.id === entryId ? nextEducation : item)),
          );
          await saveEducation(nextEducation);
        }
      }

      if (entryType === "certification") {
        const isDraft = entryId === "draft";
        const currentCert = isDraft
          ? draftCertification
          : certifications.find((i) => i.id === entryId);
        if (!currentCert || !profileId) return;

        let nextCertification: UserCertification = { ...currentCert };

        if (slotType === "certification-card") {
          nextCertification = {
            ...nextCertification,
            certification_id: entityId,
            certification_name: entity.name,
          } as any;
        }

        if (isDraft) {
          // Création directe en BDD dès la sélection
          const created = await userCertificationService.create({
            user_profile_id: profileId,
            certification_id: nextCertification.certification_id ?? null,
            obtained_at: nextCertification.obtained_at ?? null,
            expires_at: nextCertification.expires_at ?? null,
          } as any);

          setCertifications((prev) => [
            ...prev,
            { ...nextCertification, id: created.id },
          ]);
          setDraftCertification(null);
        } else {
          setCertifications((prev) =>
            prev.map((item) =>
              item.id === entryId ? nextCertification : item,
            ),
          );
          await saveCertification(nextCertification);
        }
      }

      closeEntityModal();
    } catch (err) {
      console.error("[Profile] Entity selection error:", err);
      toast.error("Could not save this selection.");
    }
  }

  /**
   * Languages
   */
  async function addLanguage(language: string, level: string) {
    if (!profileId) return;

    let proficiency = level.toUpperCase();
    if (proficiency === "INTERMEDIATE") proficiency = "CONVERSATIONAL";

    try {
      const created = await userLanguageService.create({
        user_profile_id: profileId,
        language: language as any,
        proficiency: proficiency as any,
      });

      setLanguages((prev) => sortLanguages([...prev, created]));
      setShowLangModal(false);
    } catch (err) {
      console.error("[Profile] Language create error:", err);
      toast.error("Could not add this language.");
    }
  }

  async function removeLanguage(id: string) {
    try {
      await userLanguageService.delete(id);
      setLanguages((prev) => prev.filter((lang) => lang.id !== id));
    } catch (err) {
      console.error("[Profile] Language delete error:", err);
      toast.error("Could not remove this language.");
    }
  }

  /**
   * Skills
   */
  async function openSkillPicker() {
    try {
      const all = await skillService.search("");
      setSkillSuggestions(all.map((skill) => skill.name).sort());
    } catch {
      setSkillSuggestions([]);
    }
    setShowSkillModal(true);
  }

  async function addSkill(skillName: string) {
    if (!profileId) return;

    try {
      const list = await skillService.getAll();
      const existing = list.find(
        (skill: any) => skill.name.toLowerCase() === skillName.toLowerCase(),
      );

      let skillId: string;
      if (existing) {
        skillId = existing.id;
      } else {
        const createdSkill = await skillService.create({
          name: skillName.trim(),
          serial_number:
            "SKI-" + Math.random().toString(36).substring(2, 11).toUpperCase(),
        });
        skillId = createdSkill.id;
      }

      const createdUserSkill = await userSkillService.create({
        user_profile_id: profileId,
        skill_id: skillId,
      });

      setSkills((prev) => [
        ...prev,
        {
          ...createdUserSkill,
          skill_id: skillId,
          name: skillName,
        } as any,
      ]);
      setShowSkillModal(false);
    } catch (err) {
      console.error("[Profile] Skill create error:", err);
      toast.error("Failed to add skill.");
    }
  }

  async function removeSkill(id: string) {
    try {
      await userSkillService.delete(id);
      setSkills((prev) => prev.filter((skill) => skill.id !== id));
    } catch (err) {
      console.error("[Profile] Skill delete error:", err);
      toast.error("Could not remove this skill.");
    }
  }

  /**
   * Experiences
   */
  function addExperience() {
    setDraftExperience({
      id: "draft",
      user_profile_id: profileId || "",
      organization_id: null,
      subject_id: null,
      job_id: null,
      title: null,
      description: null,
      start_year: null,
      end_year: null,
      current: false,
    } as any);
  }

  function cancelDraftExperience() {
    setDraftExperience(null);
  }

  function updateDraftExperience(next: UserExperience) {
    setDraftExperience(next);
  }

  async function saveDraftExperience() {
    if (!profileId || !draftExperience) return;

    const hasData =
      draftExperience.title ||
      draftExperience.description ||
      draftExperience.organization_id ||
      draftExperience.job_id ||
      draftExperience.subject_id ||
      draftExperience.start_year ||
      draftExperience.end_year;

    if (!hasData) {
      setDraftExperience(null);
      return;
    }

    try {
      const created = await userExperienceService.create({
        user_profile_id: profileId,
        organization_id: draftExperience.organization_id ?? null,
        subject_id: draftExperience.subject_id ?? null,
        job_id: draftExperience.job_id ?? null,
        title: draftExperience.title ?? null,
        description: draftExperience.description ?? null,
        start_year: draftExperience.start_year ?? null,
        end_year: draftExperience.end_year ?? null,
        current: draftExperience.current ?? false,
      });

      setExperiences((prev) => [
        ...prev,
        { ...draftExperience, id: created.id },
      ]);
      setDraftExperience(null);
    } catch (err) {
      console.error("[Profile] Draft experience save error:", err);
      toast.error("Could not create experience.");
    }
  }

  async function removeExperience(id: string) {
    try {
      await userExperienceService.delete(id);
      setExperiences((prev) => prev.filter((exp) => exp.id !== id));
    } catch (err) {
      console.error("[Profile] Experience delete error:", err);
      toast.error("Could not remove this experience.");
    }
  }

  function updateExperience(next: UserExperience) {
    setExperiences((prev) =>
      prev.map((item) => (item.id === next.id ? next : item)),
    );
  }

  async function saveExperience(experience: UserExperience) {
    if (!profileId) return;

    try {
      const payload = {
        user_profile_id: profileId,
        organization_id: experience.organization_id ?? null,
        subject_id: experience.subject_id ?? null,
        job_id: experience.job_id ?? null,
        title: experience.title ?? null,
        description: experience.description ?? null,
        start_year: experience.start_year ?? null,
        end_year: experience.end_year ?? null,
        current: experience.current ?? false,
      };

      await userExperienceService.update(experience.id, payload);
    } catch (err) {
      console.error("[Profile] Experience save error:", err);
      toast.error("Could not save this experience.");
    }
  }

  /**
   * Education
   */
  function addEducation() {
    setDraftEducation({
      id: "draft",
      user_profile_id: profileId || "",
      start_year: null,
      end_year: null,
      degree_id: null,
      organization_id: null,
      graduated: false,
    } as any);
  }

  function cancelDraftEducation() {
    setDraftEducation(null);
  }

  function updateDraftEducation(next: UserEducation) {
    setDraftEducation(next);
  }

  async function saveDraftEducation() {
    if (!profileId || !draftEducation) return;

    const hasData =
      draftEducation.degree_id ||
      draftEducation.organization_id ||
      draftEducation.start_year ||
      draftEducation.end_year ||
      draftEducation.graduated;

    if (!hasData) {
      setDraftEducation(null);
      return;
    }

    try {
      const created = await userEducationService.create({
        user_profile_id: profileId,
        start_year: draftEducation.start_year,
        end_year: draftEducation.end_year,
        degree_id: draftEducation.degree_id,
        organization_id: draftEducation.organization_id,
        graduated: draftEducation.graduated ?? false,
      } as any);

      setEducations((prev) => [...prev, { ...draftEducation, id: created.id }]);
      setDraftEducation(null);
    } catch (err) {
      console.error("[Profile] Draft education save error:", err);
      toast.error("Could not create education.");
    }
  }

  async function removeEducation(id: string) {
    try {
      await userEducationService.delete(id);
      setEducations((prev) => prev.filter((edu) => edu.id !== id));
    } catch (err) {
      console.error("[Profile] Education delete error:", err);
      toast.error("Could not remove this education.");
    }
  }

  function updateEducation(next: UserEducation) {
    setEducations((prev) =>
      prev.map((item) => (item.id === next.id ? next : item)),
    );
  }

  async function saveEducation(education: UserEducation) {
    if (!profileId) return;

    try {
      const payload: PutUserEducation = {
        start_year: education.start_year,
        end_year: education.end_year,
        degree_id: education.degree_id,
        graduated: education.graduated,
      };

      await userEducationService.update(education.id, payload);
    } catch (err) {
      console.error("[Profile] Education save error:", err);
      toast.error("Could not save this education.");
    }
  }

  /**
   * Certifications
   */
  function addCertification() {
    setDraftCertification({
      id: "draft",
      user_profile_id: profileId || "",
      certification_id: null,
      obtained_at: null,
      expires_at: null,
    } as any);
  }

  function cancelDraftCertification() {
    setDraftCertification(null);
  }

  function updateDraftCertification(next: UserCertification) {
    setDraftCertification(next);
  }

  async function saveDraftCertification() {
    if (!profileId || !draftCertification) return;

    const hasData =
      draftCertification.certification_id ||
      draftCertification.obtained_at ||
      draftCertification.expires_at;

    if (!hasData) {
      setDraftCertification(null);
      return;
    }

    try {
      const created = await userCertificationService.create({
        user_profile_id: profileId,
        certification_id: draftCertification.certification_id,
        obtained_at: draftCertification.obtained_at,
        expires_at: draftCertification.expires_at,
      } as any);

      setCertifications((prev) => [
        ...prev,
        { ...draftCertification, id: created.id },
      ]);
      setDraftCertification(null);
    } catch (err) {
      console.error("[Profile] Draft certification save error:", err);
      toast.error("Could not create certification.");
    }
  }

  async function removeCertification(id: string) {
    try {
      await userCertificationService.delete(id);
      setCertifications((prev) => prev.filter((cert) => cert.id !== id));
    } catch (err) {
      console.error("[Profile] Certification delete error:", err);
      toast.error("Could not remove this certification.");
    }
  }

  function updateCertification(next: UserCertification) {
    setCertifications((prev) =>
      prev.map((item) => (item.id === next.id ? next : item)),
    );
  }

  async function saveCertification(certification: UserCertification) {
    if (!profileId) return;

    try {
      const payload: PutUserCertification = {
        obtained_at: certification.obtained_at,
        expires_at: certification.expires_at,
      };

      await userCertificationService.update(certification.id, payload);
    } catch (err) {
      console.error("[Profile] Certification save error:", err);
      toast.error("Could not save this certification.");
    }
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
    reader.onload = async () => {
      const base64 = reader.result as string;
      setAvatarUrl(base64);

      if (!profileId) return;

      try {
        await userProfileService.update(profileId, {
          avatar_url: base64,
        });
      } catch (err) {
        console.error("[Profile] Avatar save error:", err);
        toast.error("Could not save your avatar.");
      }
    };

    reader.readAsDataURL(file);
  }

  async function handleSave(
    silent: boolean = false,
    overrides?: {
      name?: string;
      role?: string;
      summary?: string;
    },
    overrideAvatarUrl?: string,
  ) {
    if (!profileId) {
      if (!silent) toast.error("Profile is not available.");
      return;
    }

    const activeName = overrides?.name !== undefined ? overrides.name : name;
    const activeRole = overrides?.role !== undefined ? overrides.role : role;
    const activeSummary =
      overrides?.summary !== undefined ? overrides.summary : summary;
    const activeAvatar =
      overrideAvatarUrl !== undefined ? overrideAvatarUrl : avatarUrl;

    setIsSaving(true);

    try {
      await userProfileService.update(profileId, {
        display_name: activeName,
        role: activeRole,
        biography: activeSummary,
        avatar_url: activeAvatar || "",
      });

      if (!silent) toast.success("Profile saved.");
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
    draftExperience,
    addExperience,
    cancelDraftExperience,
    updateDraftExperience,
    saveDraftExperience,
    removeExperience,
    updateExperience,
    saveExperience,

    educations,
    setEducations,
    draftEducation,
    addEducation,
    cancelDraftEducation,
    updateDraftEducation,
    saveDraftEducation,
    removeEducation,
    updateEducation,
    saveEducation,

    certifications,
    setCertifications,
    draftCertification,
    addCertification,
    cancelDraftCertification,
    updateDraftCertification,
    saveDraftCertification,
    removeCertification,
    updateCertification,
    saveCertification,

    entityModalOpen,
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

    handleSave,
    handleSlotClick,
    handleEntitySelect,
    handleAvatarChange,
    closeEntityModal,
  };
}
