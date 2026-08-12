<?php
$pageTitle = 'Company Admin — Bildyx';
$pageDescription = 'Create and manage your connected company profile on Bildyx.';
$pageScript = 'js/company_con_admin.ts';
$bodyClass = 'company-page company-admin-page';
$showMainNav = false;
$headerMode = 'company-admin';
$headerCenterLabel = 'F-CAREER';
$headerBackHref = 'company_con_admin.php';
$headerBackLabel = '‹ Preview company page';
$headerStatusLabel = 'Unpublished';

ob_start();
require __DIR__ . '/includes/header.php';
$sharedHeader = ob_get_clean();

$bootstrapIcons = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />';
$adminStylesheet = '<link rel="stylesheet" href="css/company_con_admin.css" />';

echo str_replace(
  '</head>',
  " {$bootstrapIcons}\n {$adminStylesheet}\n</head>",
  $sharedHeader
); ?>
<script>
  (function() {
    const raw = sessionStorage.getItem('bildyx_session') || localStorage.getItem('bildyx_session');
    if (!raw) return;
    try {
      const s = JSON.parse(raw);
      const t = String(s.accountType || s.role || '').toLowerCase().replace(/[\s_-]/g, '');
      if (t && t !== 'company') location.href = 'profile.php';
    } catch (e) {}
  })();
