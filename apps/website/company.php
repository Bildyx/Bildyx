<?php
$pageTitle = 'Company — Bildyx';
$pageDescription = 'About Bildyx, our mission, our values, and the people behind the platform.';
$pageScript = 'js/company.ts';
$bodyClass = 'company-page';
$showMainNav = false;

/*
 * Header/footer shared remain unchanged.
 * This page only adds its own stylesheet.
 */
ob_start();
require __DIR__ . '/includes/header.php';
$sharedHeader = ob_get_clean();
$companyStylesheet = '<link rel="stylesheet" href="css/company.css" />';
echo str_replace('</head>', "    {$companyStylesheet}\n</head>", $sharedHeader);
?>

<main class="company-main">
    <section class="company-frame" aria-labelledby="company-title">
        <div class="company-inner">
            <header class="company-hero">
                <h1 id="company-title">About Us</h1>
                <p>
                    Bildyx is a company profile and hiring platform built for modern teams. We help
                    companies share who they really are — and help job seekers find places where
                    they truly belong.
                </p>
            </header>

            <section class="company-section company-mission" aria-labelledby="company-mission-title">
                <span class="company-eyebrow">Our mission</span>
                <h2 id="company-mission-title">Connecting the right people with the right teams</h2>
                <p>
                    We believe hiring is broken — not because of a lack of candidates, but because of
                    a lack of transparency. Companies hide behind job descriptions. Candidates guess
                    at culture. We're building a platform that changes that: one where teams show their
                    real face, and job seekers present their real selves through a concise micro-resume.
                </p>
            </section>

            <section class="company-blue-card" aria-labelledby="company-story-title">
                <span class="company-blue-card__eyebrow">Why we built it</span>
                <h2 id="company-story-title">We were tired of bad hires — on both sides</h2>
                <p>
                    After years of building teams and watching great candidates get rejected based on
                    keywords — and great companies struggle to communicate their culture — we decided
                    to build something better. Bildyx is the result: a platform where company teams and
                    individual micro-resumes tell the real story.
                </p>
            </section>

            <section class="company-section company-values" aria-labelledby="company-values-title">
                <span class="company-eyebrow">Our values</span>
                <h2 id="company-values-title">What guides everything we do</h2>

                <div class="company-value-grid">
                    <article class="company-value-card">
                        <span class="company-value-icon" aria-hidden="true">⊙</span>
                        <h3>Transparency</h3>
                        <p>We believe in honest, open communication — for companies and candidates alike.</p>
                    </article>

                    <article class="company-value-card">
                        <span class="company-value-icon" aria-hidden="true">♙</span>
                        <h3>Team-first</h3>
                        <p>Great companies are built by great teams. We put teams at the center of every profile.</p>
                    </article>

                    <article class="company-value-card">
                        <span class="company-value-icon" aria-hidden="true">ϟ</span>
                        <h3>Simplicity</h3>
                        <p>Less noise, more signal. A focused micro-resume beats a 5-page CV every time.</p>
                    </article>
                </div>
            </section>

            <section class="company-section company-team" aria-labelledby="company-team-title">
                <span class="company-eyebrow">Our team</span>
                <h2 id="company-team-title">The people behind Bildyx</h2>

                <div class="company-team-grid">
                    <article class="company-person-card">
                        <img src="images/company-benjamin.png" alt="Benjamin Park" />
                        <h3>Benjamin Park</h3>
                        <p>CEO &amp; Co-Founder</p>
                    </article>

                    <article class="company-person-card">
                        <img src="images/company-sofia.png" alt="Sofia Müller" />
                        <h3>Sofia Müller</h3>
                        <p>CTO &amp; Co-Founder</p>
                    </article>

                    <article class="company-person-card">
                        <img src="images/company-marcus.png" alt="Marcus Hayes" />
                        <h3>Marcus Hayes</h3>
                        <p>Head of Product</p>
                    </article>

                    <article class="company-person-card">
                        <img src="images/company-priya.png" alt="Priya Sharma" />
                        <h3>Priya Sharma</h3>
                        <p>Head of Design</p>
                    </article>
                </div>
            </section>
        </div>
    </section>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
