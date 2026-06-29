<?php
$pages = [
    'login' => 'Log In',
    'signup' => 'Sign Up',
    'create-team-profile' => 'Create Team Profile',
    'create-microresume' => 'Create MicroResume',
    'company' => 'Company',
    'mission' => 'Mission',
    'contact' => 'Contact',
    'why-we-built-it' => 'Why we built it',
    'linkedin' => 'LinkedIn',
    'facebook' => 'Facebook',
    'youtube' => 'YouTube',
    'x-twitter' => 'X / Twitter',
    'instagram' => 'Instagram',
    'privacy-policy' => 'Privacy Policy',
    'terms-of-service' => 'Terms of Service',
];

$pageKey = $_GET['page'] ?? '';
$featureName = $pages[$pageKey] ?? 'This feature';
$pageTitle = 'Bildyx — ' . $featureName;
$pageDescription = $featureName . ' is coming soon on Bildyx.';
$bodyClass = 'generic-page';
require __DIR__ . '/includes/header.php';
?>

<main class="generic-main">
    <section class="generic-card">
        <span class="eyebrow">Coming soon</span>
        <h1><?= htmlspecialchars($featureName, ENT_QUOTES, 'UTF-8') ?></h1>
        <p>This page is under construction. The feature will be added later.</p>
        <a href="index.php" class="primary-button">Back to home</a>
    </section>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
