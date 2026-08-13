<template id="modal-edit-member">
    <h2>Edit Team Member</h2>
    <p>Update job title or profile image for this team member.</p>

    <input type="hidden" data-field="memberId" />

    <label>Name</label>
    <input data-field="memberName" disabled style="background-color: #f8fafc; color: #94a3b8; cursor: not-allowed;" />

    <label>Job Title</label>
    <div class="ca-cselect" data-field="job">
        <div class="ca-cselect-trigger" tabindex="0" role="combobox">
            <span class="ca-cselect-val is-placeholder">Select job...</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
            </svg>
        </div>

        <div class="ca-cselect-panel" role="listbox">
            <div style="padding: 8px 12px; border-bottom: 1px solid #eee; position: sticky; top: 0; background: #fff; z-index: 10;">
                <div class="ca-search-wrap" style="margin-top: 0;">
                    <input class="ca-search-input" data-job-search placeholder="Search job..." style="min-height: 34px; font-size: 13px; padding-left: 12px; padding-right: 34px;">
                    <svg class="ca-search-icon" style="left: auto; right: 11px;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </div>
            </div>

            <div class="ca-cselect-opts-container" data-field="jobOpts"></div>
        </div>

        <input type="hidden" data-cselect-value data-field="jobId" />
    </div>

    <label>Profile Image</label>

    <div style="display: flex; align-items: center; gap: 14px; margin-top: 8px;">
        <img data-field="previewImg" src="" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid #cbd5e1;" />

        <input type="file" data-field="memberAvatar" accept="image/*" style="display: none;" />

        <button type="button" class="ca-toggle-btn" data-action="changeImage" style="display: inline-flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Change Image
        </button>
    </div>

    <footer>
        <button data-close-modal>Cancel</button>
        <button class="primary" data-update-member>Save Changes</button>
    </footer>
</template>