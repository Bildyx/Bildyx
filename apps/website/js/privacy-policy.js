(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll('a[href="privacy-policy.php"]').forEach((link) => {
            link.setAttribute("aria-current", "page");
        });
    });
})();
