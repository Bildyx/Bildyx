<?php
$pageTitle = 'Pekamix Team Example — Bildyx';
$pageDescription = 'Public company and team profile example on Bildyx.';
$pageScript = 'js/team-example.ts';
$bodyClass = 'team-example-page';
$showMainNav = false;

ob_start();
require __DIR__ . '/includes/header.php';
$sharedHeader = ob_get_clean();
$teamExampleStylesheet = '<link rel="stylesheet" href="css/team-example.css" />';
echo str_replace('</head>', "    {$teamExampleStylesheet}\n</head>", $sharedHeader);
?>

<main class="te-page">
    <div class="te-company-bar" aria-label="Current company">PEKAMIX</div>

    <div class="te-layout">
        <aside class="te-company-rail" aria-label="Company information">
            <div
                id="company-profile-card"
                class="te-backend-slot te-company-card-slot"
                data-card-slot="company-profile"
                aria-label="Company profile card reserved for backend content">
            </div>

            <h1 class="te-company-rail__title">Parent Company</h1>
            <a class="te-archive-link" href="company-archives.php">
                <span aria-hidden="true">▣</span>
                Company Archives
            </a>
        </aside>

        <div class="te-content">
            <section class="te-team-panel" aria-labelledby="te-team-title">
                <div class="te-team-main">
                    <h2 id="te-team-title">Our Teams</h2>

                    <div class="te-team-tabs" role="tablist" aria-label="Choose a team">
                        <button class="te-team-tab is-active" type="button" data-team="alpha" role="tab" aria-selected="true">Team Alpha</button>
                        <button class="te-team-tab" type="button" data-team="beta" role="tab" aria-selected="false">Team Beta</button>
                        <button class="te-team-tab" type="button" data-team="gamma" role="tab" aria-selected="false">Team Gamma</button>
                        <button class="te-team-tab" type="button" data-team="delta" role="tab" aria-selected="false">Team Delta</button>
                    </div>

                    <div class="te-members" id="teMembers" aria-live="polite"></div>

                    <section class="te-subsection" aria-labelledby="te-offices-title">
                        <h3 id="te-offices-title">Our Offices</h3>
                        <div class="te-offices" id="teOffices"></div>
                    </section>

                    <section class="te-subsection" aria-labelledby="te-products-title">
                        <h3 id="te-products-title">Main Products / Services</h3>
                        <div class="te-products" id="teProducts"></div>
                    </section>
                </div>

                <aside class="te-team-profile" aria-live="polite">
                    <h2>Team Profile</h2>
                    <span class="te-team-badge" id="teTeamBadge">Team Alpha</span>
                    <div class="te-profile-points" id="teProfilePoints"></div>
                    <div class="te-profile-actions" aria-label="Team profile mode">
                        <button class="te-profile-button is-active" type="button" data-profile-mode="people" aria-pressed="true">People</button>
                        <button class="te-profile-button" type="button" data-profile-mode="operate" aria-pressed="false">How We Operate</button>
                    </div>
                </aside>
            </section>

            <section class="te-section" aria-labelledby="te-portfolio-title">
                <h2 id="te-portfolio-title">Our Product &amp; Service Portfolio</h2>
                <div class="te-carousel" data-carousel="portfolio">
                    <button class="te-carousel-arrow te-carousel-arrow--left" type="button" aria-label="Previous product">←</button>
                    <div class="te-carousel-track" id="portfolio-track">
                        <div id="portfolio-card-1" class="te-backend-slot te-product-card-slot" data-card-slot="portfolio-card"></div>
                    </div>
                    <button class="te-carousel-arrow te-carousel-arrow--right" type="button" aria-label="Next product">→</button>
                </div>
            </section>

            <section class="te-section" aria-labelledby="te-brands-title">
                <h2 id="te-brands-title">Our Brands</h2>
                <div class="te-carousel" data-carousel="brands">
                    <button class="te-carousel-arrow te-carousel-arrow--left" type="button" aria-label="Previous brand">←</button>
                    <div class="te-carousel-track te-carousel-track--two" id="brands-track">
                        <div id="brand-card-1" class="te-backend-slot te-brand-card-slot" data-card-slot="brand-card"></div>
                        <div id="brand-card-2" class="te-backend-slot te-brand-card-slot" data-card-slot="brand-card"></div>
                    </div>
                    <button class="te-carousel-arrow te-carousel-arrow--right" type="button" aria-label="Next brand">→</button>
                </div>
            </section>

            <section class="te-section te-media-section" aria-labelledby="te-photos-title">
                <span class="te-section-pill" id="te-photos-title">Photos</span>
                <div class="te-carousel te-media-carousel" data-carousel="photos">
                    <button class="te-carousel-arrow te-carousel-arrow--left" type="button" aria-label="Previous photo">←</button>
                    <div id="photos-slot" class="te-backend-slot te-media-slot" data-card-slot="photos"></div>
                    <button class="te-carousel-arrow te-carousel-arrow--right" type="button" aria-label="Next photo">→</button>
                </div>
            </section>

            <section class="te-section te-media-section" aria-labelledby="te-partners-title">
                <span class="te-section-pill" id="te-partners-title">Partners</span>
                <div class="te-carousel te-media-carousel" data-carousel="partners">
                    <button class="te-carousel-arrow te-carousel-arrow--left" type="button" aria-label="Previous partner">←</button>
                    <div id="partners-slot" class="te-backend-slot te-media-slot te-media-slot--short" data-card-slot="partners"></div>
                    <button class="te-carousel-arrow te-carousel-arrow--right" type="button" aria-label="Next partner">→</button>
                </div>
            </section>
        </div>

        <aside class="te-tip-card" aria-label="Tip">
            <strong><span aria-hidden="true">✣</span> TIP</strong>
            <p>Job seekers want to know the team before they apply. Create a free team profile on Bildyx Teams and show them yours today.</p>
        </aside>
    </div>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
