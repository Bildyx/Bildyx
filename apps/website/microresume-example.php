<?php
$pageTitle = 'MicroResume Example — Bildyx';
$pageDescription = 'Example of a structured Bildyx MicroResume profile.';
$pageScript = 'js/microresume-example.js';
$bodyClass = 'microresume-example-page';

/*
 * Le header et le footer partagés restent inchangés.
 * Cette page ajoute seulement sa propre feuille de styles.
 */
ob_start();
require __DIR__ . '/includes/header.php';
$sharedHeader = ob_get_clean();
$exampleStylesheet = '<link rel="stylesheet" href="css/microresume-example.css" />';
echo str_replace('</head>', "    {$exampleStylesheet}\n</head>", $sharedHeader);
?>

<main class="mre-page">
    <article class="mre-resume" aria-labelledby="mre-name">
        <header class="mre-profile-header">
            <div class="mre-name-pill">
                <h1 id="mre-name">Hanako Kingswell</h1>
                <span>MicroResume</span>
            </div>

            <div class="mre-introduction">
                <img class="mre-avatar" src="images/hanako.png" alt="Portrait of Hanako Kingswell" />
                <p>
                    Results-driven Software Engineer with experience at Pekamix, contributing to the development and
                    enhancement of Sales Software solutions. Skilled in designing scalable business applications,
                    improving system performance, and collaborating across cross-functional global teams to deliver
                    high-quality software products. Bilingual in Japanese and English, enabling effective communication
                    with international stakeholders, bridging technical and business requirements across diverse markets.
                </p>
            </div>

            <div class="mre-profile-grid">
                <section aria-labelledby="mre-role-title">
                    <h2 id="mre-role-title">Software Engineer</h2>
                    <p class="mre-meta-label">◐ Languages</p>
                    <div class="mre-tags" aria-label="Languages">
                        <span>Japanese</span>
                        <span>English</span>
                        <span>German</span>
                    </div>

                    <ul class="mre-summary-list">
                        <li>Countries: USA</li>
                        <li>Companies: Pekamix</li>
                        <li>Products: Sales Software</li>
                        <li>Job Occupations: Software Engineer</li>
                    </ul>
                </section>

                <section aria-labelledby="mre-skills-title">
                    <h3 id="mre-skills-title">Top skills</h3>
                    <div class="mre-skill-tags">
                        <span>Software Development</span>
                        <span>Team Building</span>
                        <span>Problem Solving</span>
                        <span>CRM Integration</span>
                        <span>Performance Optimization</span>
                    </div>
                </section>
            </div>
        </header>

        <section class="mre-section" aria-labelledby="mre-experiences-title">
            <h2 id="mre-experiences-title">Experiences</h2>

            <div class="mre-entry-heading">
                <div class="mre-entry-icon" aria-hidden="true">⌂</div>
                <div>
                    <strong>Jan 2015–Now</strong>
                    <span>Seattle, Washington</span>
                    <span>Pekamix</span>
                    <a href="#">Software Engineer</a>
                </div>
            </div>

            <p class="mre-entry-description">
                I did various jobs in Pekamix. Mainly software developer. I also supported Japanese clients in USA and
                collaborated with the Tokyo office. My main languages are Java, C++ and Python.
            </p>

            <div class="mre-card-grid mre-card-grid--three">
                <section class="mre-card-column">
                    <h3>Company</h3>
                    <div id="experience-company-card" class="mre-card-slot" data-card-slot="experience-company" aria-label="Company card placeholder">
                        <?php /* Future backend company card */ ?>
                    </div>
                </section>

                <section class="mre-card-column">
                    <h3>Product/Service</h3>
                    <div id="experience-product-card" class="mre-card-slot" data-card-slot="experience-product" aria-label="Product or service card placeholder">
                        <?php /* Future backend product card */ ?>
                    </div>
                </section>

                <section class="mre-card-column">
                    <h3>Role</h3>
                    <div id="experience-role-card" class="mre-card-slot" data-card-slot="experience-role" aria-label="Role card placeholder">
                        <?php /* Future backend role card */ ?>
                    </div>
                </section>
            </div>

            <div class="mre-tags mre-tags--experience" aria-label="Experience skills">
                <span>Code Optimization</span>
                <span>Refactoring</span>
                <span>Debugging</span>
                <span>DevOps</span>
                <span>Project Management</span>
            </div>
        </section>

        <section class="mre-section" aria-labelledby="mre-education-title">
            <h2 id="mre-education-title">Education</h2>
            <p class="mre-entry-description">
                I was top student. I was on dean list many times. I got scholarship for academic achievement. I was active
                in Asian Club, debate club, sailing and hiking.
            </p>

            <article class="mre-education-entry">
                <header class="mre-education-heading">
                    <div class="mre-entry-icon" aria-hidden="true">◆</div>
                    <div>
                        <h3>Master</h3>
                        <span>University</span>
                    </div>
                    <time datetime="2010/2012">2010–2012</time>
                </header>

                <div class="mre-card-grid mre-card-grid--two">
                    <div id="master-university-card" class="mre-card-slot mre-card-slot--education" data-card-slot="master-university" aria-label="Master university card placeholder">
                        <?php /* Future backend university card */ ?>
                    </div>
                    <div id="master-degree-card" class="mre-card-slot mre-card-slot--education" data-card-slot="master-degree" aria-label="Master degree card placeholder">
                        <?php /* Future backend degree card */ ?>
                    </div>
                </div>
            </article>

            <article class="mre-education-entry">
                <header class="mre-education-heading">
                    <div class="mre-entry-icon" aria-hidden="true">◆</div>
                    <div>
                        <h3>Bachelor</h3>
                        <span>University</span>
                    </div>
                    <time datetime="2006/2010">2006–2010</time>
                </header>

                <div class="mre-card-grid mre-card-grid--two">
                    <div id="bachelor-university-card" class="mre-card-slot mre-card-slot--education" data-card-slot="bachelor-university" aria-label="Bachelor university card placeholder">
                        <?php /* Future backend university card */ ?>
                    </div>
                    <div id="bachelor-degree-card" class="mre-card-slot mre-card-slot--education" data-card-slot="bachelor-degree" aria-label="Bachelor degree card placeholder">
                        <?php /* Future backend degree card */ ?>
                    </div>
                </div>
            </article>
        </section>
    </article>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
