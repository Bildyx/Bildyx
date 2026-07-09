(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll('a[href="contact.php"]').forEach((link) => {
            link.setAttribute("aria-current", "page");
        });

        const form = document.getElementById("contactForm");
        const status = document.getElementById("contactStatus");

        if (!form || !status) return;

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            status.textContent = "Message saved locally for now. Connect this form to your backend later.";
        });
    });
})();
