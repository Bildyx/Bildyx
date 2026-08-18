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
);

?>

<script>
  (function() {
    const raw =
      sessionStorage.getItem('bildyx_session') ||
      localStorage.getItem('bildyx_session');

    if (!raw) {
      return;
    }

    try {
      const s = JSON.parse(raw);
      const t = String(
        s.accountType || s.role || ''
      ).toLowerCase().replace(/[\s_-]/g, '');

      if (t && t !== 'company') {
        location.href = 'profile.php';
      }
    } catch (e) {
      // Ignore invalid session data.
    }
  })();
</script>

<main class="ca-page">

  <div class="ca-shell">

    <!-- =========================================================
             LEFT SIDEBAR
        ========================================================== -->

    <aside class="ca-left">

      <section class="ca-profile-box">

        <button
          class="ca-logo"
          type="button"
          data-open-modal="logo"
          id="caCompanyLogoBtn">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true">
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>

          <small>Upload Logo</small>
        </button>

        <h1 contenteditable="true" data-company-name>
          F-Career
        </h1>

        <p>Company Profile</p>

        <div class="ca-profile-url-container" style="margin-top: 8px; font-size: 11px; opacity: 0.85; text-align: center; width: 100%;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link-2">
              <path d="M9 17H7A5 5 0 0 1 7 7h2"></path>
              <path d="M15 7h2a5 5 0 1 1 0 10h-2"></path>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <span>Profile URL</span>
          </div>
          <div class="ca-profile-url-display" style="display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: bold; margin-top: 4px;">
            <span>bildyx.com/<span data-profile-url-text>f-career</span></span>
            <button type="button" class="ca-url-edit-btn" style="background: transparent; border: none; color: #fff; cursor: pointer; padding: 0; display: inline-flex; align-items: center;" aria-label="Edit Profile URL">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
              </svg>
            </button>
          </div>
          <div class="ca-profile-url-edit" style="display: none; align-items: center; justify-content: center; gap: 6px; margin-top: 4px;">
            <span>bildyx.com/</span>
            <input type="text" class="ca-url-input" style="width: 110px; height: 24px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.4); background: rgba(255,255,255,0.15); color: #fff; padding: 0 6px; font-size: 11px; font-weight: bold; outline: none;" />
            <button type="button" class="ca-url-save-btn" style="background: transparent; border: none; color: #4ade80; cursor: pointer; padding: 0 4px; font-size: 13px; font-weight: bold;" aria-label="Save">✓</button>
            <button type="button" class="ca-url-cancel-btn" style="background: transparent; border: none; color: #94a3b8; cursor: pointer; padding: 0 4px; font-size: 13px; font-weight: bold;" aria-label="Cancel">✕</button>
          </div>
        </div>

      </section>

      <h2>Parent Company</h2>

      <div id="caParentCompanyContainer" style="width: 100%;">

        <button
          class="ca-parent"
          type="button"
          data-open-modal="parent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-building2 h-8 w-8 text-primary-foreground/30">
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
            <path d="M10 6h4"></path>
            <path d="M10 10h4"></path>
            <path d="M10 14h4"></path>
            <path d="M10 18h4"></path>
          </svg>

          <span>Add your parent company if applicable</span>
        </button>

      </div>

    </aside>


    <!-- =========================================================
             MAIN CONTENT
        ========================================================== -->

    <section class="ca-main">

      <header class="ca-builder">
        <span></span>
        <b>Profile Builder</b>
        <p>
          — Start building your company profile by adding teams,
          products, and more
        </p>
      </header>


      <!-- =====================================================
                 TEAMS
            ====================================================== -->

      <section>

        <div class="ca-section-head">

          <h2>Our Teams</h2>

          <div
            class="ca-edit-actions"
            data-edit-actions>

            <button
              class="ca-edit-btn"
              type="button"
              data-edit-start>
              <i class="bi bi-pencil" aria-hidden="true"></i>
              <span>Edit</span>
            </button>

            <button
              class="ca-save-btn"
              type="button"
              data-edit-save>
              <i class="bi bi-check-lg" aria-hidden="true"></i>
              <span>Save</span>
            </button>

            <button
              class="ca-cancel-btn"
              type="button"
              data-edit-cancel>
              <i class="bi bi-x-lg" aria-hidden="true"></i>
              <span>Cancel</span>
            </button>

          </div>

        </div>


        <div class="ca-team-panel">

          <!-- Skeleton -->

          <div
            class="ca-skeleton-loader"
            id="caSkeletonLoader"
            style="display: none; padding: 18px; width: 100%;">

            <div
              style="display: flex; gap: 12px; margin-bottom: 20px; align-items: center;">
              <div
                class="skeleton-pill"
                style="width: 32px; height: 32px; background: #e2e8f0; border-radius: 50%;"></div>

              <div
                class="skeleton-pill"
                style="width: 80px; height: 32px; background: #e2e8f0; border-radius: 999px;"></div>

              <div
                class="skeleton-pill"
                style="width: 100px; height: 32px; background: #e2e8f0; border-radius: 999px;"></div>

              <div
                class="skeleton-pill"
                style="width: 70px; height: 32px; background: #e2e8f0; border-radius: 999px;"></div>

              <div
                class="skeleton-pill"
                style="width: 32px; height: 32px; background: #e2e8f0; border-radius: 50%;"></div>
            </div>

            <div
              style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px;">
              <div
                class="skeleton-card"
                style="height: 92px; background: #e2e8f0; border-radius: 12px;"></div>

              <div
                class="skeleton-card"
                style="height: 92px; background: #e2e8f0; border-radius: 12px;"></div>

              <div
                class="skeleton-card"
                style="height: 92px; background: #e2e8f0; border-radius: 12px;"></div>

              <div
                class="skeleton-card"
                style="height: 92px; background: #e2e8f0; border-radius: 12px;"></div>
            </div>

          </div>


          <!-- Real content -->

          <div
            class="ca-team-main"
            id="caTeamRealContent">

            <div class="ca-tabs-wrapper">

              <button
                class="ca-tab-arrow left"
                type="button">
                ←
              </button>

              <div
                class="ca-tabs"
                id="caTeamTabs"></div>

              <button
                class="ca-tab-arrow right"
                type="button">
                →
              </button>

            </div>


            <div
              class="ca-actions"
              style="margin-top: 14px;">

              <button
                data-open-modal="team"
                style="border: 1px dashed var(--ca-blue); color: var(--ca-blue); border-radius: 999px; min-height: 34px; padding: 0 16px; font-weight: bold; background: transparent;">
                + Add New Team
              </button>

              <button
                data-open-modal="member"
                style="border: 1px dashed #cbd5e1; color: #0f172a; border-radius: 999px; min-height: 34px; padding: 0 16px; font-weight: bold; background: transparent; display: inline-flex; align-items: center; gap: 6px;">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                  style="margin-right: 2px;">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>

                Add Team Members
              </button>

            </div>


            <div
              class="ca-members"
              id="caMembers">
              <div class="ca-empty">
                No team members added yet.
                Use “Add Team Members” to build this team.
              </div>
            </div>


            <div class="ca-sub">

              <h3>Our Offices</h3>

              <button data-open-modal="office">
                + Add City
              </button>

            </div>

            <div
              class="ca-chips"
              id="caOffices"></div>


            <div class="ca-sub">

              <h3>Main Products / Services</h3>

              <div>

                <button data-open-modal="product">
                  + Add Product/Service
                </button>

                <button data-open-modal="brand">
                  + Add Brand
                </button>

              </div>

            </div>

            <div
              class="ca-chips"
              id="caProducts"></div>

          </div>


          <!-- Team profile -->

          <aside class="ca-profile-side">

            <div>

              <h3>Team Profile</h3>

              <button
                data-open-modal="profile"
                data-profile-edit-button>
                + Add
              </button>

            </div>

            <div id="caTeamProfile">
              <p>No team profile added yet.</p>
            </div>

            <footer>
              <button
                class="is-active"
                data-mode="people">
                People
              </button>

              <button data-mode="operate">
                How We Operate
              </button>
            </footer>

          </aside>

        </div>

      </section>


      <!-- =====================================================
                 PRODUCT PORTFOLIO
            ====================================================== -->

      <section class="ca-block">

        <header>

          <span>
            Our Product &amp; Service Portfolio
          </span>

          <button data-open-modal="product">
            + Add Product/Service
          </button>

        </header>

        <div id="caPortfolio">
          No products or services added yet. Use "+ Add Product/Service" in the Teams section above to get started.
        </div>

      </section>


      <!-- =====================================================
                 PHOTOS
            ====================================================== -->

      <section class="ca-block">

        <header>

          <span>Photos</span>

          <small id="caPhotosCount">
            0/10
          </small>

          <button data-open-modal="photos">
            + Add Photos
          </button>

        </header>

        <div
          id="caPhotos"
          class="ca-photos-grid ca-carousel">
          <div class="ca-photo-skeleton"></div>
          <div class="ca-photo-skeleton"></div>
          <div class="ca-photo-skeleton"></div>
        </div>

      </section>


      <!-- =====================================================
                 PARTNERS
            ====================================================== -->

      <section class="ca-block">

        <header>

          <span>Partners</span>

          <button data-open-modal="partner">
            + Add Partner
          </button>

        </header>

        <div id="caPartners">
          No partners added yet. Click "+ Add Partner" to get started.
        </div>

      </section>


      <!-- =====================================================
                 CUSTOMERS
            ====================================================== -->

      <section class="ca-block">

        <header>

          <span>Customers</span>

          <button data-open-modal="customer">
            + Add Customer
          </button>

        </header>

        <div id="caCustomers">
          No customers added yet. Click "+ Add Customer" to get started.
        </div>

      </section>


      <!-- =====================================================
                 INVESTORS
            ====================================================== -->

      <section class="ca-block">

        <header>

          <span>Investors</span>

          <button data-open-modal="investor">
            + Add Investor
          </button>

        </header>

        <div id="caInvestors">
          No investors added yet. Click "Add Investor" to get started.
        </div>

      </section>


      <!-- =====================================================
                 SUBSIDIARIES
            ====================================================== -->

      <section class="ca-block">

        <header>

          <span>Subsidiaries</span>

          <button data-open-modal="subsidiary">
            + Add Subsidiary
          </button>

        </header>

        <div id="caSubsidiaries">
          No subsidiaries added yet. Click "Add Subsidiary" to get started.
        </div>

      </section>

    </section>


    <!-- =========================================================
             RIGHT NAVIGATION
        ========================================================== -->

    <aside class="ca-nav">

      <a
        class="is-active"
        href="company_con_admin.php">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>

        Profile
      </a>


      <a href="#">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>

        About Me
      </a>


      <a href="#">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>

        My Job Ads
      </a>


      <a href="#">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
        </svg>

        Settings
      </a>

    </aside>

  </div>

