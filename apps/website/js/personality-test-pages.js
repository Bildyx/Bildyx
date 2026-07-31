/*
 * Generic JS for personality test pages.
 */

(function () {
    const form = document.getElementById('personalityTestForm');
    if (!form) return;

    const testKey = form.dataset.testKey || 'personality_test';
    const storageKey = `bildyx_${testKey}_answers`;
    const scoresKey = `bildyx_${testKey}_scores`;
    const API = window.BildyxAPI || null;

    const buttons = Array.from(document.querySelectorAll('.pt-answer-button'));
    const progress = document.getElementById('ptProgress');
    const navLinks = Array.from(document.querySelectorAll('.pt-question-list a'));
    const discardBtn = document.getElementById('ptDiscard');
    const total = navLinks.length || document.querySelectorAll('.pt-question').length;

    function getAnswers() {
        try {
            return JSON.parse(localStorage.getItem(storageKey) || '{}');
        } catch (_) {
            return {};
        }
    }

    function setAnswers(answers) {
        localStorage.setItem(storageKey, JSON.stringify(answers));
    }

    function refreshProgress() {
        const answers = getAnswers();
        const answered = Object.keys(answers).filter(key => answers[key]).length;

        if (progress) {
            progress.textContent = `${answered}/${total} answered`;
        }

        navLinks.forEach(link => {
            const id = link.getAttribute('href')?.replace('#question-', '');
            link.classList.toggle('is-answered', Boolean(answers[id]));
        });
    }

    function restoreAnswers() {
        const answers = getAnswers();

        buttons.forEach(button => {
            const question = button.dataset.question;
            const value = button.dataset.value;
            const selected = String(answers[question] || '') === String(value);

            button.classList.toggle('is-selected', selected);
            button.setAttribute('aria-pressed', selected ? 'true' : 'false');

            const input = form.querySelector(`input[name="q${question}"]`);
            if (input && selected) input.value = value;
        });

        refreshProgress();
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const question = button.dataset.question;
            const value = button.dataset.value;
            const answers = getAnswers();

            answers[question] = value;
            setAnswers(answers);

            buttons
                .filter(item => item.dataset.question === question)
                .forEach(item => {
                    const selected = item === button;
                    item.classList.toggle('is-selected', selected);
                    item.setAttribute('aria-pressed', selected ? 'true' : 'false');
                });

            const input = form.querySelector(`input[name="q${question}"]`);
            if (input) input.value = value;

            refreshProgress();
        });
    });

    navLinks.forEach(link => {
        link.addEventListener('click', event => {
            const target = document.querySelector(link.getAttribute('href'));
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    if (discardBtn) {
        discardBtn.addEventListener('click', async () => {
            localStorage.removeItem(storageKey);
            localStorage.removeItem(scoresKey);

            form.reset();

            buttons.forEach(button => {
                button.classList.remove('is-selected');
                button.setAttribute('aria-pressed', 'false');
            });

            refreshProgress();

            if (API) {
                try {
                    const session = await API.requireSession();
                    if (session?.profileId) {
                        const profile = await API.apiFetch('GET', `/profiles/${session.profileId}`);
                        const existingMetadata = profile?.metadata ?? {};
                        delete existingMetadata[`${testKey}Answers`];
                        delete existingMetadata[`${testKey}AnsweredAt`];

                        await API.apiFetch('PATCH', `/profiles/${session.profileId}`, {
                            metadata: existingMetadata,
                        });
                    }
                } catch (err) {
                    console.warn(`[${testKey}] Could not clear API answers:`, err.message);
                }
            }
        });
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();

        const answers = getAnswers();
        const answered = Object.keys(answers).filter(key => answers[key]).length;
        const score = Math.round((answered / total) * 100);

        localStorage.setItem(scoresKey, JSON.stringify({
            completion: score,
            answered,
            total,
            savedAt: new Date().toISOString(),
        }));

        if (API) {
            try {
                const session = await API.requireSession();

                if (session?.profileId) {
                    let existingMetadata = {};
                    try {
                        const profile = await API.apiFetch('GET', `/profiles/${session.profileId}`);
                        existingMetadata = profile?.metadata ?? {};
                    } catch (_) {}

                    await API.apiFetch('PATCH', `/profiles/${session.profileId}`, {
                        metadata: {
                            ...existingMetadata,
                            [`${testKey}Answers`]: answers,
                            [`${testKey}AnsweredAt`]: new Date().toISOString(),
                        },
                    });

                    alert(`Test updated & saved to your profile.\n${answered}/${total} questions answered.`);
                    return;
                }
            } catch (err) {
                console.error(`[${testKey}] API save error:`, err);
            }
        }

        alert(`Test updated locally.\n${answered}/${total} questions answered.`);
    });

    async function loadFromProfile() {
        if (!API) {
            restoreAnswers();
            return;
        }

        try {
            const session = await API.requireSession();

            if (!session?.profileId) {
                restoreAnswers();
                return;
            }

            const profile = await API.apiFetch('GET', `/profiles/${session.profileId}`);
            const savedAnswers = profile?.metadata?.[`${testKey}Answers`];

            if (savedAnswers) {
                setAnswers(savedAnswers);
            }

            restoreAnswers();
        } catch (err) {
            console.warn(`[${testKey}] Could not load profile answers:`, err.message);
            restoreAnswers();
        }
    }

    loadFromProfile();
})();
