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
                <div>
                    <p class="tl-kicker">Showing Results for:</p>
                    <label class="tl-search-label" for="targetCity">Filter by city</label>
                    <input id="targetCity" class="tl-search-input" type="search" placeholder="enter a city" autocomplete="off" />
                </div>
            </header>

            <section class="tl-target-section" aria-labelledby="tl-company-title">
                <h1 id="tl-company-title" class="tl-section-icon" aria-label="Companies">▥</h1>
                <div class="tl-card-row" data-target-list="companies">
                    <div class="backend-slot is-loading">
                        <div class="skeleton-loader skeleton-card"></div>
                    </div>
                    <div class="backend-slot is-loading">
                        <div class="skeleton-loader skeleton-card"></div>
                    </div>
                </div>
                <div class="tl-pagination" data-pagination-for="companies">
                    <button class="tl-page-btn is-prev" type="button" aria-label="Previous page">‹ Prev</button>
                    <span class="tl-page-info">Page 1 of 1</span>
                    <button class="tl-page-btn is-next" type="button" aria-label="Next page">Next ›</button>
                </div>
            </section>

            <section class="tl-target-section" aria-labelledby="tl-government-title">
                <h2 id="tl-government-title" class="tl-section-icon" aria-label="Public sector">▥</h2>
                <div class="tl-card-row" data-target-list="government">
                    <div class="backend-slot is-loading">
                        <div class="skeleton-loader skeleton-card"></div>
                    </div>
                    <div class="backend-slot is-loading">
                        <div class="skeleton-loader skeleton-card"></div>
                    </div>
                </div>
                <div class="tl-pagination" data-pagination-for="government">
                    <button class="tl-page-btn is-prev" type="button" aria-label="Previous page">‹ Prev</button>
                    <span class="tl-page-info">Page 1 of 1</span>
                    <button class="tl-page-btn is-next" type="button" aria-label="Next page">Next ›</button>
                </div>
            </section>
        </section>

        <aside class="profile-side-nav" aria-label="Profile menu">
            <a class="side-nav-button" href="profile.php"><span aria-hidden="true">☻</span> Profile</a>
            <a class="side-nav-button is-active" href="target-list.php"><span aria-hidden="true">◎</span> My Target List</a>
            <a class="side-nav-button" href="tests-preferences.php"><span aria-hidden="true">▣</span> Tests &amp;<br> Preferences</a>
            <a class="side-nav-button" href="my-jobs.php"><span aria-hidden="true">▥</span> My Jobs</a>
            <a class="side-nav-button" href="settings.php"><span aria-hidden="true">⚙</span> Settings</a>
        </aside>
    </div>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
