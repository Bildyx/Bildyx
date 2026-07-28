<?php
$pageTitle = 'Basic Information — Bildyx';
$pageDescription = 'Basic information test for Bildyx profile.';
$pageScript = 'js/basic-information.js';
$bodyClass = 'basic-information-page';
$showMainNav = false;

/*
 * Cette page est dans /tests-preferences/.
 * Le <base href="../"> permet au header/footer partagés
 * de retrouver correctement css/, js/, images/, profile.php, etc.
 */

ob_start();
require __DIR__ . '/../includes/header.php';
$sharedHeader = ob_get_clean();

$headInjection = '
    <base href="../">
    <link rel="stylesheet" href="css/basic-information.css">
';

if (preg_match('/<head\b[^>]*>/i', $sharedHeader)) {
    echo preg_replace('/<head([^>]*)>/i', '<head$1>' . $headInjection, $sharedHeader, 1);
} else {
    echo $headInjection . $sharedHeader;
}
?>

<main class="bi-page">
    <div class="bi-shell">
        <section class="bi-card" aria-labelledby="bi-title">
            <header class="bi-header">
                <a class="bi-back" href="tests-preferences.php" aria-label="Back to tests and preferences">‹</a>
                <div>
                    <h1 id="bi-title">Test: <span>Basic Information</span></h1>
                    <p>Type basic information about your career aspirations.</p>
                </div>
            </header>

            <div class="bi-test-layout">
                <aside class="bi-question-index" aria-label="Questions list">
                    <h2>Questions</h2>
                    <ol>
                        <li><a href="#q1">My first job choice...</a></li>
                        <li><a href="#q2">I am looking for a...</a></li>
                        <li><a href="#q3">I am interested to w...</a></li>
                        <li><a href="#q4">I am looking to wor...</a></li>
                        <li><a href="#q5">Let me be more spe...</a></li>
                        <li><a href="#q6">I want to work in...</a></li>
                        <li><a href="#q7">Choose the option ...</a></li>
                        <li><a href="#q8">I want to work for a...</a></li>
                        <li><a href="#q9">Choose the option...</a></li>
                        <li><a href="#q10">I would like to...</a></li>
                        <li><a href="#q11">I would like to work...</a></li>
                        <li><a href="#q12">I want to work for...</a></li>
                        <li><a href="#q13">I would not like...</a></li>
                        <li><a href="#q14">My minimum expec...</a></li>
                    </ol>
                </aside>

                <form class="bi-form" id="basicInfoForm">
                    <section class="bi-question" id="q1">
                        <div class="bi-question-icon">▥</div>
                        <div class="bi-question-content bi-inline-fields">
                            <label>
                                1. My first job choice is
                                <input type="text" name="firstJob" value="Game Developer">
                            </label>
                            <label>
                                My second job choice is
                                <input type="text" name="secondJob" value="Game Designer">
                            </label>
                        </div>
                    </section>

                    <section class="bi-question" id="q2">
                        <div class="bi-question-icon">◎</div>
                        <div class="bi-question-content bi-inline-fields">
                            <label>
                                2. I am looking for a job within this country
                                <input type="text" name="country" value="Japan">
                            </label>
                        </div>
                    </section>

                    <section class="bi-question" id="q3">
                        <div class="bi-question-icon">▥</div>
                        <div class="bi-question-content">
                            <label>
                                3. I am interested to work in these cities
                                <input class="bi-add-input" type="text" data-chip-target="cities" placeholder="enter a city">
                            </label>
                            <div class="bi-chip-list" id="cities">
                                <span>Yokohama <button type="button" aria-label="Remove Yokohama">×</button></span>
                                <span>Tokyo <button type="button" aria-label="Remove Tokyo">×</button></span>
                            </div>
                        </div>
                    </section>

                    <section class="bi-question" id="q4">
                        <div class="bi-question-icon">文</div>
                        <div class="bi-question-content">
                            <label>
                                4. I am looking to work in a/an
                                <input class="bi-add-input" type="text" data-chip-target="languages" placeholder="enter a language">
                                speaking environment
                            </label>
                            <div class="bi-chip-list" id="languages">
                                <span>French <button type="button" aria-label="Remove French">×</button></span>
                                <span>English <button type="button" aria-label="Remove English">×</button></span>
                                <span>Japanese <button type="button" aria-label="Remove Japanese">×</button></span>
                            </div>
                        </div>
                    </section>

                    <section class="bi-question" id="q5">
                        <div class="bi-question-icon">◎</div>
                        <div class="bi-question-content">
                            <strong>5. Let me be more specific</strong>

                            <label class="bi-option">
                                <input type="radio" name="sectorChoice">
                                I want to work in any of these sectors
                                <input type="text" placeholder="enter a sector">
                            </label>

                            <label class="bi-option">
                                <input type="radio" name="sectorChoice">
                                I want to work in any of these industries
                                <input type="text" placeholder="enter a industry">
                            </label>

                            <label class="bi-option is-selected">
                                <input type="radio" name="sectorChoice" checked>
                                Any sector is fine
                            </label>
                        </div>
                    </section>

                    <section class="bi-question" id="q6">
                        <div class="bi-question-icon">⌁</div>
                        <div class="bi-question-content">
                            <strong>6. I want to work in a company that has a</strong>

                            <label class="bi-option">
                                <input type="checkbox" name="growth">
                                Small rate of growth (Annual revenue growth 1-2%, not much change, stable, not much stress.)
                            </label>

                            <label class="bi-option">
                                <input type="checkbox" name="growth">
                                Medium rate of growth (annual revenue growth is maybe 5%, people work a bit harder than usual.)
                            </label>

                            <label class="bi-option">
                                <input type="checkbox" name="growth">
                                High rate of growth (annual revenue growth is maybe 20%, employees are working hard to meet deadlines, company is aggressively hiring, stress can be high.)
                            </label>

                            <label class="bi-option is-selected">
                                <input type="checkbox" name="growth" checked>
                                Does not matter
                            </label>
                        </div>
                    </section>

                    <section class="bi-question" id="q7">
                        <div class="bi-question-icon">♙</div>
                        <div class="bi-question-content">
                            <strong>7. Choose the option which most closely describes the company you would like to work for</strong>

                            <label class="bi-option">
                                <input type="radio" name="companyRank">
                                Company that is the leader in its industry
                            </label>

                            <label class="bi-option">
                                <input type="radio" name="companyRank">
                                Company that is a follower in its industry (#2)
                            </label>

                            <label class="bi-option">
                                <input type="radio" name="companyRank">
                                Company that is a "normal/average company"
                            </label>

                            <label class="bi-option is-selected">
                                <input type="radio" name="companyRank" checked>
                                Does not matter
                            </label>
                        </div>
                    </section>

                    <section class="bi-question" id="q8">
                        <div class="bi-question-icon">◎</div>
                        <div class="bi-question-content">
                            <strong>8. I want to work for a company originating in</strong>

                            <label class="bi-option">
                                <input type="radio" name="origin">
                                My home country
                            </label>

                            <label class="bi-option is-selected">
                                <input type="radio" name="origin" checked>
                                One of these countries
                                <input class="bi-add-input" type="text" data-chip-target="countries" placeholder="enter a country">
                            </label>

                            <div class="bi-chip-list" id="countries">
                                <span>United States <button type="button" aria-label="Remove United States">×</button></span>
                                <span>Japan <button type="button" aria-label="Remove Japan">×</button></span>
                                <span>Malaysia <button type="button" aria-label="Remove Malaysia">×</button></span>
                                <span>Singapore <button type="button" aria-label="Remove Singapore">×</button></span>
                            </div>

                            <label class="bi-option">
                                <input type="radio" name="origin">
                                Any country is fine
                            </label>
                        </div>
                    </section>

                    <section class="bi-question" id="q9">
                        <div class="bi-question-icon">▧</div>
                        <div class="bi-question-content">
                            <strong>9. Choose the option which MOST closely describes the company you would like to work for</strong>

                            <label class="bi-option">
                                <input type="radio" name="companyType">
                                Public Company (listed on the stock exchange)
                            </label>

                            <label class="bi-option is-selected">
                                <input type="radio" name="companyType" checked>
                                Private (owned by 1 or more persons)
                            </label>

                            <label class="bi-option">
                                <input type="radio" name="companyType">
                                Sole Proprietorship (owned by 1 person)
                            </label>

                            <label class="bi-option">
                                <input type="radio" name="companyType">
                                Startup that is backed by venture capital or angel investor
                            </label>

                            <label class="bi-option">
                                <input type="radio" name="companyType">
                                Startup that is founded by large company or is a joint venture
                            </label>

                            <label class="bi-option">
                                <input type="radio" name="companyType">
                                Does not matter
                            </label>
                        </div>
                    </section>

                    <section class="bi-question" id="q10">
                        <div class="bi-question-icon">⚖</div>
                        <div class="bi-question-content">
                            <strong>10. I would like to work in company which is</strong>

                            <label class="bi-option is-selected">
                                <input type="checkbox" checked>
                                Micro business (1-20 employees)
                            </label>

                            <label class="bi-option is-selected">
                                <input type="checkbox" checked>
                                Small business (20-100 employees)
                            </label>

                            <label class="bi-option is-selected">
                                <input type="checkbox" checked>
                                Medium-sized business (100-1000)
                            </label>

                            <label class="bi-option is-selected">
                                <input type="checkbox" checked>
                                Big business (1000-10000)
                            </label>

                            <label class="bi-option is-selected">
                                <input type="checkbox" checked>
                                Large, established company (10,000+)
                            </label>
                        </div>
                    </section>

                    <section class="bi-question" id="q11">
                        <div class="bi-question-icon">✪</div>
                        <div class="bi-question-content">
                            <label>
                                11. I would like to work for a
                                <select name="jobPreference">
                                    <option>Doesn't matter</option>
                                    <option>Local company</option>
                                    <option>Global company</option>
                                </select>
                            </label>
                        </div>
                    </section>

                    <section class="bi-question" id="q12">
                        <div class="bi-question-icon">♧</div>
                        <div class="bi-question-content">
                            <label>
                                12. Interested in Tech Startups? I want to work for
                                <select name="startupInterest">
                                    <option>Artificial Intelligence</option>
                                    <option>Cloud Infrastructure</option>
                                    <option>Cybersecurity</option>
                                </select>
                            </label>
                        </div>
                    </section>

                    <section class="bi-question" id="q13">
                        <div class="bi-question-icon">☞</div>
                        <div class="bi-question-content">
                            <label>
                                13. I would not like to work in these companies
                                <input class="bi-add-input" type="text" data-chip-target="blockedCompanies" placeholder="enter a company">
                            </label>

                            <div class="bi-chip-list" id="blockedCompanies">
                                <span>Works Applications Co., Ltd. <button type="button" aria-label="Remove Works Applications Co., Ltd.">×</button></span>
                            </div>
                        </div>
                    </section>

                    <section class="bi-question" id="q14">
                        <div class="bi-question-icon">◎</div>
                        <div class="bi-question-content bi-salary-grid">
                            <strong>14. My minimum expected salary in case I work in my employer office is</strong>

                            <label>
                                Base
                                <span>US $ USD</span>
                                <input type="number" value="50000">
                            </label>

                            <label>
                                Bonus
                                <span>US $ USD</span>
                                <input type="number" value="10000">
                            </label>
                        </div>
                    </section>

                    <div class="bi-actions">
                        <button class="bi-button bi-button--ghost" type="reset">Discard</button>
                        <button class="bi-button bi-button--primary" type="submit">Update</button>
                    </div>
                </form>
            </div>
        </section>

        <aside class="profile-side-nav" aria-label="Profile menu">
            <a class="side-nav-button" href="profile.php"><span aria-hidden="true">☻</span> Profile</a>
            <a class="side-nav-button" href="target-list.php"><span aria-hidden="true">◎</span> My Target List</a>
            <a class="side-nav-button is-active" href="tests-preferences.php"><span aria-hidden="true">▣</span> Tests &amp;<br> Preferences</a>
            <a class="side-nav-button" href="my-jobs.php"><span aria-hidden="true">▥</span> My Jobs</a>
            <a class="side-nav-button" href="settings.php"><span aria-hidden="true">⚙</span> Settings</a>
        </aside>
    </div>
</main>

<?php require __DIR__ . '/../includes/footer.php'; ?>