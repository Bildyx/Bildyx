<?php
$pageTitle = 'Bildyx — Forgot Password';
$pageDescription = 'Reset your Bildyx password.';
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

    <section class="form-panel" aria-label="Forgot password form">
        <div class="auth-card">
            <form id="forgot-form" class="auth-form active" novalidate>
                <div class="form-heading center">
                    <h2>Forgot your password?</h2>
                    <p>Enter your email address and we will send you a reset link.</p>
                </div>

                <div class="field">
                    <label for="forgotEmail">Email</label>
                    <div class="input-wrap">
                        <img class="input-icon" src="images/image.jpg" alt="" />
                        <input id="forgotEmail" name="email" type="email" placeholder="you@example.com" maxlength="120" autocomplete="email" required />
                    </div>
                    <small class="error"></small>
                </div>

                <div class="captcha-box" data-captcha="forgot">
                    <div>
                        <strong>Security check</strong>
                        <p>Solve this quick captcha: <span class="captcha-question"></span></p>
                    </div>
                    <button class="captcha-refresh" type="button" aria-label="Refresh captcha">Refresh</button>
                    <input class="captcha-answer" type="number" inputmode="numeric" placeholder="Answer" required />
                </div>
                <small class="captcha-error error"></small>

                <button class="submit-btn" type="submit">Send reset link</button>

                <p class="switch-text">
                    Remember your password?
                    <a class="link-btn" href="login.php">Log in</a>
                </p>
            </form>
        </div>
    </section>
</main>

<div id="toast" class="toast" role="status" aria-live="polite"></div>
<script src="js/auth.js"></script>
<script>
const forgotForm = document.getElementById('forgot-form');
if (forgotForm) {
    forgotForm.addEventListener('submit', async event => {
        event.preventDefault();
        const emailInput = document.getElementById('forgotEmail');
        let ok = true;

        if (!validEmail(emailInput.value.trim())) {
            setError(emailInput, 'Enter a valid email.');
            ok = false;
        } else {
            setError(emailInput, '');
        }

        if (!checkCaptcha('forgot')) ok = false;
        if (!ok) return;

        let stopLoading;
        try {
            stopLoading = startButtonLoading(forgotForm.querySelector('.submit-btn'));
            const resp = await fetch(`${API_BASE}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailInput.value.trim() })
            });
            const data = await resp.json().catch(() => ({}));
            if (resp.status === 200) {
                toast.success('If an account exists, a reset link has been sent. Check your email.');
            } else if (resp.status === 429) {
                toast.warning(data.message || 'Please wait before requesting another reset link.');
            } else {
                toast.error(data.message || 'Unable to send reset email');
            }
        } catch (err) {
            console.error(err);
            toast.error('Could not connect to server');
        } finally {
            if (stopLoading) stopLoading();
        }

        generateCaptcha('forgot');
        forgotForm.reset();
    });
}
</script>

<?php require __DIR__ . '/includes/footer.php'; ?>
