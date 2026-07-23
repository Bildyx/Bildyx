document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#basicInfoForm');

    document.querySelectorAll('.bi-option input[type="radio"], .bi-option input[type="checkbox"]').forEach((input) => {
        input.addEventListener('change', () => {
            if (input.type === 'radio') {
                document.querySelectorAll(`input[name="${CSS.escape(input.name)}"]`).forEach((radio) => {
                    radio.closest('.bi-option')?.classList.remove('is-selected');
                });
            }

            input.closest('.bi-option')?.classList.toggle('is-selected', input.checked);
        });
    });

    document.querySelectorAll('.bi-add-input').forEach((input) => {
        input.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();

            const value = input.value.trim();
            const targetId = input.dataset.chipTarget;
            const target = targetId ? document.getElementById(targetId) : null;

            if (!value || !target) return;

            const chip = document.createElement('span');
            chip.textContent = `${value} `;

            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.setAttribute('aria-label', `Remove ${value}`);
            removeButton.textContent = '×';

            chip.appendChild(removeButton);
            target.appendChild(chip);
            input.value = '';
        });
    });

    document.addEventListener('click', (event) => {
        const button = event.target.closest('.bi-chip-list button');
        if (!button) return;
        button.closest('span')?.remove();
    });

    if (!form) return;

    form.addEventListener('reset', () => {
        setTimeout(() => {
            document.querySelectorAll('.bi-option').forEach((option) => {
                const control = option.querySelector('input[type="radio"], input[type="checkbox"]');
                option.classList.toggle('is-selected', Boolean(control?.checked));
            });
        }, 0);
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const submitButton = form.querySelector('.bi-button--primary');
        if (!submitButton) return;

        const originalText = submitButton.textContent;
        submitButton.textContent = 'Updated';
        submitButton.disabled = true;

        window.setTimeout(() => {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }, 1100);
    });
});
