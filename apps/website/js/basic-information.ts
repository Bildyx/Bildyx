import { UserProfileService } from "../services/user-profile.service";
import { getSession } from "./helpers";

const profileService = new UserProfileService();

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(
    "#basicInfoForm",
  ) as HTMLFormElement | null;

  // ─── Option cards (radio / checkbox) ─────────────────────
  document
    .querySelectorAll(
      '.bi-option input[type="radio"], .bi-option input[type="checkbox"]',
    )
    .forEach((element) => {
      const input = element as HTMLInputElement;
      input.addEventListener("change", () => {
        if (input.type === "radio") {
          document
            .querySelectorAll(`input[name="${CSS.escape(input.name)}"]`)
            .forEach((radio) => {
              radio.closest(".bi-option")?.classList.remove("is-selected");
            });
        }

        input
          .closest(".bi-option")
          ?.classList.toggle("is-selected", input.checked);
      });
    });

  // ─── Chips (ajouter avec Entrée) ──────────────────────────
  document.querySelectorAll(".bi-add-input").forEach((element) => {
    const input = element as HTMLInputElement;
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();

      const value = input.value.trim();
      const targetId = input.dataset.chipTarget;
      const target = targetId ? document.getElementById(targetId) : null;

      if (!value || !target) return;

      const chip = document.createElement("span");
      chip.textContent = `${value} `;

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.setAttribute("aria-label", `Remove ${value}`);
      removeButton.textContent = "×";

      chip.appendChild(removeButton);
      target.appendChild(chip);
      input.value = "";
    });
  });

  // ─── Supprimer un chip ────────────────────────────────────
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const button = target.closest(".bi-chip-list button");
    if (!button) return;
    button.closest("span")?.remove();
  });

  if (!form) return;

  // ─── Reset ────────────────────────────────────────────────
  form.addEventListener("reset", () => {
    setTimeout(() => {
      document.querySelectorAll(".bi-option").forEach((option) => {
        const control = option.querySelector(
          'input[type="radio"], input[type="checkbox"]',
        ) as HTMLInputElement | null;
        option.classList.toggle("is-selected", Boolean(control?.checked));
      });
    }, 0);
  });

  // ─── Lecture des données du formulaire ────────────────────
  function collectFormData() {
    const data: Record<string, any> = {};

    // Champs texte simples
    ["firstJob", "secondJob", "country"].forEach((name) => {
      const el = form?.querySelector(
        `[name="${name}"]`,
      ) as HTMLInputElement | null;
      if (el) data[name] = el.value.trim();
    });

    // Chips
    ["cities", "languages", "countries", "blockedCompanies"].forEach((id) => {
      const container = document.getElementById(id);
      if (!container) return;
      data[id] = Array.from(container.querySelectorAll("span"))
        .map((span) => span.childNodes[0]?.textContent?.trim())
        .filter(Boolean);
    });

    // Radios
    [
      "sectorChoice",
      "companyRank",
      "origin",
      "companyType",
      "jobPreference",
      "startupInterest",
    ].forEach((name) => {
      const checked = form?.querySelector(
        `[name="${name}"]:checked`,
      ) as HTMLInputElement | null;
      if (checked)
        data[name] =
          checked.value || checked.closest(".bi-option")?.textContent?.trim();
    });

    // Checkboxes (multi-select) — growth, company size
    const growthChecks = Array.from(
      form?.querySelectorAll('[name="growth"]:checked') || [],
    )
      .map((cb) => cb.closest(".bi-option")?.textContent?.trim())
      .filter(Boolean);
    if (growthChecks.length) data.growth = growthChecks;

    // Company size checkboxes (sans name explicite dans le HTML)
    const sizeCheckboxes =
      form?.querySelectorAll('#q10 input[type="checkbox"]') || [];
    data.companySizes = Array.from(sizeCheckboxes)
      .filter((element) => (element as HTMLInputElement).checked)
      .map((cb) => cb.closest(".bi-option")?.textContent?.trim())
      .filter(Boolean);

    // Salaire
    const salaryInputs =
      form?.querySelectorAll('#q14 input[type="number"]') || [];
    const salaryBaseInput = salaryInputs[0] as HTMLInputElement | null;
    const salaryBonusInput = salaryInputs[1] as HTMLInputElement | null;
    if (salaryBaseInput) data.salaryBase = Number(salaryBaseInput.value) || 0;
    if (salaryBonusInput)
      data.salaryBonus = Number(salaryBonusInput.value) || 0;

    return data;
  }

  // ─── Soumission du formulaire ─────────────────────────────
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = form.querySelector(
      ".bi-button--primary",
    ) as HTMLButtonElement | null;
    if (!submitButton) return;

    const originalText = submitButton.textContent;
    submitButton.textContent = "...";
    submitButton.disabled = true;

    const basicInformation = collectFormData();

    localStorage.setItem(
      "bildyx_basic_information",
      JSON.stringify(basicInformation),
    );

    try {
      const session = getSession();

      if (session?.profileId) {
        let existingMetadata: Record<string, any> = {};
        const profile = await profileService.getById(session.profileId);
        existingMetadata = (profile?.metadata as Record<string, any>) ?? {};

        await profileService.update(session.profileId, {
          metadata: {
            ...existingMetadata,
            basicInformation,
          },
        });

        submitButton.textContent = "Saved ✓";
        setTimeout(() => {
          submitButton.textContent = originalText;
          submitButton.disabled = false;
        }, 1500);
        return;
      } else {
        throw new Error("No session found");
      }
    } catch (err) {
      console.error("[basic-information.ts] Service save error:", err);
    } finally {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  });

  // ─── Restaurer les données locales au chargement ──────────
  function restoreLocalData() {
    const saved = localStorage.getItem("bildyx_basic_information");
    if (!saved) return;
    const data = JSON.parse(saved);

    // Restaurer les champs texte simples
    ["firstJob", "secondJob", "country"].forEach((name) => {
      const el = form?.querySelector(
        `[name="${name}"]`,
      ) as HTMLInputElement | null;
      if (el && data[name]) el.value = data[name];
    });
  }

  // ─── Charger les données depuis le profil API ─────────────
  async function loadFromProfile() {
    try {
      const session = getSession();
      if (!session?.profileId) {
        restoreLocalData();
        return;
      }

      const profile = await profileService.getById(session.profileId);
      const bi = (profile?.metadata as any)?.basicInformation;
      if (!bi) return;

      // Restaurer les champs texte
      ["firstJob", "secondJob", "country"].forEach((name) => {
        const el = form?.querySelector(
          `[name="${name}"]`,
        ) as HTMLInputElement | null;
        if (el && bi[name]) el.value = bi[name];
      });

      // Restaurer le salaire
      const salaryInputs =
        form?.querySelectorAll('#q14 input[type="number"]') || [];
      const salaryBaseInput = salaryInputs[0] as HTMLInputElement | null;
      const salaryBonusInput = salaryInputs[1] as HTMLInputElement | null;
      if (bi.salaryBase && salaryBaseInput)
        salaryBaseInput.value = bi.salaryBase;
      if (bi.salaryBonus && salaryBonusInput)
        salaryBonusInput.value = bi.salaryBonus;
    } catch (err: any) {
      console.warn(
        "[basic-information.ts] Could not load profile data:",
        err?.message,
      );
      // Fallback sur localStorage
      restoreLocalData();
    }
  }

  loadFromProfile();
});
