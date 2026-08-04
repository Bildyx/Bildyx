<?php
/**
 * Header partagé de Bildyx.
 *
 * Variables facultatives à définir avant l'inclusion :
 * $pageTitle       Titre de l'onglet.
 * $pageDescription Meta description.
 * $basePath        Chemin vers la racine depuis la page courante.
 * $bodyClass       Classe CSS facultative appliquée à <body>.
 */
$pageTitle = $pageTitle ?? 'Bildyx';
$pageDescription = $pageDescription ?? 'Bildyx — professional team profiles and MicroResumes.';
$basePath = $basePath ?? '';
$bodyClass = $bodyClass ?? '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="<?= htmlspecialchars($pageDescription, ENT_QUOTES, 'UTF-8') ?>" />
    <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></title>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="<?= htmlspecialchars($basePath, ENT_QUOTES, 'UTF-8') ?>css/style.css" />
</head>
<body<?= $bodyClass !== '' ? ' class="' . htmlspecialchars($bodyClass, ENT_QUOTES, 'UTF-8') . '"' : '' ?>>
    <header class="site-header">
        <div class="header-content">
            <a href="<?= htmlspecialchars($basePath, ENT_QUOTES, 'UTF-8') ?>index.php" class="logo" aria-label="Bildyx home">
                <img src="<?= htmlspecialchars($basePath, ENT_QUOTES, 'UTF-8') ?>images/Logo.png" alt="Bildyx" />
            </a>

            <nav class="nav-buttons" aria-label="Authentication">
                <a href="<?= htmlspecialchars($basePath, ENT_QUOTES, 'UTF-8') ?>login.php" class="login">Log In</a>
                <a href="<?= htmlspecialchars($basePath, ENT_QUOTES, 'UTF-8') ?>login.php?tab=signup" class="signup">Sign Up</a>
            </nav>
        </div>
    </header>
