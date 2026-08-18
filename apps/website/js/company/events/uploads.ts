export function initUploads(): void {
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;

    const changeButton = target.closest<HTMLElement>(
      '[data-action="changeImage"]',
    );

    if (!changeButton) {
      return;
    }

    const modal = changeButton.closest(".ca-modal");

    if (!modal) {
      return;
    }

    const fileInput = modal.querySelector<HTMLInputElement>(
      '[data-field="memberAvatar"]',
    );

    if (!fileInput) {
      console.error("Image file input not found");
      return;
    }

    fileInput.click();
  });

  document.addEventListener("change", (event) => {
    const target = event.target as HTMLElement;

    const input = target.closest<HTMLInputElement>(
      '[data-field="memberAvatar"]',
    );

    if (!input || !input.files?.[0]) {
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      input.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB.");
      input.value = "";
      return;
    }

    const modal = input.closest(".ca-modal");

    if (!modal) {
      return;
    }

    const preview = modal.querySelector<HTMLImageElement>(
      '[data-field="previewImg"]',
    );

    const previewArea = modal.querySelector<HTMLElement>(
      '[data-field="previewArea"]',
    );

    if (!preview) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      preview.src = reader.result as string;

      if (previewArea) {
        previewArea.style.display = "flex";
      } else {
        preview.style.display = "";
      }
    };

    reader.readAsDataURL(file);
  });
}
