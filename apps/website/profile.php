<?php
$pageTitle = 'Profile — Bildyx';
$pageDescription = 'Create and edit your Bildyx MicroResume profile.';
$pageScript = 'js/profile.js';
$bodyClass = 'profile-page';

/*
 * Le header et le footer partagés restent inchangés.
 * Cette page ajoute seulement sa propre feuille CSS.
 */
ob_start();
require __DIR__ . '/includes/header.php';
$sharedHeader = ob_get_clean();
$profileStylesheet = '<link rel="stylesheet" href="css/profile.css" />';
echo str_replace('</head>', "    {$profileStylesheet}\n</head>", $sharedHeader);
?>

<main class="profile-shell">
    <section class="profile-workspace" aria-label="Bildyx MicroResume builder">
        <article class="profile-card" id="profilePanel">
            <header class="profile-top">
                <div class="name-zone" data-edit-area="identity">
                    <div class="name-pill">
                        <strong data-editable="name" contenteditable="false">Justine Tauxe</strong>
                        <span>MicroResume</span>
                    </div>
                    <button class="icon-action js-edit" type="button" data-edit-target="identity" aria-label="Edit name and headline">✎</button>
                </div>

                <div class="headline-wrap" data-edit-area="identity">
                    <input
                        class="headline-input"
                        type="text"
                        value="Cosmopolitan. Nerd. Learner. Love Tokyo."
                        maxlength="100"
                        data-counter="headlineCounter"
                        aria-label="Short profile headline"
                    />
                    <p class="field-help"><span id="headlineCounter">40</span>/100 chars · 5/12 words</p>
                </div>
            </header>

            <section class="summary-block" data-edit-area="summary" aria-labelledby="career-summary-title">
                <div class="section-mini-title" id="career-summary-title">Career Summary</div>
                <div class="summary-row">
                    <div class="avatar-editor">
                        <div class="profile-avatar" id="profileAvatar" aria-label="Profile avatar placeholder">JT</div>
                        <button class="tiny-button" type="button" id="avatarButton">Change photo</button>
                    </div>
                    <p class="summary-text" data-editable="career-summary" contenteditable="false">
                        I am as hardworking as Japanese.
                    </p>
                    <button class="icon-action js-edit" type="button" data-edit-target="summary" aria-label="Edit career summary">✎</button>
                </div>
                <p class="location-line">⌾ Aachen, Germany</p>
            </section>

            <section class="profile-main-grid">
                <div class="profile-info" data-edit-area="profile-info">
                    <div class="title-line">
                        <h1 data-editable="role-title" contenteditable="false">Software Ninjica</h1>
                        <button class="icon-action js-edit" type="button" data-edit-target="profile-info" aria-label="Edit profile information">✎</button>
                    </div>

                    <div class="language-zone">
                        <p class="mini-label">◐ Languages <span>(max 5)</span></p>
                        <div class="chip-row" id="languageChips" data-chip-limit="5">
                            <span class="chip is-filled">English <button type="button" aria-label="Remove English">×</button></span>
                            <span class="chip is-filled">German <button type="button" aria-label="Remove German">×</button></span>
                            <span class="chip is-filled">Spanish <button type="button" aria-label="Remove Spanish">×</button></span>
                            <span class="chip is-filled">Japanese <button type="button" aria-label="Remove Japanese">×</button></span>
                            <button class="chip-add" type="button" data-add-chip="languageChips">+</button>
                        </div>
                        <p class="level-legend"><span></span> Native <span></span> Fluent <span></span> Intermediate</p>
                    </div>

                    <ul class="profile-meta-list" data-edit-area="profile-info">
                        <li><strong>◎ Worked In:</strong> <span data-editable="worked-in" contenteditable="false">Abilene, Texas (United States), Aberdeen (United Kingdom)</span></li>
                        <li><strong>⊕ Studied In:</strong> <span data-editable="studied-in" contenteditable="false">—</span></li>
                        <li><strong>▥ Companies:</strong> <span data-editable="companies" contenteditable="false">Pekamix Global, Pekamix</span></li>
                        <li><strong>⌁ Products/Services:</strong> <span data-editable="products" contenteditable="false">SalesPro</span></li>
                        <li><strong>▦ Job Occupations:</strong> <span data-editable="occupations" contenteditable="false">Software Engineer</span></li>
                        <li><strong>◇ Degrees:</strong> <span data-editable="degrees" contenteditable="false">Bachelor of Business Administration (BBA), Associate Degree in Nursing (ADN)</span></li>
                        <li><strong>⌘ Certifications:</strong> <span data-editable="certifications" contenteditable="false">Microsoft Azure Fundamentals, AWS Certified Solutions Architect - Associate</span></li>
                    </ul>
                </div>

                <aside class="skills-box" data-edit-area="skills">
                    <div class="title-line title-line--small">
                        <h2>Top Skills</h2>
                        <button class="icon-action js-edit" type="button" data-edit-target="skills" aria-label="Edit skills">✎</button>
                    </div>
                    <div class="chip-row skill-row" id="skillChips" data-chip-limit="8">
                        <span class="chip is-outline">Programming <button type="button" aria-label="Remove Programming">×</button></span>
                        <span class="chip is-outline">customer_service <button type="button" aria-label="Remove customer service">×</button></span>
                        <span class="chip is-outline">Team Building <button type="button" aria-label="Remove Team Building">×</button></span>
                        <button class="chip-add" type="button" data-add-chip="skillChips">+</button>
                    </div>
                </aside>
            </section>

            <hr />

            <section class="builder-section" aria-labelledby="experience-title">
                <div class="section-title-row">
                    <h2 id="experience-title">Experiences</h2>
                    <button class="icon-action" type="button" id="addExperienceTop" aria-label="Add work experience">＋</button>
                </div>

                <div id="experienceList" class="entry-list">
                    <article class="entry-card" data-entry="experience">
                        <div class="entry-toolbar">
                            <h3>Work Experience 1</h3>
                            <div>
                                <button class="entry-tool js-collapse" type="button" aria-label="Collapse or expand work experience">＋</button>
                                <button class="entry-tool js-remove-entry" type="button" aria-label="Remove work experience">×</button>
                            </div>
                        </div>

                        <div class="entry-body">
                            <div class="entry-header-line">
                                <div class="round-place"></div>
                                <div class="entry-controls">
                                    <div class="date-row">
                                        <select aria-label="Start date"><option>Jan 2025</option><option>Jan 2024</option><option>Nov 2012</option></select>
                                        <span>–</span>
                                        <select aria-label="End date"><option>Jul 2025</option><option>May 2024</option><option>Oct 2013</option></select>
                                    </div>
                                    <p><span contenteditable="true">Abilene, Texas</span> · <span contenteditable="true">Pekamix Global</span></p>
                                    <button class="inline-link" type="button">Add brand (optional)...</button>
                                    <button class="inline-link" type="button">Add client/industry served (optional)...</button>
                                    <a href="#">Software Engineer</a>
                                    <label>Type:
                                        <select><option>Internship</option><option>Full-time</option><option>Part-time</option><option>Freelance</option></select>
                                    </label>
                                    <label>Level:
                                        <select><option>Optional</option><option>Junior</option><option>Mid</option><option>Senior</option></select>
                                    </label>
                                </div>
                            </div>

                            <textarea maxlength="600" data-word-counter placeholder="Add work summary up to 60 words...">I was working hard for Pekamix family, likes it.</textarea>
                            <p class="word-counter">9/60 words</p>

                            <div class="backend-grid backend-grid--three">
                                <section>
                                    <h4>Company</h4>
                                    <div class="backend-slot" data-card-slot="company-card">Company card</div>
                                </section>
                                <section>
                                    <h4>Product/Service</h4>
                                    <div class="backend-slot" data-card-slot="product-card">Product/Service card</div>
                                </section>
                                <section>
                                    <h4>Role</h4>
                                    <div class="backend-slot" data-card-slot="role-card">Role card</div>
                                </section>
                            </div>

                            <div class="backend-grid backend-grid--two">
                                <section>
                                    <h4>Brands</h4>
                                    <button class="inline-link" type="button">Add brand (optional)...</button>
                                    <div class="backend-slot backend-slot--small" data-card-slot="brand-card">Brand card</div>
                                </section>
                                <section>
                                    <h4>Client/Industry</h4>
                                    <button class="inline-link" type="button">Add client/industry...</button>
                                    <div class="backend-slot backend-slot--small" data-card-slot="client-card">Client/Industry card</div>
                                </section>
                            </div>

                            <div class="entry-skills">
                                <p>Skills related to Software Engineer <span>(select up to 5)</span></p>
                                <div class="chip-row" data-selectable-skills>
                                    <button class="chip is-outline is-selectable is-active" type="button">AI</button>
                                    <button class="chip is-outline is-selectable is-active" type="button">customer_service</button>
                                    <button class="chip is-outline is-selectable is-active" type="button">Programming</button>
                                </div>
                                <small>3/5 selected</small>
                            </div>
                        </div>
                    </article>
                </div>

                <button class="outline-button" type="button" id="addExperienceBottom">＋ Add Work Experience</button>
            </section>

            <hr />

            <section class="builder-section" aria-labelledby="education-title">
                <div class="section-title-row">
                    <h2 id="education-title">Education</h2>
                    <button class="icon-action" type="button" id="addDegreeTop" aria-label="Add degree">＋</button>
                </div>

                <div id="educationList" class="entry-list">
                    <article class="entry-card" data-entry="education">
                        <div class="entry-toolbar">
                            <h3>Sterlingbridge University</h3>
                            <div>
                                <button class="entry-tool js-collapse" type="button" aria-label="Collapse or expand education">＋</button>
                                <button class="entry-tool js-remove-entry" type="button" aria-label="Remove education">×</button>
                            </div>
                        </div>

                        <div class="entry-body">
                            <div class="education-form-line">
                                <div class="entry-icon-soft">◈</div>
                                <div class="education-fields">
                                    <p><strong contenteditable="true">Sterlingbridge University</strong> <button class="inline-link" type="button">Add school/faculty/department (optional)...</button></p>
                                    <p><strong contenteditable="true">Bachelor of Business Administration (BBA)</strong> <span contenteditable="true">Management</span></p>
                                    <label>Mode:
                                        <select><option>Full time</option><option>Part time</option><option>Online</option></select>
                                    </label>
                                    <label><input type="checkbox" checked /> Honors</label>
                                    <label><input type="checkbox" checked /> Double Degree</label>
                                    <label><input type="checkbox" checked /> Double Major</label>
                                    <div class="chip-row education-tags">
                                        <span class="chip is-outline">English <button type="button">×</button></span>
                                        <button class="inline-link" type="button">+ Add another major</button>
                                        <span class="chip is-outline">Marketing <button type="button">×</button></span>
                                        <span class="chip is-outline">Entrepreneurship <button type="button">×</button></span>
                                    </div>
                                    <div class="date-row date-row--right">
                                        <select><option>Start date</option><option>Jan 2025</option><option>Jan 2013</option></select>
                                        <span>–</span>
                                        <select><option>End date</option><option>Mar 2025</option><option>Jan 2017</option></select>
                                    </div>
                                </div>
                            </div>

                            <textarea maxlength="500" data-word-counter placeholder="Add summary up to 50 words...">Hello, I am engineer.</textarea>
                            <p class="word-counter">4/50 words</p>

                            <div class="backend-grid backend-grid--two">
                                <div class="backend-slot backend-slot--education" data-card-slot="university-card">University card</div>
                                <div class="backend-slot backend-slot--education" data-card-slot="degree-card">Degree card</div>
                            </div>
                        </div>
                    </article>
                </div>

                <button class="outline-button" type="button" id="addDegreeBottom">＋ Add Degree</button>
            </section>

            <hr />

            <section class="builder-section" aria-labelledby="certification-title">
                <div class="section-title-row">
                    <h2 id="certification-title">Certifications</h2>
                    <button class="icon-action" type="button" id="addCertificationTop" aria-label="Add certification">＋</button>
                </div>

                <div id="certificationList" class="cert-grid">
                    <article class="entry-card cert-card" data-entry="certification">
                        <div class="entry-toolbar">
                            <h3>Microsoft Azure Fundamentals</h3>
                            <button class="entry-tool js-remove-entry" type="button" aria-label="Remove certification">×</button>
                        </div>
                        <div class="entry-body">
                            <p>Issued by: <span contenteditable="true">Microsoft</span></p>
                            <div class="date-row"><select><option>Feb 2011</option><option>Jan 2026</option></select><span>–</span><select><option>Feb 2012</option><option>Select date</option></select></div>
                            <div class="backend-slot backend-slot--certification" data-card-slot="certification-card">Certification card</div>
                        </div>
                    </article>

                    <article class="entry-card cert-card" data-entry="certification">
                        <div class="entry-toolbar">
                            <h3>AWS Certified Solutions Architect - Associate</h3>
                            <button class="entry-tool js-remove-entry" type="button" aria-label="Remove certification">×</button>
                        </div>
                        <div class="entry-body">
                            <p>Issued by: <span contenteditable="true">Amazon Web Services</span></p>
                            <div class="date-row"><select><option>Jan 2026</option><option>Feb 2011</option></select><span>–</span><select><option>Select date</option><option>Feb 2012</option></select></div>
                            <div class="backend-slot backend-slot--certification" data-card-slot="certification-card">Certification card</div>
                        </div>
                    </article>
                </div>

                <button class="outline-button" type="button" id="addCertificationBottom">＋ Add Certification</button>
            </section>

            <div class="save-row">
                <button class="save-button" type="button" id="saveProfile">▣ Save Microresume</button>
            </div>
        </article>

        <aside class="profile-side-nav" aria-label="Profile menu">
            <button class="side-nav-button is-active" type="button" data-panel="profilePanel">◎ Profile</button>
            <button class="side-nav-button" type="button" data-panel="experiencePanel">▥ My Target List</button>
            <button class="side-nav-button" type="button" data-panel="testsPanel">▣ Tests &amp;<br />Preferences</button>
            <button class="side-nav-button" type="button" data-panel="jobsPanel">▥ My Jobs</button>
            <button class="side-nav-button" type="button" data-panel="settingsPanel">⚙ Settings</button>
        </aside>

        <section class="profile-card utility-panel" id="testsPanel" hidden>
            <h1>Tests &amp; Preferences</h1>
            <p>Choose the signals you want to show recruiters.</p>
            <div class="settings-list">
                <label><input type="checkbox" checked /> Show language test results</label>
                <label><input type="checkbox" checked /> Show work preference tags</label>
                <label><input type="checkbox" /> Open to relocation</label>
            </div>
            <button class="save-button js-back-profile" type="button">Back to profile</button>
        </section>

        <section class="profile-card utility-panel" id="jobsPanel" hidden>
            <h1>My Jobs</h1>
            <p>Track applications connected to this MicroResume.</p>
            <div class="empty-state">No saved jobs yet.</div>
            <button class="save-button js-back-profile" type="button">Back to profile</button>
        </section>

        <section class="profile-card utility-panel" id="settingsPanel" hidden>
            <h1>Settings</h1>
            <p>Manage visibility and account preferences.</p>
            <div class="settings-list">
                <label><input type="checkbox" checked /> Public MicroResume</label>
                <label><input type="checkbox" /> Recruiter contact allowed</label>
                <label><input type="checkbox" checked /> Email updates</label>
            </div>
            <button class="save-button js-back-profile" type="button">Back to profile</button>
        </section>
    </section>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
