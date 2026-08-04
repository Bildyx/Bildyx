<?php
$pageTitle = 'Company Archives — Bildyx';
$pageDescription = 'Connected company archive page on Bildyx.';
$pageScript = 'js/compagny_con.ts';
$bodyClass = 'team-example-page company-page compagny-con-page compagny-archive-page';
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


<main class="te-page compagny-con-main">
    <div class="te-company-bar" aria-label="Current company">PEKAMIX</div>

    <section class="compagny-archive-true-card" aria-labelledby="archive-title">
        <header class="compagny-archive-true-header">
            <a href="compagny_con.php" aria-label="Back to company page">←</a>
            <div>
                <p>Connected company account</p>
                <h1 id="archive-title">Company Archives</h1>
            </div>
        </header>

        <div class="compagny-archive-true-grid">
            <div class="te-backend-slot te-company-card-slot" data-card-slot="archive-company-1"></div>
            <div class="te-backend-slot te-company-card-slot" data-card-slot="archive-company-2"></div>
            <div class="te-backend-slot te-company-card-slot" data-card-slot="archive-company-3"></div>
            <div class="te-backend-slot te-company-card-slot" data-card-slot="archive-company-4"></div>
        </div>
    </section>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
