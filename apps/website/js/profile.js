/* =========================================================
   Bildyx — Profile builder interactions
   Fichier dédié à profile.php uniquement.
   ========================================================= */

(() => {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const API = window.BildyxAPI || null;
    const panels = ['profilePanel', 'testsPanel', 'jobsPanel', 'settingsPanel'];

    let currentUser = null;
    let currentProfile = null;
    
    // Suivi des éléments supprimés localement pour envoi API lors de la sauvegarde
    const deletedEducations = [];
    const deletedCertifications = [];

    // ─── Toast ────────────────────────────────────────────────
    function showToast(message, type = 'default') {
        let toast = $('.profile-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'profile-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.className = `profile-toast ${type === 'error' ? 'is-error' : ''}`;
        toast.classList.add('is-visible');
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => {
            toast.classList.remove('is-visible');
        }, 2400);
    }

    // ─── Management des Panneaux ─────────────────────────────
    function showPanel(panelId) {
        panels.forEach(id => {
            const panel = document.getElementById(id);
            if (panel) panel.hidden = id !== panelId;
        });

        $$('.side-nav-button').forEach(button => {
            button.classList.toggle('is-active', button.dataset.panel === panelId);
        });
    }

    // ─── Word / char counters ─────────────────────────────────
    function countWords(value) {
        return String(value || '').trim().split(/\s+/).filter(Boolean).length;
    }

    function updateWordCounter(textarea) {
        const max = Number(textarea.getAttribute('maxlength')) || 600;
        const maxWords = max >= 600 ? 60 : 50;
        const wordsCount = countWords(textarea.value);
        const counter = textarea.nextElementSibling;
        if (!counter || !counter.classList.contains('word-counter')) return;
        counter.textContent = `${wordsCount}/${maxWords} words`;
        if (wordsCount > maxWords) {
            textarea.classList.add('is-overflow');
            counter.classList.add('is-overflow');
        } else {
            textarea.classList.remove('is-overflow');
            counter.classList.remove('is-overflow');
        }
    }

    // ─── Édition de zone ──────────────────────────────────────
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
        showToast(isEditing ? 'Editing enabled.' : 'Changes saved locally.');
    }

    // ─── Auto-save ─────────────────────────────────────────────
    let autosaveTimer = null;
    function scheduleAutosave() {
        clearTimeout(autosaveTimer);
        autosaveTimer = window.setTimeout(() => {
            if (API && currentProfile?.id) {
                saveProfile();
            }
        }, 1200);
    }

    // ─── Language Modal ─────────────────────────────────────────
    // Formate une clé enum en label lisible : CHINESE_MANDARIN → Chinese (Mandarin)
    function formatLanguageLabel(key) {
        const SPECIAL = {
            'CHINESE_MANDARIN': 'Chinese (Mandarin)',
            'CHINESE_CANTONESE': 'Chinese (Cantonese)',
            'HAITIAN_CREOLE': 'Haitian Creole',
            'AMBONESE_MALAY': 'Ambonese Malay',
            'BAJAN_CREOLE': 'Bajan Creole',
            'GUYANESE_CREOLE': 'Guyanese Creole',
            'SCOTTISH_GAELIC': 'Scottish Gaelic',
            'SEYCHELLOIS_CREOLE': 'Seychellois Creole',
        };
        if (SPECIAL[key]) return SPECIAL[key];
        return key.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
    }

    // Chargé une seule fois depuis l'API (source unique = LanguageSchema dans enums.ts)
    let _languagesCache = null;
    async function getLanguages() {
        if (_languagesCache) return _languagesCache;
        try {
            const apiBase = (API?.baseUrl || 'http://localhost:3000').replace(/\/$/, '');
            const res = await fetch(`${apiBase}/enums/languages`);
            const keys = await res.json();
            _languagesCache = keys.map(formatLanguageLabel);
        } catch (e) {
            console.error('Failed to load languages:', e);
            _languagesCache = [];
        }
        return _languagesCache;
    }


    async function openLanguageModal(onConfirm) {
        const languages = await getLanguages();

        let overlay = document.getElementById('langModalOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'langModalOverlay';
            overlay.className = 'lang-modal-overlay';
            overlay.innerHTML = `
                <div class="lang-modal" role="dialog" aria-modal="true" aria-labelledby="langModalTitle">
                    <h3 id="langModalTitle">Add a Language</h3>
                    <label for="langSelect">Language</label>
                    <select id="langSelect">
                        <option value="">— Select a language —</option>
                    </select>
                    <label>Level</label>
                    <div class="lang-level-grid">
                        <button type="button" class="lang-level-btn" data-level="Native">Native</button>
                        <button type="button" class="lang-level-btn is-active" data-level="Fluent">Fluent</button>
                        <button type="button" class="lang-level-btn" data-level="Intermediate">Intermediate</button>
                    </div>
                    <div class="lang-modal-actions">
                        <button type="button" class="lang-modal-cancel" id="langModalCancel">Cancel</button>
                        <button type="button" class="lang-modal-confirm" id="langModalConfirm">Add Language</button>
                    </div>
                </div>`;
            document.body.appendChild(overlay);

            // Level selection
            overlay.querySelectorAll('.lang-level-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    overlay.querySelectorAll('.lang-level-btn').forEach(b => b.classList.remove('is-active'));
                    btn.classList.add('is-active');
                });
            });

            // Cancel
            overlay.querySelector('#langModalCancel').addEventListener('click', () => closeLangModal());
            overlay.addEventListener('click', e => { if (e.target === overlay) closeLangModal(); });
        }

        // Populate select with fetched languages
        const select = overlay.querySelector('#langSelect');
        select.innerHTML = '<option value="">— Select a language —</option>' +
            languages.map(l => `<option value="${l}">${l}</option>`).join('');

        // Reset
        select.value = '';
        overlay.querySelectorAll('.lang-level-btn').forEach(b => b.classList.remove('is-active'));
        overlay.querySelector('[data-level="Fluent"]').classList.add('is-active');

        // Confirm handler
        const confirmBtn = overlay.querySelector('#langModalConfirm');
        const newConfirm = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
        newConfirm.addEventListener('click', () => {
            const lang = overlay.querySelector('#langSelect').value;
            if (!lang) { showToast('Please select a language.', 'error'); return; }
            const level = overlay.querySelector('.lang-level-btn.is-active')?.dataset.level || 'Fluent';
            closeLangModal();
            onConfirm(lang, level);
        });

        requestAnimationFrame(() => overlay.classList.add('is-open'));
    }

    function closeLangModal() {
        const overlay = document.getElementById('langModalOverlay');
        if (overlay) {
            overlay.classList.remove('is-open');
        }
    }

    // ─── Chips ────────────────────────────────────────────────
    function addChip(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const limit = Number(container.dataset.chipLimit || 99);
        const current = $$('.chip', container).length;

        if (current >= limit) {
            showToast(`Maximum ${limit} items.`);
            return;
        }

        if (containerId === 'languageChips') {
            openLanguageModal((lang, level) => {
                let levelClass = '', suffix = '';
                if (level === 'Native')       { levelClass = 'is-native';       suffix = ' (Native)'; }
                else if (level === 'Fluent')  { levelClass = 'is-fluent';       suffix = ' (Fluent)'; }
                else                          { levelClass = 'is-intermediate';  suffix = ' (Intermediate)'; }
                const label = lang + suffix;
                const chip = document.createElement('span');
                chip.className = `chip is-filled ${levelClass}`;
                chip.innerHTML = `${label} <button type="button" aria-label="Remove ${label}">×</button>`;
                container.appendChild(chip);
                showToast('Language added.');
                updateProfileMetaSummary();
                scheduleAutosave();
            });
        } else {
            const val = window.prompt('Name of the new item:');
            if (!val || !val.trim()) return;
            const label = val.trim();
            const chip = document.createElement('span');
            chip.className = 'chip is-outline';
            chip.innerHTML = `${label} <button type="button" aria-label="Remove ${label}">×</button>`;
            container.appendChild(chip);
            showToast('Item added.');
            updateProfileMetaSummary();
            scheduleAutosave();
        }
    }

    function removeChip(button) {
        const chip = button.closest('.chip');
        if (chip) chip.remove();
        showToast('Item removed.');
        scheduleAutosave();
    }


    // ─── Selectable Skills ────────────────────────────────────
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
            showToast('Maximum 5 skills selected.');
            return;
        }

        button.classList.toggle('is-active');
        updateSelectableCounter(container);
    }

    // ─── Helper : remplit un champ [data-field] ───────────────
    function setField(fieldName, value) {
        const el = document.querySelector(`[data-field="${fieldName}"]`);
        if (!el) return;
        el.textContent = value || '';
    }

    // ─── Reference Data Lookups and Creation on the Fly ───────
    async function resolveOrCreateUniversity(name) {
        if (!name || name.trim() === '') return null;
        try {
            const list = await API.apiFetch('GET', '/universities', null, { name });
            const found = list.find(u => u.name.toLowerCase() === name.trim().toLowerCase());
            if (found) return found.id;
        } catch (_) {}
        try {
            const res = await API.apiFetch('POST', '/universities', {
                name: name.trim(),
                serial_number: 'UNI-' + Math.random().toString(36).substr(2, 9).toUpperCase()
            });
            return res.id;
        } catch (err) {
            console.error('Failed to create university:', err);
            return null;
        }
    }

    async function resolveOrCreateDegree(name) {
        if (!name || name.trim() === '') return null;
        try {
            const list = await API.apiFetch('GET', '/degrees', null, { name });
            const found = list.find(d => d.name.toLowerCase() === name.trim().toLowerCase());
            if (found) return found.id;
        } catch (_) {}
        try {
            const res = await API.apiFetch('POST', '/degrees', {
                name: name.trim(),
                serial_number: 'DEG-' + Math.random().toString(36).substr(2, 9).toUpperCase()
            });
            return res.id;
        } catch (err) {
            console.error('Failed to create degree:', err);
            return null;
        }
    }

    async function resolveOrCreateOrganization(name) {
        if (!name || name.trim() === '') return null;
        try {
            const list = await API.apiFetch('GET', '/organizations', null, { name });
            const found = list.find(o => o.name.toLowerCase() === name.trim().toLowerCase());
            if (found) return found.id;
        } catch (_) {}
        try {
            const res = await API.apiFetch('POST', '/organizations', {
                name: name.trim(),
                slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                serial_number: 'ORG-' + Math.random().toString(36).substr(2, 9).toUpperCase()
            });
            return res.id;
        } catch (err) {
            console.error('Failed to create organization:', err);
            return null;
        }
    }

    async function resolveOrCreateCertification(name, issuingOrgId) {
        if (!name || name.trim() === '') return null;
        try {
            const list = await API.apiFetch('GET', '/certifications', null, { name });
            const found = list.find(c => c.name.toLowerCase() === name.trim().toLowerCase());
            if (found) return found.id;
        } catch (_) {}
        try {
            const res = await API.apiFetch('POST', '/certifications', {
                name: name.trim(),
                serial_number: 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                issuing_organization_id: issuingOrgId || null
            });
            return res.id;
        } catch (err) {
            console.error('Failed to create certification:', err);
            return null;
        }
    }

    // ─── Chargement des données utilisateur depuis l'API ─────
    async function loadUserData() {
        if (!API) {
            console.warn('[profile.js] BildyxAPI not loaded — working offline.');
            return;
        }

        try {
            const meResp = await API.apiFetch('GET', '/auth/me');
            currentUser = meResp?.user ?? null;

            if (!currentUser) {
                window.location.href = 'login.php';
                return;
            }

            API.setSession({
                userId: currentUser.id,
                email: currentUser.email,
                role: currentUser.role,
                profileId: null,
            });

            const displayName = currentUser.display_name
                || [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ')
                || currentUser.email;

            setField('name', displayName);

            const avatarEl = document.getElementById('profileAvatar');
            if (avatarEl) {
                if (currentUser.avatar_url) {
                    avatarEl.style.backgroundImage = `url('${currentUser.avatar_url}')`;
                    avatarEl.style.backgroundSize = 'cover';
                    avatarEl.style.backgroundPosition = 'center';
                    avatarEl.textContent = '';
                } else {
                    const initials = [currentUser.first_name?.[0], currentUser.last_name?.[0]]
                        .filter(Boolean).join('').toUpperCase() || '?';
                    avatarEl.textContent = initials;
                }
            }

            try {
                currentProfile = await API.apiFetch('GET', `/users/${currentUser.id}/profile`);
            } catch (_) {
                currentProfile = null;
            }

            if (currentProfile) {
                API.setSession({
                    userId: currentUser.id,
                    email: currentUser.email,
                    role: currentUser.role,
                    profileId: currentProfile.id,
                });
                let meta = {};
                if (currentProfile.metadata) {
                    try {
                        meta = typeof currentProfile.metadata === 'string'
                            ? JSON.parse(currentProfile.metadata)
                            : currentProfile.metadata;
                    } catch (e) {
                        console.error('Failed to parse metadata:', e);
                        meta = currentProfile.metadata || {};
                    }
                }

                // biography
                if (currentProfile.biography) {
                    setField('summary', currentProfile.biography);
                } else {
                    setField('summary', '');
                }

                // Job role title
                if (meta.role) {
                    setField('role', meta.role);
                } else {
                    setField('role', '');
                }

                // Location
                if (meta.location) {
                    const locationEl = document.querySelector('.location-line');
                    if (locationEl) locationEl.textContent = `⌾ ${meta.location}`;
                } else {
                    const locationEl = document.querySelector('.location-line');
                    if (locationEl) locationEl.textContent = '⌾ Add location...';
                }

                // Languages
                const langRow = document.getElementById('languageChips');
                if (langRow) {
                    langRow.querySelectorAll('.chip, .skeleton-loader').forEach(c => c.remove());
                    const langs = meta.languages || [];
                    langs.forEach(lang => {
                        const chip = document.createElement('span');
                        let levelClass = '';
                        if (lang.includes('(Native)')) levelClass = 'is-native';
                        else if (lang.includes('(Fluent)')) levelClass = 'is-fluent';
                        else if (lang.includes('(Intermediate)')) levelClass = 'is-intermediate';
                        chip.className = `chip is-filled ${levelClass}`;
                        chip.innerHTML = `${lang} <button type="button" aria-label="Remove ${lang}">×</button>`;
                        langRow.appendChild(chip);
                    });
                }

                // Top Skills
                const skillRow = document.getElementById('skillChips');
                if (skillRow) {
                    skillRow.querySelectorAll('.chip, .skeleton-loader').forEach(c => c.remove());
                    const skills = meta.skills || [];
                    skills.forEach(skill => {
                        const chip = document.createElement('span');
                        chip.className = 'chip';
                        chip.innerHTML = `${skill} <button type="button" aria-label="Remove ${skill}">×</button>`;
                        skillRow.appendChild(chip);
                    });
                }

                // Render Work Experiences from profile metadata
                renderExperiences(meta.experiences || []);

                // Load and render Educations
                await loadAndRenderEducations(currentProfile.id);

                // Load and render Certifications
                await loadAndRenderCertifications(currentProfile.id);
            }
        } catch (err) {
            console.error('[profile.js] Load profile error:', err);
            showToast('Failed to load user profile.', 'error');
            window.location.href = "login.php";
        }
    }

    // ─── Render Work Experiences ──────────────────────────────
    function renderExperiences(experiences) {
        const list = document.getElementById('experienceList');
        if (!list) return;
        list.innerHTML = '';

        if (experiences.length === 0) {
            list.innerHTML = '<p class="empty-message">No experiences added yet.</p>';
            return;
        }

        experiences.forEach((exp, i) => {
            const article = document.createElement('article');
            article.className = 'entry-card';
            article.dataset.entry = 'experience';
            article.innerHTML = `
                <div class="entry-toolbar">
                    <h3>Work Experience ${i + 1}</h3>
                    <div>
                        <button class="entry-tool js-collapse" type="button" aria-label="Collapse or expand work experience">＋</button>
                        <button class="entry-tool js-remove-entry" type="button" aria-label="Remove work experience">×</button>
                    </div>
                </div>
                <div class="entry-body">
                    <div class="entry-header-line">
                        <div class="round-place ${exp.image ? 'has-image' : ''}" style="${exp.image ? `background-image: ${exp.image}; background-size: cover; background-position: center;` : ''}">
                            <input type="file" accept="image/*" class="exp-image-input" style="display: none;" />
                        </div>
                        <div class="entry-controls">
                            <div class="date-row">
                                <input type="date" class="start-date" aria-label="Start date" value="${exp.startDate || ''}" />
                                <span>–</span>
                                <input type="date" class="end-date" aria-label="End date" value="${exp.endDate || ''}" />
                            </div>
                            <p>
                                <span contenteditable="true" class="exp-location" data-placeholder="Add location...">${exp.location || ''}</span> · 
                                <span contenteditable="true" class="exp-company" data-placeholder="Add company...">${exp.company || ''}</span>
                            </p>
                            <input type="text" class="exp-role-title" placeholder="Add role title..." value="${exp.role || ''}" />
                            <label>Type:<select><option>Optional</option><option>Internship</option><option>Full-time</option><option>Freelance</option></select></label>
                            <label>Level:<select><option>Optional</option><option>Junior</option><option>Mid</option><option>Senior</option></select></label>
                        </div>
                    </div>
                    <textarea maxlength="600" data-word-counter placeholder="Add work summary up to 60 words...">${exp.summary || ''}</textarea>
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
                    <div class="entry-skills ${exp.skills && exp.skills.length > 0 ? 'is-visible' : ''}">
                        <p>Skills related to this role <span>(select up to 5)</span></p>
                        <div class="chip-row" data-selectable-skills>
                            ${(exp.skills || []).map(skill => `<button class="chip is-outline is-selectable is-active" type="button">${escapeHtml(skill)}</button>`).join('')}
                        </div>
                        <small>${(exp.skills || []).length}/5 selected</small>
                    </div>
                </div>
            `;
            list.appendChild(article);

            if (exp.companyId) {
                const slot = article.querySelector('[data-card-slot="company-card"]');
                if (slot) fetchAndRenderCardSlot(slot, 'company-card', exp.companyId);
            }
            if (exp.productId) {
                const slot = article.querySelector('[data-card-slot="product-card"]');
                if (slot) fetchAndRenderCardSlot(slot, 'product-card', exp.productId);
            }
            if (exp.roleId) {
                const slot = article.querySelector('[data-card-slot="role-card"]');
                if (slot) fetchAndRenderCardSlot(slot, 'role-card', exp.roleId);
            }
            if (exp.brandId) {
                const slot = article.querySelector('[data-card-slot="brand-card"]');
                if (slot) fetchAndRenderCardSlot(slot, 'brand-card', exp.brandId);
            }
            if (exp.industryId) {
                const slot = article.querySelector('[data-card-slot="client-card"]');
                if (slot) fetchAndRenderCardSlot(slot, 'client-card', exp.industryId);
            }
        });
    }

    // ─── Load and Render Educations ───────────────────────────
    async function loadAndRenderEducations(profileId) {
        const list = document.getElementById('educationList');
        if (!list) return;
        list.innerHTML = '';

        try {
            const educations = await API.apiFetch('GET', `/profiles/${profileId}/educations`);
            
            if (educations.length === 0) {
                list.innerHTML = '<p class="empty-message">No degrees added yet.</p>';
                return;
            }

            for (const edu of educations) {
                let uniName = '';
                let degName = '';
                try {
                    const uniPromises = [];
                    if (edu.university_id) uniPromises.push(API.apiFetch('GET', `/universities/${edu.university_id}`));
                    if (edu.degree_id) uniPromises.push(API.apiFetch('GET', `/degrees/${edu.degree_id}`));
                    
                    const [uni, deg] = await Promise.all(uniPromises);
                    if (uni) uniName = uni.name;
                    if (deg) degName = deg.name;
                } catch (_) {}

                const article = document.createElement('article');
                article.className = 'entry-card';
                article.dataset.entry = 'education';
                article.dataset.id = edu.id;
                article.innerHTML = `
                    <div class="entry-toolbar">
                        <h3>Education</h3>
                        <div>
                            <button class="entry-tool js-collapse" type="button" aria-label="Collapse or expand education">＋</button>
                            <button class="entry-tool js-remove-entry" type="button" aria-label="Remove education">×</button>
                        </div>
                    </div>
                    <div class="entry-body">
                        <div class="education-form-line">
                            <div class="entry-icon-soft">◈</div>
                            <div class="education-fields">
                                <p><strong contenteditable="true" class="edu-university" data-placeholder="Add university...">${uniName}</strong> <button class="inline-link" type="button">Add school/faculty/department (optional)...</button></p>
                                <p><strong contenteditable="true" class="edu-degree" data-placeholder="Select type of degree...">${degName}</strong> <span contenteditable="true" data-placeholder="Add degree name..."></span></p>
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
                                    <input type="number" class="start-year" placeholder="Start Year" min="1900" max="2099" value="${edu.start_year || ''}" style="width: 80px;" />
                                    <span>–</span>
                                    <input type="number" class="end-year" placeholder="End Year" min="1900" max="2099" value="${edu.end_year || ''}" style="width: 80px;" />
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
                list.appendChild(article);

                if (edu.university_id) {
                    const uniSlot = article.querySelector('[data-card-slot="university-card"]');
                    if (uniSlot) fetchAndRenderCardSlot(uniSlot, 'university-card', edu.university_id);
                }
                if (edu.degree_id) {
                    const degSlot = article.querySelector('[data-card-slot="degree-card"]');
                    if (degSlot) fetchAndRenderCardSlot(degSlot, 'degree-card', edu.degree_id);
                }
            }
        } catch (err) {
            console.error('Failed to load educations:', err);
            list.innerHTML = '<p class="empty-message">Failed to load educations.</p>';
        }
    }

    // ─── Load and Render Certifications ────────────────────────
    async function loadAndRenderCertifications(profileId) {
        const grid = document.querySelector('.cert-grid') || document.getElementById('certificationList');
        if (!grid) return;
        grid.innerHTML = '';

        try {
            const userCerts = await API.apiFetch('GET', `/profiles/${profileId}/certifications`);

            if (userCerts.length === 0) {
                grid.innerHTML = '<p class="empty-message">No certifications added yet.</p>';
                return;
            }

            for (const uc of userCerts) {
                let certName = '';
                let issuerName = '';
                try {
                    const cert = await API.apiFetch('GET', `/certifications/${uc.certification_id}`);
                    if (cert) {
                        certName = cert.name;
                        if (cert.issuing_organization_id) {
                            const org = await API.apiFetch('GET', `/organizations/${cert.issuing_organization_id}`);
                            if (org) issuerName = org.name;
                        }
                    }
                } catch (_) {}

                const article = document.createElement('article');
                article.className = 'entry-card cert-card';
                article.dataset.entry = 'certification';
                article.dataset.id = uc.id;
                article.innerHTML = `
                    <div class="entry-toolbar">
                        <h3 contenteditable="true" class="cert-name" data-placeholder="New Certification">${certName}</h3>
                        <button class="entry-tool js-remove-entry" type="button" aria-label="Remove certification">×</button>
                    </div>
                    <div class="entry-body">
                        <div class="backend-grid">
                            <div class="backend-slot backend-slot--certification" data-card-slot="certification-card">Certification card</div>
                        </div>
                    </div>
                `;
                grid.appendChild(article);

                if (uc.certification_id) {
                    const slot = article.querySelector('[data-card-slot="certification-card"]');
                    if (slot) fetchAndRenderCardSlot(slot, 'certification-card', uc.certification_id);
                }
            }
        } catch (err) {
            console.error('Failed to load certifications:', err);
            grid.innerHTML = '<p class="empty-message">Failed to load certifications.</p>';
        }
    }

    // ─── Sauvegarde du profil via l'API ───────────────────────
    async function saveProfile() {
        const name      = document.querySelector('[data-field="name"]')?.textContent.trim() || $('[data-editable="name"]')?.textContent.trim() || '';

        const biography = document.querySelector('[data-field="summary"]')?.textContent.trim() || $('[data-editable="career-summary"]')?.textContent.trim() || '';
        const role      = document.querySelector('[data-field="role"]')?.textContent.trim() || $('[data-editable="role-title"]')?.textContent.trim() || '';
        
        const languages = Array.from(document.querySelectorAll('#languageChips .chip'))
                              .map(c => c.childNodes[0].textContent.trim()).filter(Boolean);
        const skills    = Array.from(document.querySelectorAll('#skillChips .chip'))
                              .map(c => c.childNodes[0].textContent.trim()).filter(Boolean);

        // 1. Collect experiences
        const experiences = $$('#experienceList [data-entry="experience"]').map(card => {
            const companySlot = card.querySelector('[data-card-slot="company-card"]');
            const productSlot = card.querySelector('[data-card-slot="product-card"]');
            const roleSlot = card.querySelector('[data-card-slot="role-card"]');
            const brandSlot = card.querySelector('[data-card-slot="brand-card"]');
            const clientSlot = card.querySelector('[data-card-slot="client-card"]');
            return {
                company: card.querySelector('.exp-company')?.textContent.trim() || '',
                location: card.querySelector('.exp-location')?.textContent.trim() || '',
                product: card.querySelector('.exp-product')?.textContent.trim() || '',
                role: card.querySelector('.exp-role-title')?.value.trim() || '',
                startDate: card.querySelector('.start-date')?.value.trim() || '',
                endDate: card.querySelector('.end-date')?.value.trim() || '',
                summary: card.querySelector('textarea')?.value.trim() || '',
                image: card.querySelector('.round-place')?.style.backgroundImage || '',
                skills: Array.from(card.querySelectorAll('[data-selectable-skills] .is-selectable.is-active')).map(btn => btn.textContent.trim()),
                companyId: companySlot?.dataset.orgId || '',
                productId: productSlot?.dataset.productId || '',
                roleId: roleSlot?.dataset.roleId || '',
                brandId: brandSlot?.dataset.productId || '',
                industryId: clientSlot?.dataset.industryId || ''
            };
        });

        if (API && currentProfile?.id) {
            try {
                let existingMeta = {};
                if (currentProfile.metadata) {
                    try {
                        existingMeta = typeof currentProfile.metadata === 'string'
                            ? JSON.parse(currentProfile.metadata)
                            : currentProfile.metadata;
                    } catch (e) {
                        console.error('Failed to parse metadata:', e);
                        existingMeta = currentProfile.metadata || {};
                    }
                }

                // A. Save profile & experiences in metadata
                await API.apiFetch('PATCH', `/profiles/${currentProfile.id}`, {
                    biography: biography || null,
                    metadata: {
                        ...existingMeta,
                        role,
                        skills,
                        languages,
                        displayName: name,
                        experiences
                    },
                });

                // B. Handle deleted educations
                for (const eduId of deletedEducations) {
                    await API.apiFetch('DELETE', `/educations/${eduId}`);
                }
                deletedEducations.length = 0;

                // C. Save/Update Educations
                const eduCards = $$('#educationList [data-entry="education"]');
                for (const card of eduCards) {
                    const uniName = card.querySelector('.edu-university')?.textContent.trim();
                    const degName = card.querySelector('.edu-degree')?.textContent.trim();
                    const startYear = parseInt(card.querySelector('.start-year')?.value) || null;
                    const endYear = parseInt(card.querySelector('.end-year')?.value) || null;

                    const uniSlot = card.querySelector('[data-card-slot="university-card"]');
                    const degSlot = card.querySelector('[data-card-slot="degree-card"]');
                    
                    let uniId = uniSlot?.dataset.universityId || null;
                    let degId = degSlot?.dataset.degreeId || null;

                    if (!uniId && uniName) {
                        uniId = await resolveOrCreateUniversity(uniName);
                    }
                    if (!degId && degName) {
                        degId = await resolveOrCreateDegree(degName);
                    }

                    const eduData = {
                        university_id: uniId,
                        degree_id: degId,
                        start_year: startYear,
                        end_year: endYear,
                        graduated: true
                    };

                    const id = card.dataset.id;
                    if (id && card.dataset.unsaved !== 'true') {
                        await API.apiFetch('PATCH', `/educations/${id}`, eduData);
                    } else {
                        const newEdu = await API.apiFetch('POST', '/educations', {
                            user_profile_id: currentProfile.id,
                            ...eduData
                        });
                        card.dataset.id = newEdu.id;
                        card.dataset.unsaved = 'false';
                    }
                }

                // D. Handle deleted certifications
                for (const ucId of deletedCertifications) {
                    await API.apiFetch('DELETE', `/user-certifications/${ucId}`);
                }
                deletedCertifications.length = 0;

                // E. Save/Update Certifications
                const certCards = $$('.cert-grid [data-entry="certification"], #certificationList [data-entry="certification"]');
                for (const card of certCards) {
                    const certName = card.querySelector('.cert-name')?.textContent.trim();
                    const issuerName = card.querySelector('.cert-issuer')?.textContent.trim();

                    const slot = card.querySelector('[data-card-slot="certification-card"]');
                    let certId = slot?.dataset.certificationId || null;

                    if (!certId && certName) {
                        const orgId = await resolveOrCreateOrganization(issuerName);
                        certId = await resolveOrCreateCertification(certName, orgId);
                    }

                    const id = card.dataset.id;
                    if (certId) {
                        if (id && card.dataset.unsaved !== 'true') {
                            await API.apiFetch('PATCH', `/user-certifications/${id}`, {
                                obtained_at: new Date().toISOString()
                            });
                        } else {
                            const newUC = await API.apiFetch('POST', '/user-certifications', {
                                user_profile_id: currentProfile.id,
                                certification_id: certId,
                                obtained_at: new Date().toISOString()
                            });
                            card.dataset.id = newUC.id;
                            card.dataset.unsaved = 'false';
                        }
                    }
                }

                currentProfile = await API.apiFetch('GET', `/profiles/${currentProfile.id}`);
                showToast('Profile saved');
            } catch (err) {
                console.error('[profile.js] Save profile error:', err);
                showToast('Failed to sync with API.', 'error');
            }
        } else {
            // Backup local
            const payload = {
                savedAt: new Date().toISOString(),
                name,
                summary: biography,
                role,
                languages,
                skills,
                experiences: experiences.length,
            };
            localStorage.setItem('bildyx_profile_draft', JSON.stringify(payload));
            showToast('MicroResume saved locally.');
        }
    }

    // ─── Add new items handlers ────────────────────────────────
    function addExperience() {
        const list = $('#experienceList');
        if (!list) return;

        const empty = list.querySelector('.empty-message');
        if (empty) empty.remove();

        const count = $$('[data-entry="experience"]', list).length + 1;
        const article = document.createElement('article');
        article.className = 'entry-card';
        article.dataset.entry = 'experience';
        article.innerHTML = `
            <div class="entry-toolbar">
                <h3>Work Experience ${count}</h3>
                <div>
                    <button class="entry-tool js-collapse" type="button" aria-label="Collapse or expand work experience">＋</button>
                    <button class="entry-tool js-remove-entry" type="button" aria-label="Remove work experience">×</button>
                </div>
            </div>
            <div class="entry-body">
                <div class="entry-header-line">
                    <div class="round-place">
                        <input type="file" accept="image/*" class="exp-image-input" style="display: none;" />
                    </div>
                    <div class="entry-controls">
                        <div class="date-row">
                            <input type="date" class="start-date" aria-label="Start date" />
                            <span>–</span>
                            <input type="date" class="end-date" aria-label="End date" />
                        </div>
                        <p>
                            <span contenteditable="true" class="exp-location" data-placeholder="Add location..."></span> · 
                            <span contenteditable="true" class="exp-company" data-placeholder="Add company..."></span>
                        </p>
                        <input type="text" class="exp-role-title" placeholder="Add role title..." />
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
                    <div class="chip-row" data-selectable-skills></div>
                    <small>0/5 selected</small>
                </div>
            </div>
        `;
        list.appendChild(article);
        showToast('Work experience added.');
    }

    function addEducation() {
        const list = $('#educationList');
        if (!list) return;

        const empty = list.querySelector('.empty-message');
        if (empty) empty.remove();

        const count = $$('[data-entry="education"]', list).length + 1;
        const article = document.createElement('article');
        article.className = 'entry-card';
        article.dataset.entry = 'education';
        article.dataset.unsaved = 'true';
        article.innerHTML = `
            <div class="entry-toolbar">
                <h3>Education ${count}</h3>
                <div>
                    <button class="entry-tool js-collapse" type="button" aria-label="Collapse or expand education">＋</button>
                    <button class="entry-tool js-remove-entry" type="button" aria-label="Remove education">×</button>
                </div>
            </div>
            <div class="entry-body">
                <div class="education-form-line">
                    <div class="entry-icon-soft">◈</div>
                    <div class="education-fields">
                        <p><strong contenteditable="true" class="edu-university" data-placeholder="Add university..."></strong> <button class="inline-link" type="button">Add school/faculty/department (optional)...</button></p>
                        <p><strong contenteditable="true" class="edu-degree" data-placeholder="Select type of degree..."></strong> <span contenteditable="true" data-placeholder="Add degree name..."></span></p>
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
                            <input type="number" class="start-year" placeholder="Start Year" min="1900" max="2099" style="width: 80px;" />
                            <span>–</span>
                            <input type="number" class="end-year" placeholder="End Year" min="1900" max="2099" style="width: 80px;" />
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
        list.appendChild(article);
        showToast('Education added.');
    }

    function addCertification() {
        const grid = document.querySelector('.cert-grid') || $('#certificationList');
        if (!grid) return;

        const empty = grid.querySelector('.empty-message');
        if (empty) empty.remove();

        const count = $$('[data-entry="certification"]', grid).length + 1;
        const article = document.createElement('article');
        article.className = 'entry-card cert-card';
        article.dataset.entry = 'certification';
        article.dataset.unsaved = 'true';
        article.innerHTML = `
            <div class="entry-toolbar">
                <h3 contenteditable="true" class="cert-name" data-placeholder="Certification ${count}"></h3>
                <button class="entry-tool js-remove-entry" type="button" aria-label="Remove certification">×</button>
            </div>
            <div class="entry-body">
                <div class="backend-grid">
                    <div class="backend-slot backend-slot--certification" data-card-slot="certification-card">Certification card</div>
                </div>
            </div>
        `;
        grid.appendChild(article);
        showToast('Certification added.');
    }

    // ─── Entry collapse and delete triggers ───────────────────
    function collapseEntry(button) {
        const entry = button.closest('.entry-card');
        const body = $('.entry-body', entry);
        if (!body) return;
        body.classList.toggle('is-collapsed');
        button.textContent = body.classList.contains('is-collapsed') ? '▾' : '＋';
    }

    function renumberExperiences() {
        $$('#experienceList [data-entry="experience"]').forEach((entry, index) => {
            const title = entry.querySelector('.entry-toolbar h3');
            if (title) title.textContent = `Work Experience ${index + 1}`;
        });
    }

    function removeEntry(button) {
        const entry = button.closest('[data-entry], .entry-card');
        if (!entry) return;

        const id = entry.dataset.id;
        const type = entry.dataset.entry;

        if (id && entry.dataset.unsaved !== 'true') {
            if (type === 'education') deletedEducations.push(id);
            if (type === 'certification') deletedCertifications.push(id);
        }

        entry.remove();
        renumberExperiences();
        updateProfileMetaSummary();
        showToast('Item removed.');
        scheduleAutosave();
    }

    function fillBackendSlot(slot) {
        const slotType = slot.dataset.cardSlot;

        if (SLOT_MAPPING[slotType]) {
            openOrgModal(slot);
        }
    }

    // ─── Update Profile Meta Summary list ─────────────────────
    function updateProfileMetaSummary() {
        // worked in
        const locations = $$('#experienceList [data-entry="experience"]').map(card => {
            const loc = card.querySelector('.exp-location')?.textContent.trim();
            return loc && loc !== 'Add location...' ? loc : null;
        }).filter(Boolean);
        setField('meta-worked-in', [...new Set(locations)].join(', ') || '—');

        // companies
        const companies = $$('#experienceList [data-entry="experience"]').map(card => {
            const comp = card.querySelector('.exp-company')?.textContent.trim();
            return comp && comp !== 'Add company...' ? comp : null;
        }).filter(Boolean);
        setField('meta-companies', [...new Set(companies)].join(', ') || '—');

        // job occupations
        const jobs = $$('#experienceList [data-entry="experience"]').map(card => {
            return card.querySelector('.exp-role-title')?.value.trim();
        }).filter(Boolean);
        setField('meta-jobs', [...new Set(jobs)].join(', ') || '—');

        // degrees
        const degrees = $$('#educationList [data-entry="education"]').map(card => {
            const deg = card.querySelector('.edu-degree')?.textContent.trim();
            return deg && deg !== 'Add Degree...' ? deg : null;
        }).filter(Boolean);
        setField('meta-degrees', [...new Set(degrees)].join(', ') || '—');

        // studied in (universities)
        const universities = $$('#educationList [data-entry="education"]').map(card => {
            const uni = card.querySelector('.edu-university')?.textContent.trim();
            return uni && uni !== 'Add University...' ? uni : null;
        }).filter(Boolean);
        setField('meta-studied-in', [...new Set(universities)].join(', ') || '—');

        // products/services
        const products = $$('#experienceList [data-entry="experience"]').map(card => {
            const prod = card.querySelector('.exp-product')?.textContent.trim();
            return prod && prod !== 'Add product...' ? prod : null;
        }).filter(Boolean);
        setField('meta-products', [...new Set(products)].join(', ') || '—');

        // certifications
        const certs = $$('.cert-grid [data-entry="certification"], #certificationList [data-entry="certification"]').map(card => {
            const name = card.querySelector('.cert-name')?.textContent.trim();
            return name && name !== 'New Certification' ? name : null;
        }).filter(Boolean);
        setField('meta-certifications', [...new Set(certs)].join(', ') || '—');
    }

    // ─── Event Delegation ─────────────────────────────────────
    document.addEventListener('click', event => {
        const roundPlace = event.target.closest('.round-place');
        if (roundPlace && event.target !== roundPlace.querySelector('.exp-image-input')) {
            const fileInput = roundPlace.querySelector('.exp-image-input');
            if (fileInput) {
                fileInput.click();
                return;
            }
        }

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
            updateProfileMetaSummary();
            return;
        }

        if (button?.closest('.chip') && button.textContent.trim() === '×') {
            removeChip(button);
            updateProfileMetaSummary();
            return;
        }

        if (button?.classList.contains('is-selectable')) {
            toggleSelectableSkill(button);
            return;
        }

        if (event.target.classList.contains('js-collapse')) {
            collapseEntry(event.target);
            return;
        }

        if (event.target.classList.contains('js-remove-entry')) {
            removeEntry(event.target);
            return;
        }

        if (button?.id === 'addExperienceButton' || button?.id === 'addExperienceTop' || button?.id === 'addExperienceBottom') {
            addExperience();
            updateProfileMetaSummary();
            return;
        }

        if (button?.id === 'addEducationButton' || button?.id === 'addDegreeTop' || button?.id === 'addDegreeBottom') {
            addEducation();
            updateProfileMetaSummary();
            return;
        }

        if (button?.id === 'addCertificationButton' || button?.id === 'addCertificationTop' || button?.id === 'addCertificationBottom') {
            addCertification();
            updateProfileMetaSummary();
            return;
        }

        if (button?.id === 'saveProfileButton' || button?.id === 'saveProfile') {
            saveProfile();
            return;
        }

        if (button?.id === 'avatarButton') {
            const initials = window.prompt('Initials to display in the avatar placeholder:', 'JT');
            if (initials && initials.trim()) {
                const avatarEl = $('#profileAvatar');
                if (avatarEl) avatarEl.textContent = initials.trim().slice(0, 3).toUpperCase();
                showToast('Avatar updated.');
            }
            return;
        }

        if (button?.classList.contains('inline-link')) {
            const value = window.prompt('Text to add:');
            if (value && value.trim()) {
                button.textContent = value.trim();
                button.style.fontStyle = 'normal';
                button.style.fontWeight = '700';
                showToast('Field updated.');
            }
            return;
        }

        if (button?.id === 'logoutButton') {
            API?.logout();
            return;
        }

        if (event.target.classList.contains('slot-clear-btn') || event.target.closest('.slot-clear-btn')) {
            const btn = event.target.closest('.slot-clear-btn');
            const slot = btn.closest('.backend-slot');
            if (slot) {
                // Clear datasets
                delete slot.dataset.orgId;
                delete slot.dataset.productId;
                delete slot.dataset.roleId;
                delete slot.dataset.industryId;
                delete slot.dataset.universityId;
                delete slot.dataset.degreeId;
                delete slot.dataset.certificationId;

                // Reset class
                slot.classList.remove('is-filled');

                // Restore original placeholder text based on data-card-slot
                const slotType = slot.dataset.cardSlot;
                let placeholderText = 'Backend Slot';
                if (slotType === 'company-card') placeholderText = 'Company card';
                else if (slotType === 'product-card') placeholderText = 'Product/Service card';
                else if (slotType === 'role-card') placeholderText = 'Role card';
                else if (slotType === 'brand-card') placeholderText = 'Brand card';
                else if (slotType === 'client-card') placeholderText = 'Client/Industry card';
                else if (slotType === 'university-card') placeholderText = 'University card';
                else if (slotType === 'degree-card') placeholderText = 'Degree card';
                else if (slotType === 'certification-card') placeholderText = 'Certification card';

                slot.innerHTML = placeholderText;

                // Clear inline styles applied by alignCardsHeight
                slot.style.height = '';
                slot.style.minHeight = '';

                // If role card, clear tools & tech selectable skills
                if (slotType === 'role-card') {
                    const entryCard = slot.closest('.entry-card');
                    if (entryCard) {
                        const skillsSection = entryCard.querySelector('.entry-skills');
                        if (skillsSection) {
                            skillsSection.classList.remove('is-visible');
                            const chipRow = skillsSection.querySelector('[data-selectable-skills]');
                            if (chipRow) chipRow.innerHTML = '';
                            const countEl = skillsSection.querySelector('small');
                            if (countEl) countEl.textContent = '0/5 selected';
                        }
                    }
                }

                // If certification, reset text field
                if (slotType === 'certification-card') {
                    const entryCard = slot.closest('.entry-card');
                    if (entryCard) {
                        const nameEl = entryCard.querySelector('.cert-name');
                        if (nameEl) nameEl.textContent = '';
                    }
                }

                showToast('Card removed.');
                updateProfileMetaSummary();
                scheduleAutosave();
            }
            return;
        }

        const slot = event.target.closest('.backend-slot');
        if (slot) {
            fillBackendSlot(slot);
        }
    });

    document.addEventListener('input', event => {
        if (event.target.matches('[data-word-counter]')) {
            updateWordCounter(event.target);
        }
        if (event.target.closest('[data-entry]') || event.target.closest('.skill-row') || event.target.closest('[aria-label="Languages"]')) {
            updateProfileMetaSummary();
        }
        // Auto-save on any text input within entries
        if (event.target.closest('[data-entry]')) {
            scheduleAutosave();
        }
    });

    // Auto-save when leaving a contenteditable field (role, name, summary, etc.)
    document.addEventListener('focusout', event => {
        if (event.target.matches('[contenteditable="true"]')) {
            scheduleAutosave();
        }
    });


    document.addEventListener('change', event => {
        if (event.target.classList.contains('exp-image-input')) {
            const fileInput = event.target;
            const file = fileInput.files && fileInput.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
                const roundPlace = fileInput.closest('.round-place');
                if (roundPlace) {
                    roundPlace.classList.add('has-image');
                    roundPlace.style.backgroundImage = `url("${reader.result}")`;
                    roundPlace.style.backgroundSize = 'cover';
                    roundPlace.style.backgroundPosition = 'center';
                    showToast('Experience image updated!');
                    updateProfileMetaSummary();
                }
            };
            reader.readAsDataURL(file);
        }
    });

    // ─── Initialisation Sécurisée sans Blocage ────────────────
    (async () => {
        try {
            $$('[data-word-counter]').forEach(updateWordCounter);
            
            if (API) {
                await loadUserData();
            }
        } catch (err) {
            console.error('[profile.js] Initialization error:', err);
        } finally {
            showPanel('profilePanel');
            updateProfileMetaSummary();
        }
    })();

    // ─── Gestion de la Modale de Recherche ──────────────────────────
    const SLOT_MAPPING = {
        'company-card': {
            title: 'Select an Organisation',
            placeholder: 'Search for a company...',
            searchEndpoint: '/organizations',
            cardEndpointPrefix: '/cards/organization/',
            displayProp: 'name',
            subProp: 'subtype',
            toastSuccess: 'Organisation card updated!'
        },
        'product-card': {
            title: 'Select a Product / Service',
            placeholder: 'Search for a product or service...',
            searchEndpoint: '/subjects',
            cardEndpointPrefix: '/cards/product/',
            displayProp: 'name',
            subProp: 'category',
            toastSuccess: 'Product card updated!'
        },
        'role-card': {
            title: 'Select a Role / Position',
            placeholder: 'Search for a role...',
            searchEndpoint: '/jobs',
            cardEndpointPrefix: '/cards/job/',
            displayProp: 'title',
            subProp: 'category',
            toastSuccess: 'Role card updated!'
        },
        'brand-card': {
            title: 'Select a Brand',
            placeholder: 'Search for a brand...',
            searchEndpoint: '/subjects',
            cardEndpointPrefix: '/cards/product/',
            displayProp: 'name',
            subProp: 'category',
            toastSuccess: 'Brand card updated!'
        },
        'client-card': {
            title: 'Select a Sector / Industry',
            placeholder: 'Search for an industry...',
            searchEndpoint: '/industries',
            cardEndpointPrefix: '/cards/industry/',
            displayProp: 'name',
            subProp: 'description',
            toastSuccess: 'Industry card updated!'
        },
        'university-card': {
            title: 'Select a University',
            placeholder: 'Search for a university...',
            searchEndpoint: '/universities',
            cardEndpointPrefix: '/cards/university/',
            displayProp: 'name',
            subProp: 'location',
            toastSuccess: 'University card updated!'
        },
        'degree-card': {
            title: 'Select a Degree',
            placeholder: 'Search for a degree...',
            searchEndpoint: '/degrees',
            cardEndpointPrefix: '/cards/degree/',
            displayProp: 'name',
            subProp: 'level',
            toastSuccess: 'Degree card updated!'
        },
        'certification-card': {
            title: 'Select a Certification',
            placeholder: 'Search for a certification...',
            searchEndpoint: '/certifications',
            cardEndpointPrefix: '/cards/certification/',
            displayProp: 'name',
            subProp: 'level',
            toastSuccess: 'Certification card updated!'
        }
    };

    let orgSearchDebounceTimer = null;
    let targetSlotForModal = null; // Garde en mémoire le bloc cliqué

    function getOrCreateOrgModal() {
        let modal = document.getElementById('orgSearchModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'orgSearchModal';
            modal.className = 'org-modal-overlay';
            modal.hidden = true;
            modal.innerHTML = `
                <div class="org-modal-card">
                    <div class="org-modal-header">
                        <h3>Select an Organisation</h3>
                        <button type="button" class="org-modal-close js-close-org-modal" aria-label="Close">&times;</button>
                    </div>
                    <div class="org-modal-body">
                        <div class="org-search-wrapper">
                            <input type="text" id="orgSearchInput" class="org-search-input" placeholder="Search for a company..." autocomplete="off" />
                            <ul id="orgSearchResults" class="org-results-list" hidden></ul>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Fermeture de la modale sur la croix ou le fond
            $('#closeOrgModalBtn', modal)?.addEventListener('click', closeOrgModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal || e.target.classList.contains('js-close-org-modal')) {
                    closeOrgModal();
                }
            });

            // Recherche dynamique au clavier
            const input = $('#orgSearchInput', modal);
            input.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                window.clearTimeout(orgSearchDebounceTimer);

                if (query.length < 2) {
                    const resultsList = $('#orgSearchResults', modal);
                    resultsList.innerHTML = '';
                    resultsList.hidden = true;
                    return;
                }

                orgSearchDebounceTimer = window.setTimeout(() => {
                    fetchOrganizations(query);
                }, 300);
            });
        }
        return modal;
    }

    function openOrgModal(slotElement) {
        if (!slotElement) return;
        targetSlotForModal = slotElement;
        
        const slotType = slotElement.dataset.cardSlot;
        const config = SLOT_MAPPING[slotType] || SLOT_MAPPING['company-card'];
        
        const modal = getOrCreateOrgModal();
        const titleEl = modal.querySelector('.org-modal-header h3');
        if (titleEl) titleEl.textContent = config.title;

        const input = $('#orgSearchInput', modal);
        if (input) {
            input.value = '';
            input.placeholder = config.placeholder;
        }

        const results = $('#orgSearchResults', modal);
        if (results) {
            results.innerHTML = '';
            results.hidden = true;
        }
        
        // Réaffichage explicite
        modal.hidden = false;
        modal.style.display = 'flex'; // Forçage de l'affichage flex de la modale

        setTimeout(() => input.focus(), 50);
    }

    function closeOrgModal() {
        const modal = document.getElementById('orgSearchModal');
        if (modal) {
            modal.hidden = true;
            modal.style.display = 'none'; // Forçage CSS
            modal.classList.remove('is-visible', 'show', 'active');
        }
    }

    async function fetchOrganizations(query) {
        if (!targetSlotForModal) return;
        const slotType = targetSlotForModal.dataset.cardSlot;
        const config = SLOT_MAPPING[slotType] || SLOT_MAPPING['company-card'];

        const modal = document.getElementById('orgSearchModal');
        const resultsList = $('#orgSearchResults', modal);

        try {
            resultsList.innerHTML = '<li class="org-result-loading">Searching...</li>';
            resultsList.hidden = false;

            const data = await API.apiFetch('GET', config.searchEndpoint, null, { name: query });

            resultsList.innerHTML = '';

            if (!data || data.length === 0) {
                resultsList.innerHTML = '<li class="org-result-empty">No results found</li>';
                return;
            }

            data.forEach(item => {
                const li = document.createElement('li');
                li.className = 'org-result-item';
                
                const displayText = item[config.displayProp] || '';

                li.innerHTML = `
                    <div class="org-item-name">${escapeHtml(displayText)}</div>
                `;
                li.addEventListener('click', () => selectOrganization(item.id));
                resultsList.appendChild(li);
            });
        } catch (err) {
            console.error('Erreur lors de la recherche :', err);
            resultsList.innerHTML = '<li class="org-result-error">Erreur de chargement</li>';
        }
    }

    async function fetchAndRenderCardSlot(slotToUpdate, slotType, entityId) {
        if (!entityId || !slotToUpdate) return;

        // Set the ID synchronously to avoid race conditions with autosave during fetching
        if (slotType === 'company-card') slotToUpdate.dataset.orgId = entityId;
        else if (slotType === 'product-card' || slotType === 'brand-card') slotToUpdate.dataset.productId = entityId;
        else if (slotType === 'role-card') slotToUpdate.dataset.roleId = entityId;
        else if (slotType === 'client-card') slotToUpdate.dataset.industryId = entityId;
        else if (slotType === 'university-card') slotToUpdate.dataset.universityId = entityId;
        else if (slotType === 'degree-card') slotToUpdate.dataset.degreeId = entityId;
        else if (slotType === 'certification-card') slotToUpdate.dataset.certificationId = entityId;

        const config = SLOT_MAPPING[slotType];
        if (!config) return;
        try {
            const response = await API.apiFetch('GET', `${config.cardEndpointPrefix}${entityId}`);
            const htmlCard = typeof response === 'string' ? response : (response?.message || response?.html || '');

            if (!htmlCard) return;

            slotToUpdate.classList.add('is-filled');

            const iframe = document.createElement('iframe');
            iframe.className = 'org-card-frame';
            iframe.srcdoc = `
                <html>
                <head>
                    <style>
                        html, body {
                            margin: 0;
                            padding: 0;
                            overflow: hidden;
                            font-family: "Plus Jakarta Sans", system-ui, sans-serif;
                        }
                        .scale-wrap {
                            position: absolute;
                            top: 0;
                            left: 0;
                            transform-origin: top left;
                            width: 500px;
                        }
                        .main-card {
                            height: 100% !important;
                            box-sizing: border-box;
                        }
                        .footer-row {
                            margin-top: auto !important;
                        }
                    </style>
                </head>
                <body>
                    <div class="scale-wrap" id="scaleWrap">${htmlCard}</div>
                </body>
                </html>
            `;

            iframe.addEventListener('load', () => {
                alignCardsHeight(slotToUpdate.closest('.backend-grid'));
            });

            slotToUpdate.innerHTML = '';
            slotToUpdate.appendChild(iframe);

            const clearBtn = document.createElement('button');
            clearBtn.type = 'button';
            clearBtn.className = 'slot-clear-btn';
            clearBtn.innerHTML = '×';
            clearBtn.title = 'Remove card';
            slotToUpdate.appendChild(clearBtn);
        } catch (err) {
            console.error('Erreur récupération carte HTML pour le slot :', slotType, err);
        }
    }

    async function selectOrganization(orgId) {
        const slotToUpdate = targetSlotForModal;

        if (!slotToUpdate) {
            console.error("Erreur : Aucun emplacement (slot) valide n'a été trouvé.");
            showToast("Error: slot not found.", 'error');
            closeOrgModal();
            return;
        }

        const slotType = slotToUpdate.dataset.cardSlot;
        const config = SLOT_MAPPING[slotType] || SLOT_MAPPING['company-card'];

        // On réinitialise la globale et on ferme la modale
        targetSlotForModal = null;
        closeOrgModal();
        showToast('Loading card...');

        try {
            // Update corresponding text input/editable on the card
            const entryCard = slotToUpdate.closest('.entry-card');
            if (entryCard) {
                try {
                    if (slotType === 'company-card') {
                        const el = entryCard.querySelector('.exp-company');
                        const org = await API.apiFetch('GET', `/organizations/${orgId}`);
                        if (el && org) el.textContent = org.name;
                    } else if (slotType === 'university-card') {
                        const el = entryCard.querySelector('.edu-university');
                        const uni = await API.apiFetch('GET', `/universities/${orgId}`);
                        if (el && uni) el.textContent = uni.name;
                    } else if (slotType === 'degree-card') {
                        const el = entryCard.querySelector('.edu-degree');
                        const deg = await API.apiFetch('GET', `/degrees/${orgId}`);
                        if (el && deg) el.textContent = deg.name;
                    } else if (slotType === 'role-card') {
                        const el = entryCard.querySelector('.exp-role-title');
                        const job = await API.apiFetch('GET', `/jobs/${orgId}`);
                        if (el && job) el.value = job.title;
                    } else if (slotType === 'certification-card') {
                        const el = entryCard.querySelector('.cert-name');
                        const cert = await API.apiFetch('GET', `/certifications/${orgId}`);
                        if (el && cert) el.textContent = cert.name;
                        if (cert?.issuing_organization_id) {
                            const issuerEl = entryCard.querySelector('.cert-issuer');
                            const org = await API.apiFetch('GET', `/organizations/${cert.issuing_organization_id}`);
                            if (issuerEl && org) issuerEl.textContent = org.name;
                        }
                    }
                } catch (err) {
                    console.warn('Failed to update text field for selected card:', err);
                }
            }

            if (slotType === 'role-card') {
                // Charger dynamiquement les tools_and_tech liés au job (role)
                (async () => {
                    try {
                        const job = await API.apiFetch('GET', `/jobs/${orgId}`);
                        console.log('API Job loaded:', job);
                        
                        const entryCard = slotToUpdate.closest('.entry-card');
                        if (entryCard) {
                            const skillsSection = entryCard.querySelector('.entry-skills');
                            if (skillsSection) {
                                skillsSection.classList.add('is-visible');
                                
                                const chipRow = skillsSection.querySelector('[data-selectable-skills]');
                                const countEl = skillsSection.querySelector('small');
                                
                                if (chipRow) {
                                    chipRow.innerHTML = '';
                                    const tools = job?.tools_and_tech || [];
                                    tools.forEach(tool => {
                                        const btn = document.createElement('button');
                                        btn.className = 'chip is-outline is-selectable';
                                        btn.type = 'button';
                                        btn.textContent = tool;
                                        chipRow.appendChild(btn);
                                    });
                                }
                                if (countEl) {
                                    countEl.textContent = '0/5 selected';
                                }
                            }
                        }
                    } catch (err) {
                        console.error('Erreur lors de la récupération des tools & tech du rôle :', err);
                    }
                })();
            }

            await fetchAndRenderCardSlot(slotToUpdate, slotType, orgId);
            showToast(config.toastSuccess);
            updateProfileMetaSummary();
            scheduleAutosave();

        } catch (err) {
            console.error('Erreur sélection organisation :', err);
            showToast('Failed to update the card.', 'error');
        }
    }

    function alignCardsHeight(grid) {
        if (!grid) return;

        const slots = $$('.backend-slot.is-filled', grid);
        if (slots.length === 0) return;

        slots.forEach(slot => {
            const iframe = slot.querySelector('iframe');
            if (!iframe) return;

            try {
                const doc = iframe.contentDocument || iframe.contentWindow?.document;
                const wrap = doc?.getElementById('scaleWrap');
                if (!wrap) return;

                // Réinitialiser temporairement les hauteurs pour mesurer la taille réelle du contenu
                wrap.style.height = 'auto';
                const mainCard = wrap.querySelector('.main-card');
                if (mainCard) {
                    mainCard.style.setProperty('height', 'auto', 'important');
                }

                const cardWidth = 500; // Les cartes Bildyx font toujours 500px de large
                const cardHeight = wrap.scrollHeight || 400;
                const containerWidth = slot.clientWidth || iframe.clientWidth || 250;

                const padding = 16;
                const availableWidth = containerWidth - padding;
                const scale = Math.min(availableWidth / cardWidth, 1);
                const scaledHeight = cardHeight * scale;
                const requiredHeight = scaledHeight + padding;

                // Appliquer la hauteur individuelle de cette carte spécifique
                slot.style.minHeight = 'auto';
                slot.style.height = `${requiredHeight}px`;
                iframe.style.height = `${requiredHeight}px`;

                // Calculer la hauteur non-scalée requise à l'intérieur de l'iframe
                const heightNeeded = (requiredHeight - padding) / scale;
                wrap.style.height = `${heightNeeded}px`;

                // Appliquer la transformation et le positionnement
                wrap.style.transform = `scale(${scale})`;
                wrap.style.top = `${padding / 2}px`;
                wrap.style.left = `${(containerWidth - cardWidth * scale) / 2}px`;

                // Forcer la carte interne à s'étirer sur toute la hauteur calculée
                if (mainCard) {
                    mainCard.style.setProperty('height', '100%', 'important');
                }
            } catch (err) {
                console.error('Erreur lors de la mesure de la carte :', err);
            }
        });
    }

    function escapeHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
})();