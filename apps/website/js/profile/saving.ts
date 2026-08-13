import {
  profileService,
  userLanguageService,
  userSkillService,
  userExperienceService,
  educationService,
  userCertificationService,
  skillService,
} from "./services";
import {
  currentProfile,
  deletedLanguages,
  deletedSkills,
  deletedExperiences,
  deletedEducations,
  deletedCertifications,
} from "./state";
import { $, toast } from "../helpers";

export function parseLanguageLabel(label: string): string {
  const SPECIAL: Record<string, string> = {
    "Chinese (Mandarin)": "CHINESE_MANDARIN",
    "Chinese (Cantonese)": "CHINESE_CANTONESE",
    "Haitian Creole": "HAITIAN_CREOLE",
    "Ambonese Malay": "AMBONESE_MALAY",
    "Bajan Creole": "BAJAN_CREOLE",
    "Guyanese Creole": "GUYANESE_CREOLE",
    "Scottish Gaelic": "SCOTTISH_GAELIC",
    "Seychellois Creole": "SEYCHELLOIS_CREOLE",
  };
  if (SPECIAL[label]) return SPECIAL[label];
  return label.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
}

export async function resolveOrCreateSkill(
  name: string,
): Promise<string | null> {
  try {
    const list = await skillService.getAll();
    const existing = list.find(
      (s: any) => s.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) return existing.id;
  } catch (_) {}
  try {
    const res = await skillService.create({
      name: name.trim(),
      serial_number:
        "SKI-" + Math.random().toString(36).substring(2, 11).toUpperCase(),
    });
    return res.id;
  } catch (err) {
    console.error("Failed to create skill:", err);
    return null;
  }
}

