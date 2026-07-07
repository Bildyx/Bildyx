    <footer class="site-footer">
        <div class="footer-content">
            <div class="footer-brand">
                <a href="<?= htmlspecialchars($basePath, ENT_QUOTES, 'UTF-8') ?>index.php" class="footer-logo" aria-label="Bildyx home">
                    <img src="<?= htmlspecialchars($basePath, ENT_QUOTES, 'UTF-8') ?>images/Logo.png" alt="Bildyx" />
                </a>
                <p>A structured, modular visibility layer for modern hiring.</p>
            </div>

            <div class="footer-column">
                <h2>About us</h2>
                <a href="<?= htmlspecialchars($basePath, ENT_QUOTES, 'UTF-8') ?>company.php">Company</a>
                <a href="<?= htmlspecialchars($basePath, ENT_QUOTES, 'UTF-8') ?>mission.php">Mission</a>
                <a href="<?= htmlspecialchars($basePath, ENT_QUOTES, 'UTF-8') ?>contact.php">Contact</a>
            </div>

            <div class="footer-column">
                <h2>Our story</h2>
                <a href="<?= htmlspecialchars($basePath, ENT_QUOTES, 'UTF-8') ?>generic.php?page=why-we-built-it">Why we built it</a>
            </div>

            <div class="footer-column">
                <h2>Social media</h2>
                <a href="<?= htmlspecialchars($basePath, ENT_QUOTES, 'UTF-8') ?>generic.php?page=linkedin">LinkedIn</a>
                <a href="<?= htmlspecialchars($basePath, ENT_QUOTES, 'UTF-8') ?>generic.php?page=facebook">Facebook</a>
                <a href="<?= htmlspecialchars($basePath, ENT_QUOTES, 'UTF-8') ?>generic.php?page=youtube">Youtube</a>
                <a href="<?= htmlspecialchars($basePath, ENT_QUOTES, 'UTF-8') ?>generic.php?page=x-twitter">X / Twitter</a>
                <a href="<?= htmlspecialchars($basePath, ENT_QUOTES, 'UTF-8') ?>generic.php?page=instagram">Instagram</a>
            </div>
        </div>

        <div class="footer-bottom">
            <p>© 2026 MayGraph. All rights reserved.</p>
            <div class="footer-legal">
                <a href="<?= htmlspecialchars($basePath, ENT_QUOTES, 'UTF-8') ?>privacy-policy.php">Privacy Policy</a>
                <a href="<?= htmlspecialchars($basePath, ENT_QUOTES, 'UTF-8') ?>terms-service.php">Terms of Service</a>
            </div>
        </div>
    </footer>

<?php if (!empty($pageScript)): ?>
    <script src="<?= htmlspecialchars($basePath . $pageScript, ENT_QUOTES, 'UTF-8') ?>"></script>
<?php endif; ?>
</body>
</html>
