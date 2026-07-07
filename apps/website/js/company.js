(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll('a[href="company.php"]').forEach((link) => {
            link.setAttribute("aria-current", "page");
        });
    });
})();
