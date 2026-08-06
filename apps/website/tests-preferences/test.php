<?php
$pageTitle = 'Personality Test — Bildyx';
$pageDescription = 'Take a personality test on Bildyx.';
$pageScript = 'js/test-form.ts';
$bodyClass = 'personality-test-page';
$showMainNav = false;

function pt_fix_nested_paths(string $html): string
{
    return preg_replace_callback(
        '/\b(href|src)=["\'](?!https?:\/\/|\/\/|mailto:|tel:|#|\/|\.\.\/)([^"\']+)["\']/i',
        function ($matches) {
            return $matches[1] . '="../' . $matches[2] . '"';
        },
        $html
    );
}

ob_start();
require __DIR__ . '/../includes/header.php';
$sharedHeader = ob_get_clean();
$sharedHeader = pt_fix_nested_paths($sharedHeader);

$stylesheet = '<link rel="stylesheet" href="../css/personality-test-pages.css" />';
$fontawesomeScript = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />';
echo str_replace('</head>', "    {$stylesheet}\n    {$fontawesomeScript}\n</head>", $sharedHeader);
?>

<main class="pt-page">
    <div class="pt-shell">
        <section class="pt-card" aria-labelledby="pt-title" style="position: relative;">
            <div id="ptLoader" class="pt-loader" style="display: none;">
                <div class="pt-spinner-container">
                    <div class="pt-spinner"></div>
                    <p class="pt-loader-text">Saving answers and calculating results, please wait...</p>
                </div>
            </div>
            <header class="pt-header">
                <a class="pt-back" href="../tests-preferences.php" aria-label="Back to tests and preferences">‹</a>
                <div>
                    <h1 id="pt-title">Personality Test: <span id="testTitle">Loading...</span></h1>
                    <p id="testSubtitle">Loading description...</p>
                </div>
            </header>

            <div class="pt-content">
                <aside class="pt-question-nav" aria-label="Questions list">
                    <h2>Questions</h2>
                    <nav class="pt-question-list" id="questionsNavList">
                        <!-- Skeleton Loading nav items -->
                        <div class="pt-skeleton-nav-item"><span class="pt-skeleton-bar" style="width: 80%; height: 14px;"></span></div>
                        <div class="pt-skeleton-nav-item"><span class="pt-skeleton-bar" style="width: 70%; height: 14px;"></span></div>
                        <div class="pt-skeleton-nav-item"><span class="pt-skeleton-bar" style="width: 90%; height: 14px;"></span></div>
                        <div class="pt-skeleton-nav-item"><span class="pt-skeleton-bar" style="width: 60%; height: 14px;"></span></div>
                        <div class="pt-skeleton-nav-item"><span class="pt-skeleton-bar" style="width: 85%; height: 14px;"></span></div>
                    </nav>
                </aside>

                <form class="pt-form" id="personalityTestForm">
                    <div class="pt-scroll-area" id="questionsContainer">
                        <!-- Skeleton Loading questions -->
                        <div class="pt-skeleton-question">
                            <span class="pt-skeleton-bar" style="width: 65%; height: 20px; margin-bottom: 16px;"></span>
                            <div style="display: flex; gap: 12px; margin-left: 42px;">
                                <div class="pt-skeleton-circle"></div>
                                <div class="pt-skeleton-circle"></div>
                                <div class="pt-skeleton-circle"></div>
                                <div class="pt-skeleton-circle"></div>
                                <div class="pt-skeleton-circle"></div>
                            </div>
                        </div>
                        <div class="pt-skeleton-question">
                            <span class="pt-skeleton-bar" style="width: 45%; height: 20px; margin-bottom: 16px;"></span>
                            <div style="display: flex; gap: 12px; margin-left: 42px;">
                                <div class="pt-skeleton-circle"></div>
                                <div class="pt-skeleton-circle"></div>
                                <div class="pt-skeleton-circle"></div>
                                <div class="pt-skeleton-circle"></div>
                                <div class="pt-skeleton-circle"></div>
                            </div>
                        </div>
                        <div class="pt-skeleton-question">
                            <span class="pt-skeleton-bar" style="width: 55%; height: 20px; margin-bottom: 16px;"></span>
                            <div style="display: flex; gap: 12px; margin-left: 42px;">
                                <div class="pt-skeleton-circle"></div>
                                <div class="pt-skeleton-circle"></div>
                                <div class="pt-skeleton-circle"></div>
                                <div class="pt-skeleton-circle"></div>
                                <div class="pt-skeleton-circle"></div>
                            </div>
                        </div>
                    </div>

                    <footer class="pt-actions">
                        <p id="ptProgress">0/0 answered</p>

                        <div>
                            <button class="pt-outline-button" id="ptDiscard" type="button" disabled style="opacity: 0.5; cursor: not-allowed;">Discard</button>
                            <button class="pt-primary-button" type="submit" disabled style="opacity: 0.5; cursor: not-allowed;">Calculate Results</button>
                        </div>
                    </footer>
                </form>
            </div>
        </section>

        <aside class="pt-side-nav" aria-label="Profile menu">
            <a href="../profile.php"><span>☻</span> Profile</a>
            <a href="../target-list.php"><span>◎</span> My Target List</a>
            <a class="is-active" href="../tests-preferences.php"><span>▣</span> Tests &amp;<br> Preferences</a>
            <a href="../settings.php"><span>⚙</span> Settings</a>
        </aside>
    </div>
</main>

<?php
ob_start();
require __DIR__ . '/../includes/footer.php';
$sharedFooter = ob_get_clean();
echo pt_fix_nested_paths($sharedFooter);
?>
