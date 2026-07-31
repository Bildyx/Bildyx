<?php
$pageTitle = 'Big 5 Test — Bildyx';
$pageDescription = 'Big 5 personality test in Bildyx Tests & Preferences.';
$pageScript = 'js/tests-preferences.ts';
$bodyClass = 'tests-preferences-page big5-page';
$showMainNav = false;

$questions = [
    "I am the life of the party",
    "I feel little concern for others",
    "I am always prepared",
    "I get stressed out easily",
    "I have a rich vocabulary",
    "I don't talk a lot",
    "I am interested in people",
    "I leave my belongings around",
    "I am relaxed most of the time",
    "I have difficulty understanding abstract ideas",
    "I feel comfortable around people",
    "I insult people",
    "I pay attention to details",
    "I worry about things",
    "I have a vivid imagination",
    "I keep in the background",
    "I sympathize with others' feelings",
    "I make a mess of things",
    "I seldom feel blue",
    "I am not interested in abstract ideas",
    "I start conversations",
    "I am not interested in other people's problems",
    "I get chores done right away",
    "I am easily disturbed",
    "I have excellent ideas",
    "I have little to say",
    "I have a soft heart",
    "I often forget to put things back in their proper place",
    "I get upset easily",
    "I do not have a good imagination",
    "I talk to a lot of different people at parties",
    "I am not really interested in others",
    "I like order",
    "I change my mood a lot",
    "I am quick to understand things",
    "I don't like to draw attention to myself",
    "I take time out for others",
    "I shirk my duties",
    "I have frequent mood swings",
    "I use difficult words",
    "I don't mind being the center of attention",
    "I feel others' emotions",
    "I follow a schedule",
    "I get irritated easily",
    "I spend time reflecting on things",
    "I am quiet around strangers",
    "I make people feel at ease",
    "I am exacting in my work",
    "I often feel blue",
    "I am full of ideas",
];

$icons = ['✦','♘','▣','⌁','□','○','♙','◈','☻','♧','♙','▱','◉','△','✧','♙','♡','▥','☼','▤','▱','♙','☑','ϟ','☆','⌁','❤','▭','☹','▱','✦','♙','☷','⌁','♙','◌','◷','⊗','≋','▤','◉','☻','⚙','◑','◌','◁','♧','◎','☔','↗'];

ob_start();
require __DIR__ . '/../includes/header.php';
$sharedHeader = ob_get_clean();

/*
 * IMPORTANT : cette page est dans /tests-preferences/.
 * On ajoute donc <base href="../"> juste après <head>, AVANT les CSS/scripts du header partagé.
 * Comme ça, le header, le footer, le logo, les CSS globaux et les liens restent connectés au site entier.
 */
$headAdditions = '    <base href="../">' . "\n" .
                 '    <link rel="stylesheet" href="css/tests-preferences.css" />' . "\n";

if (strpos($sharedHeader, '<head>') !== false) {
    echo str_replace('<head>', "<head>\n" . $headAdditions, $sharedHeader);
} else {
    echo str_replace('</head>', $headAdditions . '</head>', $sharedHeader);
}
?>

<main class="tp-page">
    <section class="tp-card tp-big5-card" aria-labelledby="big5-title">
        <header class="big5-header">
            <a class="big5-back" href="tests-preferences.php" aria-label="Back to tests and preferences">‹</a>
            <div>
                <h1 id="big5-title">Personality Test: <span>Big 5</span></h1>
                <p>Most scientifically valid and reliable test.</p>
            </div>
        </header>

        <div class="big5-content">
            <aside class="big5-question-nav" aria-label="Questions">
                <h2>Questions</h2>
                <div class="big5-question-list">
                    <?php foreach ($questions as $index => $question): ?>
                        <a href="#question-<?php echo $index + 1; ?>">
                            <strong><?php echo $index + 1; ?>.</strong>
                            <span><?php echo htmlspecialchars($question); ?></span>
                        </a>
                    <?php endforeach; ?>
                </div>
            </aside>

            <form class="big5-form" id="big5Form">
                <div class="big5-scroll-area">
                    <?php foreach ($questions as $index => $question): ?>
                        <?php $number = $index + 1; ?>
                        <section class="big5-question" id="question-<?php echo $number; ?>" data-question="<?php echo $number; ?>">
                            <div class="big5-question-title">
                                <span class="big5-question-icon" aria-hidden="true"><?php echo $icons[$index]; ?></span>
                                <h2><?php echo $number; ?>. <?php echo htmlspecialchars($question); ?></h2>
                            </div>

                            <div class="big5-scale" role="radiogroup" aria-label="Answer for question <?php echo $number; ?>">
                                <span class="scale-label">Very Inaccurate</span>
                                <?php for ($rating = 1; $rating <= 5; $rating++): ?>
                                    <button
                                        class="tp-rating-button"
                                        type="button"
                                        data-question="<?php echo $number; ?>"
                                        data-value="<?php echo $rating; ?>"
                                        aria-pressed="false">
                                        <?php echo $rating; ?>
                                    </button>
                                <?php endfor; ?>
                                <span class="scale-label">Very Accurate</span>
                                <input type="hidden" name="q<?php echo $number; ?>" value="">
                            </div>
                        </section>
                    <?php endforeach; ?>
                </div>

                <footer class="big5-actions">
                    <p id="big5Progress">0/50 answered</p>
                    <div>
                        <button class="tp-outline-button" id="big5Discard" type="button">Discard</button>
                        <button class="tp-primary-button" type="submit">Update</button>
                    </div>
                </footer>
            </form>
        </div>
    </section>
</main>

<?php require __DIR__ . '/../includes/footer.php'; ?>
