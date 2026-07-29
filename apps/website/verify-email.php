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
<script src="js/auth.js"></script>
<script>
(async function () {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId') || '';
    const USERS_API = API_BASE.replace('/auth', '/users');

    if (!userId) {
        window.location.href = 'login.php';
        return;
    }

    let email = '';
    try {
        const resp = await fetch(`${USERS_API}/${userId}`);
        if (resp.status !== 200) {
            window.location.href = 'login.php';
            return;
        }
        const user = await resp.json();
        email = user.email;
        const emailSpan = $('#verifyEmail');
        if (emailSpan) emailSpan.textContent = email;
    } catch (err) {
        console.error(err);
        toast.error('Error loading verification screen');
        return;
    }

    $$('a[href]').forEach(link => {
        link.addEventListener('click', event => {
            const href = link.getAttribute('href');
            if (email && href && href !== '#' && (href.includes('login.php') || href.includes('index.php'))) {
                event.preventDefault();
                cancelUnverifiedAccountAndGo(href);
            }
        });
    });

    function showVerificationError(message) {
        const errorBox = $('#verifyError');
        if (errorBox) {
            errorBox.textContent = message;
            errorBox.style.display = 'block';
        }
        toast.error(message);
    }

    async function cancelUnverifiedAccountAndGo(targetUrl) {
        const confirmed = window.confirm(
            'Your email is not verified yet. If you leave this page, your account will be deleted and you will need to create a new one. Continue?'
        );
        if (!confirmed) return;

        if (userId) {
            try {
                await fetch(`${USERS_API}/${userId}`, { method: 'DELETE' });
            } catch (err) {
                console.error(err);
            }
        }

        email = ''; // Prevent beforeunload prompt
        window.location.href = targetUrl;
    }

    window.addEventListener('beforeunload', event => {
        if (email) {
            event.preventDefault();
            event.returnValue = '';
        }
    });

    const verifyForm = $('#verify-form');
    if (verifyForm) {
        verifyForm.addEventListener('submit', async event => {
            event.preventDefault();
            const codeInput = $('#verifyCode');
            if (!codeInput || !codeInput.value.trim()) {
                setError(codeInput, 'Enter your verification code.');
                return;
            }
            setError(codeInput, '');

            let stopLoading;
            try {
                stopLoading = startButtonLoading(verifyForm.querySelector('.submit-btn'));
                const resp = await fetch(`${API_BASE}/verify-email`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim(), code: codeInput.value.trim() })
                });
                const data = await resp.json().catch(() => ({}));
                if (resp.status === 200) {
                    toast.success('Email verified! Redirecting to your profile...');
                    email = ''; // Prevent beforeunload prompt
                    if (window.BildyxAPI && data.user) {
                        window.BildyxAPI.setSession({
                            userId: data.user.id,
                            email: data.user.email,
                            role: data.user.role,
                            profileId: null,
                        });
                    }
                    setTimeout(() => {
                        window.location.href = 'profile.php';
                    }, 1500);
                } else if (resp.status === 410 || (data && (data.message || '').includes('expired'))) {
                    showVerificationError(data.message || 'Verification expired. Your account has been deleted. Please create a new account.');
                } else {
                    showVerificationError(data.message || 'Invalid or expired verification code');
                }
            } catch (err) {
                console.error(err);
                toast.error('Could not connect to server');
            } finally {
                if (stopLoading) stopLoading();
            }
        });
    }

    const resendBtn = $('#resendVerification');
    if (resendBtn) {
        resendBtn.addEventListener('click', async () => {
            if (!email) {
                toast.warning('Email missing');
                return;
            }
            let stopLoading;
            try {
                stopLoading = startButtonLoading(resendBtn);
                const resp = await fetch(`${API_BASE}/resend-verification`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim() })
                });
                const data = await resp.json().catch(() => ({}));
                if (resp.status === 200) {
                    toast.success('A new verification code has been sent. Check your email.');
                } else if (resp.status === 410 || (data && (data.message || '').includes('expired'))) {
                    showVerificationError(data.message || 'Verification expired. Your account has been deleted. Please create a new account.');
                } else if (resp.status === 429 || (data && (data.message || '').includes('wait'))) {
                    showVerificationError(data.message || 'Please wait before requesting another code');
                } else {
                    showVerificationError(data.message || 'Unable to resend code');
                }
            } catch (err) {
                console.error(err);
                toast.error('Could not connect to server');
            } finally {
                if (stopLoading) stopLoading();
            }
        });
    }
})();
</script>

<?php require __DIR__ . '/includes/footer.php'; ?>
