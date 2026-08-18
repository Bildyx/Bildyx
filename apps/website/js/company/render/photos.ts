import { $, $$ } from "../dom";
import { state } from "../state";

const esc = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export function renderPhotos() {
  const container = $<HTMLElement>("#caPhotos");
  const counter = $<HTMLElement>("#caPhotosCount");

  if (!container) {
    return;
  }

  if (counter) {
    counter.textContent = `${state.photos.length}/10`;
  }

  if (!state.photos.length) {
    container.innerHTML = "No photos added yet.";
    return;
  }

  container.innerHTML = state.photos
    .map(
      (photo) => `
          <div class="ca-photo">
            <img
              src="${esc(photo.url)}"
              alt="${esc(photo.name)}"
            >
          </div>
        `,
    )
    .join("");
}
