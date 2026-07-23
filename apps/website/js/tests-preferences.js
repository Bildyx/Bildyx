/*
 * Tests & Preferences JS
 * New file only. It does not modify js/auth.js.
 */

(function () {
  const STORAGE_KEY = 'bildyx_big5_answers';

  const form = document.getElementById('big5Form');
  if (!form) return;

  const buttons = Array.from(document.querySelectorAll('.tp-rating-button'));
  const progress = document.getElementById('big5Progress');
  const navLinks = Array.from(document.querySelectorAll('.big5-question-list a'));
  const discardBtn = document.getElementById('big5Discard');

  const reverseItems = new Set([6, 16, 26, 36, 46, 2, 12, 22, 32, 8, 18, 28, 38, 9, 19, 10, 20, 30]);
  const dimensions = {
    Extraversion: [1, 6, 11, 16, 21, 26, 31, 36, 41, 46],
    Agreeableness: [2, 7, 12, 17, 22, 27, 32, 37, 42, 47],
    Conscientiousness: [3, 8, 13, 18, 23, 28, 33, 38, 43, 48],
    "Emotional Stability": [4, 9, 14, 19, 24, 29, 34, 39, 44, 49],
    Openness: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
  };

  function getAnswers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (_) {
      return {};
    }
  }

  function setAnswers(answers) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }

  function refreshProgress() {
    const answers = getAnswers();
    const answered = Object.keys(answers).filter(key => answers[key]).length;
    if (progress) progress.textContent = `${answered}/50 answered`;

    navLinks.forEach(link => {
      const id = link.getAttribute('href')?.replace('#question-', '');
      link.classList.toggle('is-answered', Boolean(answers[id]));
    });
  }

  function restoreAnswers() {
    const answers = getAnswers();

    buttons.forEach(button => {
      const q = button.dataset.question;
      const value = button.dataset.value;
      const selected = String(answers[q] || '') === String(value);
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');

      const input = form.querySelector(`input[name="q${q}"]`);
      if (input && selected) input.value = value;
    });

    refreshProgress();
  }

  function scoreTrait(items, answers) {
    const values = items
      .map(number => {
        const raw = Number(answers[number]);
        if (!raw) return null;
        return reverseItems.has(number) ? 6 - raw : raw;
      })
      .filter(value => value !== null);

    if (!values.length) return null;
    const total = values.reduce((sum, value) => sum + value, 0);
    return Math.round((total / (values.length * 5)) * 100);
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
    discardBtn.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      form.reset();
      buttons.forEach(button => {
        button.classList.remove('is-selected');
        button.setAttribute('aria-pressed', 'false');
      });
      refreshProgress();
    });
  }

  form.addEventListener('submit', event => {
    event.preventDefault();

    const answers = getAnswers();
    const answered = Object.keys(answers).filter(key => answers[key]).length;

    const scores = {};
    Object.entries(dimensions).forEach(([trait, items]) => {
      scores[trait] = scoreTrait(items, answers);
    });

    localStorage.setItem('bildyx_big5_scores', JSON.stringify(scores));

    const scoreText = Object.entries(scores)
      .map(([trait, value]) => `${trait}: ${value === null ? 'not enough answers' : value + '%'}`)
      .join('\n');

    alert(`Big 5 updated.\n${answered}/50 questions answered.\n\n${scoreText}`);
  });

  restoreAnswers();
})();
