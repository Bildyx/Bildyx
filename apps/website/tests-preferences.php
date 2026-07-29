<?php
$pageTitle = 'Tests & Preferences — Bildyx';
$pageDescription = 'Manage Bildyx tests and preferences.';
$pageScript = 'js/tests-preferences.js';
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
echo str_replace('</head>', "    {$testsStylesheet}\n</head>", $sharedHeader);
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

                <a class="tp-test-row" role="row" href="tests-preferences/basic-information.php">
                    <span class="tp-test-name" role="cell"><span class="tp-icon">▱</span> Basic Information</span>
                    <span role="cell">Test</span>
                    <span class="tp-status" role="cell">Completed</span>
                    <span role="cell"></span>
                </a>

                <a class="tp-test-row" role="row" href="#">
                    <span class="tp-test-name" role="cell"><span class="tp-icon">▥</span> Company</span>
                    <span role="cell">Preference</span>
                    <span class="tp-status" role="cell">Completed</span>
                    <span role="cell"></span>
                </a>

                <a class="tp-test-row" role="row" href="#">
                    <span class="tp-test-name" role="cell"><span class="tp-icon">▣</span> Job</span>
                    <span role="cell">Preference</span>
                    <span class="tp-status" role="cell">Completed</span>
                    <span role="cell"></span>
                </a>

                <a class="tp-test-row" role="row" href="tests-preferences/big-5.php">
                    <span class="tp-test-name" role="cell"><span class="tp-icon">♙</span> Big 5</span>
                    <span role="cell">Personality Test</span>
                    <span class="tp-status" role="cell">Completed</span>
                    <span role="cell"><span class="tp-result-button">View Result</span></span>
                </a>

                <a class="tp-test-row" role="row" href="tests-preferences/assertiveness.php">
                    <span class="tp-test-name" role="cell"><span class="tp-icon">✧</span> Assertiveness</span>
                    <span role="cell">Personality Test</span>
                    <span class="tp-status" role="cell">Completed</span>
                    <span role="cell"><span class="tp-result-button">View Result</span></span>
                </a>

                <a class="tp-test-row" role="row" href="tests-preferences/creative-analytical.php">
                    <span class="tp-test-name" role="cell"><span class="tp-icon">♙</span> Creative or Analytical</span>
                    <span role="cell">Personality Test</span>
                    <span class="tp-status" role="cell">Completed</span>
                    <span role="cell"><span class="tp-result-button">View Result</span></span>
                </a>

                <a class="tp-test-row" role="row" href="tests-preferences/intellectual-curiosity.php">
                    <span class="tp-test-name" role="cell"><span class="tp-icon">♧</span> Intellectual Curiosity</span>
                    <span role="cell">Personality Test</span>
                    <span class="tp-status" role="cell">Completed</span>
                    <span role="cell"><span class="tp-result-button">View Result</span></span>
                </a>

                <a class="tp-test-row" role="row" href="tests-preferences/entrepreneur.php">
                    <span class="tp-test-name" role="cell"><span class="tp-icon">↗</span> Entrepreneur</span>
                    <span role="cell">Personality Test</span>
                    <span class="tp-status" role="cell">Completed</span>
                    <span role="cell"><span class="tp-result-button">View Result</span></span>
                </a>

                <a class="tp-test-row" role="row" href="tests-preferences/self-motivation.php">
                    <span class="tp-test-name" role="cell"><span class="tp-icon">♙</span> Self-Motivation</span>
                    <span role="cell">Personality Test</span>
                    <span class="tp-status" role="cell">Completed</span>
                    <span role="cell"><span class="tp-result-button">View Result</span></span>
                </a>

                <a class="tp-test-row" role="row" href="#">
                    <span class="tp-test-name" role="cell"><span class="tp-icon">ⓘ</span> About Me</span>
                    <span role="cell">Test</span>
                    <span class="tp-status" role="cell">Completed</span>
                    <span role="cell"></span>
                </a>

                <a class="tp-test-row" role="row" href="#">
                    <span class="tp-test-name" role="cell"><span class="tp-icon">♡</span> Lifestyle</span>
                    <span role="cell">Test</span>
                    <span class="tp-status" role="cell">Completed</span>
                    <span role="cell"></span>
                </a>

                <a class="tp-test-row" role="row" href="#">
                    <span class="tp-test-name" role="cell"><span class="tp-icon">⌁</span> Working Time</span>
                    <span role="cell">Test</span>
                    <span class="tp-status" role="cell">Completed</span>
                    <span role="cell"></span>
                </a>

                <a class="tp-test-row" role="row" href="#">
                    <span class="tp-test-name" role="cell"><span class="tp-icon">☻</span> Wellbeing</span>
                    <span role="cell">Test</span>
                    <span class="tp-status" role="cell">Completed</span>
                    <span role="cell"></span>
                </a>

                <a class="tp-test-row" role="row" href="#">
                    <span class="tp-test-name" role="cell"><span class="tp-icon">ϟ</span> Values</span>
                    <span role="cell">Preference</span>
                    <span class="tp-status" role="cell">Completed</span>
                    <span role="cell"></span>
                </a>

                <a class="tp-test-row" role="row" href="#">
                    <span class="tp-test-name" role="cell"><span class="tp-icon">⚙</span> Preferences</span>
                    <span role="cell">Preference</span>
                    <span class="tp-status" role="cell">Completed</span>
                    <span role="cell"></span>
                </a>
            </div>
        </section>

        <aside class="tp-side-nav" aria-label="Profile menu">
            <a href="profile.php"><span>☻</span> Profile</a>
            <a href="target-list.php"><span>◎</span> My Target List</a>
            <a class="is-active" href="tests-preferences.php"><span>▣</span> Tests &amp;<br> Preferences</a>
            <a href="my-jobs.php"><span>▥</span> My Jobs</a>
            <a href="settings.php"><span>⚙</span> Settings</a>
        </aside>
    </div>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