export async function saveProfile() {
  const name =
    document.querySelector('[data-field="name"]')?.textContent?.trim() ||
    $('[data-editable="name"]')?.textContent?.trim() ||
    "";

  const biography =
    document.querySelector('[data-field="summary"]')?.textContent?.trim() ||
    $('[data-editable="career-summary"]')?.textContent?.trim() ||
    "";
  const role =
    document.querySelector('[data-field="role"]')?.textContent?.trim() ||
    $('[data-editable="role-title"]')?.textContent?.trim() ||
    "";

  if (!currentProfile?.id) {
    const payload = {
      savedAt: new Date().toISOString(),
      name,
      summary: biography,
      role,
    };
    localStorage.setItem("bildyx_profile_draft", JSON.stringify(payload));
    toast.info("Profile saved locally (offline)");
    return;
  }

  try {
    const promises: Promise<any>[] = [];

    const hasDeletions =
      deletedLanguages.length > 0 ||
      deletedSkills.length > 0 ||
      deletedExperiences.length > 0 ||
      deletedEducations.length > 0 ||
      deletedCertifications.length > 0;

    const profileDirtyEl = document.querySelector(
      '[data-profile-dirty="true"]',
    );
    if (profileDirtyEl) {
      promises.push(
        profileService
          .update(currentProfile.id, {
            biography: biography || null,
            role: role || null,
            display_name: name || null,
          })
          .then(() => {
            profileDirtyEl.removeAttribute("data-profile-dirty");
          }),
      );
    }

    if (deletedLanguages.length > 0) {
      promises.push(
        ...deletedLanguages.map((id) => userLanguageService.delete(id)),
      );
      deletedLanguages.length = 0;
    }
    if (deletedSkills.length > 0) {
      promises.push(...deletedSkills.map((id) => userSkillService.delete(id)));
      deletedSkills.length = 0;
    }
    if (deletedExperiences.length > 0) {
      promises.push(
        ...deletedExperiences.map((id) => userExperienceService.delete(id)),
      );
      deletedExperiences.length = 0;
    }
    if (deletedEducations.length > 0) {
      promises.push(
        ...deletedEducations.map((id) => educationService.delete(id)),
      );
      deletedEducations.length = 0;
    }
    if (deletedCertifications.length > 0) {
      promises.push(
        ...deletedCertifications.map((id) =>
          userCertificationService.delete(id),
        ),
      );
      deletedCertifications.length = 0;
    }

    const langChips = Array.from(
      document.querySelectorAll(
        '#languageChips .chip[data-dirty="true"], #languageChips .chip[data-unsaved="true"]',
      ),
    ) as HTMLElement[];
    langChips.forEach((chip) => {
      promises.push(
        (async () => {
          const id = chip.dataset.id;
          const text = chip.childNodes[0]?.textContent?.trim() || "";
          if (!text) return;

          const langName = text;
          const langEnum = parseLanguageLabel(langName);

          let levelEnum = "FLUENT";
          if (chip.classList.contains("is-native")) levelEnum = "NATIVE";
          else if (chip.classList.contains("is-fluent")) levelEnum = "FLUENT";
          else if (chip.classList.contains("is-intermediate"))
            levelEnum = "CONVERSATIONAL";

          const langData = {
            language: langEnum as any,
            proficiency: levelEnum as any,
          };

          if (id && chip.dataset.unsaved !== "true") {
            await userLanguageService.update(id, langData);
          } else {
            const newLang = await userLanguageService.create({
              user_profile_id: currentProfile.id,
              ...langData,
            });
            chip.dataset.id = newLang.id;
            chip.dataset.unsaved = "false";
          }
          delete chip.dataset.dirty;
        })(),
      );
    });

    const skillChips = Array.from(
      document.querySelectorAll(
        '#skillChips .chip[data-dirty="true"], #skillChips .chip[data-unsaved="true"]',
      ),
    ) as HTMLElement[];
    skillChips.forEach((chip) => {
      promises.push(
        (async () => {
          const id = chip.dataset.id;
          const skillName = chip.childNodes[0]?.textContent?.trim() || "";
          if (!skillName) return;

          const skillId = await resolveOrCreateSkill(skillName);
          if (!skillId) return;

          const skillData = { skill_id: skillId, level: "INTERMEDIATE" as any };

          if (id && chip.dataset.unsaved !== "true") {
            await userSkillService.update(id, skillData);
          } else {
            const newSkill = await userSkillService.create({
              user_profile_id: currentProfile.id,
              ...skillData,
            });
            chip.dataset.id = newSkill.id;
            chip.dataset.unsaved = "false";
          }
          delete chip.dataset.dirty;
        })(),
      );
    });

    const expCards = Array.from(
      document.querySelectorAll(
        '#experienceList [data-entry="experience"][data-dirty="true"], #experienceList [data-entry="experience"][data-unsaved="true"]',
      ),
    ) as HTMLElement[];
    expCards.forEach((card) => {
      promises.push(
        (async () => {
          const roleTitle =
            card
              .querySelector<HTMLInputElement>(".exp-role-title")
              ?.value.trim() || "";
          const summary = card.querySelector("textarea")?.value.trim() || "";
          const startYearVal =
            card.querySelector<HTMLInputElement>(".start-year")?.value.trim() ||
            "";
          const endYearVal =
            card.querySelector<HTMLInputElement>(".end-year")?.value.trim() ||
            "";
          const currentChecked =
            card.querySelector<HTMLInputElement>(".exp-current")?.checked ||
            false;

          const startYear = startYearVal
            ? parseInt(startYearVal, 10) || null
            : null;
          const endYear = currentChecked
            ? null
            : endYearVal
              ? parseInt(endYearVal, 10) || null
              : null;

          const companySlot = card.querySelector<HTMLElement>(
            '[data-card-slot="company-card"]',
          );
          const roleSlot = card.querySelector<HTMLElement>(
            '[data-card-slot="role-card"]',
          );
          const subjectSlot = card.querySelector<HTMLElement>(
            '[data-card-slot="subject-card"]',
          );

          let orgId =
            companySlot?.dataset.orgId ||
            companySlot?.dataset.universityId ||
            null;

          let jobId = roleSlot?.dataset.roleId || null;
          let subjectId = subjectSlot?.dataset.subjectId || null;

          console.log("ROLE SLOT");
          console.log(jobId);

          const expData = {
            organization_id: orgId,
            job_id: jobId,
            subject_id: subjectId,
            title: roleTitle || null,
            description: summary || null,
            start_year: startYear,
            end_year: endYear,
            current: currentChecked,
          };

          console.log(roleSlot, expData);

          const id = card.dataset.id;
          if (id && card.dataset.unsaved !== "true") {
            await userExperienceService.update(id, expData);
          } else {
            const newExp = await userExperienceService.create({
              user_profile_id: currentProfile.id,
              ...expData,
            });
            card.dataset.id = newExp.id;
            card.dataset.unsaved = "false";
          }
          delete card.dataset.dirty;
        })(),
      );
    });

    const eduCards = Array.from(
      document.querySelectorAll(
        '#educationList [data-entry="education"][data-dirty="true"], #educationList [data-entry="education"][data-unsaved="true"]',
      ),
    ) as HTMLElement[];

    eduCards.forEach((card) => {
      promises.push(
        (async () => {
          const uniName = card
            .querySelector(".edu-university")
            ?.textContent?.trim();
          const degName = card
            .querySelector(".edu-degree")
            ?.textContent?.trim();

          const rawStart =
            card.querySelector<HTMLInputElement>(".start-year")?.value;
          const rawEnd =
            card.querySelector<HTMLInputElement>(".end-year")?.value;

          // Convertit proprement en nombre ou null (évite NaN)
          const startYear =
            rawStart && !isNaN(parseInt(rawStart)) ? parseInt(rawStart) : null;
          const endYear =
            rawEnd && !isNaN(parseInt(rawEnd)) ? parseInt(rawEnd) : null;

          const uniSlot = card.querySelector<HTMLElement>(
            '[data-card-slot="university-card"]',
          );
          const degSlot = card.querySelector<HTMLElement>(
            '[data-card-slot="degree-card"]',
          );

          // S'assure que si c'est vide/undefined, ça devient strictement `null`
          let uniId = uniSlot?.dataset.universityId?.trim() || null;
          let degId = degSlot?.dataset.degreeId?.trim() || null;

          const graduated =
            card.querySelector<HTMLInputElement>(".edu-graduated")?.checked ||
            false;

          const eduData = {
            user_profile_id: currentProfile.id,
            organization_id: uniId || null,
            degree_id: degId || null,
            start_year: startYear,
            end_year: endYear,
            graduated,
          };

          const id = card.dataset.id;
          if (id && card.dataset.unsaved !== "true") {
            const { user_profile_id, ...updatePayload } = eduData;
            await educationService.update(id, updatePayload);
          } else {
            const newEdu = await educationService.create(eduData);
            card.dataset.id = newEdu.id;
            card.dataset.unsaved = "false";
          }
          delete card.dataset.dirty;
        })(),
      );
    });

    const certCards = Array.from(
      document.querySelectorAll(
        '.cert-grid [data-entry="certification"][data-dirty="true"], #certificationList [data-entry="certification"][data-dirty="true"], .cert-grid [data-entry="certification"][data-unsaved="true"], #certificationList [data-entry="certification"][data-unsaved="true"]',
      ),
    ) as HTMLElement[];
    certCards.forEach((card) => {
      promises.push(
        (async () => {
          const certName = card
            .querySelector(".cert-name")
            ?.textContent?.trim();
          const issuerName =
            card.querySelector(".cert-issuer")?.textContent?.trim() || "";

          const slot = card.querySelector<HTMLElement>(
            '[data-card-slot="certification-card"]',
          );
          let certId = slot?.dataset.certificationId || null;

          const obtainedVal =
            card.querySelector<HTMLInputElement>(".cert-obtained-at")?.value;
          const expiresVal =
            card.querySelector<HTMLInputElement>(".cert-expires-at")?.value;

          const obtainedAt = obtainedVal ? new Date(obtainedVal) : null;
          const expiresAt = expiresVal ? new Date(expiresVal) : null;

          const id = card.dataset.id;
          if (certId) {
            if (id && card.dataset.unsaved !== "true") {
              await userCertificationService.update(id, {
                obtained_at: obtainedAt,
                expires_at: expiresAt,
              });
            } else {
              const newUC = await userCertificationService.create({
                user_profile_id: currentProfile.id,
                certification_id: certId,
                obtained_at: obtainedAt,
                expires_at: expiresAt,
              });
              card.dataset.id = newUC.id;
              card.dataset.unsaved = "false";
            }
          } else {
            if (id && card.dataset.unsaved !== "true") {
              await userCertificationService.delete(id);
              card.dataset.unsaved = "true";
              delete card.dataset.id;
            }
          }
          delete card.dataset.dirty;
        })(),
      );
    });

    if (promises.length === 0 && !hasDeletions) {
      return;
    }

    await Promise.all(promises);
    sessionStorage.removeItem("user_experience_keywords");
    sessionStorage.removeItem("user_work_org_ids");
    toast.success("Profile saved");
  } catch (err) {
    console.error("[profile.ts] Save profile error:", err);
    toast.error("Failed to sync with API.");
  }
}