</script>
<main class="ca-page">

  <div class="ca-shell">
    <aside class="ca-left">
      <section class="ca-profile-box"><button class="ca-logo" type="button" data-open-modal="logo" id="caCompanyLogoBtn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg><small>Upload Logo</small></button>
        <h1 contenteditable="true" data-company-name>F-Career</h1>
        <p>Company Profile</p><small>Profile URL<br><b>bildyx.com/f-career</b></small>
      </section>
      <h2>Parent Company</h2>
      <div id="caParentCompanyContainer" style="width: 100%;">
        <button class="ca-parent" type="button" data-open-modal="parent">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building2 h-8 w-8 text-primary-foreground/30">
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
            <path d="M10 6h4"></path>
            <path d="M10 10h4"></path>
            <path d="M10 14h4"></path>
            <path d="M10 18h4"></path>
          </svg>
          <span>Add your parent company if applicable</span></button>
      </div>
    </aside>
    <section class="ca-main">
      <header class="ca-builder"><span></span><b>Profile Builder</b>
        <p>— Start building your company profile by adding teams, products, and more</p>
      </header>
      <section>
        <div class="ca-section-head">
          <h2>Our Teams</h2>
          <div class="ca-edit-actions" data-edit-actions>
            <button class="ca-edit-btn" type="button" data-edit-start>
              <i class="bi bi-pencil" aria-hidden="true"></i>
              <span>Edit</span>
            </button>
            <button class="ca-save-btn" type="button" data-edit-save>
              <i class="bi bi-check-lg" aria-hidden="true"></i>
              <span>Save</span>
            </button>
            <button class="ca-cancel-btn" type="button" data-edit-cancel>
              <i class="bi bi-x-lg" aria-hidden="true"></i>
              <span>Cancel</span>
            </button>
          </div>
        </div>
        <div class="ca-team-panel">
          <!-- Skeleton Loader -->
          <div class="ca-skeleton-loader" id="caSkeletonLoader" style="display: none; padding: 18px; width: 100%;">
            <div style="display: flex; gap: 12px; margin-bottom: 20px; align-items: center;">
              <div class="skeleton-pill" style="width: 32px; height: 32px; background: #e2e8f0; border-radius: 50%;"></div>
              <div class="skeleton-pill" style="width: 80px; height: 32px; background: #e2e8f0; border-radius: 999px;"></div>
              <div class="skeleton-pill" style="width: 100px; height: 32px; background: #e2e8f0; border-radius: 999px;"></div>
              <div class="skeleton-pill" style="width: 70px; height: 32px; background: #e2e8f0; border-radius: 999px;"></div>
              <div class="skeleton-pill" style="width: 32px; height: 32px; background: #e2e8f0; border-radius: 50%;"></div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px;">
              <div class="skeleton-card" style="height: 92px; background: #e2e8f0; border-radius: 12px;"></div>
              <div class="skeleton-card" style="height: 92px; background: #e2e8f0; border-radius: 12px;"></div>
              <div class="skeleton-card" style="height: 92px; background: #e2e8f0; border-radius: 12px;"></div>
              <div class="skeleton-card" style="height: 92px; background: #e2e8f0; border-radius: 12px;"></div>
            </div>
          </div>
          <!-- Real Content -->
          <div class="ca-team-main" id="caTeamRealContent">
            <div class="ca-tabs-wrapper">
              <button class="ca-tab-arrow left" type="button">←</button>
              <div class="ca-tabs" id="caTeamTabs"></div>
              <button class="ca-tab-arrow right" type="button">→</button>
            </div>
            <div class="ca-actions" style="margin-top: 14px;">
              <button data-open-modal="team" style="border: 1px dashed var(--ca-blue); color: var(--ca-blue); border-radius: 999px; min-height: 34px; padding: 0 16px; font-weight: bold; background: transparent;">+ Add New Team</button>
              <button data-open-modal="member" style="border: 1px dashed #cbd5e1; color: #0f172a; border-radius: 999px; min-height: 34px; padding: 0 16px; font-weight: bold; background: transparent; display: inline-flex; align-items: center; gap: 6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-right: 2px;">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                Add Team Members
              </button>
            </div>
            <div class="ca-members" id="caMembers">
              <div class="ca-empty">No team members added yet. Use “Add Team Members” to build this team.</div>
            </div>
            <div class="ca-sub">
              <h3>Our Offices</h3><button data-open-modal="city">+ Add City</button>
            </div>
            <div class="ca-chips" id="caOffices"></div>
            <div class="ca-sub">
              <h3>Main Products / Services</h3>
              <div><button data-open-modal="product">+ Add Product/Service</button><button data-open-modal="brand">+ Add Brand</button></div>
            </div>
            <div class="ca-chips" id="caProducts"></div>
          </div>
          <aside class="ca-profile-side">
            <div>
              <h3>Team Profile</h3><button data-open-modal="profile" data-profile-edit-button>+ Add</button>
            </div>
            <div id="caTeamProfile">
              <p>No team profile added yet.</p>
            </div>
            <footer><button class="is-active" data-mode="people">People</button><button data-mode="operate">How We Operate</button></footer>
          </aside>
        </div>
      </section>
      <section class="ca-block">
        <header><span>Our Product &amp; Service Portfolio</span><button data-open-modal="product">+ Add Product/Service</button></header>
        <div id="caPortfolio">No products or services added yet.</div>
      </section>
      <section class="ca-block">
        <header><span>Photos</span><small id="caPhotosCount">0/10</small><button data-open-modal="photos">+ Add Photos</button></header>
        <div id="caPhotos" class="ca-photos-grid">
          <div class="ca-photo-skeleton"></div>
          <div class="ca-photo-skeleton"></div>
          <div class="ca-photo-skeleton"></div>
        </div>
      </section>
      <section class="ca-block">
        <header><span>Partners</span><button data-open-modal="partner">+ Add Partner</button></header>
        <div id="caPartners">No partners added yet.</div>
      </section>
      <section class="ca-block">
        <header><span>Customers</span><button data-open-modal="customer">+ Add Customer</button></header>
        <div id="caCustomers">No customers added yet.</div>
      </section>
      <section class="ca-block">
        <header><span>Investors</span><button data-open-modal="investor">+ Add Investor</button></header>
        <div id="caInvestors">No investors added yet.</div>
      </section>
      <section class="ca-block">
        <header><span>Subsidiaries</span><button data-open-modal="subsidiary">+ Add Subsidiary</button></header>
        <div id="caSubsidiaries">No subsidiaries added yet.</div>
      </section>
    </section>
    <aside class="ca-nav"><a class="is-active" href="company_con_admin.php"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg> Profile</a><a href="#"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg> About Me</a><a href="#"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg> My Job Ads</a><a href="#"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
        </svg> Settings</a></aside>
  </div>
</main>
<div class="ca-toast" id="caToast"></div>
<div class="ca-overlay" id="companyAdminModal">
  <div class="ca-modal"><button class="ca-x" data-close-modal></button>
    <div id="companyAdminModalContent"></div>
  </div>
