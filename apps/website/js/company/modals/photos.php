<template id="modal-photos">
    <h2>Add Photos</h2>
    <p>Upload photos of your workspace, team, or culture.</p>

    <div class="ca-image-upload-wrapper">
        <button class="upload" type="button" data-field="uploadButton">
            <b>Click to upload photo</b>
            <small>JPG, PNG up to 5MB</small>
        </button>

        <input
            type="file"
            data-field="teamPhotoFile"
            accept="image/jpeg,image/png"
            style="display: none;" />

        <div
            class="ca-image-preview-area"
            data-field="previewArea"
            style="display: none; align-items: center; gap: 14px; margin-top: 8px;">

            <img
                class="ca-preview-img"
                data-field="previewImg"
                src=""
                style="width: 120px; height: 90px; border-radius: 6px; object-fit: cover; border: 2px solid #cbd5e1;" />

            <button type="button" class="ca-toggle-btn" data-action="changeImage">
                Change
            </button>

            <button
                type="button"
                class="ca-toggle-btn"
                data-action="removeImage"
                style="border-color: #fecaca; color: #ef4444;">
                Remove
            </button>
        </div>
    </div>

    <footer>
        <button data-close-modal>Cancel</button>
        <button class="primary" data-add-photo>Add Photo</button>
    </footer>
</template>