(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll('a[href="mission.php"]').forEach((link) => {
            link.setAttribute("aria-current", "page");
        });
    });
})();