</div>
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
<template id="modal-member">
  <h2>Add Team Members</h2>
  <p>Add a new or existing member to a team.</p>
  <label>Select Team</label>
  <select data-field="teamId"></select>
  <small class="ca-member-count" data-member-count>0/12 members</small>
  <label>Name of Member</label>
  <div class="ca-toggle-group">
    <button class="ca-toggle-btn is-active" data-member-mode="existing" type="button">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      Select Existing User
    </button>
    <button class="ca-toggle-btn" data-member-mode="new" type="button">Add New Member</button>
  </div>
  <div class="ca-search-wrap" data-member-panel="existing">
    <svg class="ca-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
    <input class="ca-search-input" data-field="memberSearch" placeholder="Search job seekers with microresume...">
  </div>
  <div class="ca-member-results" data-member-panel="existing" style="max-height: 180px; overflow-y: auto; margin-top: 10px; display: flex; flex-direction: column; gap: 6px;"></div>
  <div class="ca-search-empty" data-member-panel="existing" style="display: none;">No users found</div>
  <div data-member-panel="new" style="display:none">
    <input data-field="memberName" placeholder="Name of member..." style="margin-top:10px">
  </div>
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
  <div class="ca-image-upload-wrapper">
    <button class="upload" type="button" data-field="uploadButton">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
      </svg>
      <b>Click to upload image</b>
      <small>JPG, PNG up to 5MB</small>
    </button>

    <input type="file" data-field="memberAvatar" accept="image/jpeg,image/png" style="display: none;" />
    <div class="ca-image-preview-area" data-field="previewArea" style="display: none; align-items: center; gap: 14px; margin-top: 8px;">
      <img class="ca-preview-img" data-field="previewImg" src="" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid #cbd5e1;" />
      <button type="button" class="ca-toggle-btn" data-action="changeImage">Change</button>
      <button type="button" class="ca-toggle-btn" data-action="removeImage" style="border-color: #fecaca; color: #ef4444;">Remove</button>
    </div>
  </div>
  <footer>
    <button data-close-modal>Cancel</button>
    <button class="primary" data-add-member>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="20" y1="8" x2="20" y2="14" />
        <line x1="23" y1="11" x2="17" y2="11" />
      </svg>
      Add Member
    </button>
  </footer>
</template>
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
<template id="modal-profile">
  <h2>Add Team Profile</h2>
  <p>Describe your team across all 10 dimensions so candidates know what to expect.</p>
  <label>Select Team</label>
  <select data-field="teamId"></select>
  <hr>
  <b class="mini">PEOPLE</b>
  <div class="ca-tfield">
    <div class="ca-tfield-head"><label>Who We Are</label><span class="ca-wcount">0/30 words · 0/180 chars</span></div><textarea data-field="who_we_are" placeholder="Describe the team composition — backgrounds, experience levels, mix of skills..."></textarea>
  </div>
  <div class="ca-tfield">
    <div class="ca-tfield-head"><label>What We're Great At</label><span class="ca-wcount">0/30 words · 0/180 chars</span></div><textarea data-field="what_were_great_at" placeholder="What does the team excel at? Core strengths, technical or creative advantages..."></textarea>
  </div>
  <div class="ca-tfield">
    <div class="ca-tfield-head"><label>Team Culture</label><span class="ca-wcount">0/30 words · 0/180 chars</span></div><textarea data-field="team_culture" placeholder="How does the team interact day-to-day? Social dynamics, traditions, team rituals..."></textarea>
  </div>
  <div class="ca-tfield">
    <div class="ca-tfield-head"><label>How We Work Together</label><span class="ca-wcount">0/30 words · 0/180 chars</span></div><textarea data-field="how_we_work_together" placeholder="Remote, hybrid, or in-office? Communication tools, meeting cadence, async vs sync..."></textarea>
  </div>
  <div class="ca-tfield">
    <div class="ca-tfield-head"><label>This team is NOT for you if...</label><span class="ca-wcount">0/30 words · 0/180 chars</span></div><textarea data-field="this_team_is_not_for_you_if" placeholder="Be honest — what personality types or work styles won't thrive here?"></textarea>
  </div>
  <hr>
  <b class="mini">HOW WE OPERATE</b>
  <div class="ca-tfield">
    <div class="ca-tfield-head"><label>How We're Led</label><span class="ca-wcount">0/30 words · 0/180 chars</span></div><textarea data-field="how_were_led" placeholder="Leadership style, decision-making process, manager expectations, feedback loops..."></textarea>
  </div>
  <div class="ca-tfield">
    <div class="ca-tfield-head"><label>What We're Solving Now</label><span class="ca-wcount">0/30 words · 0/180 chars</span></div><textarea data-field="what_were_solving_now" placeholder="Current projects, key challenges, strategic priorities the team is focused on..."></textarea>
  </div>
  <div class="ca-tfield">
    <div class="ca-tfield-head"><label>A Typical Day</label><span class="ca-wcount">0/30 words · 0/180 chars</span></div><textarea data-field="typical_day" placeholder="Walk through the daily rhythm — standups, deep work, breaks, end of day..."></textarea>
  </div>
  <div class="ca-tfield">
    <div class="ca-tfield-head"><label>What We Value</label><span class="ca-wcount">0/30 words · 0/180 chars</span></div><textarea data-field="what_we_value" placeholder="Core values in action — how disagreements are handled, what's celebrated..."></textarea>
  </div>
  <div class="ca-tfield">
    <div class="ca-tfield-head"><label>Growth Here</label><span class="ca-wcount">0/30 words · 0/180 chars</span></div><textarea data-field="growth_here" placeholder="Learning opportunities, promotion paths, mentorship, conference budgets..."></textarea>
  </div>
  <footer><button data-close-modal>Cancel</button><button class="primary" data-save-profile>Save Profile</button></footer>
