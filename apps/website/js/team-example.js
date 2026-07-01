(() => {
    'use strict';

    const teams = {
        alpha: {
            label: 'Team Alpha',
            members: [
                ['Michael', 'VP Marketing'], ['Amelia', 'Product Manager'], ['Carlos', 'Lead Engineer'], ['Hana', 'UX Designer'],
                ['Ethan', 'Data Analyst'], ['Naomi', 'QA Lead'], ['Clara', 'Scrum Master'], ['Omar', 'DevOps Engineer'],
                ['Priya', 'Backend Developer'], ['Akira', 'Frontend Developer'], ['Elena', 'Operations Manager'], ['Diego', 'Customer Success']
            ],
            products: ['Marketing Software', 'ERP Systems', 'Sales Software', 'Cloud Infrastructure', 'Data Analytics'],
            people: [
                ['♙ Who We Are', 'A mix of senior and emerging talent from startups and global tech. Some with traditional degrees, others self-taught.'],
                ["☆ What We're Great At", 'Strong in system design and fast shipping. We value clean code and clear UX.'],
                ['♡ Team Culture', 'Collaborative, low politics. Friendly, not forced. Occasional dinners, strong boundaries.'],
                ['◇ How We Work Together', 'Hybrid across three cities. Async-first, minimal meetings. Slack and Notion for most communication.'],
                ['△ This team is NOT for you if...', 'You prefer rigid routines or dislike shifting priorities mid-sprint.', true]
            ],
            operate: [
                ["◇ How We're Led", 'Clear ownership, high trust, and direct feedback.'],
                ['☆ What We Are Solving Now', 'Scaling the platform while keeping the user experience simple.'],
                ['▣ A Typical Day', 'Deep work blocks, short syncs, and protected time for collaboration.'],
                ['♡ What We Value', 'Curiosity, accountability, and kindness under pressure.'],
                ['↗ Growth Here', 'Mentorship, internal mobility, and visible impact.']
            ]
        },
        beta: {
            label: 'Team Beta',
            members: [
                ['Elena', 'Engineering Manager'], ['Omar', 'Senior Backend Dev'], ['Hana', 'Product Designer'], ['Diego', 'Mobile Developer'],
                ['Naomi', 'Data Engineer'], ['Akira', 'ML Engineer'], ['Clara', 'Technical Writer'], ['Michael', 'Growth Lead']
            ],
            products: ['Search Engine Software', 'Data Analytics', 'AI Software'],
            people: [
                ['♙ Who We Are', 'Backend-heavy engineers with ML expertise, distributed across two time zones.'],
                ["☆ What We're Great At", 'Reliable data pipelines, model delivery, and fast experiments.'],
                ['♡ Team Culture', 'Data-driven, candid, and generous with knowledge.'],
                ['◇ How We Work Together', 'Mostly remote with written decisions and focused weekly syncs.'],
                ['△ This team is NOT for you if...', 'You need constant guidance or avoid ambiguity.', true]
            ],
            operate: [
                ["◇ How We're Led", 'Flat hierarchy with strong technical direction.'],
                ['☆ What We Are Solving Now', 'Recommendation quality, model latency, and reusable data tooling.'],
                ['▣ A Typical Day', 'Training reviews, pairing, and independent research blocks.'],
                ['♡ What We Value', 'Reproducibility, intellectual honesty, and useful documentation.'],
                ['↗ Growth Here', 'Conference support, paper reading groups, and clear IC tracks.']
            ]
        },
        gamma: null,
        delta: null
    };

    teams.gamma = {...teams.alpha, label: 'Team Gamma'};
    teams.delta = {...teams.beta, label: 'Team Delta'};

    const offices = ['Tokyo', 'New York', 'Istanbul', 'Seattle', 'Kuala Lumpur', 'San Francisco'];
    let currentTeam = 'alpha';
    let currentMode = 'people';

    const membersEl = document.getElementById('teMembers');
    const officesEl = document.getElementById('teOffices');
    const productsEl = document.getElementById('teProducts');
    const badgeEl = document.getElementById('teTeamBadge');
    const pointsEl = document.getElementById('teProfilePoints');

    const renderMembers = (members) => {
        membersEl.innerHTML = members.map(([name, role]) => `
            <article class="te-member-card">
                <span class="te-member-avatar" aria-hidden="true"></span>
                <div>
                    <div class="te-member-name">${name}</div>
                    <div class="te-member-role">${role}</div>
                </div>
            </article>
        `).join('');
    };

    const renderOffices = () => {
        officesEl.innerHTML = offices.map((office, index) => `
            <div class="te-office${index === 3 ? ' is-active' : ''}">
                <span class="te-office-dot" aria-hidden="true"></span>
                <span>${office}</span>
            </div>
        `).join('');
    };

    const renderProducts = (products) => {
        productsEl.innerHTML = products.map((product, index) => `
            <button class="te-product-chip${index === 0 ? ' is-active' : ''}" type="button">
                <span aria-hidden="true">▣</span>${product}
            </button>
        `).join('');
    };

    const renderProfile = () => {
        const team = teams[currentTeam];
        const points = team[currentMode];
        badgeEl.textContent = team.label;
        pointsEl.innerHTML = points.map(([title, text, warning]) => `
            <section class="te-profile-point${warning ? ' is-warning' : ''}">
                <h3>${title}</h3>
                <p>${text}</p>
            </section>
        `).join('');
    };

    const renderTeam = () => {
        const team = teams[currentTeam];
        renderMembers(team.members);
        renderProducts(team.products);
        renderProfile();
    };

    document.querySelectorAll('.te-team-tab').forEach((button) => {
        button.addEventListener('click', () => {
            currentTeam = button.dataset.team;
            document.querySelectorAll('.te-team-tab').forEach((tab) => {
                const active = tab === button;
                tab.classList.toggle('is-active', active);
                tab.setAttribute('aria-selected', String(active));
            });
            renderTeam();
        });
    });

    document.querySelectorAll('.te-profile-button').forEach((button) => {
        button.addEventListener('click', () => {
            currentMode = button.dataset.profileMode;
            document.querySelectorAll('.te-profile-button').forEach((profileButton) => {
                const active = profileButton === button;
                profileButton.classList.toggle('is-active', active);
                profileButton.setAttribute('aria-pressed', String(active));
            });
            renderProfile();
        });
    });

    // Backend helper: inject a generated card or carousel into any reserved slot.
    window.BildyxTeamExample = {
        mountCard(slotId, html) {
            const slot = document.getElementById(slotId);
            if (!slot) return false;
            slot.innerHTML = html;
            slot.classList.add('has-content');
            return true;
        },
        clearCard(slotId) {
            const slot = document.getElementById(slotId);
            if (!slot) return false;
            slot.replaceChildren();
            slot.classList.remove('has-content');
            return true;
        }
    };

    renderOffices();
    renderTeam();
})();
