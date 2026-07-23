<?php
$pageTitle = 'Profile — Bildyx';
$pageDescription = 'Build and edit your Bildyx MicroResume profile.';
$pageScript = '';
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
                        <strong id="profileName" contenteditable="true">Justine Tauxe</strong>
                        <span>MicroResume</span>
                    </div>

                    <button class="icon-action" type="button" data-edit-button aria-label="Edit profile name">✎</button>
                </div>

                <div class="headline-wrap">
                    <input
                        class="headline-input"
                        type="text"
                        value="Cosmopolitan. Nerd. Learner. Love Tokyo."
                        maxlength="100"
                        aria-label="Profile headline"
                    />
                    <p class="field-help">40/100 chars · 5/12 words</p>
                </div>

                <section class="summary-block" aria-labelledby="career-summary-title">
                    <h2 class="section-mini-title" id="career-summary-title">Career Summary</h2>

                    <div class="summary-row">
                        <div class="avatar-editor">
                            <div class="profile-avatar" id="profileAvatar">JT</div>
                            <button class="tiny-button" type="button" id="changeAvatarButton">Change photo</button>
                            <input class="hidden-file-input" id="avatarInput" type="file" accept="image/*" />
                        </div>

                        <p class="summary-text" contenteditable="true">
                            I am as hardworking as Japanese.
                        </p>

                        <button class="icon-action" type="button" data-edit-button aria-label="Edit career summary">✎</button>
                    </div>

                    <p class="location-line">⌾ Aachen, Germany</p>
                </section>

                <div class="profile-main-grid">
                    <section class="profile-core" aria-labelledby="role-title">
                        <div class="title-line">
                            <h1 id="role-title" contenteditable="true">Software Ninjica</h1>
                        </div>

                        <p class="mini-label"><span aria-hidden="true">◉</span> Languages (max 5)</p>
                        <div class="chip-row" aria-label="Languages">
                            <span class="chip is-filled">English</span>
                            <span class="chip is-filled">German</span>
                            <span class="chip is-filled">Spanish</span>
                            <span class="chip is-filled">Japanese</span>
                            <button class="chip-add" type="button" aria-label="Add language">+</button>
                        </div>

                        <p class="level-legend">
                            <span></span> Native
                            <span></span> Fluent
                            <span></span> Intermediate
                        </p>

                        <ul class="profile-meta-list">
                            <li><strong>◎ Worked In:</strong> <span>Abilene, Texas (United States), Aberdeen (United Kingdom)</span></li>
                            <li><strong>◎ Studied In:</strong> <span>—</span></li>
                            <li><strong>▥ Companies:</strong> <span>Pekamix Global, Pekamix</span></li>
                            <li><strong>▦ Products/Services:</strong> <span>SalesPro</span></li>
                            <li><strong>▣ Job Occupations:</strong> <span>Software Engineer</span></li>
                            <li><strong>⌁ Degrees:</strong> <span>Bachelor of Business Administration (BBA), Associate Degree in Nursing (ADN)</span></li>
                            <li><strong>ⓘ Certifications:</strong> <span>Microsoft Azure Fundamentals, AWS Certified Solutions Architect - Associate</span></li>
                        </ul>
                    </section>

                    <section class="skills-box" aria-labelledby="skills-title">
                        <div class="title-line title-line--small">
                            <h2 id="skills-title">Top Skills</h2>
                            <button class="icon-action" type="button" data-edit-button aria-label="Edit top skills">✎</button>
                        </div>

                        <div class="chip-row skill-row" aria-label="Top skills">
                            <span class="chip">Programming</span>
                            <span class="chip">customer_service</span>
                            <span class="chip">Team Building</span>
                            <button class="chip-add" type="button" aria-label="Add skill">+</button>
                        </div>
                    </section>
                </div>
            </header>

            <hr>

            <section class="builder-section" aria-labelledby="experience-title">
                <div class="section-title-row">
                    <h2 id="experience-title">Experiences</h2>
                    <button class="icon-action" type="button" data-edit-button aria-label="Edit experiences">✎</button>
                </div>

                <div class="entry-list" id="experienceList">
                    <article class="entry-card" data-entry>
                        <div class="entry-toolbar">
                            <h3>Work Experience 1</h3>
                            <div>
                                <button class="entry-tool" type="button" data-action="collapse" aria-label="Collapse work experience">−</button>
                                <button class="entry-tool" type="button" data-action="remove" aria-label="Remove work experience">×</button>
                            </div>
                        </div>

                        <div class="entry-body">
                            <div class="entry-header-line">
                                <div class="round-place" aria-hidden="true"></div>

                                <div class="entry-controls">
                                    <div class="date-row">
                                        <select aria-label="Start date">
                                            <option>Jan 2025</option>
                                            <option>Jan 2024</option>
                                            <option>Nov 2012</option>
                                        </select>
                                        <span>–</span>
                                        <select aria-label="End date">
                                            <option>Jul 2025</option>
                                            <option>May 2024</option>
                                            <option>Oct 2013</option>
                                        </select>
                                    </div>

                                    <p>Abilene, Texas <span>Pekamix Global</span></p>
                                    <button class="inline-link" type="button">Add brand (optional)...</button>
                                    <button class="inline-link" type="button">Add client/industry served (optional)...</button>
                                    <a href="#">Software Engineer</a>

                                    <label>
                                        Type:
                                        <select>
                                            <option>Internship</option>
                                            <option>Full-time</option>
                                            <option>Part-time</option>
                                            <option>Freelance</option>
                                        </select>
                                    </label>

                                    <label>
                                        Level:
                                        <select>
                                            <option>Optional</option>
                                            <option>Junior</option>
                                            <option>Mid-level</option>
                                            <option>Senior</option>
                                        </select>
                                    </label>
                                </div>
                            </div>

                            <textarea maxlength="600">I was working hard for Pekamix family. Likes it.</textarea>
                            <p class="word-counter">9/60 words</p>

                            <div class="backend-grid backend-grid--three">
                                <section>
                                    <h4>Company</h4>
                                    <div class="backend-slot" data-card-slot="company">Company card</div>
                                </section>

                                <section>
                                    <h4>Product/Service</h4>
                                    <div class="backend-slot" data-card-slot="product">Product/Service card</div>
                                </section>

                                <section>
                                    <h4>Role</h4>
                                    <div class="backend-slot" data-card-slot="role">Role card</div>
                                </section>
                            </div>

                            <div class="backend-grid backend-grid--two">
                                <section>
                                    <h4>Brands</h4>
                                    <button class="inline-link" type="button">Add brand (optional)...</button>
                                    <div class="backend-slot backend-slot--small">Brand card</div>
                                </section>

                                <section>
                                    <h4>Client/Industry</h4>
                                    <button class="inline-link" type="button">Add client/industry...</button>
                                    <div class="backend-slot backend-slot--small">Client/Industry card</div>
                                </section>
                            </div>

                            <div class="entry-skills">
                                <p>Skills related to Software Engineer (select up to 5)</p>
                                <div class="chip-row">
                                    <span class="chip">AI</span>
                                    <span class="chip">customer_service</span>
                                    <span class="chip is-filled">Programming</span>
                                </div>
                                <small>3/5 selected</small>
                            </div>
                        </div>
                    </article>
                </div>

                <button class="outline-button" type="button" id="addExperienceButton">+ Add Work Experience</button>
            </section>

            <hr>

            <section class="builder-section" aria-labelledby="education-title">
                <div class="section-title-row">
                    <h2 id="education-title">Education</h2>
                    <button class="icon-action" type="button" data-edit-button aria-label="Edit education">✎</button>
                </div>

                <div class="entry-list" id="educationList">
                    <article class="entry-card" data-entry>
                        <div class="entry-toolbar">
                            <h3>Education 1</h3>
                            <div>
                                <button class="entry-tool" type="button" data-action="collapse" aria-label="Collapse education">−</button>
                                <button class="entry-tool" type="button" data-action="remove" aria-label="Remove education">×</button>
                            </div>
                        </div>

                        <div class="entry-body">
                            <div class="education-form-line">
                                <div class="entry-icon-soft" aria-hidden="true">☻</div>

                                <div class="education-fields">
                                    <p><strong>Sterlingbridge University</strong> <button class="inline-link" type="button">Add school/faculty/department (optional)...</button></p>
                                    <p><strong>Bachelor of Business Administration (BBA)</strong></p>
                                    <p><strong>Management</strong></p>

                                    <div class="date-row">
                                        <label>Mode:
                                            <select>
                                                <option>Full time</option>
                                                <option>Part time</option>
                                                <option>Online</option>
                                            </select>
                                        </label>
                                        <label><input type="checkbox" checked> Honors</label>
                                        <label><input type="checkbox" checked> Double Degree</label>
                                        <label><input type="checkbox" checked> Double Major</label>
                                    </div>

                                    <div class="chip-row education-tags">
                                        <span class="chip">English</span>
                                        <span class="chip">Marketing</span>
                                        <span class="chip">Entrepreneurship</span>
                                    </div>

                                    <textarea maxlength="500">Hello, I am engineer.</textarea>
                                    <p class="word-counter">4/50 words</p>

                                    <div class="backend-grid backend-grid--two">
                                        <div class="backend-slot backend-slot--education">University card</div>
                                        <div class="backend-slot backend-slot--education">Degree card</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>

                <button class="outline-button" type="button" id="addEducationButton">+ Add Degree</button>
            </section>

            <hr>

            <section class="builder-section" aria-labelledby="certification-title">
                <div class="section-title-row">
                    <h2 id="certification-title">Certifications</h2>
                    <button class="icon-action" type="button" data-edit-button aria-label="Edit certifications">✎</button>
                </div>

                <div class="cert-grid">
                    <article class="entry-card cert-card" data-entry>
                        <div class="entry-toolbar">
                            <h3>Microsoft Azure Fundamentals</h3>
                            <button class="entry-tool" type="button" data-action="remove" aria-label="Remove certification">×</button>
                        </div>
                        <p>Issued by: Microsoft</p>
                        <div class="backend-slot backend-slot--certification">Certification card</div>
                    </article>

                    <article class="entry-card cert-card" data-entry>
                        <div class="entry-toolbar">
                            <h3>AWS Certified Solutions Architect - Associate</h3>
                            <button class="entry-tool" type="button" data-action="remove" aria-label="Remove certification">×</button>
                        </div>
                        <p>Issued by: Amazon Web Services</p>
                        <div class="backend-slot backend-slot--certification">Certification card</div>
                    </article>
                </div>

                <button class="outline-button" type="button" id="addCertificationButton">+ Add Certification</button>
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