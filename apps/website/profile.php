<?php
$pageTitle = 'Profile — Bildyx';
$pageDescription = 'Build and edit your Bildyx MicroResume profile.';
$pageScript = 'js/profile.js';
$bodyClass = 'profile-page';
$showMainNav = false;
$activePage = 'profile';

ob_start();
require __DIR__ . '/includes/header.php';
$sharedHeader = ob_get_clean();

$profileStylesheet = '<link rel="stylesheet" href="css/profile.css" />';
echo str_replace('</head>', "    {$profileStylesheet}\n</head>", $sharedHeader);
?>

<main class="profile-shell">
    <div class="profile-workspace">
        <article class="profile-card" id="profilePanel" aria-labelledby="profileName">
            <header class="profile-top">
                <div class="name-zone">
                    <div class="name-pill">
                        <strong id="profileName" data-field="name" contenteditable="true"><span class="skeleton-loader skeleton-name"></span></strong>
                        <span>MicroResume</span>
                    </div>

                    <button class="icon-action" type="button" data-edit-button aria-label="Edit profile name">✎</button>
                </div>

                <div class="headline-wrap">
                    <input
                        class="headline-input"
                        data-field="headline"
                        type="text"
                        value=""
                        maxlength="100"
                        aria-label="Profile headline"
                        placeholder="Add a headline..."
                    />
                    <p class="field-help"><span id="headlineCounter">0</span>/100 chars</p>
                </div>

                <section class="summary-block" aria-labelledby="career-summary-title">
                    <h2 class="section-mini-title" id="career-summary-title">Career Summary</h2>

                    <div class="summary-row">
                        <div class="avatar-editor">
                            <div class="profile-avatar" id="profileAvatar" data-field="avatar"></div>
                            <button class="tiny-button" type="button" id="changeAvatarButton">Change photo</button>
                            <input class="hidden-file-input" id="avatarInput" type="file" accept="image/*" />
                        </div>

                        <p class="summary-text" data-field="summary" contenteditable="true">
                            <span class="skeleton-loader skeleton-summary"></span>
                        </p>

                        <button class="icon-action" type="button" data-edit-button aria-label="Edit career summary">✎</button>
                    </div>

                    <p class="location-line" data-field="location"><span class="skeleton-loader skeleton-meta"></span></p>
                </section>

                <div class="profile-main-grid">
                    <section class="profile-core" aria-labelledby="role-title">
                        <div class="title-line">
                            <h1 id="role-title" data-field="role" contenteditable="true"><span class="skeleton-loader skeleton-role"></span></h1>
                        </div>

                        <p class="mini-label"><span aria-hidden="true">◉</span> Languages (max 5)</p>
                        <div class="chip-row" aria-label="Languages">
                            <span class="skeleton-loader skeleton-chip"></span>
                            <span class="skeleton-loader skeleton-chip"></span>
                            <button class="chip-add" type="button" aria-label="Add language">+</button>
                        </div>

                        <p class="level-legend">
                            <span></span> Native
                            <span></span> Fluent
                            <span></span> Intermediate
                        </p>

                        <ul class="profile-meta-list">
                            <li><strong>◎ Worked In:</strong> <span data-field="meta-worked-in"><span class="skeleton-loader skeleton-meta"></span></span></li>
                            <li><strong>◎ Studied In:</strong> <span data-field="meta-studied-in"><span class="skeleton-loader skeleton-meta"></span></span></li>
                            <li><strong>▥ Companies:</strong> <span data-field="meta-companies"><span class="skeleton-loader skeleton-meta"></span></span></li>
                            <li><strong>▦ Products/Services:</strong> <span data-field="meta-products"><span class="skeleton-loader skeleton-meta"></span></span></li>
                            <li><strong>▣ Job Occupations:</strong> <span data-field="meta-jobs"><span class="skeleton-loader skeleton-meta"></span></span></li>
                            <li><strong>⌁ Degrees:</strong> <span data-field="meta-degrees"><span class="skeleton-loader skeleton-meta"></span></span></li>
                            <li><strong>ⓘ Certifications:</strong> <span data-field="meta-certifications"><span class="skeleton-loader skeleton-meta"></span></span></li>
                        </ul>
                    </section>

                    <section class="skills-box" aria-labelledby="skills-title">
                        <div class="title-line title-line--small">
                            <h2 id="skills-title">Top Skills</h2>
                            <button class="icon-action" type="button" data-edit-button aria-label="Edit top skills">✎</button>
                        </div>

                        <div class="chip-row skill-row" aria-label="Top skills">
                            <span class="skeleton-loader skeleton-chip"></span>
                            <span class="skeleton-loader skeleton-chip"></span>
                            <button class="chip-add" type="button" aria-label="Add skill">+</button>
                        </div>
                    </section>
                </div>
            </header>

            <hr>

            <section class="builder-section" aria-labelledby="experience-title">
                <div class="section-title-row">
                    <h2 id="experience-title">Experiences</h2>
                    <button class="outline-button outline-button--small" type="button" id="addExperienceButton">+ Add</button>
                </div>

                <div class="entry-list" id="experienceList">
                    <div class="skeleton-loader skeleton-card"></div>
                </div>
            </section>

            <hr>

            <section class="builder-section" aria-labelledby="education-title">
                <div class="section-title-row">
                    <h2 id="education-title">Education</h2>
                    <button class="outline-button outline-button--small" type="button" id="addEducationButton">+ Add</button>
                </div>

                <div class="entry-list" id="educationList">
                    <div class="skeleton-loader skeleton-card"></div>
                </div>
            </section>

            <hr>

            <section class="builder-section" aria-labelledby="certification-title">
                <div class="section-title-row">
                    <h2 id="certification-title">Certifications</h2>
                    <button class="outline-button outline-button--small" type="button" id="addCertificationButton">+ Add</button>
                </div>

                <div class="cert-grid">
                    <div class="skeleton-loader skeleton-card" style="height: 80px;"></div>
                </div>
            </section>

            <div class="save-row">
                <button class="save-button" type="button" id="saveProfileButton">▣ Save Microresume</button>
            </div>
        </article>

        <aside class="profile-side-nav" aria-label="Profile menu">
            <a class="side-nav-button is-active" href="profile.php">
                <span aria-hidden="true">☻</span>
                Profile
            </a>

            <a class="side-nav-button" href="target-list.php">
                <span aria-hidden="true">◎</span>
                My Target List
            </a>

            <a class="side-nav-button" href="tests-preferences.php">
                <span aria-hidden="true">▣</span>
                Tests &amp;<br> Preferences
            </a>

            <a class="side-nav-button" href="my-jobs.php">
                <span aria-hidden="true">▥</span>
                My Jobs
            </a>

            <a class="side-nav-button" href="settings.php">
                <span aria-hidden="true">⚙</span>
                Settings
            </a>
        </aside>
    </div>
