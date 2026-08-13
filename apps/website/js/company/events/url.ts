import { $ } from "../dom";
import { getSession, toast } from "../../helpers";
import { OrganizationService } from "../../../services/organization.service";

const organizationService = new OrganizationService();

export function initProfileUrl(): void {
  const editUrlBtn = $<HTMLButtonElement>(".ca-url-edit-btn");
  const cancelUrlBtn = $<HTMLButtonElement>(".ca-url-cancel-btn");
  const saveUrlBtn = $<HTMLButtonElement>(".ca-url-save-btn");

  const urlDisplay = $<HTMLElement>(".ca-profile-url-display");

  const urlEdit = $<HTMLElement>(".ca-profile-url-edit");

  const urlInput = $<HTMLInputElement>(".ca-url-input");

  const urlText = $<HTMLElement>("[data-profile-url-text]");

  if (
    !editUrlBtn ||
    !cancelUrlBtn ||
    !saveUrlBtn ||
    !urlDisplay ||
    !urlEdit ||
    !urlInput ||
    !urlText
  ) {
    return;
  }

  /*
   * Open URL editor
   */
  editUrlBtn.addEventListener("click", () => {
    urlInput.value = urlText.textContent?.trim() ?? "";

    urlDisplay.style.display = "none";
    urlEdit.style.display = "flex";

    urlInput.focus();
    urlInput.select();
  });

  /*
   * Cancel URL edition
   */
  cancelUrlBtn.addEventListener("click", () => {
    urlEdit.style.display = "none";
    urlDisplay.style.display = "flex";

    // Restore the current saved value
    urlInput.value = urlText.textContent?.trim() ?? "";
  });

  /*
   * Save URL
   */
  saveUrlBtn.addEventListener("click", async () => {
    const newUrl = urlInput.value
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-");

    if (!newUrl) {
      toast.warning("Profile URL slug cannot be empty.");
      return;
    }

    const session = getSession();
    const companyId = session?.companyId;

    if (!companyId) {
      toast.error("Unable to identify your company.");
      return;
    }

    try {
      saveUrlBtn.disabled = true;
      saveUrlBtn.style.opacity = "0.5";

      const updated = await organizationService.update(companyId, {
        profile_url: newUrl,
      });

      /*
       * Update local display
       */
      urlText.textContent = updated.profile_url || newUrl;

      /*
       * Close editor
       */
      urlEdit.style.display = "none";
      urlDisplay.style.display = "flex";

      toast.success("Profile URL updated successfully.");
    } catch (error) {
      console.error("Failed to update Profile URL:", error);

      toast.error("Failed to update Profile URL.");
    } finally {
      saveUrlBtn.disabled = false;
      saveUrlBtn.style.opacity = "";
    }
  });

  /*
   * Keyboard shortcuts
   */
  urlInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveUrlBtn.click();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelUrlBtn.click();
    }
  });
}
