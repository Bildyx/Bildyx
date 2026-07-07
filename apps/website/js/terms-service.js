(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll('a[href="terms-service.php"]').forEach((link) => {
            link.setAttribute("aria-current", "page");
        });
    });
})();