</template>
<template id="modal-product">
  <h2>Add Product/Service</h2>
  <p>Type at least 5 characters to search for a product or service.</p><input data-field="name" placeholder="Search product/service..."><label>Product/Service Status</label><select data-field="status">
    <option>Select status...</option>
    <option>Main Focus</option>
    <option>High Priority</option>
    <option>Runner Ups</option>
  </select>
  <footer><button data-close-modal>Cancel</button><button class="primary" data-add-item="products">Add Product</button></footer>
</template>
<template id="modal-brand">
  <h2>Add Brand</h2>
  <p>Enter brand details and link it to a product/service.</p><label>Brand Name</label><input data-field="name" placeholder="e.g. Epsilon Cola"><label>Brand Logo</label><button class="upload mini" type="button">⇧ Upload Logo</button><label>Brand Tier</label><select data-field="status">
    <option>Select brand tier</option>
    <option>Flagship</option>
    <option>Core</option>
    <option>Growth/Emerging</option>
    <option>Niche</option>
  </select>
  <footer><button data-close-modal>Cancel</button><button class="primary" data-add-item="brands">Add Brand</button></footer>
</template>
<template id="modal-city">
  <h2>Add City</h2>
  <p>Type at least 3 characters to search for a city.</p><input data-field="name" placeholder="Search city...">
  <footer><button data-close-modal>Cancel</button><button class="primary" data-add-item="offices">Add City</button></footer>
</template>
<template id="modal-partner">
  <h2>Add Partner</h2>
  <p>Type to search for a partner organization.</p>
  <div style="position: relative; margin-top: 10px;">
    <input data-field="orgSearchInput" placeholder="Search organization..." autocomplete="off">
    <ul class="ca-cselect-panel" data-field="orgSearchResults" style="display: none; position: absolute; left: 0; right: 0; background: #fff; border: 1px solid #d7dce8; border-radius: 8px; max-height: 200px; overflow-y: auto; z-index: 100; margin: 4px 0; padding: 0; list-style: none; box-shadow: 0 10px 30px rgba(0,0,0,0.15);"></ul>
  </div>
  <input type="hidden" data-field="selectedOrgId">
  <footer><button data-close-modal>Cancel</button><button class="primary" data-add-item="partners" disabled>Add Partner</button></footer>
</template>
<template id="modal-customer">
  <h2>Add Customer</h2>
  <p>Type to search for a customer organization.</p>
  <div style="position: relative; margin-top: 10px;">
    <input data-field="orgSearchInput" placeholder="Search customer..." autocomplete="off">
    <ul class="ca-cselect-panel" data-field="orgSearchResults" style="display: none; position: absolute; left: 0; right: 0; background: #fff; border: 1px solid #d7dce8; border-radius: 8px; max-height: 200px; overflow-y: auto; z-index: 100; margin: 4px 0; padding: 0; list-style: none; box-shadow: 0 10px 30px rgba(0,0,0,0.15);"></ul>
  </div>
  <input type="hidden" data-field="selectedOrgId">
  <footer><button data-close-modal>Cancel</button><button class="primary" data-add-item="customers" disabled>Add Customer</button></footer>
