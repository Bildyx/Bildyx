<?php
$pageTitle = 'Pekamix Company Archives — Bildyx';
$pageDescription = 'Historical company information for Pekamix.';
$pageScript = 'js/company-archives.js';
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
        <aside class="ca-rail">
            <div class="ca-card-slot ca-card-slot--company" data-card-slot="current-company"></div>
            <h1>Parent Company</h1>
            <div class="ca-card-slot ca-card-slot--parent" data-card-slot="parent-company"></div>
            <a class="ca-archive-link is-active" href="company-archives.php">▣ Company Archives</a>
        </aside>

        <section class="ca-content">
            <div class="ca-panel">
                <h2>HISTORY</h2>

                <section class="ca-section">
                    <h3>Founding Team</h3>
                    <div class="ca-grid ca-grid--three" id="founding-team">
                        <div class="ca-slot" data-card-slot="founder"></div>
                        <div class="ca-slot" data-card-slot="founder"></div>
                        <div class="ca-slot" data-card-slot="founder"></div>
                        <div class="ca-slot" data-card-slot="founder"></div>
                        <div class="ca-slot" data-card-slot="founder"></div>
                        <div class="ca-slot" data-card-slot="founder"></div>
                    </div>
                </section>

                <section class="ca-section">
                    <h3>Alumni</h3>
                    <div class="ca-grid ca-grid--three">
                        <div class="ca-slot" data-card-slot="alumni"></div>
                        <div class="ca-slot" data-card-slot="alumni"></div>
                        <div class="ca-slot" data-card-slot="alumni"></div>
                    </div>
                </section>

                <section class="ca-section">
                    <h3>Former Office Locations</h3>
                    <div class="ca-round-grid">
                        <div class="ca-round-slot" data-card-slot="former-office"></div>
                        <div class="ca-round-slot" data-card-slot="former-office"></div>
                        <div class="ca-round-slot" data-card-slot="former-office"></div>
                    </div>
                </section>

                <section class="ca-section">
                    <h3>Former Parent Company</h3>
                    <div class="ca-info-slot" data-card-slot="former-parent"></div>
                </section>

                <section class="ca-section">
                    <h3>Retired Product and Service Portfolio</h3>
                    <div class="ca-inline-slots">
                        <div class="ca-small-slot" data-card-slot="retired-product"></div>
                        <div class="ca-small-slot" data-card-slot="retired-product"></div>
                    </div>
                </section>

                <section class="ca-section">
                    <span class="ca-pill">Retired Brands</span>
                    <div class="ca-wide-slot" data-card-slot="retired-brands"></div>
                </section>

                <section class="ca-section">
                    <span class="ca-pill">Photos (Historical)</span>
                    <div class="ca-photo-grid">
                        <div class="ca-photo-slot" data-card-slot="historical-photo"></div>
                        <div class="ca-photo-slot" data-card-slot="historical-photo"></div>
                    </div>
                </section>

                <section class="ca-section">
                    <span class="ca-pill">Former Partners</span>
                    <div class="ca-wide-slot" data-card-slot="former-partners"></div>
                </section>

                <section class="ca-section">
                    <span class="ca-pill">Former Customers</span>
                    <div class="ca-wide-slot" data-card-slot="former-customers"></div>
                </section>

                <section class="ca-section">
                    <span class="ca-pill">Former Investors</span>
                    <div class="ca-wide-slot" data-card-slot="former-investors"></div>
                </section>

                <section class="ca-section">
                    <span class="ca-pill">Former Subsidiaries</span>
                    <div class="ca-wide-slot" data-card-slot="former-subsidiaries"></div>
                </section>
            </div>
        </section>
    </div>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
