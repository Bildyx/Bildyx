<?php
$pageTitle = 'Mission — Bildyx';
$pageDescription = 'Bildyx mission: eliminate friction from hiring for companies and candidates.';
$pageScript = 'js/mission.js';
$bodyClass = 'mission-page';
$showMainNav = false;

ob_start();
require __DIR__ . '/includes/header.php';
$sharedHeader = ob_get_clean();
$missionStylesheet = '<link rel="stylesheet" href="css/mission.css" />';
echo str_replace('</head>', "    {$missionStylesheet}\n</head>", $sharedHeader);
?>

<main class="mission-main">
    <section class="mission-hero" aria-labelledby="mission-title">
        <span class="mission-hero__eyebrow">Our purpose</span>
        <h1 id="mission-title">Our Mission</h1>
        <p>We eliminate friction from hiring — for both sides. Build better teams, hire faster, spend less.</p>
    </section>

    <section class="mission-frame" aria-label="Mission details">
        <div class="mission-inner">
            <section class="mission-stats" aria-label="Mission promises">
                <article class="mission-stat">
                    <span class="mission-icon">
                        <img src="images/mission-job.png" alt="" aria-hidden="true">
                    </span>
                    <h2>1 week</h2>
                    <strong>Find a job</strong>
                    <p>Job seekers get matched to the right team — fast.</p>
                </article>

                <article class="mission-stat">
                    <span class="mission-icon">
                        <img src="images/mission-candidate.png" alt="" aria-hidden="true">
                    </span>
                    <h2>1 week</h2>
                    <strong>Find a candidate</strong>
                    <p>Companies discover pre-matched talent — no waiting.</p>
                </article>
            </section>

            <section class="mission-work" aria-labelledby="mission-work-title">
                <span class="mission-section-label" id="mission-work-title">What we do</span>

                <div class="mission-card-grid">
                    <article class="mission-card">
                        <span class="mission-card__icon">
                            <img src="images/mission-team.png" alt="" aria-hidden="true">
                        </span>
                        <span class="mission-number">01</span>
                        <h3>Team Building</h3>
                        <p>
                            Help companies build their team. Advise them on what roles they should hire —
                            so every hire fits the team's needs and growth stage.
                        </p>
                    </article>

                    <article class="mission-card mission-card--dark">
                        <span class="mission-card__icon mission-card__icon--dark">
                            <img src="images/mission-lightning.png" alt="" aria-hidden="true">
                        </span>
                        <span class="mission-number">02</span>
                        <h3>Fast Hiring</h3>
                        <ul>
                            <li>We know candidates. We know companies and teams.</li>
                            <li>We connect the two — directly.</li>
                            <li>Find a job in 1 week. Find a candidate in 1 week.</li>
                        </ul>
                    </article>

                    <article class="mission-card">
                        <span class="mission-card__icon">
                            <img src="images/mission-cost.png" alt="" aria-hidden="true">
                        </span>
                        <span class="mission-number">03</span>
                        <h3>Low Cost Hiring</h3>
                        <p>
                            Make recruitment cheap for companies. No expensive agency fees — just direct,
                            efficient connections between companies and the right talent.
                        </p>
                    </article>

                    <article class="mission-card mission-card--danger">
                        <span class="mission-card__icon mission-card__icon--danger">
                            <img src="images/mission-search.png" alt="" aria-hidden="true">
                        </span>
                        <span class="mission-number">04</span>
                        <h3>Eliminate the Search</h3>
                        <strong>Job Search</strong>
                        <strong>Candidate Search</strong>
                        <p>
                            Instead, Bildyx connects job seekers and companies — no searching required on either side.
                        </p>
                    </article>
                </div>
            </section>

            <section class="mission-no-search" aria-labelledby="mission-no-search-title">
                <div class="mission-no-search__intro">
                    <h2 id="mission-no-search-title">No more searching.</h2>
                    <p>Bildyx replaces the search entirely — for both sides of the hiring equation.</p>
                </div>

                <div class="mission-no-search__rows">
                    <div class="mission-row">
                        <span class="mission-row__bad">⊗</span>
                        <strong>Job<br>Search</strong>
                        <span class="mission-row__arrow">→</span>
                        <p>Bildyx connects you to the right team directly.</p>
                    </div>

                    <div class="mission-row">
                        <span class="mission-row__bad">⊗</span>
                        <strong>Candidate<br>Search</strong>
                        <span class="mission-row__arrow">→</span>
                        <p>Bildyx surfaces the right candidates for your team.</p>
                    </div>
                </div>
            </section>
        </div>
    </section>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