</template>
<template id="modal-investor">
  <h2>Add Investor</h2>
  <p>Type to search for an investor organization.</p>
  <div style="position: relative; margin-top: 10px;">
    <input data-field="orgSearchInput" placeholder="Search investor..." autocomplete="off">
    <ul class="ca-cselect-panel" data-field="orgSearchResults" style="display: none; position: absolute; left: 0; right: 0; background: #fff; border: 1px solid #d7dce8; border-radius: 8px; max-height: 200px; overflow-y: auto; z-index: 100; margin: 4px 0; padding: 0; list-style: none; box-shadow: 0 10px 30px rgba(0,0,0,0.15);"></ul>
  </div>
  <input type="hidden" data-field="selectedOrgId">
  <footer><button data-close-modal>Cancel</button><button class="primary" data-add-item="investors" disabled>Add Investor</button></footer>
</template>
<template id="modal-subsidiary">
  <h2>Add Subsidiary</h2>
  <p>Type to search for a subsidiary organization.</p>
  <div style="position: relative; margin-top: 10px;">
    <input data-field="orgSearchInput" placeholder="Search subsidiary..." autocomplete="off">
    <ul class="ca-cselect-panel" data-field="orgSearchResults" style="display: none; position: absolute; left: 0; right: 0; background: #fff; border: 1px solid #d7dce8; border-radius: 8px; max-height: 200px; overflow-y: auto; z-index: 100; margin: 4px 0; padding: 0; list-style: none; box-shadow: 0 10px 30px rgba(0,0,0,0.15);"></ul>
  </div>
  <input type="hidden" data-field="selectedOrgId">
  <footer><button data-close-modal>Cancel</button><button class="primary" data-add-item="subsidiaries" disabled>Add Subsidiary</button></footer>
</template>
<template id="modal-photos">
  <h2>Add Photos</h2>
  <p>Upload photos of your workspace, team, or culture.</p>
  <div class="ca-image-upload-wrapper">
    <button class="upload" type="button" data-field="uploadButton">
      <b>Click to upload photo</b>
      <small>JPG, PNG up to 5MB</small>
    </button>
    <input type="file" data-field="teamPhotoFile" accept="image/jpeg,image/png" style="display: none;" />
    <div class="ca-image-preview-area" data-field="previewArea" style="display: none; align-items: center; gap: 14px; margin-top: 8px;">
      <img class="ca-preview-img" data-field="previewImg" src="" style="width: 120px; height: 90px; border-radius: 6px; object-fit: cover; border: 2px solid #cbd5e1;" />
      <button type="button" class="ca-toggle-btn" data-action="changeImage">Change</button>
      <button type="button" class="ca-toggle-btn" data-action="removeImage" style="border-color: #fecaca; color: #ef4444;">Remove</button>
    </div>
  </div>
  <footer><button data-close-modal>Cancel</button><button class="primary" data-add-photo>Add Photo</button></footer>
</template>
<template id="modal-logo">
  <h2>Upload Logo</h2>
  <p>Upload your company logo.</p>
  <div class="ca-image-upload-wrapper">
    <button class="upload" type="button" data-field="uploadButton">
      <b>Click to upload logo</b>
      <small>JPG, PNG up to 5MB</small>
    </button>
    <input type="file" data-field="companyLogoFile" accept="image/jpeg,image/png" style="display: none;" />
    <div class="ca-image-preview-area" data-field="previewArea" style="display: none; align-items: center; gap: 14px; margin-top: 8px;">
      <img class="ca-preview-img" data-field="previewImg" src="" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover; border: 2px solid #cbd5e1;" />
      <button type="button" class="ca-toggle-btn" data-action="changeImage">Change</button>
      <button type="button" class="ca-toggle-btn" data-action="removeImage" style="border-color: #fecaca; color: #ef4444;">Remove</button>
    </div>
  </div>
  <footer><button data-close-modal>Cancel</button><button class="primary" data-save-logo>Save Logo</button></footer>