</main>


<div
  class="ca-toast"
  id="caToast"></div>


<!-- =============================================================
     GLOBAL MODAL CONTAINER
============================================================== -->

<div
  class="ca-overlay"
  id="companyAdminModal">
  <div class="ca-modal">

    <button
      class="ca-x"
      data-close-modal></button>

    <div id="companyAdminModalContent"></div>

  </div>
</div>


<!-- =============================================================
     MODALS
     
     Everything below is now loaded through PHP requires.
============================================================== -->

<?php

require __DIR__ . '/js/company/modals/team/team.php';
require __DIR__ . '/js/company/modals/team/team-delete.php';

require __DIR__ . '/js/company/modals/member/member.php';
require __DIR__ . '/js/company/modals/member/member-edit.php';

require __DIR__ . '/js/company/modals/profile.php';

require __DIR__ . '/js/company/modals/product/product.php';
require __DIR__ . '/js/company/modals/product/product-edit.php';

require __DIR__ . '/js/company/modals/brand.php';
require __DIR__ . '/js/company/modals/partner.php';
require __DIR__ . '/js/company/modals/customer.php';
require __DIR__ . '/js/company/modals/investor.php';
require __DIR__ . '/js/company/modals/subsidiary.php';

require __DIR__ . '/js/company/modals/photos.php';
require __DIR__ . '/js/company/modals/logo.php';
require __DIR__ . '/js/company/modals/parent.php';

require __DIR__ . '/js/company/modals/office/office.php';
require __DIR__ . '/js/company/modals/office/office-edit.php';

?>


<?php require __DIR__ . '/includes/footer.php'; ?>