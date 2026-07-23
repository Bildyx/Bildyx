<?php
$pageTitle = 'My Target List — Bildyx';
$pageDescription = 'Saved target companies and opportunities on Bildyx.';
$pageScript = 'js/target-list.js';
$bodyClass = 'target-list-page';
$showMainNav = false;

ob_start();
require __DIR__ . '/includes/header.php';
$sharedHeader = ob_get_clean();
$targetStylesheet = '<link rel="stylesheet" href="css/target-list.css" />';
echo str_replace('</head>', "    {$targetStylesheet}\n</head>", $sharedHeader);
?>

<main class="tl-page">
    <div class="tl-shell">
        <section class="tl-card" aria-labelledby="tl-title">
            <header class="tl-header">
                <div>
                    <p class="tl-kicker">Showing Results for:</p>
                    <label class="tl-search-label" for="targetCity">Filter by city</label>
                    <input id="targetCity" class="tl-search-input" type="search" placeholder="enter a city" autocomplete="off" />
                </div>
            </header>

            <section class="tl-target-section" aria-labelledby="tl-company-title">
                <h1 id="tl-company-title" class="tl-section-icon" aria-label="Companies">▥</h1>
                <div class="tl-card-row" data-target-list="companies">
                    <article class="tl-info-card" data-city="kuala lumpur tokyo" data-name="pekamix global">
                        <div class="tl-card-top">
                            <span class="tl-logo">MG</span>
                            <h2>Pekamix Global</h2>
                        </div>
                        <div class="tl-divider"></div>
                        <p class="tl-card-type">International Company</p>
                        <dl>
                            <div><dt>Industry</dt><dd>Cloud Computing &amp; IaaS</dd></div>
                            <div><dt>Type</dt><dd>Public</dd></div>
                            <div><dt>Founded</dt><dd>1984</dd></div>
                            <div><dt>Headquarters</dt><dd>Kuala Lumpur</dd></div>
                            <div><dt>No. of offices</dt><dd>6</dd></div>
                            <div><dt>No. of employees</dt><dd>8,500</dd></div>
                            <div><dt>Products</dt><dd>CloudFlex IaaS, Pekamix Cloud Storage</dd></div>
                            <div><dt>Known for</dt><dd>Scalable global cloud infrastructure</dd></div>
                        </dl>
                        <footer><span>#COM-000003</span><span>©2026</span></footer>
                    </article>

                    <article class="tl-info-card" data-city="tokyo seattle" data-name="pekamix salespro">
                        <div class="tl-card-top">
                            <span class="tl-logo">MG</span>
                            <h2>Pekamix SalesPro</h2>
                        </div>
                        <div class="tl-divider"></div>
                        <p class="tl-card-type">B2B</p>
                        <dl>
                            <div><dt>Company</dt><dd>Pekamix Global</dd></div>
                            <div><dt>Product Type</dt><dd>Sales Software</dd></div>
                            <div><dt>Description</dt><dd>Next-generation AI sales management platform that helps teams track leads, manage pipelines, and forecast revenue.</dd></div>
                            <div><dt>Industries</dt><dd>Retail, B2B Services, E-commerce, SaaS</dd></div>
                            <div><dt>Competitors</dt><dd>Sales XY, Trackex, GamaCRM</dd></div>
                            <div><dt>Fun Fact</dt><dd>Beta-tested by 50 startups, whose combined sales grew 27% in the first quarter.</dd></div>
                        </dl>
                        <footer><span>#PRO-000002</span><span>©2026</span></footer>
                    </article>
                </div>
            </section>

            <section class="tl-target-section" aria-labelledby="tl-government-title">
                <h2 id="tl-government-title" class="tl-section-icon" aria-label="Public sector">▥</h2>
                <div class="tl-card-row" data-target-list="government">
                    <article class="tl-info-card" data-city="washington dc" data-name="united states government">
                        <div class="tl-card-top">
                            <span class="tl-logo">MG</span>
                            <h2>United States Government</h2>
                        </div>
                        <div class="tl-divider"></div>
                        <p class="tl-card-type">Federal Government</p>
                        <dl>
                            <div><dt>Type</dt><dd>Federal constitutional republic with a presidential system</dd></div>
                            <div><dt>Established</dt><dd>July 4, 1776</dd></div>
                            <div><dt>Capital</dt><dd>Washington, D.C.</dd></div>
                            <div><dt>No. of employees</dt><dd>2.3 million</dd></div>
                            <div><dt>Known for / Impact</dt><dd>Law enforcement, economic regulation, public health...</dd></div>
                            <div><dt>Functions / Programs</dt><dd>National defense, foreign affairs, Social Security...</dd></div>
                            <div><dt>Budget</dt><dd>US$7 trillion</dd></div>
                            <div><dt>Partners</dt><dd>United Nations, NATO, World Bank...</dd></div>
                        </dl>
                        <footer><span>#GOV-000001</span><span>©2026</span></footer>
                    </article>

                    <article class="tl-info-card" data-city="washington dc" data-name="office of electricity">
                        <div class="tl-card-top">
                            <span class="tl-logo">MG</span>
                            <h2>Office of Electricity</h2>
                        </div>
                        <div class="tl-divider"></div>
                        <p class="tl-card-type">Office within the Department of Energy</p>
                        <dl>
                            <div><dt>Established</dt><dd>2020</dd></div>
                            <div><dt>Headquarters</dt><dd>Washington, D.C.</dd></div>
                            <div><dt>Parent</dt><dd>Department of Energy</dd></div>
                            <div><dt>Subordinate Units/Branches</dt><dd>Grid Systems, Grid Controls, Energy Storage</dd></div>
                            <div><dt>Description</dt><dd>Modernizes, secures, and strengthens America's electric grid.</dd></div>
                            <div><dt>Jurisdiction</dt><dd>United States</dd></div>
                            <div><dt>Functions / Programs</dt><dd>Grid modernization, resilience, cybersecurity.</dd></div>
                        </dl>
                        <footer><span>#DOE-000001</span><span>©2026</span></footer>
                    </article>
                </div>
            </section>
        </section>

        <aside class="profile-side-nav" aria-label="Profile menu">
            <a class="side-nav-button" href="profile.php"><span aria-hidden="true">☻</span> Profile</a>
            <a class="side-nav-button is-active" href="target-list.php"><span aria-hidden="true">◎</span> My Target List</a>
            <a class="side-nav-button" href="tests-preferences.php"><span aria-hidden="true">▣</span> Tests &amp;<br> Preferences</a>
            <a class="side-nav-button" href="my-jobs.php"><span aria-hidden="true">▥</span> My Jobs</a>
            <a class="side-nav-button" href="settings.php"><span aria-hidden="true">⚙</span> Settings</a>
        </aside>
    </div>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
