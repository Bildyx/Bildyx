<?php
$pageTitle = 'Company — Bildyx';
$pageDescription = 'Connected company profile page on Bildyx.';
$pageScript = 'js/compagny_con.ts';
$bodyClass = 'company-page compagny-con-page';
$showMainNav = false;

ob_start();
require __DIR__ . '/includes/header.php';
$sharedHeader = ob_get_clean();
$companyStylesheet = '<link rel="stylesheet" href="css/compagny_con.css" />';
echo str_replace('</head>', "    {$companyStylesheet}\n</head>", $sharedHeader);
?>

<script>
(function(){
  const raw=sessionStorage.getItem('bildyx_session')||localStorage.getItem('bildyx_session');
  if(!raw)return;
  try{const s=JSON.parse(raw);const t=String(s.accountType||s.role||'').toLowerCase().replace(/[\s_-]/g,'');if(t&&t!=='company')location.href='profile.php';}catch(e){}
})();
</script>

<main class="cc-page">
  <div class="cc-company-bar">
    <span data-company-name>Company Profile</span>
    <a class="cc-edit-link" href="compagny_con_admin.php"><span>✎</span> Edit</a>
  </div>
  <div class="cc-layout">
    <aside class="cc-left-rail">
      <section class="cc-company-card" data-public-company-card><div class="cc-empty-slot"></div></section>
      <h1>Parent Company</h1>
      <section class="cc-company-card cc-company-card--small" data-public-parent-card><div class="cc-empty-slot"></div></section>
      <a class="cc-archive-link" href="compagny_archive_true.php"><span>▣</span> Company Archives</a>
    </aside>
    <section class="cc-content">
      <section class="cc-team-panel">
        <div class="cc-team-main">
          <h2>Our Teams</h2>
          <div class="cc-team-tabs" id="ccTeamTabs"></div>
          <div class="cc-members" id="ccMembers"><div class="cc-empty-message">No team members added yet.</div></div>
          <section class="cc-subsection"><h3>Our Offices</h3><div class="cc-offices" id="ccOffices"></div></section>
          <section class="cc-subsection"><h3>Main Products / Services</h3><div class="cc-products" id="ccProducts"></div></section>
        </div>
        <aside class="cc-team-profile">
          <h2>Team Profile</h2>
          <span class="cc-team-badge" id="ccTeamBadge">No team selected</span>
          <div class="cc-profile-points" id="ccProfilePoints"><p class="cc-profile-empty">No team profile added yet.</p></div>
          <div class="cc-profile-actions">
            <button class="cc-profile-button is-active" type="button" data-profile-mode="people">People</button>
            <button class="cc-profile-button" type="button" data-profile-mode="operate">How We Operate</button>
          </div>
        </aside>
      </section>
      <section class="cc-section"><h2>Our Product &amp; Service Portfolio</h2><div class="cc-slot-grid" id="ccPortfolioSlots"><div class="cc-large-slot"></div><div class="cc-large-slot"></div></div></section>
      <section class="cc-section"><h2>Our Brands</h2><div class="cc-slot-grid" id="ccBrandSlots"><div class="cc-large-slot"></div><div class="cc-large-slot"></div></div></section>
      <section class="cc-section"><span class="cc-section-pill">Photos</span><div class="cc-media-slot" id="ccPhotoSlots"></div></section>
      <section class="cc-section"><span class="cc-section-pill">Partners</span><div class="cc-media-slot" id="ccPartnerSlots"></div></section>
      <section class="cc-section"><span class="cc-section-pill">Customers</span><div class="cc-media-slot" id="ccCustomerSlots"></div></section>
    </section>
    <aside class="cc-tip-card"><strong>✣ TIP</strong><p>Job seekers want to know the team before they apply. Create a free team profile on Bildyx Teams and show them yours today.</p></aside>
  </div>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
