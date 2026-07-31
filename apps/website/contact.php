<?php
$pageTitle = 'Contact — Bildyx';
$pageDescription = 'Contact Bildyx by email, phone, or message form.';
$pageScript = 'js/contact.ts';
$bodyClass = 'contact-page';
$showMainNav = false;

/*
 * Header/footer shared remain unchanged.
 * This page only adds its own stylesheet.
 */
ob_start();
require __DIR__ . '/includes/header.php';
$sharedHeader = ob_get_clean();
$contactStylesheet = '<link rel="stylesheet" href="css/contact.css" />';
echo str_replace('</head>', "    {$contactStylesheet}\n</head>", $sharedHeader);
?>

<main class="contact-main">
    <section class="contact-frame" aria-labelledby="contact-title">
        <div class="contact-inner">
            <header class="contact-heading">
                <h1 id="contact-title">Contact Us</h1>
                <p>We'd love to hear from you. Please fill out this form or reach out via email.</p>
            </header>

            <div class="contact-grid">
                <form class="contact-form" id="contactForm" action="#" method="post">
                    <div class="contact-form-row">
                        <label>
                            <span>First Name</span>
                            <input type="text" name="first_name" placeholder="John" autocomplete="given-name">
                        </label>

                        <label>
                            <span>Last Name</span>
                            <input type="text" name="last_name" placeholder="Doe" autocomplete="family-name">
                        </label>
                    </div>

                    <label>
                        <span>Email Address</span>
                        <input type="email" name="email" placeholder="john.doe@example.com" autocomplete="email">
                    </label>

                    <label>
                        <span>Subject</span>
                        <input type="text" name="subject" placeholder="How can we help you?">
                    </label>

                    <label>
                        <span>Message</span>
                        <textarea name="message" placeholder="Write your message here..."></textarea>
                    </label>

                    <button type="submit">Send Message</button>
                    <p class="contact-status" id="contactStatus" role="status" aria-live="polite"></p>
                </form>

                <aside class="contact-info-card" aria-label="Contact information">
                    <article class="contact-info-item">
                        <img src="images/contact-email.png" alt="" aria-hidden="true">
                        <div>
                            <h2>Email Us</h2>
                            <p><a href="mailto:benjamin@bildyx.com">benjamin@bildyx.com</a></p>
                        </div>
                    </article>

                    <article class="contact-info-item">
                        <img src="images/contact-location.png" alt="" aria-hidden="true">
                        <div>
                            <h2>Office Location</h2>
                            <p>
                                Tokyo Innovation Base<br>
                                SusHi Tech Square 3F, 3-8-3<br>
                                Marunouchi, Chiyoda-ku,<br>
                                〒100-0005 Tokyo
                            </p>
                        </div>
                    </article>

                    <article class="contact-info-item">
                        <img src="images/contact-phone.png" alt="" aria-hidden="true">
                        <div>
                            <h2>Phone</h2>
                            <p>
                                <a href="tel:+8108067382406">+81 (0)80-6738-2406</a><br>
                                Mon-Fri, 9am - 6pm UTC+9
                            </p>
                        </div>
                    </article>
                </aside>
            </div>
        </div>
    </section>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
