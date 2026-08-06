<?php
$pageTitle = 'Tests & Preferences — Bildyx';
$pageDescription = 'Manage Bildyx tests and preferences.';
$pageScript = 'js/tests-preferences.ts';
$bodyClass = 'tests-preferences-page';
$showMainNav = false;

/*
 * Page ajoutée sans toucher aux fichiers auth.css / auth.js.
 * Elle utilise le header/footer partagés + une feuille CSS dédiée.
 */
ob_start();
require __DIR__ . '/includes/header.php';
$sharedHeader = ob_get_clean();
$testsStylesheet = '<link rel="stylesheet" href="css/tests-preferences.css" />';
$fontawesomeScript = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />';
echo str_replace('</head>', "    {$testsStylesheet}\n    {$fontawesomeScript}\n</head>", $sharedHeader);
?>

<main class="tp-page">
    <div class="tp-shell">
        <section class="tp-card tp-table-card" aria-labelledby="tp-title">
            <h1 id="tp-title">Tests &amp; Preferences</h1>

            <div class="tp-tests-table" role="table" aria-label="Tests and preferences list">
                <div class="tp-table-head" role="row">
                    <span role="columnheader">Name</span>
                    <span role="columnheader">Type</span>
                    <span role="columnheader">Status</span>
                    <span role="columnheader">Summary</span>
                </div>
                <!-- Skeleton Loading Placeholders -->
                <div class="tp-skeleton-row" role="row">
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 40%;"></span></span>
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 40%;"></span></span>
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 40%;"></span></span>
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 40%;"></span></span>
                </div>
                <div class="tp-skeleton-row" role="row">
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 50%;"></span></span>
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 50%;"></span></span>
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 50%;"></span></span>
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 50%;"></span></span>
                </div>
                <div class="tp-skeleton-row" role="row">
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 50%;"></span></span>
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 50%;"></span></span>
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 50%;"></span></span>
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 50%;"></span></span>
                </div>
                <div class="tp-skeleton-row" role="row">
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 50%;"></span></span>
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 50%;"></span></span>
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 50%;"></span></span>
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 50%;"></span></span>
                </div>
                <div class="tp-skeleton-row" role="row">
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 50%;"></span></span>
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 50%;"></span></span>
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 50%;"></span></span>
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 50%;"></span></span>
                </div>
                <div class="tp-skeleton-row" role="row">
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 50%;"></span></span>
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 50%;"></span></span>
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 50%;"></span></span>
                    <span role="cell"><span class="tp-skeleton-bar" style="width: 50%;"></span></span>
                </div>
            </div>
        </section>

        <aside class="tp-side-nav" aria-label="Profile menu">
            <a href="profile.php"><span>☻</span> Profile</a>
            <a href="target-list.php"><span>◎</span> My Target List</a>
            <a class="is-active" href="tests-preferences.php"><span>▣</span> Tests &amp;<br> Preferences</a>
         <!--            <a href="my-jobs.php"><span>▥</span> My Jobs</a> -->
            <a href="settings.php"><span>⚙</span> Settings</a>
        </aside>
    </div>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
