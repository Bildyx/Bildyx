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
    function parseJSON(value) {
        try {
            return value ? JSON.parse(value) : null;
        } catch (_) {
            return null;
        }
    }

    function normalizeAccountType(value) {
        return String(value || '')
            .toLowerCase()
            .replace(/[\s_-]/g, '');
    }

    function readBildyxSession() {
        return (
            parseJSON(sessionStorage.getItem('bildyx_session')) ||
            parseJSON(localStorage.getItem('bildyx_session')) ||
            parseJSON(localStorage.getItem('bildyx_user'))
        );
    }

    function isLoggedIn(session) {
        return Boolean(
            session &&
            (
                session.userId ||
                session.id ||
                session._id ||
                session.email ||
                session.accountType ||
                session.account_type ||
                session.role
            )
        );
    }

    function getConnectedRedirect(session) {
        const accountType = normalizeAccountType(
            session?.accountType ||
            session?.account_type ||
            session?.userType ||
            session?.user_type ||
            session?.role ||
            session?.type
        );

        if (
            [
                'company',
                'business',
                'employer',
                'organization',
                'organisation',
                'recruiter',
            ].includes(accountType)
        ) {
            return 'compagny_con.php';
        }

        return 'profile.php';
    }

    document.querySelectorAll('.mr-smart-login').forEach((link) => {
        link.addEventListener('click', (event) => {
            const session = readBildyxSession();

            if (!isLoggedIn(session)) {
                return;
            }

            event.preventDefault();
            window.location.href = getConnectedRedirect(session);
        });
    });

})();