</template>
<template id="modal-confirm-delete-team">
  <h2>Delete Team</h2>
  <p style="margin-top: 10px; line-height: 1.5;">Are you sure you want to delete <strong data-field="teamNameToDelete"></strong>? This will remove all team members and profile data. This action cannot be undone.</p>
  <footer style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px;">
    <button data-close-modal style="min-height: 38px; border-radius: 6px; padding: 0 20px; font-weight: 800; cursor: pointer; border: 1px solid #d7dce8; background: #fff;">No</button>
    <button class="ca-danger-button" style="min-height: 38px; border-radius: 6px; padding: 0 20px; font-weight: 800; cursor: pointer; background: #ef4444 !important; color: #fff !important; border: 1px solid #ef4444 !important;" data-confirm-delete-team-btn>Yes, Delete</button>
  </footer>
</template>
<template id="modal-parent">
  <h2>Add Parent Company</h2>
  <p>Search and connect the parent company if applicable.</p>
  <div style="position: relative; margin-top: 10px;">
    <input data-field="orgSearchInput" placeholder="Search parent company..." autocomplete="off">
    <ul class="ca-cselect-panel" data-field="orgSearchResults" style="display: none; position: absolute; left: 0; right: 0; background: #fff; border: 1px solid #d7dce8; border-radius: 8px; max-height: 200px; overflow-y: auto; z-index: 100; margin: 4px 0; padding: 0; list-style: none; box-shadow: 0 10px 30px rgba(0,0,0,0.15);"></ul>
  </div>
  <input type="hidden" data-field="selectedOrgId">
  <footer><button data-close-modal>Cancel</button><button class="primary" data-add-parent disabled>Add Parent Company</button></footer>
</template>

<template id="modal-edit-member">
  <h2 id="companyAdminModalTitle">Edit Team Member</h2>
  <p class="ca-modal-lead">Update job title or profile image for this team member.</p>

  <input type="hidden" data-field="memberId" />

  <label>Name</label>
  <input data-field="memberName" placeholder="Member name" />

  <label>Job Title</label>
  <input data-field="jobTitle" placeholder="Job title" />

  <label>Profile Image</label>
  <button class="ca-upload-area" type="button">
    <span>⇧</span>
    <strong>Change image</strong>
    <small>JPG, PNG up to 5MB</small>
  </button>

  <footer>
    <button class="ca-danger-button" type="button" data-delete-member>Delete</button>
    <button class="ca-cancel" type="button" data-close-modal>Cancel</button>
    <button class="ca-primary" type="button" data-update-member>Save Changes</button>
  </footer>
</template>

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
  <footer>
    <button class="ca-danger-button" type="button" data-delete-office>Delete</button>
    <button class="ca-cancel" type="button" data-close-modal>Cancel</button>
    <button class="ca-primary" type="button" data-update-office>Update City</button>
  </footer>
</template>

