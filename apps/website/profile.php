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
                        <strong id="profileName" data-field="name" contenteditable="true" data-placeholder="Add your name..."><span class="skeleton-loader skeleton-name"></span></strong>
                        <span>MicroResume</span>
                    </div>
                </div>

                <section class="summary-block" aria-labelledby="career-summary-title">
                    <h2 class="section-mini-title" id="career-summary-title">Career Summary</h2>

                    <div class="summary-row">
                        <div class="avatar-editor">
                            <div class="profile-avatar" id="profileAvatar" data-field="avatar"></div>
                            <input class="hidden-file-input" id="avatarInput" type="file" accept="image/*" style="display: none;" />
                        </div>

                        <p class="summary-text" data-field="summary" contenteditable="true" data-placeholder="Add career summary...">
                            <span class="skeleton-loader skeleton-summary"></span>
                        </p>
                    </div>
                </section>

                <div class="profile-main-grid">
                    <section class="profile-core" aria-labelledby="role-title">
                        <div class="title-line">
                            <h1 id="role-title" data-field="role" contenteditable="true" data-placeholder="Add role title..."><span class="skeleton-loader skeleton-role"></span></h1>
                        </div>

                        <p class="mini-label" style="display: flex; align-items: center; gap: 8px;">
                            <svg class="meta-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            Languages
                            <button class="chip-add" type="button" data-add-chip="languageChips" aria-label="Add language">+</button>
                        </p>
                        <div class="chip-row" id="languageChips" aria-label="Languages" data-chip-limit="5">
                            <span class="skeleton-loader skeleton-chip"></span>
                            <span class="skeleton-loader skeleton-chip"></span>
                        </div>

                        <p class="level-legend" style="display: none;">
                            <span></span> Native
                            <span></span> Fluent
                            <span></span> Intermediate
                        </p>

                        <ul class="profile-meta-list">
                            <li>
                                <svg class="meta-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                <strong>Countries:</strong> 
                                <span data-field="meta-worked-in"><span class="skeleton-loader skeleton-meta"></span></span>
                            </li>
                            <li>
                                <svg class="meta-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>
                                <strong>Studied In:</strong> 
                                <span data-field="meta-studied-in"><span class="skeleton-loader skeleton-meta"></span></span>
                            </li>
                            <li>
                                <svg class="meta-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="16"></line><line x1="15" y1="22" x2="15" y2="16"></line><line x1="9" y1="16" x2="15" y2="16"></line><path d="M8 6h2v2H8V6zm0 4h2v2H8v-2zm8-4h2v2h-2V6zm0 4h2v2h-2v-2z"></path></svg>
                                <strong>Companies:</strong> 
                                <span data-field="meta-companies"><span class="skeleton-loader skeleton-meta"></span></span>
                            </li>
                            <li>
                                <svg class="meta-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08"></polygon><polygon points="12 22.08 21 17.08 21 6.92 12 12 12 22.08"></polygon><polygon points="12 12 21 6.92 12 1.84 3 6.92 12 12"></polygon></svg>
                                <strong>Products:</strong> 
                                <span data-field="meta-products"><span class="skeleton-loader skeleton-meta"></span></span>
                            </li>
                            <li>
                                <svg class="meta-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                                <strong>Job Occupations:</strong> 
                                <span data-field="meta-jobs"><span class="skeleton-loader skeleton-meta"></span></span>
                            </li>
                            <li>
                                <svg class="meta-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                <strong>Degrees:</strong> 
                                <span data-field="meta-degrees"><span class="skeleton-loader skeleton-meta"></span></span>
                            </li>
                            <li>
                                <svg class="meta-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                <strong>Certifications:</strong> 
                                <span data-field="meta-certifications"><span class="skeleton-loader skeleton-meta"></span></span>
                            </li>
                        </ul>
                    </section>

                    <section class="skills-box" aria-labelledby="skills-title">
                        <div class="title-line title-line--small" style="display: flex; align-items: center; gap: 8px;">
                            <h2 id="skills-title">Top Skills</h2>
                            <button class="chip-add" type="button" data-add-chip="skillChips" aria-label="Add skill">+</button>
                        </div>

                        <div class="chip-row skill-row" id="skillChips" aria-label="Top skills">
                            <span class="skeleton-loader skeleton-chip"></span>
                            <span class="skeleton-loader skeleton-chip"></span>
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



<?php require __DIR__ . '/includes/footer.php'; ?>