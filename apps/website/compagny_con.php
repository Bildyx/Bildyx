<?php
$pageTitle = 'Company — Bildyx';
$pageDescription = 'Company profile page for Bildyx.';
$pageScript = null;
$bodyClass = 'company-page';
$showMainNav = false;

ob_start();
require __DIR__ . '/includes/header.php';
$sharedHeader = ob_get_clean();

$companyStylesheet = '<link rel="stylesheet" href="css/compagny_con.css" />';
echo str_replace('</head>', "    {$companyStylesheet}\n</head>", $sharedHeader);
?>


<script>
(function () {
  const rawSession =
    sessionStorage.getItem('bildyx_session') ||
    localStorage.getItem('bildyx_session');

  if (!rawSession) return;

  try {
    const session = JSON.parse(rawSession);
    const accountType = String(session.accountType || session.role || '')
      .toLowerCase()
      .replace(/[\s_-]/g, '');

    if (accountType && accountType !== 'company') {
      window.location.href = 'profile.php';
    }
  } catch (error) {
    console.warn('Unable to read Bildyx session:', error);
  }
})();
</script>


<main class="company-page-shell">
    <div class="company-layout">
        <aside class="company-left-rail" aria-label="Company sidebar">
            <section class="company-slot company-slot--side" data-card-slot="company-card" aria-label="Company card empty slot"></section>

            <h2>Parent Company</h2>

            <section class="company-slot company-slot--side" data-card-slot="parent-company-card" aria-label="Parent company empty slot"></section>

            <a class="company-archive-link" href="compagny_archive_true.php">▣ Company Archives</a>
        </aside>

        <section class="company-main-card" aria-labelledby="company-title">
            <header class="company-title-bar">
                <h1 id="company-title">PEKAMIX</h1>
            </header>

            <section class="company-section">
                <h2>Our Teams</h2>

                <div class="team-box">
                    <div class="team-box-main">
                        <div class="team-tabs">
                            <button class="is-active" type="button">Team Alpha</button>
                            <button type="button">Team Beta</button>
                            <button type="button">Team Gamma</button>
                            <button type="button">Team Delta</button>
                        </div>

                        <div class="people-grid">
                            <article><span></span><strong>Michael</strong><small>VP Marketing</small></article>
                            <article><span></span><strong>Amelia</strong><small>Product Manager</small></article>
                            <article><span></span><strong>Carlos</strong><small>Lead Engineer</small></article>
                            <article><span></span><strong>Hana</strong><small>UX Designer</small></article>
                            <article><span></span><strong>Ethan</strong><small>Data Analyst</small></article>
                            <article><span></span><strong>Naomi</strong><small>QA Lead</small></article>
                            <article><span></span><strong>Clara</strong><small>Scrum Master</small></article>
                            <article><span></span><strong>Omar</strong><small>DevOps Engineer</small></article>
                        </div>

                        <h3>Our Offices</h3>
                        <div class="office-list">
                            <button type="button"><span></span>Tokyo</button>
                            <button type="button"><span></span>New York</button>
                            <button type="button"><span></span>Istanbul</button>
                            <button class="is-active" type="button"><span></span>Seattle</button>
                            <button type="button"><span></span>Kuala Lumpur</button>
                            <button type="button"><span></span>San Francisco</button>
                        </div>

                        <h3>Main Products / Services</h3>
                        <div class="product-tabs">
                            <button class="is-active" type="button">Marketing Software</button>
                            <button type="button">ERP Systems</button>
                            <button type="button">Sales Software</button>
                            <button type="button">Cloud Infrastructure</button>
                            <button type="button">Data Analytics</button>
                        </div>
                    </div>

                    <aside class="team-profile">
                        <h3>Team Profile</h3>
                        <span>Team Alpha</span>

                        <h4>Who We Are</h4>
                        <p>A mix of senior and emerging talent from startups and global tech.</p>

                        <h4>What We're Great At</h4>
                        <p>Strong in system design, product thinking, and fast delivery.</p>

                        <h4>Team Culture</h4>
                        <p>Collaborative, low politics, friendly, and practical.</p>

                        <h4>How We Work Together</h4>
                        <p>Hybrid across three cities. Async-first, minimal meetings.</p>

                        <h4 class="warning">This team is NOT for you if...</h4>
                        <p>You prefer rigid routines or dislike shifting priorities mid-sprint.</p>

                        <div>
                            <button type="button">People</button>
                            <button type="button">How We Operate</button>
                        </div>
                    </aside>
                </div>
            </section>

            <section class="company-section">
                <h2>Our Product &amp; Service Portfolio</h2>
                <div class="slot-row">
                    <button class="arrow" type="button">‹</button>
                    <article class="company-slot" data-card-slot="product-card" aria-label="Product card empty slot"></article>
                    <article class="company-slot" data-card-slot="product-card" aria-label="Product card empty slot"></article>
                    <button class="arrow" type="button">›</button>
                </div>
                <div class="dots"><i></i><i></i></div>
            </section>

            <section class="company-section">
                <h2>Our Brands</h2>
                <div class="slot-row">
                    <button class="arrow" type="button">‹</button>
                    <article class="company-slot" data-card-slot="brand-card" aria-label="Brand card empty slot"></article>
                    <article class="company-slot" data-card-slot="brand-card" aria-label="Brand card empty slot"></article>
                    <button class="arrow" type="button">›</button>
                </div>
                <div class="dots"><i></i><i></i></div>
            </section>

            <section class="company-section">
                <h2>Photos</h2>
                <div class="photo-row">
                    <article class="company-photo-slot" aria-label="Office photo empty slot"></article>
                    <article class="company-photo-slot" aria-label="Team photo empty slot"></article>
                </div>
                <div class="dots"><i></i><i></i></div>
            </section>

            <section class="company-section">
                <h2>Partners</h2>
                <div class="slot-row">
                    <button class="arrow" type="button">‹</button>
                    <article class="company-slot" data-card-slot="partner-card" aria-label="Partner card empty slot"></article>
                    <article class="company-slot" data-card-slot="partner-card" aria-label="Partner card empty slot"></article>
                    <button class="arrow" type="button">›</button>
                </div>
                <div class="dots"><i></i><i></i></div>
            </section>

            <section class="company-section">
                <h2>Customers</h2>
                <div class="slot-row">
                    <button class="arrow" type="button">‹</button>
                    <article class="company-slot" data-card-slot="customer-card" aria-label="Customer card empty slot"></article>
                    <article class="company-slot" data-card-slot="customer-card" aria-label="Customer card empty slot"></article>
                    <button class="arrow" type="button">›</button>
                </div>
                <div class="dots"><i></i><i></i></div>
            </section>
        </section>

        <aside class="company-tip-card">
            <h2>✧ TIP</h2>
            <p>Job seekers want to know the team before they apply. Create a free team profile on Bildyx Teams and show them yours today.</p>
        </aside>
    </div>
</main>

<script src="js/compagny_con.js"></script>

<?php require __DIR__ . '/includes/footer.php'; ?>
