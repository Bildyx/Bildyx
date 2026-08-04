<?php
$pageTitle = 'Company Archives — Bildyx';
$pageDescription = 'Company archive page connected to company accounts.';
$pageScript = null;
$bodyClass = 'company-page company-archive-page';
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


<main class="company-page-shell company-archive-shell">
    <section class="company-archive-card" aria-labelledby="company-archive-title">
        <header class="company-archive-header">
            <a href="compagny_con.php">‹ Back</a>
            <div>
                <p>Connected Company Account</p>
                <h1 id="company-archive-title">Company Archives</h1>
            </div>
        </header>

        <div class="company-archive-grid">
            <article class="company-slot archive-empty-slot" data-card-slot="archive-company-1" aria-label="Company archive empty slot"></article>
            <article class="company-slot archive-empty-slot" data-card-slot="archive-company-2" aria-label="Company archive empty slot"></article>
            <article class="company-slot archive-empty-slot" data-card-slot="archive-company-3" aria-label="Company archive empty slot"></article>
            <article class="company-slot archive-empty-slot" data-card-slot="archive-company-4" aria-label="Company archive empty slot"></article>
        </div>
    </section>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
