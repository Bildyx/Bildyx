document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.team-tabs button').forEach((tab) => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.team-tabs button').forEach((item) => item.classList.remove('is-active'));
            tab.classList.add('is-active');

            const badge = document.querySelector('.team-profile > span');
            if (badge) badge.textContent = tab.textContent.trim();
        });
    });

    document.querySelectorAll('.office-list button').forEach((chip) => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.office-list button').forEach((item) => item.classList.remove('is-active'));
            chip.classList.add('is-active');
        });
    });

    document.querySelectorAll('.product-tabs button').forEach((tab) => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.product-tabs button').forEach((item) => item.classList.remove('is-active'));
            tab.classList.add('is-active');
        });
    });
});
