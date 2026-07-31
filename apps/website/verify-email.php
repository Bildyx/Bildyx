<?php
$pageTitle = 'Bildyx — Verify Email';
$pageDescription = 'Verify your Bildyx email address.';
$bodyClass = 'auth-page';
$showMainNav = false;

ob_start();
require __DIR__ . '/includes/header.php';
$sharedHeader = ob_get_clean();
$authStylesheet = '<link rel="stylesheet" href="css/auth.css" />';
echo str_replace('</head>', "    {$authStylesheet}\n</head>", $sharedHeader);
?>

<main class="auth-shell">
    <section class="brand-panel" id="brandPanel" aria-label="Bildyx presentation">
        <a class="brand" href="index.php" aria-label="Back to home">
            <img class="brand-icon" src="images/bildyx-icon.png" alt="" />
            <span>BILDYX</span>
        </a>

        <div class="brand-content">
            <h1 id="brandTitle">"Right Teams. Right<br>Candidates."</h1>
            <div class="brand-features">
                <article class="feature-card brand-feature">
                    <span class="feature-icon"><img src="images/image.jpg" alt="" /></span>
                    <div>
                        <h2 class="brand-feature-title">For Companies</h2>
                        <p class="brand-feature-text">Build profile and present your teams to potential candidates.</p>
                    </div>
                </article>
                <article class="feature-card brand-feature">
                    <span class="feature-icon"><img src="images/image.jpg" alt="" /></span>
                    <div>
                        <h2 class="brand-feature-title">For Job Seekers</h2>
                        <p class="brand-feature-text">Create a powerful microresume in minutes. Use Microresume as elevator pitch to potential employers.</p>
                    </div>
                </article>
            </div>
        </div>

        <p class="copyright">© 2026 MayGraph.com. All rights reserved.</p>
    </section>

    <section class="form-panel" aria-label="Email verification page">
        <div class="auth-card">
            <form id="verify-form" class="auth-form active" novalidate>
                <div class="form-heading center">
                    <h2>Verify your email</h2>
                    <p>Enter the code we just emailed you.</p>
                </div>

                <p class="switch-text">
                    Verification target:
                    <strong id="verifyEmail">your email address</strong>
                </p>

                <p id="verifyError" style="display: none; margin: 12px 0 0; color: #dc2626; font-weight: 700; text-align: center;"></p>

                <div class="field">
                    <label for="verifyCode">Verification code</label>
                    <div class="input-wrap">
                        <img class="input-icon" src="images/image.jpg" alt="" />
                        <input id="verifyCode" name="code" type="text" placeholder="e.g. ABC123" maxlength="6" autocomplete="one-time-code" required />
                    </div>
                    <small class="error"></small>
                </div>

                <button class="submit-btn" type="submit">Verify</button>
                <button id="resendVerification" class="link-btn" type="button" style="margin-top: 12px;">Resend code</button>

                <p class="switch-text" style="margin-top: 16px;">
                    Already verified?
                    <a class="link-btn" href="login.php">Log in</a>
                </p>
            </form>
        </div>
    </section>
</main>

<div id="toast" class="toast" role="status" aria-live="polite"></div>
<script src="js/dist/verify-email.js" defer></script>

<?php require __DIR__ . '/includes/footer.php'; ?>
