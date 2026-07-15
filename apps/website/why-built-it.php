<?php
$pageTitle = 'Why We Built It — Bildyx';
$pageDescription = 'Why Bildyx was built: clarity, chemistry, and confidence in hiring.';
$pageScript = 'js/why-built-it.js';
$bodyClass = 'why-built-page';
$showMainNav = false;

/*
 * Header/footer shared remain unchanged.
 * This page only adds its own stylesheet.
 */
ob_start();
require __DIR__ . '/includes/header.php';
$sharedHeader = ob_get_clean();
$whyBuiltStylesheet = '<link rel="stylesheet" href="css/why-built-it.css" />';
echo str_replace('</head>', "    {$whyBuiltStylesheet}\n</head>", $sharedHeader);
?>

<main class="why-built-main">
    <section class="why-hero" aria-labelledby="why-title">
        <span class="why-eyebrow">Why we built it</span>
        <h1 id="why-title">Why We Build</h1>
        <p>We built Bildyx because hiring should be about clarity, chemistry, and confidence — not keywords and guesswork.</p>
    </section>

    <section class="why-origin" aria-labelledby="origin-title">
        <div class="why-origin__text">
            <span class="why-eyebrow">The origin</span>
            <h2 id="origin-title">It Started With a Question</h2>
            <p>
                Why is hiring — one of the most important decisions companies and candidates make —
                still so slow, biased, and unclear?
            </p>
            <p>
                We watched brilliant candidates get filtered out by keywords. We saw great companies
                lose talent to noise. Something was clearly off.
            </p>
            <p>So we set out to fix it — an answer at a time.</p>
        </div>

        <aside class="why-origin__timeline" aria-label="Bildyx milestones">
            <ul>
                <li><strong>First candidate saved</strong><span>Structured signal beat keyword sorting.</span></li>
                <li><strong>First company</strong><span>A team that trusted context over CVs.</span></li>
                <li><strong>First framework</strong><span>The MicroResume model was born.</span></li>
                <li><strong>First iteration</strong><span>Real feedback shaped every card.</span></li>
                <li><strong>Products shipped</strong><span>Team profiles, MicroResume, Company Test.</span></li>
                <li><strong>Still going</strong><span>New answers every week.</span></li>
            </ul>
        </aside>
    </section>

    <section class="why-beliefs" aria-labelledby="beliefs-title">
        <div class="why-section-heading why-section-heading--light">
            <span class="why-eyebrow">Our beliefs</span>
            <h2 id="beliefs-title">Four beliefs that guide<br>everything we make</h2>
        </div>

        <div class="belief-grid">
            <article class="belief-card">
                <img src="images/why-purpose.png" alt="" aria-hidden="true">
                <h3>We Build With Purpose</h3>
                <p>Every feature starts with a clear reason. If it doesn't move hiring forward for candidates or teams, we don't ship it.</p>
            </article>

            <article class="belief-card">
                <img src="images/why-people.png" alt="" aria-hidden="true">
                <h3>We Build For People</h3>
                <p>Real recruiters, real job seekers, real teams. We design around the humans on both sides of the hiring table.</p>
            </article>

            <article class="belief-card">
                <img src="images/why-curiosity.png" alt="" aria-hidden="true">
                <h3>We Build Through Curiosity</h3>
                <p>The best solutions come from asking better questions. We keep learning, testing, and refining what works.</p>
            </article>

            <article class="belief-card">
                <img src="images/why-together.png" alt="" aria-hidden="true">
                <h3>We Build Together</h3>
                <p>Great products aren't built alone. We partner with candidates and companies to shape Bildyx.</p>
            </article>
        </div>
    </section>

    <section class="why-process" aria-labelledby="process-title">
        <div class="why-section-heading">
            <span class="why-eyebrow">How we work</span>
            <h2 id="process-title">The Building Process</h2>
        </div>

        <ol class="process-list">
            <li><span>01</span><strong>Discover</strong><p>Listen to candidates and teams to find what's actually broken.</p></li>
            <li><span>02</span><strong>Understand</strong><p>Dig into the why behind hiring friction, not just the symptoms.</p></li>
            <li><span>03</span><strong>Create</strong><p>Design solutions that match how hiring really works.</p></li>
            <li><span>04</span><strong>Test</strong><p>Ship early, learn fast, and refine with real users.</p></li>
            <li><span>05</span><strong>Improve</strong><p>Iterate until every touchpoint feels obvious and effortless.</p></li>
            <li><span>06</span><strong>Deliver</strong><p>Roll it out to companies and candidates who need it.</p></li>
        </ol>
    </section>

    <section class="why-iterate" aria-labelledby="iterate-title">
        <div class="why-iterate__intro">
            <div>
                <span class="why-eyebrow">How we iterate</span>
                <h2 id="iterate-title">Building is a process,<br>not a moment.</h2>
            </div>
            <p>
                Every version of Bildyx is shaped by conversations with candidates, teams, and recruiters.
                We keep listening — because the moment we stop, we stop building the right thing.
            </p>
        </div>

        <div class="iterate-grid">
            <article class="iterate-card iterate-card--large">
                <p>Sticky notes, whiteboards, and long calls — the real R&amp;D lives here.</p>
            </article>
            <article class="iterate-card">
                <p>Every card, every field, every question — pressure-tested.</p>
            </article>
            <article class="iterate-card iterate-card--blue">
                <blockquote>"Fail faster.<br>Learn deeper."</blockquote>
                <span>— our motto</span>
            </article>
            <article class="iterate-card">
                <p>From sketches to shipped features in weeks — not quarters.</p>
            </article>
            <article class="iterate-card iterate-card--outline">
                <p>Every release is a step closer to hiring without friction.</p>
            </article>
        </div>
    </section>

    <section class="why-stats" aria-label="Bildyx numbers">
        <div><strong>10+</strong><span>Years of hiring experience</span></div>
        <div><strong>50+</strong><span>Teams onboarded</span></div>
        <div><strong>100K+</strong><span>MicroResumes powered</span></div>
    </section>

    <section class="why-testimonials" aria-labelledby="testimonials-title">
        <div class="why-section-heading">
            <span class="why-eyebrow">What people say</span>
            <h2 id="testimonials-title">What people say about<br>the work</h2>
        </div>

        <div class="testimonial-grid">
            <article class="testimonial-card">
                <p>"Bildyx made our hiring process feel structured for the first time. We finally see the signal, not the noise."</p>
                <div><span>S</span><strong>Sarah K.</strong><small>Head of Talent</small></div>
            </article>

            <article class="testimonial-card">
                <p>"As a candidate, I felt seen. The MicroResume put my real story in front of the right teams."</p>
                <div><span>J</span><strong>James T.</strong><small>Product Designer</small></div>
            </article>

            <article class="testimonial-card">
                <p>"The clarity Bildyx brings to both sides of hiring is the difference between guessing and knowing."</p>
                <div><span>P</span><strong>Priya S.</strong><small>Founder</small></div>
            </article>
        </div>
    </section>

    <section class="why-cta" aria-labelledby="cta-title">
        <span class="why-eyebrow">Keep going</span>
        <h2 id="cta-title">Still building. Still<br>learning. Still searching<br>for better answers.</h2>
        <p>Bildyx is a living product. If you have an idea, a problem, or a story — we want to hear it.</p>
        <div class="why-cta__actions">
            <a class="why-button why-button--white" href="contact.php">Contact us</a>
            <a class="why-button why-button--ghost" href="mission.php">See our mission</a>
        </div>
    </section>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
