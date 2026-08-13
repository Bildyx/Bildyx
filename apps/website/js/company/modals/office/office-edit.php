<template id="modal-edit-office">
    <h2 id="companyAdminModalTitle">Edit City</h2>
    <p class="ca-modal-lead">Update or remove this office location.</p>

    <input type="hidden" data-field="officeId" />

    <label>City</label>

    <div class="ca-cselect" data-field="office-city">
        <div class="ca-cselect-trigger" tabindex="0" role="combobox">
            <span class="ca-cselect-val is-placeholder">Select city</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
            </svg>
        </div>

        <div class="ca-cselect-panel" role="listbox">
            <div style="padding: 8px 12px; border-bottom: 1px solid #eee; position: sticky; top: 0; background: #fff; z-index: 10;">
                <div class="ca-search-wrap" style="margin-top: 0;">
                    <input
                        class="ca-search-input"
                        data-city-search
                        placeholder="Search city..."
                        style="min-height: 34px; font-size: 13px; padding-left: 12px; padding-right: 34px;">

                    <svg
                        class="ca-search-icon"
                        style="left: auto; right: 11px;"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </div>
            </div>

            <div class="ca-cselect-opts-container"></div>
        </div>

        <input type="hidden" data-cselect-value />
    </div>

    <footer>
        <button class="ca-danger-button" type="button" data-delete-office>Delete</button>
        <button class="ca-cancel" type="button" data-close-modal>Cancel</button>
        <button class="ca-primary" type="button" data-update-office>Update City</button>
    </footer>
</template>