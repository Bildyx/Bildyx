<?php
$pageTitle = 'Privacy Policy — Bildyx';
$pageDescription = 'Bildyx Privacy Policy.';
$pageScript = 'js/privacy-policy.js';
$bodyClass = 'privacy-policy-page';
$showMainNav = false;

/*
 * Header/footer shared remain unchanged.
 * This page only adds its own stylesheet.
 */
ob_start();
require __DIR__ . '/includes/header.php';
$sharedHeader = ob_get_clean();
$privacyStylesheet = '<link rel="stylesheet" href="css/privacy-policy.css" />';
echo str_replace('</head>', "    {$privacyStylesheet}\n</head>", $sharedHeader);
?>

<main class="privacy-main">
    <article class="privacy-frame" aria-labelledby="privacy-title">
        <div class="privacy-inner">
            <header class="privacy-header">
                <h1 id="privacy-title">Privacy Policy</h1>
                <p>Last Updated: October 2026</p>
            </header>

            <section class="privacy-section">
                <h2>1. Information We Collect</h2>
                <p>
                    When you interact with Bildyx, we collect information that helps us provide our services
                    effectively. This includes:
                </p>
                <ul>
                    <li><strong>Account Information:</strong> Name, email address, password, and contact details.</li>
                    <li><strong>Profile Data:</strong> Company details, team information, job roles, and microresumes.</li>
                    <li><strong>Usage Data:</strong> Information about how you navigate and interact with our platform.</li>
                </ul>
            </section>

            <section class="privacy-section">
                <h2>2. How We Use Your Information</h2>
                <p>We use the collected information for various purposes, including to:</p>
                <ul>
                    <li>Create and manage your account (Company Profile or Job Seeker Microresume).</li>
                    <li>Improve, personalize, and expand our services.</li>
                    <li>Communicate with you regarding updates, security alerts, and support messages.</li>
                    <li>Process transactions and prevent fraudulent activities.</li>
                </ul>
            </section>

            <section class="privacy-section">
                <h2>3. Data Sharing and Disclosure</h2>
                <p>
                    We do not sell your personal information. We may share your data in the following
                    circumstances:
                </p>
                <ul>
                    <li>
                        <strong>With Other Users:</strong> Information you publish in a Company Profile or
                        Microresume is visible to authorized users on the platform.
                    </li>
                    <li>
                        <strong>Service Providers:</strong> We use third-party vendors to help us operate our
                        platform, such as hosting and analytics.
                    </li>
                    <li>
                        <strong>Legal Requirements:</strong> We may disclose information if required to do so by
                        law or in response to valid requests by public authorities.
                    </li>
                </ul>
            </section>

            <section class="privacy-section">
                <h2>4. Data Security</h2>
                <p>
                    We implement appropriate technical and organizational measures to protect your personal data
                    against accidental or unlawful destruction, loss, alteration, or unauthorized disclosure.
                    However, no method of transmission over the Internet is 100% secure.
                </p>
            </section>

            <section class="privacy-section">
                <h2>5. Your Rights</h2>
                <p>
                    Depending on your location, you may have the right to access, correct, delete, or restrict the
                    processing of your personal data. You can manage most of your information directly within your
                    account settings or contact us for assistance.
                </p>
            </section>

            <section class="privacy-section">
                <h2>6. Changes to This Privacy Policy</h2>
                <p>
                    We may update this Privacy Policy from time to time. We will notify you of any material changes
                    by posting the new Privacy Policy on this page and updating the “Last Updated” date.
                </p>
            </section>

            <section class="privacy-section">
                <h2>7. Contact Us</h2>
                <p>
                    If you have any questions or concerns about this Privacy Policy or our data practices, please
                    contact us at <a href="mailto:privacy@bildyx.com">privacy@bildyx.com</a>.
                </p>
            </section>
        </div>
    </article>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
