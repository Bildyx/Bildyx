/*
 * Basic Information — Tests & Preferences
 *
 * Ce script gère :
 *  1. L'interaction UI (sélection radio/checkbox, chips, etc.)
 *  2. La sauvegarde des réponses dans le profil utilisateur via
 *     PATCH /api/profiles/{profileId} (champ metadata.basicInformation)
 *
 * Fallback : si la session ou l'API n'est pas disponible,
 * les réponses sont sauvegardées dans localStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#basicInfoForm');
    const API = window.BildyxAPI || null;

    // ─── Option cards (radio / checkbox) ─────────────────────
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

    // ─── Chips (ajouter avec Entrée) ──────────────────────────
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

    // ─── Supprimer un chip ────────────────────────────────────
    document.addEventListener('click', (event) => {
        const button = event.target.closest('.bi-chip-list button');
        if (!button) return;
        button.closest('span')?.remove();
    });

    if (!form) return;

    // ─── Reset ────────────────────────────────────────────────
    form.addEventListener('reset', () => {
        setTimeout(() => {
            document.querySelectorAll('.bi-option').forEach((option) => {
                const control = option.querySelector('input[type="radio"], input[type="checkbox"]');
                option.classList.toggle('is-selected', Boolean(control?.checked));
            });
        }, 0);
    });

    // ─── Lecture des données du formulaire ────────────────────
    function collectFormData() {
        const data = {};

        // Champs texte simples
        ['firstJob', 'secondJob', 'country'].forEach(name => {
            const el = form.querySelector(`[name="${name}"]`);
            if (el) data[name] = el.value.trim();
        });

        // Chips
        ['cities', 'languages', 'countries', 'blockedCompanies'].forEach(id => {
            const container = document.getElementById(id);
            if (!container) return;
            data[id] = Array.from(container.querySelectorAll('span'))
                .map(span => span.childNodes[0]?.textContent?.trim())
                .filter(Boolean);
        });

        // Radios
        ['sectorChoice', 'companyRank', 'origin', 'companyType', 'jobPreference', 'startupInterest'].forEach(name => {
            const checked = form.querySelector(`[name="${name}"]:checked`);
            if (checked) data[name] = checked.value || checked.closest('.bi-option')?.textContent?.trim();
        });

        // Checkboxes (multi-select) — growth, company size
        const growthChecks = Array.from(form.querySelectorAll('[name="growth"]:checked'))
            .map(cb => cb.closest('.bi-option')?.textContent?.trim()).filter(Boolean);
        if (growthChecks.length) data.growth = growthChecks;

        // Company size checkboxes (sans name explicite dans le HTML)
        const sizeCheckboxes = form.querySelectorAll('#q10 input[type="checkbox"]');
        data.companySizes = Array.from(sizeCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.closest('.bi-option')?.textContent?.trim())
            .filter(Boolean);

        // Salaire
        const salaryInputs = form.querySelectorAll('#q14 input[type="number"]');
        if (salaryInputs[0]) data.salaryBase = Number(salaryInputs[0].value) || 0;
        if (salaryInputs[1]) data.salaryBonus = Number(salaryInputs[1].value) || 0;

        return data;
    }

    // ─── Soumission du formulaire ─────────────────────────────
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitButton = form.querySelector('.bi-button--primary');
        if (!submitButton) return;

        const originalText = submitButton.textContent;
        submitButton.textContent = '...';
        submitButton.disabled = true;

        const basicInformation = collectFormData();

        // Toujours sauvegarder en localStorage comme fallback
        localStorage.setItem('bildyx_basic_information', JSON.stringify(basicInformation));

        // Sauvegarde via API si disponible
        if (API) {
            const session = API.getSession();
            const profileId = session?.profileId;

            if (profileId) {
                try {
                    // On charge d'abord le profil existant pour merger les metadata
                    let existingMetadata = {};
                    try {
                        const profile = await API.apiFetch('GET', `/profiles/${profileId}`);
                        existingMetadata = profile?.metadata ?? {};
                    } catch (_) {}

                    await API.apiFetch('PATCH', `/profiles/${profileId}`, {
                        metadata: {
                            ...existingMetadata,
                            basicInformation,
                        },
                    });

                    submitButton.textContent = 'Saved ✓';
                    setTimeout(() => {
                        submitButton.textContent = originalText;
                        submitButton.disabled = false;
                    }, 1500);
                    return;
                } catch (err) {
                    console.error('[basic-information.js] API save error:', err);
                }
            } else {
                // Essayer de récupérer la session depuis l'API
                try {
                    const freshSession = await API.requireSession();
                    if (freshSession?.profileId) {
                        // Re-tenter la sauvegarde
                        form.dispatchEvent(new Event('submit', { bubbles: true }));
                        return;
                    }
                } catch (_) {}
            }
        }

        // Fallback : simulation de succès local
        submitButton.textContent = 'Saved (local)';
        window.setTimeout(() => {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }, 1100);
    });

    // ─── Restaurer les données locales au chargement ──────────
    function restoreLocalData() {
        try {
            const saved = localStorage.getItem('bildyx_basic_information');
            if (!saved) return;
            const data = JSON.parse(saved);

            // Restaurer les champs texte simples
            ['firstJob', 'secondJob', 'country'].forEach(name => {
                const el = form.querySelector(`[name="${name}"]`);
                if (el && data[name]) el.value = data[name];
            });

            // Note : on ne restaure pas les chips ni les checkboxes automatiquement
            // pour éviter de dupliquer les valeurs déjà pré-remplies en PHP.
        } catch (_) {}
    }

    // ─── Charger les données depuis le profil API ─────────────
    async function loadFromProfile() {
        if (!API) return;

        try {
            const session = await API.requireSession();
            if (!session?.profileId) return;

            const profile = await API.apiFetch('GET', `/profiles/${session.profileId}`);
            const bi = profile?.metadata?.basicInformation;
            if (!bi) return;

            // Restaurer les champs texte
            ['firstJob', 'secondJob', 'country'].forEach(name => {
                const el = form.querySelector(`[name="${name}"]`);
                if (el && bi[name]) el.value = bi[name];
            });

            // Restaurer le salaire
            const salaryInputs = form.querySelectorAll('#q14 input[type="number"]');
            if (bi.salaryBase && salaryInputs[0]) salaryInputs[0].value = bi.salaryBase;
            if (bi.salaryBonus && salaryInputs[1]) salaryInputs[1].value = bi.salaryBonus;

        } catch (err) {
            console.warn('[basic-information.js] Could not load profile data:', err.message);
            // Fallback sur localStorage
            restoreLocalData();
        }
    }

    loadFromProfile();
});
