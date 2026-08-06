<?php
$pageTitle = 'MicroResume — Bildyx';
$pageDescription = 'Turn your resume into a scannable signal system with Bildyx MicroResume.';
$pageScript = 'js/microresume.ts';
$bodyClass = 'microresume-page';

/*
 * Le header partagé reste inchangé.
 * On ajoute uniquement la feuille CSS de cette nouvelle page.
 */
ob_start();
require __DIR__ . '/includes/header.php';
$sharedHeader = ob_get_clean();
$microresumeStylesheet = '<link rel="stylesheet" href="css/microresume.css" />';
echo str_replace('</head>', "    {$microresumeStylesheet}\n</head>", $sharedHeader);
?>

<main class="mr-page">
    <section class="mr-hero" aria-labelledby="mr-hero-title">
        <div class="mr-shell mr-hero__inner">
            <div class="mr-hero__copy">
                <p class="mr-kicker"><span aria-hidden="true">——</span> Built for the 6-second recruiter scan</p>
                <h1 id="mr-hero-title">Turn your resume into a<br>scannable signal<br>system.</h1>
                <p class="mr-hero__lead">Bildyx MicroResume is a condensed, card-based professional profile designed for how recruiters actually work: scanning, pattern-matching, and reducing uncertainty in seconds.</p>

                <ul class="mr-bullet-list">
                    <li>Make your key signals — roles, companies, products, impact — instantly visible.</li>
                    <li>Add missing context so unknown universities and companies don't hold you back.</li>
                    <li>Standardize messy job titles into clear, comparable role profiles.</li>
                </ul>

                <div class="mr-actions">
                    <a class="mr-button mr-button--primary mr-smart-login" href="login.php" data-auth-redirect="profile.php">Log in</a>
                    <a class="mr-button mr-button--primary" href="microresume-example.php">
                        See MicroResume example
                    </a>
                </div>
                <p class="mr-note">Designed to sit on top of your existing resume — not replace it.</p>
            </div>
        </div>
    </section>

    <section class="mr-blue mr-problems" id="why-microresume" aria-labelledby="mr-problems-title">
        <div class="mr-shell">
            <header class="mr-section-heading mr-section-heading--light">
                <h2 id="mr-problems-title">The three core problems in modern hiring.</h2>
                <p>Hiring is rapid uncertainty reduction under time pressure. Traditional resumes weren't<br class="mr-desktop-only"> built for 6-second scans, missing context, or chaotic job titles.</p>
            </header>

            <div class="mr-problem-grid">
                <article class="mr-problem-card">
                    <span class="mr-card-label">Problem 1</span>
                    <h3>The 6-second reality</h3>
                    <p>You spend hours crafting your resume. Recruiters skim it in 6–7 seconds. They scan, pattern-match, and look for fast signals — not nuance.</p>
                    <ul>
                        <li>Candidates optimize for completeness.</li>
                        <li>Recruiters optimize for quick elimination.</li>
                        <li>If title, company, dates, and results aren't obvious, you're filtered out.</li>
                    </ul>
                </article>

                <article class="mr-problem-card">
                    <span class="mr-card-label">Problem 2</span>
                    <h3>Missing context creates bias</h3>
                    <p>A job title alone means little without the story behind it. Unknown universities and companies feel risky when context is missing.</p>
                    <ul>
                        <li>Recruiters rely on brands, logos, and familiar institutions.</li>
                        <li>Strong candidates from lesser-known places are quietly ignored.</li>
                        <li>Not for lack of skill — but lack of recognizable signals.</li>
                    </ul>
                </article>

                <article class="mr-problem-card">
                    <span class="mr-card-label">Problem 3</span>
                    <h3>Title inflation &amp; ambiguity</h3>
                    <p>"VP" at a 15-person startup. "Lead" with no reports. "Code ninja" in a job ad. Titles alone don't describe real scope or impact.</p>
                    <ul>
                        <li>No standard for seniority, scope, or leadership.</li>
                        <li>Candidates get mis-leveled or misunderstood.</li>
                        <li>Ambiguity increases uncertainty — and slows trust.</li>
                    </ul>
                </article>
            </div>

            <div class="mr-underlying">
                <p class="mr-kicker mr-kicker--light"><span aria-hidden="true">——</span> The underlying issue</p>
                <h2>Hiring is rapid uncertainty reduction<br>under time pressure.</h2>
                <p>To cope, recruiters rely on speed-based scanning, brand recognition, and title familiarity.<br class="mr-desktop-only"> When resumes lack clear, standardized context, the system defaults to shortcuts.</p>
            </div>
        </div>
    </section>

    <section class="mr-solution" id="how-it-works" aria-labelledby="mr-solution-title">
        <div class="mr-shell">
            <header class="mr-section-heading">
                <h2 id="mr-solution-title">The Bildyx MicroResume solution.</h2>
                <p>A condensed, modular, card-based professional profile that sits on top of your existing<br class="mr-desktop-only"> resume. Built to match real recruiter behavior.</p>
            </header>

            <div class="mr-feature-grid">
                <article>
                    <h3>Built for the 6-second scan</h3>
                    <p>MicroResume compresses your story into structured cards that surface role, context, and impact immediately.</p>
                </article>
                <article>
                    <h3>Context built in</h3>
                    <p>Each card carries the missing pieces: company size, industry, product type, scope, certifications, and more. No Googling. No guesswork.</p>
                </article>
                <article>
                    <h3>Standardized titles</h3>
                    <p>Chaotic job titles translate into clear role profiles that show what you do, what you ship, and which tools you use.</p>
                </article>
                <article>
                    <h3>From paragraphs to structured signal units</h3>
                    <p>Instead of dense text blocks, recruiters see modular signal cards: Company, Role, Product, Certification, Education, Skills, and Impact.</p>
                </article>
                <article>
                    <h3>Modular &amp; adaptable</h3>
                    <p>Stack relevant cards per application so each MicroResume feels targeted without rewriting your entire story.</p>
                </article>
                <article>
                    <h3>Reduces brand bias</h3>
                    <p>When structured context is visible, evaluation shifts from logo recognition to substance — skills, scope, and outcomes.</p>
                </article>
            </div>
        </div>
    </section>

    <section class="mr-blue mr-advantage" aria-labelledby="mr-advantage-title">
        <div class="mr-shell">
            <header class="mr-section-heading mr-section-heading--light">
                <h2 id="mr-advantage-title">The core advantage: less guessing, more clarity.</h2>
                <p>Traditional resumes increase uncertainty through ambiguous titles, unknown brands,<br class="mr-desktop-only"> dense formatting, and hidden impact. Bildyx reduces uncertainty by standardizing how<br class="mr-desktop-only"> your story is read.</p>
            </header>

            <div class="mr-advantage-grid">
                <article>
                    <h3>Traditional resumes rely on</h3>
                    <p>Brand recognition, formatting tricks, and keyword stuffing — all weak proxies for actual fit.</p>
                </article>
                <article>
                    <h3>Why it matters</h3>
                    <p>The best candidate shouldn't just be the one with the most famous logo or most polished formatting. They should be the one whose skills, experience, and impact actually match the role.</p>
                </article>
                <article>
                    <h3>Bildyx MicroResume focuses on</h3>
                    <p>Structured signals: context, scope, tools, products, and impact — the things that really define your work.</p>
                </article>
                <article>
                    <h3>Being qualified isn't enough</h3>
                    <p>In modern hiring you also need to be legible. MicroResume helps you be understood — instantly.</p>
                </article>
            </div>
        </div>
    </section>

    <section class="mr-final" aria-labelledby="mr-final-title">
        <div class="mr-shell mr-final__inner">
            <h2 id="mr-final-title">Build your first Bildyx MicroResume.</h2>
            <p>If you're tired of being overlooked because your story doesn't fit<br class="mr-desktop-only"> into a 6-second skim, MicroResume is for you. Turn your<br class="mr-desktop-only"> experience into a clear, scannable signal system.</p>
            <a class="mr-button mr-button--primary mr-smart-login" href="login.php" data-auth-redirect="profile.php">Log in</a>
            <p class="mr-note">No spam. Just occasional progress updates and an invite when we're ready.</p>
        </div>
    </section>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
