<template id="modal-team">
  <h2 id="modalTeamTitle">Add New Team</h2>
  <p id="modalTeamLead">Fill in the details to create a new team.</p>
  <input type="hidden" data-field="teamId" />

  <label>Team Type</label>
  <div class="ca-cselect" data-field="teamType">
    <div class="ca-cselect-trigger" tabindex="0" role="combobox">
      <span class="ca-cselect-val is-placeholder">Select team type</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>

    <div class="ca-cselect-panel" role="listbox">
      <div class="ca-cselect-group">
        <div class="ca-cselect-group-label">Cross-Functional Teams</div>
        <div class="ca-cselect-opt" data-value="Customer Success" role="option">Customer Success</div>
        <div class="ca-cselect-opt" data-value="Growth &amp; Product Development" role="option">Growth &amp; Product Development</div>
        <div class="ca-cselect-opt" data-value="Innovation &amp; Project-Based" role="option">Innovation &amp; Project-Based</div>
        <div class="ca-cselect-opt" data-value="Market Expansion" role="option">Market Expansion</div>
        <div class="ca-cselect-opt" data-value="Process Improvement" role="option">Process Improvement</div>
      </div>

      <div class="ca-cselect-group">
        <div class="ca-cselect-group-label">Functional Teams</div>
        <div class="ca-cselect-opt" data-value="Administration" role="option">Administration</div>
        <div class="ca-cselect-opt" data-value="Business Planning and Strategy" role="option">Business Planning and Strategy</div>
        <div class="ca-cselect-opt" data-value="Customer Support" role="option">Customer Support</div>
        <div class="ca-cselect-opt" data-value="Data &amp; Analytics" role="option">Data &amp; Analytics</div>
        <div class="ca-cselect-opt" data-value="Design &amp; UX" role="option">Design &amp; UX</div>
        <div class="ca-cselect-opt" data-value="Engineering &amp; Development" role="option">Engineering &amp; Development</div>
        <div class="ca-cselect-opt" data-value="Finance &amp; Accounting" role="option">Finance &amp; Accounting</div>
        <div class="ca-cselect-opt" data-value="Human Resources" role="option">Human Resources</div>
        <div class="ca-cselect-opt" data-value="Legal &amp; Compliance" role="option">Legal &amp; Compliance</div>
        <div class="ca-cselect-opt" data-value="Marketing &amp; Communications" role="option">Marketing &amp; Communications</div>
        <div class="ca-cselect-opt" data-value="Operations" role="option">Operations</div>
        <div class="ca-cselect-opt" data-value="Product Management" role="option">Product Management</div>
        <div class="ca-cselect-opt" data-value="Quality Assurance" role="option">Quality Assurance</div>
        <div class="ca-cselect-opt" data-value="Research &amp; Development" role="option">Research &amp; Development</div>
        <div class="ca-cselect-opt" data-value="Sales" role="option">Sales</div>
        <div class="ca-cselect-opt" data-value="Security &amp; IT" role="option">Security &amp; IT</div>
      </div>
    </div>

    <input type="hidden" data-cselect-value />
  </div>

  <label>Name of Team</label>
  <input data-field="teamName" maxlength="35" placeholder="e.g. Team Epsilon">
  <small class="ca-counter">0/35</small>

  <label>Visibility</label>
  <select data-field="visibility">
    <option value="PUBLIC">Public Team</option>
    <option value="LIMITED">Limited Visibility (Team appears, but product names and city are not known)</option>
    <option value="PRIVATE">Private Team (Only accessible by link)</option>
  </select>

  <label>City</label>
  <div class="ca-cselect" data-field="city">
    <div class="ca-cselect-trigger" tabindex="0" role="combobox">
      <span class="ca-cselect-val is-placeholder">Select city</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>

    <div class="ca-cselect-panel" role="listbox">
      <div style="padding: 8px 12px; border-bottom: 1px solid #eee; position: sticky; top: 0; background: #fff; z-index: 10;">
        <div class="ca-search-wrap" style="margin-top: 0;">
          <input class="ca-search-input" data-city-search placeholder="Search city..." style="min-height: 34px; font-size: 13px; padding-left: 12px; padding-right: 34px;">
          <svg class="ca-search-icon" style="left: auto; right: 11px;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>
      <div class="ca-cselect-opts-container"></div>
    </div>

    <input type="hidden" data-cselect-value />
  </div>

  <label>Brand</label>
  <select data-field="brand">
    <option>Select brand (optional)</option>
  </select>

  <label>Product / Service</label>
  <select data-field="product">
    <option value="None">None</option>
    <option value="Company-Wide (Internal Operations)">Company-Wide (Internal Operations)</option>
    <option value="Marketing Software">Marketing Software</option>
    <option value="ERP Systems">ERP Systems</option>
    <option value="Sales Software">Sales Software</option>
  </select>

  <footer>
    <button class="ca-danger-button" type="button" data-delete-team style="display: none; margin-right: auto; background: #fff !important; border: 1px solid #fecaca !important; color: #ef4444 !important; min-height: 38px; border-radius: 6px; padding: 0 16px; font-weight: 800; cursor: pointer;">Delete</button>
    <button data-close-modal>Cancel</button>
    <button class="primary" data-save-team-btn>Create Team</button>
  </footer>
</template>