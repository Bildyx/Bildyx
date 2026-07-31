// @ts-nocheck
(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll('a[href="why-built-it.php"]').forEach((link) => {
            link.setAttribute("aria-current", "page");
        });
    });
})();

