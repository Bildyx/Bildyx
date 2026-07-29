<?php
$pageTitle = 'Personality Test: ' . $testTitle . ' — Bildyx';
$pageDescription = $testSubtitle;
$pageScript = null;
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
echo str_replace('</head>', "    {$stylesheet}\n</head>", $sharedHeader);
?>

<main class="pt-page">
    <div class="pt-shell">
        <section class="pt-card" aria-labelledby="pt-title">
            <header class="pt-header">
                <a class="pt-back" href="../tests-preferences.php" aria-label="Back to tests and preferences">‹</a>
                <div>
                    <h1 id="pt-title">Personality Test: <span><?php echo htmlspecialchars($testTitle, ENT_QUOTES, 'UTF-8'); ?></span></h1>
                    <p><?php echo htmlspecialchars($testSubtitle, ENT_QUOTES, 'UTF-8'); ?></p>
                </div>
            </header>

            <div class="pt-content">
                <aside class="pt-question-nav" aria-label="Questions list">
                    <h2>Questions</h2>

                    <nav class="pt-question-list">
                        <?php foreach ($questions as $index => $question): ?>
                            <?php $number = $index + 1; ?>
                            <a href="#question-<?php echo $number; ?>">
                                <strong><?php echo $number; ?>.</strong>
                                <span><?php echo htmlspecialchars($question, ENT_QUOTES, 'UTF-8'); ?></span>
                            </a>
                        <?php endforeach; ?>
                    </nav>
                </aside>

                <form class="pt-form" id="personalityTestForm" data-test-key="<?php echo htmlspecialchars($testKey, ENT_QUOTES, 'UTF-8'); ?>">
                    <div class="pt-scroll-area">
                        <?php foreach ($questions as $index => $question): ?>
                            <?php $number = $index + 1; ?>
                            <section class="pt-question" id="question-<?php echo $number; ?>">
                                <div class="pt-question-title">
                                    <span class="pt-question-icon" aria-hidden="true"><?php echo htmlspecialchars($icons[$index % count($icons)], ENT_QUOTES, 'UTF-8'); ?></span>
                                    <h2><?php echo $number . '. ' . htmlspecialchars($question, ENT_QUOTES, 'UTF-8'); ?></h2>
                                </div>

                                <?php if ($testType === 'yesno'): ?>
                                    <div class="pt-scale pt-scale-yesno" role="group" aria-label="<?php echo htmlspecialchars($question, ENT_QUOTES, 'UTF-8'); ?>">
                                        <button class="pt-answer-button pt-answer-pill" type="button" data-question="<?php echo $number; ?>" data-value="yes" aria-pressed="false">
                                            <span></span> <?php echo htmlspecialchars($scaleLeft, ENT_QUOTES, 'UTF-8'); ?>
                                        </button>

                                        <button class="pt-answer-button pt-answer-pill" type="button" data-question="<?php echo $number; ?>" data-value="no" aria-pressed="false">
                                            <span></span> <?php echo htmlspecialchars($scaleRight, ENT_QUOTES, 'UTF-8'); ?>
                                        </button>

                                        <input type="hidden" name="q<?php echo $number; ?>" value="">
                                    </div>
                                <?php else: ?>
                                    <div class="pt-scale" role="group" aria-label="<?php echo htmlspecialchars($question, ENT_QUOTES, 'UTF-8'); ?>">
                                        <span class="pt-scale-label"><?php echo htmlspecialchars($scaleLeft, ENT_QUOTES, 'UTF-8'); ?></span>

                                        <?php for ($value = 1; $value <= 5; $value++): ?>
                                            <button
                                                class="pt-answer-button pt-rating-button"
                                                type="button"
                                                data-question="<?php echo $number; ?>"
                                                data-value="<?php echo $value; ?>"
                                                aria-pressed="false"
                                            >
                                                <?php echo $value; ?>
                                            </button>
                                        <?php endfor; ?>

                                        <span class="pt-scale-label"><?php echo htmlspecialchars($scaleRight, ENT_QUOTES, 'UTF-8'); ?></span>
                                        <input type="hidden" name="q<?php echo $number; ?>" value="">
                                    </div>
                                <?php endif; ?>
                            </section>
                        <?php endforeach; ?>
                    </div>

                    <footer class="pt-actions">
                        <p id="ptProgress">0/<?php echo count($questions); ?> answered</p>

                        <div>
                            <button class="pt-outline-button" id="ptDiscard" type="button">Discard</button>
                            <button class="pt-primary-button" type="submit">Update</button>
                        </div>
                    </footer>
                </form>
            </div>
        </section>

        <aside class="pt-side-nav" aria-label="Profile menu">
            <a href="../profile.php"><span>☻</span> Profile</a>
            <a href="../target-list.php"><span>◎</span> My Target List</a>
            <a class="is-active" href="../tests-preferences.php"><span>▣</span> Tests &amp;<br> Preferences</a>
            <a href="../my-jobs.php"><span>▥</span> My Jobs</a>
            <a href="../settings.php"><span>⚙</span> Settings</a>
        </aside>
    </div>
</main>

<script src="../js/personality-test-pages.js"></script>

<?php
ob_start();
require __DIR__ . '/../includes/footer.php';
$sharedFooter = ob_get_clean();
echo pt_fix_nested_paths($sharedFooter);
?>
