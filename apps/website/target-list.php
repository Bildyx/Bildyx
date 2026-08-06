<?php
$pageTitle = 'My Target List — Bildyx';
$pageDescription = 'Saved target companies and opportunities on Bildyx.';
$pageScript = 'js/target-list.ts';
$bodyClass = 'target-list-page';
$showMainNav = false;

ob_start();
require __DIR__ . '/includes/header.php';
$sharedHeader = ob_get_clean();
$targetStylesheet = '<link rel="stylesheet" href="css/target-list.css" />';
echo str_replace('</head>', "    {$targetStylesheet}\n</head>", $sharedHeader);
?>

<main class="tl-page">
  <div class="tl-shell">
    <section class="tl-card" aria-labelledby="tl-title">
      <header class="tl-header">
        <h1 id="tl-title">My Target List</h1>

        <form class="tl-filter-bar" id="targetFilters" role="search">
          <div class="tl-filter-line tl-filter-line--top">
            <span class="tl-filter-label">Showing Results for:</span>
            <label class="tl-visually-hidden" for="targetCity">City</label>
            <input id="targetCity" class="tl-search-input" type="search" placeholder="enter a city" autocomplete="off" />
            <label class="tl-visually-hidden" for="targetCountry">Country</label>
            <input id="targetCountry" class="tl-search-input" type="search" placeholder="enter a country" autocomplete="off" />

            <div class="tl-filter-dropdown" data-filter-dropdown>
              <button class="tl-filter-chip" type="button" data-filter-toggle aria-expanded="false">
                <span aria-hidden="true">♙</span> Organization Size <strong data-filter-count="sizes"></strong> <span aria-hidden="true">⌄</span>
              </button>
              <div class="tl-filter-panel" data-filter-panel>
                <label class="tl-filter-option"><input type="checkbox" value="RANGE_1_10" data-filter="sizes" /><span></span><strong>Micro</strong><small>1–10 employees</small></label>
                <label class="tl-filter-option"><input type="checkbox" value="RANGE_11_50" data-filter="sizes" /><span></span><strong>Small</strong><small>11–50 employees</small></label>
                <label class="tl-filter-option"><input type="checkbox" value="RANGE_51_200" data-filter="sizes" /><span></span><strong>Medium-sized</strong><small>51–200 employees</small></label>
                <label class="tl-filter-option"><input type="checkbox" value="RANGE_201_1000" data-filter="sizes" /><span></span><strong>Mid-Market</strong><small>201–1,000 employees</small></label>
                <label class="tl-filter-option"><input type="checkbox" value="RANGE_1001_5000" data-filter="sizes" /><span></span><strong>Big</strong><small>1,001–5,000 employees</small></label>
                <label class="tl-filter-option"><input type="checkbox" value="RANGE_5000_PLUS" data-filter="sizes" /><span></span><strong>Large, established</strong><small>5,000+ employees</small></label>
              </div>
            </div>
          </div>

          <div class="tl-filter-line">
            <div class="tl-filter-dropdown" data-filter-dropdown>
              <button class="tl-filter-chip" type="button" data-filter-toggle aria-expanded="false">
                <span aria-hidden="true">▣</span> Products and Services <strong data-filter-count="products"></strong> <span aria-hidden="true">⌄</span>
              </button>
              <div class="tl-filter-panel tl-filter-panel--wide" data-filter-panel>
                <p>Products and Services</p>
                <label class="tl-filter-option tl-filter-option--sentence"><input type="checkbox" value="same" data-filter="products" /><span></span><strong>Same as I used to work on.</strong></label>
                <label class="tl-filter-option tl-filter-option--sentence"><input type="checkbox" value="similar" data-filter="products" /><span></span><strong>Similar to the ones that I used to work on.</strong></label>
                <label class="tl-filter-option tl-filter-option--sentence"><input type="checkbox" value="different" data-filter="products" /><span></span><strong>Different from the ones that I used to work on.</strong></label>
              </div>
            </div>

            <label class="tl-keyword-chip" for="targetKeyword">
              <span aria-hidden="true">♡</span><strong>I like to work on</strong>
              <input id="targetKeyword" type="search" placeholder="enter keyword" autocomplete="off" />
            </label>

            <div class="tl-filter-dropdown" data-filter-dropdown>
              <button class="tl-filter-chip" type="button" data-filter-toggle aria-expanded="false">
                <span aria-hidden="true">▥</span> I would like to work for <strong data-filter-count="workFor"></strong> <span aria-hidden="true">⌄</span>
              </button>
              <div class="tl-filter-panel tl-filter-panel--work" data-filter-panel>
                <p>I would like to work for</p>
                <label class="tl-filter-option tl-filter-option--sentence"><input type="checkbox" value="companies" data-filter="workFor" /><span></span><strong>Companies</strong></label>
                <label class="tl-filter-option tl-filter-option--sentence"><input type="checkbox" value="government" data-filter="workFor" /><span></span><strong>Government &amp; Public Services</strong></label>
                <label class="tl-filter-option tl-filter-option--sentence"><input type="checkbox" value="healthcare" data-filter="workFor" /><span></span><strong>Hospitals &amp; Healthcare Providers</strong></label>
                <label class="tl-filter-option tl-filter-option--sentence"><input type="checkbox" value="education" data-filter="workFor" /><span></span><strong>Education &amp; Research</strong></label>
                <label class="tl-filter-option tl-filter-option--sentence"><input type="checkbox" value="nonprofit" data-filter="workFor" /><span></span><strong>Non-Profit, Community &amp; Advocacy</strong></label>
                <label class="tl-filter-option tl-filter-option--sentence"><input type="checkbox" value="international" data-filter="workFor" /><span></span><strong>International &amp; Diplomatic Organizations</strong></label>
                <label class="tl-filter-option tl-filter-option--sentence"><input type="checkbox" value="culture" data-filter="workFor" /><span></span><strong>Culture, Parks &amp; Heritage</strong></label>
              </div>
            </div>

            <button class="tl-reset-filters" id="resetTargetFilters" type="button">Reset filters</button>
          </div>
        </form>
      </header>

      <section class="tl-target-section" aria-labelledby="tl-company-title">
        <h2 id="tl-company-title" class="tl-section-icon" aria-label="Companies">▥</h2>
        <div class="tl-card-row" data-target-list="companies"><div class="backend-slot is-loading"><div class="skeleton-loader skeleton-card"></div></div><div class="backend-slot is-loading"><div class="skeleton-loader skeleton-card"></div></div></div>
        <div class="tl-pagination" data-pagination-for="companies"><button class="tl-page-btn is-prev" type="button">‹ Prev</button><span class="tl-page-info">Page 1 of 1</span><button class="tl-page-btn is-next" type="button">Next ›</button></div>
      </section>
    </section>

    <aside class="profile-side-nav" aria-label="Profile menu">
      <a class="side-nav-button" href="profile.php"><span aria-hidden="true">☻</span> Profile</a>
      <a class="side-nav-button is-active" href="target-list.php"><span aria-hidden="true">◎</span> My Target List</a>
      <a class="side-nav-button" href="tests-preferences.php"><span aria-hidden="true">▣</span> Tests &amp;<br> Preferences</a>
  <!--            <a class="side-nav-button" href="my-jobs.php"><span aria-hidden="true">▥</span> My Jobs</a> -->
      <a class="side-nav-button" href="settings.php"><span aria-hidden="true">⚙</span> Settings</a>
    </aside>
  </div>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
