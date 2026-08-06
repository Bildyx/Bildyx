<?php
$pageTitle = 'Test Results — Bildyx';
$pageDescription = 'View your personality test results.';
$pageScript = 'js/result.ts';
$bodyClass = 'result-page';
$showMainNav = false;

function result_fix_nested_paths(string $html): string
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
$sharedHeader = result_fix_nested_paths($sharedHeader);

$stylesheet = '<link rel="stylesheet" href="../css/result.css" />';
// Include jsPDF from CDN
$jspdfScript = '<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>';
$fontawesomeScript = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />';
echo str_replace('</head>', "    {$stylesheet}\n    {$jspdfScript}\n    {$fontawesomeScript}\n</head>", $sharedHeader);
?>

<main class="res-page">
    <div class="res-shell">
        <section class="res-card" aria-labelledby="res-title">
            <header class="res-header">
                <a class="res-back" href="../tests-preferences.php" aria-label="Back to tests and preferences">‹</a>
                <div>
                    <h1 id="res-title" class="res-test-title">Loading...</h1>
                    <p class="res-test-subtitle"></p>
                </div>
            </header>

            <div class="res-content">
                <!-- Score Cards row -->
                <div class="res-score-cards" id="scoreCardsContainer">
                    <!-- Dynamic score cards go here -->
                </div>

                <!-- PDF Viewer container -->
                <div class="res-pdf-container" style="position: relative;">
                    <div id="pdfLoader" class="res-pdf-loader">
                        <div class="res-spinner-container">
                            <div class="res-spinner"></div>
                            <p class="res-loader-text">Generating your report, please wait...</p>
                        </div>
                    </div>
                    <iframe id="pdfViewer" src="" title="PDF Results" type="application/pdf"></iframe>
                </div>
            </div>
        </section>

        <aside class="res-side-nav" aria-label="Profile menu">
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
echo result_fix_nested_paths($sharedFooter);
?>
