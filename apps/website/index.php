<?php
$pageTitle = 'Bildyx — Home';
$pageDescription = 'Bildyx — professional team profiles and MicroResumes.';
$pageScript = 'js/home.js';
require __DIR__ . '/includes/header.php';
?>

<main class="home-layout">
        <section class="home-panel home-panel--teams">
            <div class="panel-inner teams-inner">
                <div class="intro-block">
                    <span class="eyebrow">For teams &amp; companies</span>
                    <h1>Create Team Profile</h1>
                    <p>Showcase your organization's collective talent. Manage team credentials and verified profiles in one place.</p>
                    <a href="why-teams.php" class="primary-button">
                        <span class="button-icon" aria-hidden="true">▣</span>
                        Create Team Profile
                    </a>
                </div>

                <article class="team-showcase" id="team-showcase">
                    <div class="team-overview">
                        <h2>Our Teams</h2>

                        <div class="team-tabs" role="tablist" aria-label="Choose a team">
                            <button class="team-tab active" type="button" data-team="alpha" role="tab" aria-selected="true">Team Alpha</button>
                            <button class="team-tab" type="button" data-team="beta" role="tab" aria-selected="false">Team Beta</button>
                            <button class="team-tab" type="button" data-team="gamma" role="tab" aria-selected="false">Team Gamma</button>
                            <button class="team-tab" type="button" data-team="delta" role="tab" aria-selected="false">Team Delta</button>
                            <button class="team-tab" type="button" data-team="fusion" role="tab" aria-selected="false">Team Fusion</button>
                        </div>

                        <div class="team-members" id="teamMembers" aria-live="polite"></div>

                        <section class="team-subsection offices">
                            <h3>Our Offices</h3>
                            <div class="office-cities" id="officeCities">
                                <div class="city" data-city="tokyo">
                                    <div class="city-photo"><img src="images/city-tokyo.png" alt="Tokyo" /></div>
                                    <span>Tokyo</span>
                                </div>
                                <div class="city" data-city="new-york">
                                    <div class="city-photo"><img src="images/city-new-york.png" alt="New York" /></div>
                                    <span>New York</span>
                                </div>
                                <div class="city" data-city="seoul">
                                    <div class="city-photo"><img src="images/city-seoul.png" alt="Seoul" /></div>
                                    <span>Seoul</span>
                                </div>
                                <div class="city" data-city="kuala-lumpur">
                                    <div class="city-photo"><img src="images/city-kuala-lumpur.png" alt="Kuala Lumpur" /></div>
                                    <span>Kuala Lumpur</span>
                                </div>
                                <div class="city" data-city="san-francisco">
                                    <div class="city-photo"><img src="images/city-san-francisco.png" alt="San Francisco" /></div>
                                    <span>San Francisco</span>
                                </div>
                                <div class="city" data-city="istanbul">
                                    <div class="city-photo"><img src="images/city-istanbul.png" alt="Istanbul" /></div>
                                    <span>Istanbul</span>
                                </div>
                            </div>
                        </section>

                        <section class="team-subsection products">
                            <h3>Main Products / Services</h3>
                            <div class="product-list" id="productList">
                                <span class="product-chip" data-product="ai"><span aria-hidden="true">▣</span> AI Software</span>
                                <span class="product-chip" data-product="search"><span aria-hidden="true">⌕</span> Search Engine Software</span>
                                <span class="product-chip" data-product="sales"><span aria-hidden="true">▽</span> Sales Software</span>
                                <span class="product-chip" data-product="cloud"><span aria-hidden="true">⌒</span> Cloud Infrastructure</span>
                                <span class="product-chip" data-product="analytics"><span aria-hidden="true">▥</span> Data Analytics</span>
                            </div>
                        </section>
                    </div>

                    <aside class="team-profile" aria-live="polite">
                        <h2>Team Profile</h2>
                        <span class="team-badge" id="teamBadge">Team Alpha</span>
                        <div class="profile-points" id="profilePoints"></div>
                        <div class="team-actions" aria-label="Team profile view">
                            <button
                                type="button"
                                class="profile-button active"
                                data-profile-mode="overview"
                                aria-pressed="true"
                            >Team Overview</button>
                            <button
                                type="button"
                                class="profile-button"
                                data-profile-mode="operate"
                                aria-pressed="false"
                            >How We Operate</button>
                        </div>
                    </aside>
                </article>
            </div>
        </section>

        <section class="home-panel home-panel--resume">
            <div class="panel-inner resume-inner">
                <div class="intro-block intro-block--light">
                    <span class="eyebrow eyebrow--light">For professionals</span>
                    <h1>Create MicroResume</h1>
                    <p>Build a verified, concise professional profile that highlights your core skills and achievements in seconds.</p>
                    <a href="generic.php?page=create-microresume" class="secondary-button">
                        Create MicroResume
                        <span aria-hidden="true">→</span>
                    </a>
                </div>

                <article class="resume-card">
                    <div class="resume-title-row">
                        <h2>Hanako Kingswell</h2>
                        <span class="resume-type">MicroResume</span>
                    </div>

                    <div class="resume-summary">
                        <img src="images/hanako.png" alt="Hanako Kingswell" class="resume-avatar" />
                        <p>Results-driven Software Engineer with experience at Pekamix, contributing to the development and enhancement of Sales Software solutions. Skilled in designing scalable business applications, improving system performance, and collaborating across cross-functional global teams to deliver high-quality software products. Bilingual in Japanese and English.</p>
                    </div>

                    <div class="resume-grid">
                        <section>
                            <h3>Software Engineer</h3>
                            <p class="mini-label"><span aria-hidden="true">◉</span> Languages</p>
                            <div class="tag-list">
                                <span class="tag tag--filled">Japanese</span>
                                <span class="tag tag--filled">English</span>
                                <span class="tag tag--outlined">German</span>
                            </div>
                        </section>

                        <section>
                            <h4>Top Skills</h4>
                            <div class="skill-list">
                                <span class="tag tag--filled">Software Development</span>
                                <span class="tag tag--filled">Team Building</span>
                                <span class="tag tag--filled">Problem Solving</span>
                                <span class="tag tag--filled">CRM Integration</span>
                                <span class="tag tag--filled">Performance Optimization</span>
                            </div>
                        </section>
                    </div>

                    <ul class="resume-meta">
                        <li><span aria-hidden="true">◎</span> Countries: USA</li>
                        <li><span aria-hidden="true">▥</span> Companies: Pekamix</li>
                        <li><span aria-hidden="true">▦</span> Products: Sales Software</li>
                        <li><span aria-hidden="true">▣</span> Job Occupations: Software Engineer</li>
                    </ul>
                </article>
            </div>
        </section>
    </main>

<?php require __DIR__ . '/includes/footer.php'; ?>
