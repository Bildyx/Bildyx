<?php
$pageTitle = 'Bildyx — Login / Sign Up';
$pageDescription = 'Log in or create a Bildyx account.';
$bodyClass = 'auth-page';
$showMainNav = false;

/*
 * Header/footer partagés conservés.
 * Cette page utilise ton CSS existant : css/auth.css
 * Cette page utilise ton JS existant : js/auth.js
 */
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
                    <span class="feature-icon">
                        <img src="images/image.jpg" alt="" />
                    </span>
                    <div>
                        <h2 class="brand-feature-title">For Companies</h2>
                        <p class="brand-feature-text">Build profile and present your teams to potential candidates.</p>
                    </div>
                </article>

                <article class="feature-card brand-feature">
                    <span class="feature-icon">
                        <img src="images/image.jpg" alt="" />
                    </span>
                    <div>
                        <h2 class="brand-feature-title">For Job Seekers</h2>
                        <p class="brand-feature-text">Create a powerful microresume in minutes. Use Microresume as elevator pitch to potential employers.</p>
                    </div>
                </article>
            </div>
        </div>

        <p class="copyright">© 2026 MayGraph.com. All rights reserved.</p>
    </section>

    <section class="form-panel" aria-label="Authentication forms">
        <div class="auth-card">
            <div class="tabs" role="tablist" aria-label="Authentication tabs">
                <button class="tab" id="signup-tab" type="button" data-target="signup-form" role="tab" aria-selected="false">Sign Up</button>
                <button class="tab active" id="login-tab" type="button" data-target="login-form" role="tab" aria-selected="true">Log In</button>
            </div>

            <form id="signup-form" class="auth-form" novalidate>
                <div class="form-heading">
                    <h2>Create an account</h2>
                    <p id="signupSubtitle">Select your account type to get started.</p>
                </div>

                <div class="account-switch" role="radiogroup" aria-label="Account type">
                    <label class="account-option active">
                        <input type="radio" name="accountType" value="company" checked />
                        <img class="option-icon" src="images/image.jpg" alt="" />
                        <span>Company</span>
                    </label>

                    <label class="account-option">
                        <input type="radio" name="accountType" value="seeker" />
                        <img class="option-icon" src="images/image.jpg" alt="" />
                        <span>Job Seeker</span>
                    </label>
                </div>

                <div class="field company-only">
                    <label for="companyName">Company Name</label>
                    <div class="input-wrap">
                        <img class="input-icon" src="images/image.jpg" alt="" />
                        <input id="companyName" name="companyName" type="text" placeholder="Type at least 3 characters..." maxlength="80" autocomplete="organization" />
                    </div>
                    <small class="error"></small>
                </div>

                <div class="seeker-only hidden">
                    <div class="social-row social-row-single">
                        <button type="button" class="social-btn google-btn" id="googleSignupBtn">
                            <img src="images/google.svg" alt="" />
                            Continue with Google
                        </button>
                    </div>

                    <div class="divider">
                        <span>OR</span>
                    </div>

                    <div class="field-grid">
                        <div class="field">
                            <label for="firstName">First Name</label>
                            <div class="input-wrap">
                                <img class="input-icon" src="images/image.jpg" alt="" />
                                <input id="firstName" name="firstName" type="text" placeholder="Jane" maxlength="80" autocomplete="given-name" />
                            </div>
                            <small class="error"></small>
                        </div>

                        <div class="field">
                            <label for="lastName">Last Name</label>
                            <div class="input-wrap">
                                <img class="input-icon" src="images/image.jpg" alt="" />
                                <input id="lastName" name="lastName" type="text" placeholder="Parker" maxlength="80" autocomplete="family-name" />
                            </div>
                            <small class="error"></small>
                        </div>
                    </div>

                    <div class="field">
                        <label for="desiredRole">Desired Role</label>
                        <div class="input-wrap">
                            <img class="input-icon" src="images/image.jpg" alt="" />
                            <input id="desiredRole" name="desiredRole" type="text" placeholder="Type at least 3 characters..." maxlength="100" autocomplete="organization-title" />
                        </div>
                        <small class="error"></small>
                    </div>
                </div>

                <div class="field">
                    <label for="email" id="emailLabel">Work Email</label>
                    <div class="input-wrap">
                        <img class="input-icon" src="images/image.jpg" alt="" />
                        <input id="email" name="email" type="email" placeholder="name@company.com" maxlength="120" autocomplete="email" required />
                    </div>
                    <small class="error"></small>
                </div>

                <div class="field">
                    <label for="password">Password</label>
                    <div class="input-wrap">
                        <img class="input-icon" src="images/image.jpg" alt="" />
                        <input id="password" name="password" type="password" placeholder="••••••••" minlength="8" maxlength="72" autocomplete="new-password" required />
                        <button class="icon-btn toggle-password" type="button" aria-label="Show password">
                            <img class="eye-icon" src="images/image.jpg" alt="" />
                        </button>
                    </div>
                    <meter class="password-meter" min="0" max="4" value="0"></meter>
                    <small class="hint">Minimum 8 characters, with uppercase, lowercase, number and symbol recommended.</small>
                    <small class="error"></small>
                </div>

                <div class="captcha-box" data-captcha="signup">
                    <div>
                        <strong>Security check</strong>
                        <p>Solve this quick captcha: <span class="captcha-question"></span></p>
                    </div>
                    <button class="captcha-refresh" type="button" aria-label="Refresh captcha">Refresh</button>
                    <input class="captcha-answer" type="number" inputmode="numeric" placeholder="Answer" required />
                </div>
                <small class="captcha-error error"></small>

                <label class="check-line">
                    <input id="terms" name="terms" type="checkbox" required />
                    <span>I agree to the <a href="terms-of-service.php">Terms of Service</a> and <a href="privacy-policy.php">Privacy Policy</a>.</span>
                </label>

                <label class="check-line muted">
                    <input id="marketing" name="marketing" type="checkbox" />
                    <span>I agree to receive emails about recruitment services from Bildyx. I can unsubscribe at any time.</span>
                </label>

                <button class="submit-btn" type="submit">Create Company Account</button>
            </form>

            <form id="login-form" class="auth-form active" novalidate>
                <div class="form-heading center">
                    <h2>Log In</h2>
                    <p>Welcome back! Please enter your details.</p>
                </div>

                <div class="field">
                    <label for="loginEmail">Email</label>
                    <div class="input-wrap">
                        <img class="input-icon" src="images/image.jpg" alt="" />
                        <input id="loginEmail" name="email" type="email" placeholder="you@example.com" maxlength="120" autocomplete="email" required />
                    </div>
                    <small class="error"></small>
                </div>

                <div class="field">
                    <div class="label-row">
                        <label for="loginPassword">Password</label>
                        <a href="forgot-password.php" id="forgotPassword">Forgot password?</a>
                    </div>
                    <div class="input-wrap">
                        <img class="input-icon" src="images/image.jpg" alt="" />
                        <input id="loginPassword" name="password" type="password" placeholder="••••••••" maxlength="72" autocomplete="current-password" required />
                        <button class="icon-btn toggle-password" type="button" aria-label="Show password">
                            <img class="eye-icon" src="images/image.jpg" alt="" />
                        </button>
                    </div>
                    <small class="error"></small>
                </div>

                <div class="captcha-box" data-captcha="login">
                    <div>
                        <strong>Security check</strong>
                        <p>Solve this quick captcha: <span class="captcha-question"></span></p>
                    </div>
                    <button class="captcha-refresh" type="button" aria-label="Refresh captcha">Refresh</button>
                    <input class="captcha-answer" type="number" inputmode="numeric" placeholder="Answer" required />
                </div>
                <small class="captcha-error error"></small>

                <button class="submit-btn" type="submit">Log In</button>

                <p class="switch-text">
                    Don't have an account?
                    <button type="button" class="link-btn" data-target="signup-form">Sign up</button>
                </p>
            </form>
        </div>
    </section>
</main>

<div id="toast" class="toast" role="status" aria-live="polite"></div>
<script src="js/auth.js"></script>

<?php require __DIR__ . '/includes/footer.php'; ?>
