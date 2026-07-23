/* =========================================================
   Bildyx — Profile builder interactions
   Fichier dédié à profile.php uniquement.
   Tous les boutons visibles de la page sont connectés côté front.
   ========================================================= */

(() => {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const panels = ['profilePanel', 'testsPanel', 'jobsPanel', 'settingsPanel'];

    function showToast(message) {
        let toast = $('.profile-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'profile-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('is-visible');
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => {
            toast.classList.remove('is-visible');
        }, 2400);
    }

    function showPanel(panelId) {
        panels.forEach(id => {
            const panel = document.getElementById(id);
            if (panel) panel.hidden = id !== panelId;
        });

        $$('.side-nav-button').forEach(button => {
            button.classList.toggle('is-active', button.dataset.panel === panelId);
        });
    }

    function countWords(value) {
        return String(value || '').trim().split(/\s+/).filter(Boolean).length;
    }

    function updateHeadlineCounter() {
        const input = $('.headline-input');
        const counter = $('#headlineCounter');
        if (!input || !counter) return;
        counter.textContent = input.value.length;
        const help = input.nextElementSibling;
        if (help) {
            help.innerHTML = `<span id="headlineCounter">${input.value.length}</span>/100 chars · ${countWords(input.value)}/12 words`;
        }
    }

    function updateWordCounter(textarea) {
        const max = Number(textarea.getAttribute('maxlength')) || 600;
        const maxWords = max >= 600 ? 60 : 50;
        const counter = textarea.nextElementSibling;
        if (!counter || !counter.classList.contains('word-counter')) return;
        counter.textContent = `${countWords(textarea.value)}/${maxWords} words`;
    }

    function setAreaEditable(areaName, editable) {
        const area = document.querySelector(`[data-edit-area="${areaName}"]`);
        if (!area) return;

        $$('[data-editable]', area).forEach(element => {
            element.setAttribute('contenteditable', editable ? 'true' : 'false');
        });
    }

    function toggleEdit(button) {
        const target = button.dataset.editTarget;
        const isEditing = !button.classList.contains('is-editing');
        button.classList.toggle('is-editing', isEditing);
        button.textContent = isEditing ? '✓' : '✎';
        setAreaEditable(target, isEditing);
        showToast(isEditing ? 'Edition activée.' : 'Modification enregistrée localement.');
    }

    function addChip(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const limit = Number(container.dataset.chipLimit || 99);
        const current = $$('.chip', container).length;

        if (current >= limit) {
            showToast(`Maximum ${limit} éléments.`);
            return;
        }

        const label = window.prompt('Nom du nouvel élément :');
        if (!label || !label.trim()) return;

        const chip = document.createElement('span');
        chip.className = containerId === 'languageChips' ? 'chip is-filled' : 'chip is-outline';
        chip.innerHTML = `${label.trim()} <button type="button" aria-label="Remove ${label.trim()}">×</button>`;

        const addButton = container.querySelector('.chip-add');
        container.insertBefore(chip, addButton || null);
        showToast('Élément ajouté.');
    }

    function removeChip(button) {
        const chip = button.closest('.chip');
        if (!chip) return;
        chip.remove();
        showToast('Élément supprimé.');
    }

    function updateSelectableCounter(container) {
        const activeCount = $$('.is-selectable.is-active', container).length;
        const section = container.closest('.entry-skills');
        const small = section?.querySelector('small');
        if (small) small.textContent = `${activeCount}/5 selected`;
    }

    function toggleSelectableSkill(button) {
        const container = button.closest('[data-selectable-skills]');
        const activeCount = $$('.is-selectable.is-active', container).length;
        const willActivate = !button.classList.contains('is-active');

        if (willActivate && activeCount >= 5) {
            showToast('Maximum 5 skills sélectionnés.');
            return;
        }

        button.classList.toggle('is-active');
        updateSelectableCounter(container);
    }

    function collapseEntry(button) {
        const entry = button.closest('.entry-card');
        const body = $('.entry-body', entry);
        if (!body) return;
        body.classList.toggle('is-collapsed');
        button.textContent = body.classList.contains('is-collapsed') ? '▾' : '＋';
    }

    function removeEntry(button) {
        const entry = button.closest('.entry-card');
        if (!entry) return;

        const type = entry.dataset.entry;
        const list = entry.parentElement;
        const sameEntries = $$(`[data-entry="${type}"]`, list);

        if (sameEntries.length <= 1 && type !== 'certification') {
            showToast('Garde au moins une section.');
            return;
        }

        entry.remove();
        renumberExperiences();
        showToast('Section supprimée.');
    }

    function renumberExperiences() {
        $$('#experienceList [data-entry="experience"]').forEach((entry, index) => {
            const title = entry.querySelector('.entry-toolbar h3');
            if (title) title.textContent = `Work Experience ${index + 1}`;
        });
    }

    function makeExperience(index) {
        const article = document.createElement('article');
        article.className = 'entry-card';
        article.dataset.entry = 'experience';
        article.innerHTML = `
            <div class="entry-toolbar">
                <h3>Work Experience ${index}</h3>
                <div>
                    <button class="entry-tool js-collapse" type="button" aria-label="Collapse or expand work experience">＋</button>
                    <button class="entry-tool js-remove-entry" type="button" aria-label="Remove work experience">×</button>
                </div>
            </div>
            <div class="entry-body">
                <div class="entry-header-line">
                    <div class="round-place"></div>
                    <div class="entry-controls">
                        <div class="date-row">
                            <select aria-label="Start date"><option>Start date</option><option>Jan 2025</option><option>Jan 2024</option></select>
                            <span>–</span>
                            <select aria-label="End date"><option>End date</option><option>Jul 2025</option><option>May 2024</option></select>
                        </div>
                        <p><span contenteditable="true">Add location...</span> · <span contenteditable="true">Add company...</span></p>
                        <button class="inline-link" type="button">Add brand (optional)...</button>
                        <button class="inline-link" type="button">Add client/industry served (optional)...</button>
                        <a href="#">Add role...</a>
                        <label>Type:<select><option>Optional</option><option>Internship</option><option>Full-time</option><option>Freelance</option></select></label>
                        <label>Level:<select><option>Optional</option><option>Junior</option><option>Mid</option><option>Senior</option></select></label>
                    </div>
                </div>
                <textarea maxlength="600" data-word-counter placeholder="Add work summary up to 60 words..."></textarea>
                <p class="word-counter">0/60 words</p>
                <div class="backend-grid backend-grid--three">
                    <section><h4>Company</h4><div class="backend-slot" data-card-slot="company-card">Company card</div></section>
                    <section><h4>Product/Service</h4><div class="backend-slot" data-card-slot="product-card">Product/Service card</div></section>
                    <section><h4>Role</h4><div class="backend-slot" data-card-slot="role-card">Role card</div></section>
                </div>
                <div class="backend-grid backend-grid--two">
                    <section><h4>Brands</h4><button class="inline-link" type="button">Add brand (optional)...</button><div class="backend-slot backend-slot--small" data-card-slot="brand-card">Brand card</div></section>
                    <section><h4>Client/Industry</h4><button class="inline-link" type="button">Add client/industry...</button><div class="backend-slot backend-slot--small" data-card-slot="client-card">Client/Industry card</div></section>
                </div>
                <div class="entry-skills">
                    <p>Skills related to this role <span>(select up to 5)</span></p>
                    <div class="chip-row" data-selectable-skills>
                        <button class="chip is-outline is-selectable" type="button">AI</button>
                        <button class="chip is-outline is-selectable" type="button">customer_service</button>
                        <button class="chip is-outline is-selectable" type="button">Programming</button>
                    </div>
                    <small>0/5 selected</small>
                </div>
            </div>
        `;
        return article;
    }

    function addExperience() {
        const list = $('#experienceList');
        if (!list) return;
        const next = $$('#experienceList [data-entry="experience"]').length + 1;
        list.appendChild(makeExperience(next));
        showToast('Work Experience ajouté.');
    }

    function makeEducation(index) {
        const article = document.createElement('article');
        article.className = 'entry-card';
        article.dataset.entry = 'education';
        article.innerHTML = `
            <div class="entry-toolbar">
                <h3>Education ${index}</h3>
                <div>
                    <button class="entry-tool js-collapse" type="button" aria-label="Collapse or expand education">＋</button>
                    <button class="entry-tool js-remove-entry" type="button" aria-label="Remove education">×</button>
                </div>
            </div>
            <div class="entry-body">
                <div class="education-form-line">
                    <div class="entry-icon-soft">◈</div>
                    <div class="education-fields">
                        <p><strong contenteditable="true">Add university...</strong> <button class="inline-link" type="button">Add school/faculty/department (optional)...</button></p>
                        <p><strong contenteditable="true">Select type of degree...</strong> <span contenteditable="true">Add degree name...</span></p>
                        <label>Mode:<select><option>Select mode...</option><option>Full time</option><option>Part time</option><option>Online</option></select></label>
                        <label><input type="checkbox" /> Honors</label>
                        <label><input type="checkbox" /> Double Degree</label>
                        <label><input type="checkbox" /> Double Major</label>
                        <div class="chip-row education-tags">
                            <button class="inline-link" type="button">+ Add language...</button>
                            <button class="inline-link" type="button">+ Add major...</button>
                            <button class="inline-link" type="button">+ Add minor...</button>
                        </div>
                        <div class="date-row date-row--right">
                            <select><option>Start date</option><option>Jan 2025</option></select><span>–</span><select><option>End date</option><option>Mar 2025</option></select>
                        </div>
                    </div>
                </div>
                <textarea maxlength="500" data-word-counter placeholder="Add summary up to 50 words..."></textarea>
                <p class="word-counter">0/50 words</p>
                <div class="backend-grid backend-grid--two">
                    <div class="backend-slot backend-slot--education" data-card-slot="university-card">University card</div>
                    <div class="backend-slot backend-slot--education" data-card-slot="degree-card">Degree card</div>
                </div>
            </div>
        `;
        return article;
    }

    function addDegree() {
        const list = $('#educationList');
        if (!list) return;
        const next = $$('#educationList [data-entry="education"]').length + 1;
        list.appendChild(makeEducation(next));
        showToast('Diplôme ajouté.');
    }

    function makeCertification(index) {
        const article = document.createElement('article');
        article.className = 'entry-card cert-card';
        article.dataset.entry = 'certification';
        article.innerHTML = `
            <div class="entry-toolbar">
                <h3 contenteditable="true">Certification ${index}</h3>
                <button class="entry-tool js-remove-entry" type="button" aria-label="Remove certification">×</button>
            </div>
            <div class="entry-body">
                <p>Issued by: <span contenteditable="true">Add issuer...</span></p>
                <div class="date-row"><select><option>Issued date</option><option>Jan 2026</option></select><span>–</span><select><option>Expiry date</option><option>Select date</option></select></div>
                <div class="backend-slot backend-slot--certification" data-card-slot="certification-card">Certification card</div>
            </div>
        `;
        return article;
    }

    function addCertification() {
        const list = $('#certificationList');
        if (!list) return;
        const next = $$('#certificationList [data-entry="certification"]').length + 1;
        list.appendChild(makeCertification(next));
        showToast('Certification ajoutée.');
    }

    function fillBackendSlot(slot) {
        const label = window.prompt('Nom de la future carte backend :', slot.textContent.trim());
        if (!label || !label.trim()) return;
        slot.textContent = label.trim();
        slot.classList.add('is-filled');
        showToast('Placeholder renommé.');
    }

    function saveProfile() {
        const payload = {
            savedAt: new Date().toISOString(),
            name: $('[data-editable="name"]')?.textContent.trim(),
            headline: $('.headline-input')?.value.trim(),
            summary: $('[data-editable="career-summary"]')?.textContent.trim(),
            role: $('[data-editable="role-title"]')?.textContent.trim(),
            languages: $$('#languageChips .chip').map(chip => chip.childNodes[0].textContent.trim()),
            skills: $$('#skillChips .chip').map(chip => chip.childNodes[0].textContent.trim()),
            experiences: $$('#experienceList [data-entry="experience"]').length,
            education: $$('#educationList [data-entry="education"]').length,
            certifications: $$('#certificationList [data-entry="certification"]').length
        };
        localStorage.setItem('bildyx_profile_draft', JSON.stringify(payload));
        showToast('MicroResume sauvegardé en local.');
    }

    document.addEventListener('click', event => {
        const button = event.target.closest('button');

        if (button?.classList.contains('side-nav-button')) {
            showPanel(button.dataset.panel);
            return;
        }

        if (button?.classList.contains('js-back-profile')) {
            showPanel('profilePanel');
            return;
        }

        if (button?.classList.contains('js-edit')) {
            toggleEdit(button);
            return;
        }

        if (button?.dataset.addChip) {
            addChip(button.dataset.addChip);
            return;
        }

        if (button?.closest('.chip') && button.textContent.trim() === '×') {
            removeChip(button);
            return;
        }

        if (button?.classList.contains('is-selectable')) {
            toggleSelectableSkill(button);
            return;
        }

        if (button?.classList.contains('js-collapse')) {
            collapseEntry(button);
            return;
        }

        if (button?.classList.contains('js-remove-entry')) {
            removeEntry(button);
            return;
        }

        if (button?.id === 'addExperienceTop' || button?.id === 'addExperienceBottom') {
            addExperience();
            return;
        }

        if (button?.id === 'addDegreeTop' || button?.id === 'addDegreeBottom') {
            addDegree();
            return;
        }

        if (button?.id === 'addCertificationTop' || button?.id === 'addCertificationBottom') {
            addCertification();
            return;
        }

        if (button?.id === 'saveProfile') {
            saveProfile();
            return;
        }

        if (button?.id === 'avatarButton') {
            const initials = window.prompt('Initiales à afficher dans le rond avatar :', 'JT');
            if (initials && initials.trim()) {
                $('#profileAvatar').textContent = initials.trim().slice(0, 3).toUpperCase();
                showToast('Avatar placeholder modifié.');
            }
            return;
        }

        if (button?.classList.contains('inline-link')) {
            const value = window.prompt('Texte à ajouter :');
            if (value && value.trim()) {
                button.textContent = value.trim();
                button.style.fontStyle = 'normal';
                button.style.fontWeight = '700';
                showToast('Champ mis à jour.');
            }
        }
    });

    document.addEventListener('click', event => {
        const slot = event.target.closest('.backend-slot');
        if (slot) fillBackendSlot(slot);
    });

    document.addEventListener('input', event => {
        if (event.target.matches('.headline-input')) {
            updateHeadlineCounter();
        }
        if (event.target.matches('[data-word-counter]')) {
            updateWordCounter(event.target);
        }
    });

    // Initialisation
    updateHeadlineCounter();
    $$('[data-word-counter]').forEach(updateWordCounter);
    showPanel('profilePanel');
})();
