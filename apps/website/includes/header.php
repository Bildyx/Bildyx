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

            <nav class="nav-buttons" aria-label="Authentication and account" data-auth-nav>
                <a href="<?= htmlspecialchars($basePath, ENT_QUOTES, 'UTF-8') ?>login.php" class="login" data-login-link>Log In</a>
                <a href="<?= htmlspecialchars($basePath, ENT_QUOTES, 'UTF-8') ?>login.php?tab=signup" class="signup" data-signup-link>Sign Up</a>

                <div class="account-menu" data-account-menu>
                    <button class="account-trigger" type="button" aria-label="Account menu" aria-expanded="false" data-account-trigger>
                        <span aria-hidden="true">𖡌</span>
                    </button>

                    <div class="account-dropdown" data-account-dropdown>
                        <a href="<?= htmlspecialchars($basePath, ENT_QUOTES, 'UTF-8') ?>privacy-policy.php">
                            <span aria-hidden="true">▱</span>
                            Privacy
                        </a>

                        <button type="button" data-signout-button>
                            <span aria-hidden="true">↪</span>
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    </header>

    <script>
    (function () {
        const nav = document.querySelector('[data-auth-nav]');
        if (!nav) return;

        const loginLink = nav.querySelector('[data-login-link]');
        const signupLink = nav.querySelector('[data-signup-link]');
        const menu = nav.querySelector('[data-account-menu]');
        const trigger = nav.querySelector('[data-account-trigger]');
        const signout = nav.querySelector('[data-signout-button]');

        function parseJSON(value) {
            try {
                return value ? JSON.parse(value) : null;
            } catch (_) {
                return null;
            }
        }

        function normalizeType(value) {
            const raw = String(value || '').toLowerCase().replace(/[\s_-]/g, '');

            if (['company', 'business', 'employer', 'organization', 'organisation', 'recruiter'].includes(raw)) {
                return 'company';
            }

            if (['seeker', 'jobseeker', 'jobseekers', 'candidate', 'student', 'user'].includes(raw)) {
                return 'seeker';
            }

            return raw;
        }

        function readSession() {
            const session =
                parseJSON(sessionStorage.getItem('bildyx_session')) ||
                parseJSON(localStorage.getItem('bildyx_session')) ||
                parseJSON(localStorage.getItem('bildyx_user'));

            if (!session) return null;

            if (!sessionStorage.getItem('bildyx_session')) {
                sessionStorage.setItem('bildyx_session', JSON.stringify(session));
            }

            if (!localStorage.getItem('bildyx_session')) {
                localStorage.setItem('bildyx_session', JSON.stringify(session));
            }

            return session;
        }

        function hasActiveSession(session) {
            return Boolean(
                session &&
                (
                    session.userId ||
                    session.id ||
                    session._id ||
                    session.email ||
                    session.accountType ||
                    session.account_type ||
                    session.role
                )
            );
        }

        function getAccountType(session) {
            return normalizeType(
                session?.accountType ||
                session?.account_type ||
                session?.userType ||
                session?.user_type ||
                session?.role ||
                session?.type
            );
        }

        function clearAuthSession() {
            [
                'bildyx_session',
                'bildyx_user',
                'bildyx_pending_account_type',
                'token',
                'auth_token',
                'accessToken',
                'refreshToken',
                'bildyx_access_token',
                'bildyx_refresh_token'
            ].forEach(function (key) {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
            });
        }

        function buildSignupUrl(accountType) {
            const rawHref = signupLink?.getAttribute('href') || loginLink?.getAttribute('href') || 'login.php';
            const url = new URL(rawHref, window.location.href);

            url.searchParams.set('tab', 'signup');

            if (accountType) {
                url.searchParams.set('accountType', accountType);
                url.searchParams.set('type', accountType);
            }

            return url.href;
        }

        function refreshAuthNav() {
            const session = readSession();
            const isLoggedIn = hasActiveSession(session);

            nav.classList.toggle('is-authenticated', isLoggedIn);

            if (!isLoggedIn && menu) {
                menu.classList.remove('is-open');
                trigger?.setAttribute('aria-expanded', 'false');
            }
        }

        function isCompanyOnlyLink(link) {
            const href = String(link.getAttribute('href') || '').toLowerCase();
            const text = String(link.textContent || '').toLowerCase();

            return (
                href.includes('compagny_con.php') ||
                href.includes('create-team') ||
                href.includes('team-create') ||
                href.includes('team-builder') ||
                text.includes('create a team') ||
                text.includes('create team') ||
                text.includes('create a free team profile')
            );
        }

        function isSeekerOnlyLink(link) {
            const href = String(link.getAttribute('href') || '').toLowerCase();
            const text = String(link.textContent || '').toLowerCase();

            return (
                href.includes('profile.php') ||
                href.includes('target-list.php') ||
                href.includes('my-jobs.php') ||
                href.includes('tests-preferences.php') ||
                href.includes('microresume') ||
                text.includes('microresume') ||
                text.includes('job seeker')
            );
        }

        trigger?.addEventListener('click', function (event) {
            event.stopPropagation();

            const isOpen = !menu.classList.contains('is-open');

            menu.classList.toggle('is-open', isOpen);
            trigger.setAttribute('aria-expanded', String(isOpen));
        });

        document.addEventListener('click', function () {
            menu?.classList.remove('is-open');
            trigger?.setAttribute('aria-expanded', 'false');
        });

        document.addEventListener('keydown', function (event) {
            if (event.key !== 'Escape') return;

            menu?.classList.remove('is-open');
            trigger?.setAttribute('aria-expanded', 'false');
        });

        signout?.addEventListener('click', function () {
            clearAuthSession();
            window.location.href = loginLink?.getAttribute('href') || 'login.php';
        });

        document.addEventListener('click', function (event) {
            const link = event.target.closest ? event.target.closest('a') : null;
            if (!link) return;

            const session = readSession();
            if (!hasActiveSession(session)) return;

            const accountType = getAccountType(session);

            if (accountType === 'seeker' && isCompanyOnlyLink(link)) {
                event.preventDefault();
                clearAuthSession();
                window.location.href = buildSignupUrl('company');
                return;
            }

            if (accountType === 'company' && isSeekerOnlyLink(link)) {
                event.preventDefault();
                clearAuthSession();
                window.location.href = buildSignupUrl('seeker');
            }
        });

        refreshAuthNav();

        window.addEventListener('storage', refreshAuthNav);
        window.BildyxRefreshAuthNav = refreshAuthNav;
    })();
    </script>