<template id="modal-edit-product">
  <h2 id="companyAdminModalTitle">Edit Product/Service</h2>
  <p class="ca-modal-lead">Update or remove this product/service.</p>

  <input type="hidden" data-field="productId" />

  <label>Product/Service Name</label>
  <input data-field="productName" placeholder="Product/service name" />

  <label>Product/Service Status</label>
  <select data-field="productStatus">
    <option>Main Focus (Our #1 Priority)</option>
    <option>High Priority (Core Products/Services)</option>
    <option>Runner Ups (New or Smaller Projects)</option>
  </select>

  <footer>
    <button class="ca-danger-button" type="button" data-delete-product>Delete</button>
    <button class="ca-cancel" type="button" data-close-modal>Cancel</button>
    <button class="ca-primary" type="button" data-update-product>Update Product</button>
  </footer>
</template>


<?php require __DIR__ . '/includes/footer.php'; ?>
<script>
  (function() {
    document.addEventListener('click', function(e) {
      var trigger = e.target.closest('.ca-cselect-trigger');
      var opt = e.target.closest('.ca-cselect-opt');

      // IMPORTANT :
      // Ne sélectionner que les vrais boutons de mode membre.
      // Les boutons "Change Image" ont aussi .ca-toggle-btn.
      var toggle = e.target.closest('.ca-toggle-btn[data-member-mode]');

      /* close all open selects not containing the click */
      document.querySelectorAll('.ca-cselect.is-open').forEach(function(el) {
        if (!el.contains(e.target)) {
          el.classList.remove('is-open');
        }
      });

      /* open / close the clicked trigger */
      if (trigger) {
        var wrap = trigger.closest('.ca-cselect');
        wrap.classList.toggle('is-open');
      }

      /* select an option */
      if (opt) {
        var wrap = opt.closest('.ca-cselect');
        var val = opt.dataset.value !== undefined ?
          opt.dataset.value :
          opt.textContent.trim();

        var label = opt.textContent.trim();
        var valEl = wrap.querySelector('.ca-cselect-val');
        var hiddenIn = wrap.querySelector('[data-cselect-value]');

        if (valEl) {
          valEl.textContent = label;
          valEl.classList.remove('is-placeholder');
        }

        if (hiddenIn) {
          hiddenIn.value = val;
        }

        wrap.querySelectorAll('.ca-cselect-opt').forEach(function(o) {
          o.classList.toggle('is-selected', o === opt);
        });

        wrap.classList.remove('is-open');
      }

      /* member mode toggle */
      if (toggle) {
        var group = toggle.closest('.ca-toggle-group');

        if (!group) return;

        var modal = toggle.closest('.ca-modal, [id^="companyAdmin"]');

        if (!modal) {
          modal = document.getElementById('companyAdminModalContent');
        }

        group.querySelectorAll('.ca-toggle-btn').forEach(function(b) {
          b.classList.remove('is-active');
        });

        toggle.classList.add('is-active');

        var mode = toggle.dataset.memberMode;

        if (modal) {
          modal.querySelectorAll('[data-member-panel]').forEach(function(el) {
            el.style.display =
              (el.dataset.memberPanel === mode) ? '' : 'none';
          });
        }
      }
    });

    /* ── Word / char counter for profile textareas ────────── */
    document.addEventListener('input', function(e) {
      var ta = e.target.closest('.ca-tfield textarea');
      if (!ta) return;
      var field = ta.closest('.ca-tfield');
      var counter = field && field.querySelector('.ca-wcount');
      if (!counter) return;
      var text = ta.value.trim();
      var words = text ? text.split(/\s+/).length : 0;
      var chars = ta.value.length;
      counter.textContent = words + '/30 words \u00b7 ' + chars + '/180 chars';
      ta.style.borderColor = chars > 180 ? 'var(--ca-danger)' : '';
    });

    document.addEventListener('click', function(e) {
      const uploadButton = e.target.closest('[data-field="uploadButton"]');
      const changeButton = e.target.closest('[data-action="changeImage"]');
      const removeButton = e.target.closest('[data-action="removeImage"]');

      if (uploadButton || changeButton) {
        const wrapper = (uploadButton || changeButton).closest('.ca-image-upload-wrapper');
        const fileInput = wrapper ? wrapper.querySelector('input[type="file"]') : null;
        if (fileInput) {
          fileInput.click();
        }
      }

      if (removeButton) {
        const wrapper = removeButton.closest('.ca-image-upload-wrapper');
        const fileInput = wrapper ? wrapper.querySelector('input[type="file"]') : null;
        const previewArea = wrapper ? wrapper.querySelector('[data-field="previewArea"]') : null;
        const uploadBtn = wrapper ? wrapper.querySelector('[data-field="uploadButton"]') : null;
        const previewImg = wrapper ? wrapper.querySelector('[data-field="previewImg"]') : null;
        if (fileInput) fileInput.value = '';
        if (previewImg) previewImg.src = '';
        if (previewArea) previewArea.style.display = 'none';
        if (uploadBtn) uploadBtn.style.display = '';
      }
    });

    document.addEventListener('change', function(e) {
      const input = e.target.closest('.ca-image-upload-wrapper input[type="file"]');
      if (!input || !input.files || !input.files[0]) return;

      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Please select an image.');
        input.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be smaller than 5MB.');
        input.value = '';
        return;
      }

      const wrapper = input.closest('.ca-image-upload-wrapper');
      if (!wrapper) return;

      const previewImg = wrapper.querySelector('[data-field="previewImg"]');
      const previewArea = wrapper.querySelector('[data-field="previewArea"]');
      const uploadBtn = wrapper.querySelector('[data-field="uploadButton"]');

      const reader = new FileReader();
      reader.onload = function() {
        if (previewImg) previewImg.src = reader.result;
        if (previewArea) previewArea.style.display = 'flex';
        if (uploadBtn) uploadBtn.style.display = 'none';
      };
      reader.readAsDataURL(file);
    });


  })();
</script>