</main>

<div class="profile-toast" id="profileToast" role="status" aria-live="polite">Profile saved.</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const toast = document.getElementById('profileToast');

    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('is-visible');
        setTimeout(() => toast.classList.remove('is-visible'), 1800);
    }

    document.querySelectorAll('[data-edit-button]').forEach((button) => {
        button.addEventListener('click', () => {
            button.classList.toggle('is-editing');
            showToast(button.classList.contains('is-editing') ? 'Edition enabled.' : 'Edition saved.');
        });
    });

    document.addEventListener('click', (event) => {
        const tool = event.target.closest('[data-action]');
        if (!tool) return;

        const entry = tool.closest('[data-entry]');
        if (!entry) return;

        const action = tool.dataset.action;

        if (action === 'collapse') {
            const body = entry.querySelector('.entry-body');
            if (!body) return;
            body.classList.toggle('is-collapsed');
            tool.textContent = body.classList.contains('is-collapsed') ? '+' : '−';
        }

        if (action === 'remove') {
            entry.remove();
            showToast('Item removed.');
        }
    });

    const experienceList = document.getElementById('experienceList');
    const addExperienceButton = document.getElementById('addExperienceButton');

    if (experienceList && addExperienceButton) {
        addExperienceButton.addEventListener('click', () => {
            const firstEntry = experienceList.querySelector('[data-entry]');
            if (!firstEntry) return;

            const clone = firstEntry.cloneNode(true);
            const count = experienceList.querySelectorAll('[data-entry]').length + 1;

            clone.querySelector('h3').textContent = `Work Experience ${count}`;
            clone.querySelectorAll('textarea').forEach((textarea) => textarea.value = '');
            clone.querySelectorAll('.backend-slot').forEach((slot) => {
                const label = slot.dataset.cardSlot;
                if (label === 'company') slot.textContent = 'Company card';
                if (label === 'product') slot.textContent = 'Product/Service card';
                if (label === 'role') slot.textContent = 'Role card';
            });

            experienceList.appendChild(clone);
            showToast('Work experience added.');
        });
    }

    const educationList = document.getElementById('educationList');
    const addEducationButton = document.getElementById('addEducationButton');

    if (educationList && addEducationButton) {
        addEducationButton.addEventListener('click', () => {
            const firstEntry = educationList.querySelector('[data-entry]');
            if (!firstEntry) return;

            const clone = firstEntry.cloneNode(true);
            const count = educationList.querySelectorAll('[data-entry]').length + 1;

            clone.querySelector('h3').textContent = `Education ${count}`;
            clone.querySelectorAll('textarea').forEach((textarea) => textarea.value = '');

            educationList.appendChild(clone);
            showToast('Education added.');
        });
    }

    const addCertificationButton = document.getElementById('addCertificationButton');

    if (addCertificationButton) {
        addCertificationButton.addEventListener('click', () => {
            const certGrid = document.querySelector('.cert-grid');
            if (!certGrid) return;

            const cert = document.createElement('article');
            cert.className = 'entry-card cert-card';
            cert.dataset.entry = '';

            cert.innerHTML = `
                <div class="entry-toolbar">
                    <h3>New Certification</h3>
                    <button class="entry-tool" type="button" data-action="remove" aria-label="Remove certification">×</button>
                </div>
                <p>Issued by: Add issuer</p>
                <div class="backend-slot backend-slot--certification">Certification card</div>
            `;

            certGrid.appendChild(cert);
            showToast('Certification added.');
        });
    }

    const saveProfileButton = document.getElementById('saveProfileButton');

    if (saveProfileButton) {
        saveProfileButton.addEventListener('click', () => {
            showToast('Microresume saved.');
        });
    }

    const changeAvatarButton = document.getElementById('changeAvatarButton');
    const avatarInput = document.getElementById('avatarInput');
    const profileAvatar = document.getElementById('profileAvatar');

    if (changeAvatarButton && avatarInput && profileAvatar) {
        changeAvatarButton.addEventListener('click', () => avatarInput.click());

        avatarInput.addEventListener('change', () => {
            const file = avatarInput.files && avatarInput.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
                profileAvatar.textContent = '';
                profileAvatar.style.backgroundImage = `url("${reader.result}")`;
                profileAvatar.style.backgroundSize = 'cover';
                profileAvatar.style.backgroundPosition = 'center';
            };
            reader.readAsDataURL(file);
        });
    }
});
</script>

<?php require __DIR__ . '/includes/footer.php'; ?>