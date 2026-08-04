<?php
$pageTitle = 'Personality Test: Big 5 — Bildyx';
$pageDescription = 'Big 5 personality test for Bildyx.';
$pageScript = 'js/big-5.ts';
$bodyClass = 'big5-page';
$showMainNav = false;

/*
 * Page dans /tests-preferences/.
 * On garde un CSS dédié à Big 5, mais on reprend les dimensions de tests-preferences.php :
 * - wrapper 1180px
 * - menu droit 190px
 * - gap 32px
 * - carte blanche même style
 */
function big5_fix_nested_paths(string $html): string
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
$sharedHeader = big5_fix_nested_paths($sharedHeader);

$big5Stylesheet = '<link rel="stylesheet" href="../css/big-5.css" />';
echo str_replace('</head>', "    {$big5Stylesheet}\n</head>", $sharedHeader);

$questions = [
    'I am the life of the party',
    'I feel little concern for others',
    'I am always prepared',
    'I get stressed out easily',
    'I have a rich vocabulary',
    "I don't talk a lot",
    'I am interested in people',
    'I leave my belongings around',
    'I am relaxed most of the time',
    'I have difficulty understanding abstract ideas',
    'I feel comfortable around people',
    'I insult people',
    'I pay attention to details',
    'I worry about things',
    'I have a vivid imagination',
    'I keep in the background',
    "I sympathize with others' feelings",
    'I make a mess of things',
    'I seldom feel blue',
    'I am not interested in abstract ideas',
    'I start conversations',
    "I am not interested in other people's problems",
    'I get chores done right away',
    'I am easily disturbed',
    'I have excellent ideas',
    'I have little to say',
    'I have a soft heart',
    'I often forget to put things back in their proper place',
    'I get upset easily',
    'I do not have a good imagination',
    'I talk to a lot of different people at parties',
    'I am not really interested in others',
    'I like order',
    'I change my mood a lot',
    'I am quick to understand things',
    "I don't like to draw attention to myself",
    'I take time out for others',
    'I shirk my duties',
    'I have frequent mood swings',
    'I use difficult words',
    "I don't mind being the center of attention",
    "I feel others' emotions",
    'I follow a schedule',
    'I get irritated easily',
    'I spend time reflecting on things',
    'I am quiet around strangers',
    'I make people feel at ease',
    'I am exacting in my work',
    'I often feel blue',
    'I am full of ideas'
];

$icons = ['✦', '♞', '▣', '⌁', '▫', '○', '♙'];
?>

<main class="b5-page">
    <div class="b5-shell">
        <section class="b5-card" aria-labelledby="big5-title">
            <header class="b5-header">
                <a class="b5-back" href="../tests-preferences.php" aria-label="Back to tests and preferences">‹</a>
                <div>
                    <h1 id="big5-title">Personality Test: <span>Big 5</span></h1>
                    <p>Most scientifically valid and reliable test.</p>
                </div>
            </header>

            <div class="b5-content">
                <aside class="b5-question-nav" aria-label="Questions list">
                    <h2>Questions</h2>

                    <nav class="b5-question-list">
                        <?php foreach ($questions as $index => $question): ?>
                            <?php $number = $index + 1; ?>
                            <a href="#question-<?php echo $number; ?>">
                                <strong><?php echo $number; ?>.</strong>
                                <span><?php echo htmlspecialchars($question, ENT_QUOTES, 'UTF-8'); ?></span>
                            </a>
                        <?php endforeach; ?>
                    </nav>
                </aside>

                <form class="b5-form" id="big5Form">
                    <div class="b5-scroll-area">
                        <?php foreach ($questions as $index => $question): ?>
                            <?php $number = $index + 1; ?>
                            <section class="b5-question" id="question-<?php echo $number; ?>">
                                <div class="b5-question-title">
                                    <span class="b5-question-icon" aria-hidden="true"><?php echo $icons[$index % count($icons)]; ?></span>
                                    <h2><?php echo $number . '. ' . htmlspecialchars($question, ENT_QUOTES, 'UTF-8'); ?></h2>
                                </div>

                                <div class="b5-scale" role="group" aria-label="<?php echo htmlspecialchars($question, ENT_QUOTES, 'UTF-8'); ?>">
                                    <span class="b5-scale-label">Very Inaccurate</span>

                                    <?php for ($value = 1; $value <= 5; $value++): ?>
                                        <button
                                            class="b5-rating-button"
                                            type="button"
                                            data-question="<?php echo $number; ?>"
                                            data-value="<?php echo $value; ?>"
                                            aria-pressed="false"
                                        >
                                            <?php echo $value; ?>
                                        </button>
                                    <?php endfor; ?>

                                    <span class="b5-scale-label">Very Accurate</span>
                                    <input type="hidden" name="q<?php echo $number; ?>" value="">
                                </div>
                            </section>
                        <?php endforeach; ?>
                    </div>

                    <footer class="b5-actions">
                        <p id="big5Progress">0/50 answered</p>

                        <div>
                            <button class="b5-outline-button" id="big5Discard" type="button">Discard</button>
                            <button class="b5-primary-button" type="submit">Update</button>
                        </div>
                    </footer>
                </form>
            </div>
        </section>

        <aside class="b5-side-nav" aria-label="Profile menu">
            <a href="../profile.php"><span>☻</span> Profile</a>
            <a href="../target-list.php"><span>◎</span> My Target List</a>
            <a class="is-active" href="../tests-preferences.php"><span>▣</span> Tests &amp;<br> Preferences</a>
            <a href="../my-jobs.php"><span>▥</span> My Jobs</a>
            <a href="../settings.php"><span>⚙</span> Settings</a>
        </aside>
    </div>
</main>

<?php
ob_start();
require __DIR__ . '/../includes/footer.php';
$sharedFooter = ob_get_clean();
echo big5_fix_nested_paths($sharedFooter);
?>
