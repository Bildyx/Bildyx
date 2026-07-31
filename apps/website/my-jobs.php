<?php
$pageTitle = 'My Jobs — Bildyx';
$pageDescription = 'Recommended teams and jobs based on your Bildyx MicroResume.';
$pageScript = 'js/my-jobs.ts';
$bodyClass = 'my-jobs-page';
$showMainNav = false;

/*
 * Page root: elle utilise le header/footer partagés.
 * Elle ajoute seulement sa feuille CSS dédiée.
 */
ob_start();
require __DIR__ . '/includes/header.php';
$sharedHeader = ob_get_clean();
$myJobsStylesheet = '<link rel="stylesheet" href="css/my-jobs.css" />';
echo str_replace('</head>', "    {$myJobsStylesheet}\n</head>", $sharedHeader);
?>

<main class="mj-page">
    <div class="mj-shell">
        <aside class="mj-recommendation-rail" aria-label="Recommended jobs and teams">
            <div class="mj-rail-header">
                <button class="mj-company-tab is-active" type="button" data-company="pekamix" aria-pressed="true">
                    <span aria-hidden="true">▥</span>
                    Pekamix
                </button>
                <button class="mj-clear-button" type="button" id="clearJobSelection" aria-label="Clear selected job">C</button>
            </div>

            <div class="mj-company-group" data-company-group="pekamix">
                <button class="mj-company-tab mj-company-tab--sub is-active" type="button" data-company="pekamix" aria-pressed="true">
                    <span aria-hidden="true">▥</span>
                    Pekamix
                </button>

                <article class="mj-job-card is-active" tabindex="0" role="button" aria-pressed="true" data-job="pekamix-alpha">
                    <div class="mj-line-row">
                        <span>Team:</span>
                        <strong>SuperTeam</strong>
                    </div>
                    <div class="mj-score-row" aria-label="Recommendation scores">
                        <span class="mj-score mj-score--medium">M</span>
                        <span class="mj-score mj-score--high">H</span>
                        <span class="mj-score mj-score--high">H</span>
                        <span class="mj-score mj-score--empty">–</span>
                    </div>
                    <div class="mj-score-labels" aria-hidden="true">
                        <span>O</span>
                        <span>T</span>
                        <span>M</span>
                        <span>J</span>
                    </div>
                    <div class="mj-line-row">
                        <span>Job:</span>
                        <strong>Software Engineer</strong>
                    </div>
                    <div class="mj-line-row">
                        <span>Product:</span>
                        <strong>SalesPro</strong>
                    </div>
                    <button class="mj-apply-button" type="button" data-apply="pekamix-alpha">Applied</button>
                </article>

                <article class="mj-job-card" tabindex="0" role="button" aria-pressed="false" data-job="pekamix-beta">
                    <div class="mj-line-row">
                        <span>Team:</span>
                        <strong>Core Platform</strong>
                    </div>
                    <div class="mj-score-row" aria-label="Recommendation scores">
                        <span class="mj-score mj-score--high">H</span>
                        <span class="mj-score mj-score--medium">M</span>
                        <span class="mj-score mj-score--high">H</span>
                        <span class="mj-score mj-score--medium">M</span>
                    </div>
                    <div class="mj-score-labels" aria-hidden="true">
                        <span>O</span>
                        <span>T</span>
                        <span>M</span>
                        <span>J</span>
                    </div>
                    <div class="mj-line-row">
                        <span>Job:</span>
                        <strong>Backend Developer</strong>
                    </div>
                    <div class="mj-line-row">
                        <span>Product:</span>
                        <strong>Analytics Tools</strong>
                    </div>
                    <button class="mj-apply-button" type="button" data-apply="pekamix-beta">Apply</button>
                </article>
            </div>

            <div class="mj-company-group" data-company-group="rakuten">
                <button class="mj-company-tab mj-company-tab--sub" type="button" data-company="rakuten" aria-pressed="false">
                    <span aria-hidden="true">▥</span>
                    Rakuten
                </button>

                <article class="mj-job-card" tabindex="0" role="button" aria-pressed="false" data-job="rakuten-superteam">
                    <div class="mj-line-row">
                        <span>Team:</span>
                        <strong>SuperTeam</strong>
                    </div>
                    <div class="mj-score-row" aria-label="Recommendation scores">
                        <span class="mj-score mj-score--medium">M</span>
                        <span class="mj-score mj-score--high">H</span>
                        <span class="mj-score mj-score--high">H</span>
                        <span class="mj-score mj-score--empty">–</span>
                    </div>
                    <div class="mj-score-labels" aria-hidden="true">
                        <span>O</span>
                        <span>T</span>
                        <span>M</span>
                        <span>J</span>
                    </div>
                </article>

                <article class="mj-job-card" tabindex="0" role="button" aria-pressed="false" data-job="rakuten-maj2023">
                    <div class="mj-line-row">
                        <span>Team:</span>
                        <strong>Maj2023Time</strong>
                    </div>
                    <div class="mj-score-row" aria-label="Recommendation scores">
                        <span class="mj-score mj-score--medium">M</span>
                        <span class="mj-score mj-score--medium">M</span>
                        <span class="mj-score mj-score--high">H</span>
                        <span class="mj-score mj-score--empty">–</span>
                    </div>
                    <div class="mj-score-labels" aria-hidden="true">
                        <span>O</span>
                        <span>T</span>
                        <span>M</span>
                        <span>J</span>
                    </div>
                </article>

                <article class="mj-job-card" tabindex="0" role="button" aria-pressed="false" data-job="rakuten-2maj">
                    <div class="mj-line-row">
                        <span>Team:</span>
                        <strong>2.Maj</strong>
                    </div>
                    <div class="mj-score-row" aria-label="Recommendation scores">
                        <span class="mj-score mj-score--medium">M</span>
                        <span class="mj-score mj-score--medium">M</span>
                        <span class="mj-score mj-score--high">H</span>
                        <span class="mj-score mj-score--medium">M</span>
                    </div>
                    <div class="mj-score-labels" aria-hidden="true">
                        <span>O</span>
                        <span>T</span>
                        <span>M</span>
                        <span>J</span>
                    </div>
                    <div class="mj-line-row">
                        <span>Job:</span>
                        <strong>Video</strong>
                    </div>
                    <div class="mj-line-row">
                        <span>Product:</span>
                        <strong>rakuten.com</strong>
                    </div>
                    <button class="mj-apply-button" type="button" data-apply="rakuten-2maj">Applied</button>
                </article>

                <article class="mj-job-card" tabindex="0" role="button" aria-pressed="false" data-job="rakuten-games">
                    <div class="mj-line-row">
                        <span>Team:</span>
                        <strong>RakutenGames</strong>
                    </div>
                    <div class="mj-score-row" aria-label="Recommendation scores">
                        <span class="mj-score mj-score--medium">M</span>
                        <span class="mj-score mj-score--medium">M</span>
                        <span class="mj-score mj-score--medium">M</span>
                        <span class="mj-score mj-score--medium">M</span>
                    </div>
                    <div class="mj-score-labels" aria-hidden="true">
                        <span>O</span>
                        <span>T</span>
                        <span>M</span>
                        <span>J</span>
                    </div>
                </article>
            </div>
        </aside>

        <section class="mj-main-card" aria-labelledby="my-jobs-title">
            <div id="jobPreview" class="mj-preview" aria-live="polite">
                <h1 id="my-jobs-title">My Jobs</h1>
                <p class="mj-lead">Recommended teams and jobs based on your MicroResume. Select a recommendation on the left to preview the team profile.</p>
                <div class="mj-empty-state">Click on a team in the left sidebar to view its full profile here.</div>
            </div>
        </section>

        <aside class="mj-side-nav" aria-label="Profile menu">
            <a href="profile.php"><span aria-hidden="true">☻</span> Profile</a>
            <a href="target-list.php"><span aria-hidden="true">◎</span> My Target List</a>
            <a href="tests-preferences.php"><span aria-hidden="true">▣</span> Tests &amp;<br> Preferences</a>
            <a class="is-active" href="my-jobs.php"><span aria-hidden="true">▥</span> My Jobs</a>
            <a href="settings.php"><span aria-hidden="true">⚙</span> Settings</a>
        </aside>
    </div>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
