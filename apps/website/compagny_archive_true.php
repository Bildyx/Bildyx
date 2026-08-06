<?php
$pageTitle='Company Archives — Bildyx';$pageDescription='Connected company archives.';$pageScript=null;$bodyClass='company-page compagny-con-page';$showMainNav=false;
ob_start();require __DIR__.'/includes/header.php';$h=ob_get_clean();$css='<link rel="stylesheet" href="css/compagny_con.css" />';echo str_replace('</head>',"    {$css}\n</head>",$h);
?>
<main class="cc-page"><div class="cc-company-bar"><span>Company Archives</span><a class="cc-edit-link" href="compagny_con.php">‹ Back</a></div><section class="cc-archive"><h1>Company Archives</h1><p>This page is connected to the same company account.</p><div class="cc-slot-grid"><div class="cc-large-slot"></div><div class="cc-large-slot"></div><div class="cc-large-slot"></div><div class="cc-large-slot"></div></div></section></main>
<?php require __DIR__.'/includes/footer.php'; ?>
