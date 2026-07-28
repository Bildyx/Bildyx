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
        showToast(isEditing ? 'Edition activée.' : 'Modification enregistrée localement.');
    }

    // ─── Chips ────────────────────────────────────────────────
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
        if (chip) chip.remove();
        showToast('Élément supprimé.');
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
            showToast('Maximum 5 skills sélectionnés.');
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

                const meta = currentProfile.metadata || {};

                // Headline
                const headline = meta.headline || '';
                const headlineInput = document.querySelector('.headline-input');
                if (headlineInput) {
                    headlineInput.value = headline;
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
                const langRow = document.querySelector('[aria-label="Languages"]');
                if (langRow) {
                    langRow.querySelectorAll('.chip, .skeleton-loader').forEach(c => c.remove());
                    const langs = meta.languages || [];
                    langs.forEach(lang => {
                        const chip = document.createElement('span');
                        chip.className = 'chip is-filled';
                        chip.innerHTML = `${lang} <button type="button" aria-label="Remove ${lang}">×</button>`;
                        langRow.insertBefore(chip, langRow.querySelector('.chip-add'));
                    });
                }

                // Top Skills
                const skillRow = document.querySelector('.skill-row');
                if (skillRow) {
                    skillRow.querySelectorAll('.chip, .skeleton-loader').forEach(c => c.remove());
                    const skills = meta.skills || [];
                    skills.forEach(skill => {
                        const chip = document.createElement('span');
                        chip.className = 'chip';
                        chip.innerHTML = `${skill} <button type="button" aria-label="Remove ${skill}">×</button>`;
                        skillRow.insertBefore(chip, skillRow.querySelector('.chip-add'));
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
                        <div class="round-place"></div>
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
                            <button class="inline-link" type="button">Add brand (optional)...</button>
                            <button class="inline-link" type="button">Add client/industry served (optional)...</button>
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
            list.appendChild(article);
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
                        <p>Issued by: <span contenteditable="true" class="cert-issuer" data-placeholder="Add issuer...">${issuerName}</span></p>
                        <div class="date-row">
                            <input type="date" aria-label="Issued date" />
                            <span>–</span>
                            <input type="date" aria-label="Expiry date" />
                        </div>
                        <div class="backend-slot backend-slot--certification" data-card-slot="certification-card">Certification card</div>
                    </div>
                `;
                grid.appendChild(article);
            }
        } catch (err) {
            console.error('Failed to load certifications:', err);
            grid.innerHTML = '<p class="empty-message">Failed to load certifications.</p>';
        }
    }

    // ─── Sauvegarde du profil via l'API ───────────────────────
    async function saveProfile() {
        const name      = document.querySelector('[data-field="name"]')?.textContent.trim() || $('[data-editable="name"]')?.textContent.trim() || '';
        const headline  = document.querySelector('.headline-input')?.value.trim() || '';
        const biography = document.querySelector('[data-field="summary"]')?.textContent.trim() || $('[data-editable="career-summary"]')?.textContent.trim() || '';
        const role      = document.querySelector('[data-field="role"]')?.textContent.trim() || $('[data-editable="role-title"]')?.textContent.trim() || '';
        
        const languages = Array.from(document.querySelectorAll('#languageChips .chip'))
                              .map(c => c.childNodes[0].textContent.trim()).filter(Boolean);
        const skills    = Array.from(document.querySelectorAll('#skillChips .chip'))
                              .map(c => c.childNodes[0].textContent.trim()).filter(Boolean);

        // 1. Collect experiences
        const experiences = $$('#experienceList [data-entry="experience"]').map(card => {
            return {
                company: card.querySelector('.exp-company')?.textContent.trim() || '',
                location: card.querySelector('.exp-location')?.textContent.trim() || '',
                product: card.querySelector('.exp-product')?.textContent.trim() || '',
                role: card.querySelector('.exp-role-title')?.value.trim() || '',
                startDate: card.querySelector('.start-date')?.value.trim() || '',
                endDate: card.querySelector('.end-date')?.value.trim() || '',
                summary: card.querySelector('textarea')?.value.trim() || '',
            };
        });

        if (API && currentProfile?.id) {
            try {
                showToast('Sauvegarde en cours...');
                const existingMeta = currentProfile.metadata || {};

                // A. Save profile & experiences in metadata
                await API.apiFetch('PATCH', `/profiles/${currentProfile.id}`, {
                    biography: biography || null,
                    metadata: {
                        ...existingMeta,
                        headline,
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

                    const uniId = await resolveOrCreateUniversity(uniName);
                    const degId = await resolveOrCreateDegree(degName);

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

                    const orgId = await resolveOrCreateOrganization(issuerName);
                    const certId = await resolveOrCreateCertification(certName, orgId);

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

                showToast('Profil synchronisé avec la base de données ✓');
                await loadUserData();
            } catch (err) {
                console.error('[profile.js] Save profile error:', err);
                showToast('Erreur lors de la synchronisation avec l\'API.', 'error');
            }
        } else {
            // Backup local
            const payload = {
                savedAt: new Date().toISOString(),
                name,
                headline,
                summary: biography,
                role,
                languages,
                skills,
                experiences: experiences.length,
            };
            localStorage.setItem('bildyx_profile_draft', JSON.stringify(payload));
            showToast('MicroResume sauvegardé en local.');
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
                    <div class="round-place"></div>
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
                        <button class="inline-link" type="button">Add brand (optional)...</button>
                        <button class="inline-link" type="button">Add client/industry served (optional)...</button>
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
                    <div class="chip-row" data-selectable-skills>
                        <button class="chip is-outline is-selectable" type="button">AI</button>
                        <button class="chip is-outline is-selectable" type="button">customer_service</button>
                        <button class="chip is-outline is-selectable" type="button">Programming</button>
                    </div>
                    <small>0/5 selected</small>
                </div>
            </div>
        `;
        list.appendChild(article);
        showToast('Work Experience ajouté.');
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
        showToast('Diplôme ajouté.');
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
                <p>Issued by: <span contenteditable="true" class="cert-issuer" data-placeholder="Add issuer..."></span></p>
                <div class="date-row">
                    <input type="date" aria-label="Issued date" />
                    <span>–</span>
                    <input type="date" aria-label="Expiry date" />
                </div>
                <div class="backend-slot backend-slot--certification" data-card-slot="certification-card">Certification card</div>
            </div>
        `;
        grid.appendChild(article);
        showToast('Certification ajoutée.');
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
        showToast('Élément retiré.');
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
            const initials = window.prompt('Initiales à afficher dans le rond avatar :', 'JT');
            if (initials && initials.trim()) {
                const avatarEl = $('#profileAvatar');
                if (avatarEl) avatarEl.textContent = initials.trim().slice(0, 3).toUpperCase();
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
            return;
        }

        if (button?.id === 'logoutButton') {
            API?.logout();
            return;
        }

        const slot = event.target.closest('.backend-slot');
        if (slot) {
            fillBackendSlot(slot);
        }
    });

    document.addEventListener('input', event => {
        if (event.target.matches('.headline-input')) {
            updateHeadlineCounter();
        }
        if (event.target.matches('[data-word-counter]')) {
            updateWordCounter(event.target);
        }
        if (event.target.closest('[data-entry]') || event.target.closest('.skill-row') || event.target.closest('[aria-label="Languages"]')) {
            updateProfileMetaSummary();
        }
    });

    // ─── Initialisation Sécurisée sans Blocage ────────────────
    (async () => {
        try {
            updateHeadlineCounter();
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
            title: 'Sélectionner une Organisation',
            placeholder: 'Rechercher une entreprise...',
            searchEndpoint: '/organizations',
            cardEndpointPrefix: '/cards/organization/',
            displayProp: 'name',
            subProp: 'subtype',
            toastSuccess: 'Carte d\'organisation mise à jour !'
        },
        'product-card': {
            title: 'Sélectionner un Produit/Service',
            placeholder: 'Rechercher un produit ou service...',
            searchEndpoint: '/subjects',
            cardEndpointPrefix: '/cards/product/',
            displayProp: 'name',
            subProp: 'category',
            toastSuccess: 'Carte de produit mise à jour !'
        },
        'role-card': {
            title: 'Sélectionner un Rôle/Poste',
            placeholder: 'Rechercher un rôle...',
            searchEndpoint: '/jobs',
            cardEndpointPrefix: '/cards/job/',
            displayProp: 'title',
            subProp: 'category',
            toastSuccess: 'Carte de rôle mise à jour !'
        },
        'brand-card': {
            title: 'Sélectionner une Marque',
            placeholder: 'Rechercher une marque...',
            searchEndpoint: '/subjects',
            cardEndpointPrefix: '/cards/product/',
            displayProp: 'name',
            subProp: 'category',
            toastSuccess: 'Carte de marque mise à jour !'
        },
        'client-card': {
            title: 'Sélectionner un Secteur / Industrie',
            placeholder: 'Rechercher une industrie...',
            searchEndpoint: '/industries',
            cardEndpointPrefix: '/cards/industry/',
            displayProp: 'name',
            subProp: 'description',
            toastSuccess: 'Carte de secteur mise à jour !'
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
                        <h3>Sélectionner une Organisation</h3>
                        <button type="button" class="org-modal-close js-close-org-modal" aria-label="Fermer">&times;</button>
                    </div>
                    <div class="org-modal-body">
                        <div class="org-search-wrapper">
                            <input type="text" id="orgSearchInput" class="org-search-input" placeholder="Rechercher une entreprise..." autocomplete="off" />
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
            resultsList.innerHTML = '<li class="org-result-loading">Recherche en cours...</li>';
            resultsList.hidden = false;

            const data = await API.apiFetch('GET', config.searchEndpoint, null, { name: query });

            resultsList.innerHTML = '';

            if (!data || data.length === 0) {
                resultsList.innerHTML = '<li class="org-result-empty">Aucun résultat trouvé</li>';
                return;
            }

            data.forEach(item => {
                const li = document.createElement('li');
                li.className = 'org-result-item';
                
                const displayText = item[config.displayProp] || '';
                const subText = item[config.subProp] || '';

                li.innerHTML = `
                    <div class="org-item-name">${escapeHtml(displayText)}</div>
                    ${subText ? `<div class="org-item-sub">${escapeHtml(subText)}</div>` : ''}
                `;
                li.addEventListener('click', () => selectOrganization(item.id));
                resultsList.appendChild(li);
            });
        } catch (err) {
            console.error('Erreur lors de la recherche :', err);
            resultsList.innerHTML = '<li class="org-result-error">Erreur de chargement</li>';
        }
    }

    async function selectOrganization(orgId) {
        const slotToUpdate = targetSlotForModal;

        if (!slotToUpdate) {
            console.error("Erreur : Aucun emplacement (slot) valide n'a été trouvé.");
            showToast("Erreur : Emplacement introuvable.", 'error');
            closeOrgModal();
            return;
        }

        const slotType = slotToUpdate.dataset.cardSlot;
        const config = SLOT_MAPPING[slotType] || SLOT_MAPPING['company-card'];

        // On réinitialise la globale et on ferme la modale
        targetSlotForModal = null;
        closeOrgModal();
        showToast('Chargement de la carte...');

        try {
            // Appel API direct vers la route carte
            const response = await API.apiFetch('GET', `${config.cardEndpointPrefix}${orgId}`);
            console.log('Réponse API card :', response);

            // On récupère le contenu HTML (soit response.message, soit la string directement)
            const htmlCard = typeof response === 'string' ? response : (response?.message || response?.html || '');

            if (!htmlCard) {
                throw new Error("L'API a renvoyé un contenu vide.");
            }

            slotToUpdate.classList.add('is-filled');
            
            if (slotType === 'company-card') {
                slotToUpdate.dataset.orgId = orgId;
            } else if (slotType === 'product-card' || slotType === 'brand-card') {
                slotToUpdate.dataset.productId = orgId;
            } else if (slotType === 'role-card') {
                slotToUpdate.dataset.roleId = orgId;
            } else if (slotType === 'client-card') {
                slotToUpdate.dataset.industryId = orgId;
            }

            const iframe = document.createElement('iframe');
            iframe.className = 'org-card-frame';
            iframe.sandbox = 'allow-same-origin';

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
                    </style>
                </head>
                <body>
                    <div class="scale-wrap" id="scaleWrap">${htmlCard}</div>
                </body>
                </html>
            `;

            iframe.addEventListener('load', () => {
                try {
                    const doc = iframe.contentDocument;
                    const wrap = doc.getElementById('scaleWrap');
                    if (!wrap) return;

                    const cardWidth = wrap.scrollWidth;
                    const cardHeight = wrap.scrollHeight;
                    const containerWidth = iframe.clientWidth;

                    // On remplit la largeur disponible (avec une petite marge)
                    const padding = 16; // 8px de marge de chaque côté
                    const availableWidth = containerWidth - padding;
                    const scale = Math.min(availableWidth / cardWidth, 1);
                    const scaledHeight = cardHeight * scale;

                    wrap.style.transform = `scale(${scale})`;
                    wrap.style.top = `${padding / 2}px`;
                    wrap.style.left = `${(containerWidth - cardWidth * scale) / 2}px`;

                    // La hauteur du slot s'ajuste à la carte réduite (avec un plafond de 550px pour afficher en entier)
                    const finalHeight = Math.min(scaledHeight + padding, 550);
                    iframe.style.height = `${finalHeight}px`;
                    slotToUpdate.style.minHeight = `${finalHeight}px`;
                } catch (err) {
                    console.error('Erreur de calcul du scale de la carte :', err);
                }
            });

            slotToUpdate.innerHTML = '';
            slotToUpdate.appendChild(iframe);

            showToast(config.toastSuccess);

        } catch (err) {
            console.error('Erreur récupération carte HTML :', err);
            showToast('Erreur lors du chargement de la carte.', 'error');
        }
    }

    function escapeHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
})();