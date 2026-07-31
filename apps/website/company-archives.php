<?php
$pageTitle = 'Pekamix Company Archives — Bildyx';
$pageDescription = 'Historical company information for Pekamix.';
$pageScript = 'js/company-archives.ts';
$bodyClass = 'company-archives-page';
$showMainNav = false;

ob_start();
require __DIR__ . '/includes/header.php';
$sharedHeader = ob_get_clean();
$stylesheet = '<link rel="stylesheet" href="css/company-archives.css" />';
echo str_replace('</head>', "    {$stylesheet}\n</head>", $sharedHeader);
?>

<main class="ca-page">
    <div class="ca-company-bar">PEKAMIX</div>

    <div class="ca-layout">
        <aside class="ca-rail" aria-label="Company placeholders">
            <div class="ca-company-placeholder" data-card-slot="current-company"></div>

            <h1 class="ca-rail-title">Parent Company</h1>

            <div class="ca-company-placeholder" data-card-slot="parent-company"></div>

            <a class="ca-archive-link is-active" href="company-archives.php">
                <span aria-hidden="true">▣</span>
                Company Archives
            </a>
        </aside>

        <section class="ca-content">
            <div class="ca-panel">
                <h2>HISTORY</h2>

                <section class="ca-section">
                    <h3>Founding Team</h3>
                    <div class="ca-card-frame">
                        <div class="ca-people-grid ca-people-grid--founders">
                            <article class="ca-person-card">
                                <img src="images/robert.png" alt="Robert">
                                <div><strong>Robert</strong><span>Founder &amp; CEO</span></div>
                            </article>
                            <article class="ca-person-card">
                                <img src="images/sarah.png" alt="Sarah">
                                <div><strong>Sarah</strong><span>Co-Founder, CTO</span></div>
                            </article>
                            <article class="ca-person-card">
                                <img src="images/marco.png" alt="Marco">
                                <div><strong>Marco</strong><span>Chief Architect</span></div>
                            </article>
                            <article class="ca-person-card">
                                <img src="images/mei.png" alt="Mei">
                                <div><strong>Mei</strong><span>Head of Product</span></div>
                            </article>
                            <article class="ca-person-card">
                                <img src="images/james.png" alt="James">
                                <div><strong>James</strong><span>VP Sales</span></div>
                            </article>
                            <article class="ca-person-card">
                                <img src="images/grace.png" alt="Grace">
                                <div><strong>Grace</strong><span>VP Operations</span></div>
                            </article>
                        </div>
                    </div>
                </section>

                <section class="ca-section">
                    <h3>Alumni</h3>
                    <div class="ca-card-frame">
                        <div class="ca-people-grid ca-people-grid--alumni">
                            <article class="ca-person-card">
                                <img src="images/david.png" alt="David">
                                <div><strong>David</strong><span>Former Engineer</span></div>
                            </article>
                            <article class="ca-person-card">
                                <img src="images/anna.png" alt="Anna">
                                <div><strong>Anna</strong><span>Former Designer</span></div>
                            </article>
                            <article class="ca-person-card">
                                <img src="images/rahul.png" alt="Rahul">
                                <div><strong>Rahul</strong><span>Former QA Lead</span></div>
                            </article>
                        </div>
                    </div>
                </section>

                <section class="ca-section">
                    <h3>Former Office Locations</h3>
                    <div class="ca-office-grid">
                        <article class="ca-office-card">
                            <img src="images/london.png" alt="London">
                            <span>London</span>
                        </article>
                        <article class="ca-office-card">
                            <img src="images/paris.png" alt="Paris">
                            <span>Paris</span>
                        </article>
                        <article class="ca-office-card">
                            <img src="images/berlin.png" alt="Berlin">
                            <span>Berlin</span>
                        </article>
                    </div>
                </section>

                <section class="ca-section">
                    <h3>Former Parent Company</h3>
                    <article class="ca-info-card ca-info-card--compact">
                        <div class="ca-info-card__title"><span aria-hidden="true">▣</span><strong>Vanguard Holdings (1995–2005)</strong></div>
                        <div class="ca-info-card__meta">
                            <div><b>Industry</b><span>Conglomerate</span></div>
                            <div><b>HQ</b><span>New York, NY</span></div>
                        </div>
                    </article>
                </section>

                <section class="ca-section">
                    <h3>Retired Product and Service Portfolio</h3>
                    <div class="ca-inline-list">
                        <span>▤ Legacy Hosting v1</span>
                        <span>▤ On-Premise CRM</span>
                    </div>
                </section>

                <section class="ca-section">
                    <span class="ca-pill">Retired Brands</span>
                    <div class="ca-card-frame ca-card-frame--brands">
                        <article class="ca-brand-card">
                            <div class="ca-brand-icon">A</div>
                            <div>
                                <strong>AlphaTech</strong>
                                <dl><div><dt>Status</dt><dd>Active</dd></div><div><dt>Years</dt><dd>2003–2010</dd></div></dl>
                            </div>
                        </article>
                        <article class="ca-brand-card">
                            <div class="ca-brand-icon">☁</div>
                            <div>
                                <strong>CloudSprint</strong>
                                <dl><div><dt>Status</dt><dd>Active</dd></div><div><dt>Years</dt><dd>2011–2015</dd></div></dl>
                            </div>
                        </article>
                    </div>
                </section>

                <section class="ca-section">
                    <span class="ca-pill">Photos (Historical)</span>
                    <div class="ca-photo-grid">
                        <img src="images/historical-office.png" alt="Historical open-space office">
                        <img src="images/historical-datacenter.png" alt="Historical data center">
                    </div>
                </section>

                <section class="ca-section">
                    <span class="ca-pill">Former Partners</span>
                    <article class="ca-detail-card"><strong>DataLink Corp</strong><div><b>Partnership</b><span>2005–2012</span></div></article>
                </section>

                <section class="ca-section">
                    <span class="ca-pill">Former Customers</span>
                    <article class="ca-detail-card"><strong>GlobalNet</strong><div><b>Client Years</b><span>2008–2015</span></div></article>
                </section>

                <section class="ca-section">
                    <span class="ca-pill">Former Investors</span>
                    <article class="ca-detail-card"><strong>SeedCap Partners</strong><div><b>Investment</b><span>Series A</span></div></article>
                </section>

                <section class="ca-section">
                    <span class="ca-pill">Former Subsidiaries</span>
                    <article class="ca-detail-card"><strong>Pekamix Mobile</strong><div><b>Status</b><span>Merged (2018)</span></div></article>
                </section>
            </div>
        </section>
    </div>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
