// @ts-nocheck
(() => {
    const headerContent = document.querySelector('.site-header .header-content');
    const headerLogo = document.querySelector('.site-header .logo');
    const footerLogo = document.querySelector('.site-footer .footer-logo');
    const authNav = document.querySelector('.site-header .nav-buttons');

    if (headerLogo && !headerLogo.querySelector('.mr-brand-suffix')) {
        const suffix = document.createElement('span');
        suffix.className = 'mr-brand-suffix';
        suffix.textContent = 'MicroResume';
        headerLogo.appendChild(suffix);
    }

    if (footerLogo && !footerLogo.querySelector('.mr-footer-brand-suffix')) {
        const suffix = document.createElement('span');
        suffix.className = 'mr-footer-brand-suffix';
        suffix.textContent = 'MicroResume';
        footerLogo.appendChild(suffix);
    }

    if (headerContent && authNav && !headerContent.querySelector('.mr-header-nav')) {
        const nav = document.createElement('nav');
        nav.className = 'mr-header-nav';
        nav.setAttribute('aria-label', 'MicroResume navigation');
        nav.innerHTML = `
            <a href="#why-microresume">Why MicroResume</a>
            <a href="#how-it-works">How it works</a>
        `;
        headerContent.insertBefore(nav, authNav);
    }

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
})();

