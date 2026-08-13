<template id="modal-office">
    <h2>Add City</h2>
    <p class="ca-modal-lead">Type at least 3 characters to search for a city.</p>

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

    <label style="margin-top: 14px;">Type of Office</label>

    <select
        data-field="officeType"
        style="width: 100%; min-height: 42px; border-radius: 8px; border: 1px solid #d7dce8; padding: 0 12px; font-size: 14px; color: #1e293b; background: #fff; margin-top: 6px; margin-bottom: 16px;">
        <option value="" disabled selected>Select type of office</option>
        <option value="Head Office">Head Office</option>
        <option value="Back Office">Back Office</option>
        <option value="Customer Support Center">Customer Support Center</option>
        <option value="Data Center">Data Center</option>
        <option value="Delivery Center">Delivery Center</option>
        <option value="Distribution/Fulfillment Center">Distribution/Fulfillment Center</option>
        <option value="Headquarters">Headquarters</option>
        <option value="Hub/Depot/Terminal">Hub/Depot/Terminal</option>
        <option value="Liaison/Representative Office">Liaison/Representative Office</option>
        <option value="Management/Business Operations">Management/Business Operations</option>
        <option value="Manufacturing Plant/Factory/Facility">Manufacturing Plant/Factory/Facility</option>
        <option value="Network Operations Center (NOC)/Control Center">Network Operations Center (NOC)/Control Center</option>
        <option value="Payments Hub">Payments Hub</option>
        <option value="Procurement/Sourcing Hub">Procurement/Sourcing Hub</option>
        <option value="R&amp;D Center/Lab/Incubator">R&amp;D Center/Lab/Incubator</option>
        <option value="Regional Headquarters">Regional Headquarters</option>
        <option value="Sales/Business Development">Sales/Business Development</option>
        <option value="Satellite/Branch Office">Satellite/Branch Office</option>
        <option value="Shared Services Center (SSC)">Shared Services Center (SSC)</option>
        <option value="Showroom">Showroom</option>
        <option value="Software Development Center">Software Development Center</option>
        <option value="Studio">Studio</option>
        <option value="Tax/Treasury Center">Tax/Treasury Center</option>
        <option value="Training Center">Training Center</option>
    </select>

    <footer>
        <button class="ca-cancel" type="button" data-close-modal>Cancel</button>
        <button class="ca-primary" type="button" data-add-office>Add City</button>
    </footer>
</template>