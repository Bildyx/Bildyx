<?php
$pageTitle = 'Why Teams — Bildyx';
$pageDescription = 'People do not join companies. They join teams.';
$pageScript = 'js/why-teams.js';
$bodyClass = 'why-teams-page';

/*
 * Le header partagé ne doit pas être modifié.
 * On l'injecte dans un buffer pour ajouter uniquement le CSS propre à cette page.
 */
ob_start();
require __DIR__ . '/includes/header.php';
$sharedHeader = ob_get_clean();
$teamsStylesheet = '<link rel="stylesheet" href="css/why-teams.css" />';
echo str_replace('</head>', "    {$teamsStylesheet}\n</head>", $sharedHeader);
?>

<main class="wt-page">
    <section class="wt-hero" aria-labelledby="wt-hero-title">
        <div class="wt-container wt-hero__grid">
            <div class="wt-hero__copy">
                <p class="wt-kicker">A fit for common ground that builds teams</p>
                <h1 id="wt-hero-title">People Don't Join<br>Companies. They Join<br>Teams.</h1>
                <p class="wt-hero__lead">Job seekers care less about logos and perks and more about the people they'll work with every day. Teams—not companies—are the true magnets for top talent.</p>
                <div class="wt-button-row">
                    <a class="wt-button wt-button--primary" href="generic.php?page=create-profile">Create Profile <span aria-hidden="true">→</span></a>
                    <a class="wt-button wt-button--secondary" href="team-example.php">
                        See Team Example
                    </a>
                </div>
            </div>

            <figure class="wt-hero__media">
                <img src="images/team-meeting.jpg" alt="Team collaborating in a modern office" />
            </figure>
        </div>
    </section>

    <section class="wt-blue-section wt-benefits" id="why-teams" aria-labelledby="wt-benefits-title">
        <div class="wt-container">
            <header class="wt-section-heading wt-section-heading--light">
                <h2 id="wt-benefits-title">Why Teams Matter More Than Companies</h2>
                <p>Candidates choose the team that makes them feel connected, valued, and empowered<br class="wt-desktop-break"> to make an impact.</p>
            </header>

            <div class="wt-benefit-grid">
                <article class="wt-benefit-card">
                    <span class="wt-line-icon" aria-hidden="true">♡</span>
                    <h3>Connection &amp; Belonging</h3>
                    <p>Teams foster genuine human relationships that drive engagement.</p>
                </article>
                <article class="wt-benefit-card">
                    <span class="wt-line-icon" aria-hidden="true">↗</span>
                    <h3>Impact &amp; Growth</h3>
                    <p>Leaders who listen, mentor, and empower create a sense of real contribution.</p>
                </article>
                <article class="wt-benefit-card">
                    <span class="wt-line-icon" aria-hidden="true">⬡</span>
                    <h3>Psychological Safety</h3>
                    <p>A supportive team culture can buffer corporate dysfunction.</p>
                </article>
                <article class="wt-benefit-card">
                    <span class="wt-line-icon" aria-hidden="true">♙</span>
                    <h3>Retention Drivers</h3>
                    <p>People leave managers and teams, not companies. Salary attracts, but culture retains.</p>
                </article>
            </div>
        </div>
    </section>

    <section class="wt-showcase-section" id="team-example" aria-labelledby="wt-showcase-title">
        <div class="wt-container wt-container--wide">
            <header class="wt-section-heading">
                <h2 id="wt-showcase-title">Show Your Teams Before Candidates Apply.</h2>
                <p>Give job seekers a richer view of your teams: team profiles, products and services, how<br class="wt-desktop-break"> your team works, and where they are located.</p>
            </header>

            <article class="wt-team-card" aria-label="Interactive team profile example">
                <div class="wt-team-overview">
                    <h3>Our Teams</h3>

                    <div class="wt-team-tabs" role="tablist" aria-label="Choose a team">
                        <button class="wt-team-tab is-active" type="button" data-team="alpha" role="tab" aria-selected="true">Team Alpha</button>
                        <button class="wt-team-tab" type="button" data-team="beta" role="tab" aria-selected="false">Team Beta</button>
                        <button class="wt-team-tab" type="button" data-team="gamma" role="tab" aria-selected="false">Team Gamma</button>
                        <button class="wt-team-tab" type="button" data-team="delta" role="tab" aria-selected="false">Team Delta</button>
                        <button class="wt-team-tab" type="button" data-team="fusion" role="tab" aria-selected="false">Team Fusion</button>
                    </div>

                    <div class="wt-team-members" id="wtTeamMembers" aria-live="polite"></div>

                    <section class="wt-team-subsection">
                        <h4>Our Offices</h4>
                        <div class="wt-office-cities" id="wtOfficeCities">
                            <button class="wt-city" type="button" data-city="tokyo">
                                <span class="wt-city-photo"><img src="images/city-tokyo.png" alt="" /></span>
                                <span>Tokyo</span>
                            </button>
                            <button class="wt-city" type="button" data-city="new-york">
                                <span class="wt-city-photo"><img src="images/city-new-york.png" alt="" /></span>
                                <span>New York</span>
                            </button>
                            <button class="wt-city" type="button" data-city="seoul">
                                <span class="wt-city-photo"><img src="images/city-seoul.png" alt="" /></span>
                                <span>Seoul</span>
                            </button>
                            <button class="wt-city" type="button" data-city="kuala-lumpur">
                                <span class="wt-city-photo"><img src="images/city-kuala-lumpur.png" alt="" /></span>
                                <span>Kuala Lumpur</span>
                            </button>
                            <button class="wt-city" type="button" data-city="san-francisco">
                                <span class="wt-city-photo"><img src="images/city-san-francisco.png" alt="" /></span>
                                <span>San Francisco</span>
                            </button>
                            <button class="wt-city" type="button" data-city="istanbul">
                                <span class="wt-city-photo"><img src="images/city-istanbul.png" alt="" /></span>
                                <span>Istanbul</span>
                            </button>
                        </div>
                    </section>

                    <section class="wt-team-subsection">
                        <h4>Main Products / Services</h4>
                        <div class="wt-product-list" id="wtProductList">
                            <button class="wt-product-chip" type="button" data-product="ai"><span aria-hidden="true">▣</span> AI Software</button>
                            <button class="wt-product-chip" type="button" data-product="search"><span aria-hidden="true">⌕</span> Search Engine Software</button>
                            <button class="wt-product-chip" type="button" data-product="sales"><span aria-hidden="true">▽</span> Sales Software</button>
                            <button class="wt-product-chip" type="button" data-product="cloud"><span aria-hidden="true">⌒</span> Cloud Infrastructure</button>
                            <button class="wt-product-chip" type="button" data-product="analytics"><span aria-hidden="true">▥</span> Data Analytics</button>
                        </div>
                    </section>
                </div>

                <aside class="wt-team-profile" aria-live="polite">
                    <h3>Team Profile</h3>
                    <span class="wt-team-badge" id="wtTeamBadge">Team Alpha</span>
                    <div class="wt-profile-points" id="wtProfilePoints"></div>
                    <div class="wt-team-actions" aria-label="Team profile mode">
                        <button type="button" class="wt-profile-button is-active" data-profile-mode="overview" aria-pressed="true">Team Overview</button>
                        <button type="button" class="wt-profile-button" data-profile-mode="operate" aria-pressed="false">How We Operate</button>
                    </div>
                </aside>
            </article>
        </div>
    </section>

    <section class="wt-blue-section wt-magnet-section" aria-labelledby="wt-magnet-title">
        <div class="wt-container wt-magnet-grid">
            <div class="wt-magnet-copy">
                <h2 id="wt-magnet-title">The Magnet Effect</h2>
                <p>High-performing teams attract top talent. A-players gravitate toward teams where high performance, creativity, and a relentless culture of excellence thrive.</p>
                <ul>
                    <li><span aria-hidden="true">✣</span> Showcase impact. Your work is your product's best pitch.</li>
                    <li><span aria-hidden="true">☆</span> Growth: Learning opportunities with strong peers.</li>
                    <li><span aria-hidden="true">♡</span> Cohesion: A sense of belonging your hiring page.</li>
                </ul>
            </div>

            <div class="wt-stat-grid">
                <article class="wt-stat-card">
                    <strong>92%</strong>
                    <p>of candidates prioritize team culture over large perks</p>
                </article>
                <article class="wt-stat-card">
                    <strong>60%</strong>
                    <p>lower turnover in positively aligned teams</p>
                </article>
            </div>
        </div>
    </section>

    <section class="wt-candidate-section" aria-labelledby="wt-candidate-title">
        <div class="wt-container wt-candidate-grid">
            <figure class="wt-candidate-media">
                <img src="images/candidate-browser.jpg" alt="Professional browsing team profiles" />
            </figure>

            <div class="wt-candidate-copy">
                <h2 id="wt-candidate-title">What Candidates Look For</h2>
                <p>Before applying, job seekers increasingly want to know who they'll work with and how they fit in.</p>
                <div class="wt-checklist-card">
                    <h3><span aria-hidden="true">⌕</span> The Search Checklist</h3>
                    <ul>
                        <li>Who they'll work with and their experience, skills, and interests</li>
                        <li>Team culture, collaboration style, and workflow</li>
                        <li>Access to leaders who act as mentors, not just managers</li>
                        <li>A shared mission where contributions are visible and valued</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <section class="wt-blue-section wt-shine-section" aria-labelledby="wt-shine-title">
        <div class="wt-container">
            <header class="wt-section-heading wt-section-heading--light">
                <h2 id="wt-shine-title">BILDYX: Where Teams Shine</h2>
                <p>At Bildyx, we believe people don't just join companies—they join teams. Bildyx puts<br class="wt-desktop-break"> teams at the center of every company profile.</p>
            </header>

            <div class="wt-shine-grid">
                <article class="wt-shine-card">
                    <h3>Give Your Team the Spotlight</h3>
                    <p>Small or large, every team has a story. Bildyx is your platform to share the people, work, and culture that define you.</p>
                    <div class="wt-shine-list">
                        <span>♙ Your Teams</span>
                        <span>⬡ Products / Services</span>
                        <span>◎ Cities &amp; Locations</span>
                        <span>◇ Partners &amp; Customers</span>
                    </div>
                </article>

                <article class="wt-shine-card">
                    <h3>Help Job Seekers Find Their Fit</h3>
                    <p>Candidates want to know who they'll work with before making a move. Help people feel the team's energy from the first click.</p>
                    <div class="wt-shine-list">
                        <span>▥ Collaboration &amp; Culture</span>
                        <span>↗ Real Impact</span>
                        <span>☆ Shared Mission</span>
                        <span>▣ Growth &amp; Mentorship</span>
                    </div>
                    <a class="wt-button wt-button--primary" href="generic.php?page=start-profile">Start Your Profile <span aria-hidden="true">→</span></a>
                </article>
            </div>
        </div>
    </section>

    <section class="wt-cta-section" aria-labelledby="wt-cta-title">
        <div class="wt-container">
            <h2 id="wt-cta-title">Ready to showcase your team?</h2>
            <p>Show your team, their culture, and their work so talent chooses you for the<br class="wt-desktop-break"> people—not just the brand.</p>
            <a class="wt-button wt-button--primary" href="generic.php?page=get-started">Get Started for Free</a>
        </div>
    </section>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
