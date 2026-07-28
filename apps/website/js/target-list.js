/*
 * Target List — My Target Companies & Opportunities
 *
 * Ce script gère :
 *  1. Le filtre de recherche local (par ville/nom)
 *  2. Le chargement des cartes HTML depuis l'API
 *     GET /api/cards/organization/{id}
 *     GET /api/cards/country/{id}
 *     GET /api/cards/city/{id}
 *
 * Les cartes backend (`.backend-slot[data-card-id]`) sont automatiquement
 * remplies avec le HTML retourné par le serveur.
 *
 * Usage :
 *   <div class="backend-slot" data-card-type="organization" data-card-id="pekamix-global"></div>
 *   <div class="backend-slot" data-card-type="country" data-card-id="JP"></div>
 */

document.addEventListener('DOMContentLoaded', async () => {
    const API = window.BildyxAPI || null;

    // ─── Filtre de recherche ──────────────────────────────────
    const input = document.querySelector('#targetCity');
    const cards = Array.from(document.querySelectorAll('.tl-info-card'));
    const rows = Array.from(document.querySelectorAll('.tl-card-row'));

    if (input) {
        const filterCards = () => {
            const query = input.value.trim().toLowerCase();

            cards.forEach((card) => {
                const searchable = `${card.dataset.city || ''} ${card.dataset.name || ''} ${card.textContent}`.toLowerCase();
                card.hidden = query.length > 0 && !searchable.includes(query);
            });

            rows.forEach((row) => {
                const visibleCards = Array.from(row.querySelectorAll('.tl-info-card')).filter((card) => !card.hidden);
                row.classList.toggle('is-empty', visibleCards.length === 0);
            });
        };

        input.addEventListener('input', filterCards);
    }

    // ─── Chargement des cartes API ────────────────────────────
    if (!API) return;

    /**
     * Charge le HTML d'une carte depuis l'API et l'insère dans le slot.
     *
     * @param {HTMLElement} slot     - L'élément `.backend-slot`
     * @param {string}      type     - 'organization' | 'country' | 'city' | 'skill' | 'job' | 'university' | 'industry' | 'certification' | 'product' | 'subject'
     * @param {string}      id       - Identifiant (uuid, iso_code, slug, serial_number…)
     * @param {boolean}     extended - Pour les cartes pays, affichage étendu
     */
    async function loadCard(slot, type, id, extended = false) {
        slot.textContent = '...';
        try {
            const params = extended ? '?extended=true' : '';
            const resp = await fetch(
                `${API.API_BASE}/cards/${encodeURIComponent(type)}/${encodeURIComponent(id)}${params}`,
                { credentials: 'include' }
            );

            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status}`);
            }

            const html = await resp.text();

            // Créer un wrapper et insérer le HTML de la carte
            const wrapper = document.createElement('div');
            wrapper.className = 'api-card-wrapper';
            wrapper.innerHTML = html;
            slot.replaceWith(wrapper);
        } catch (err) {
            console.warn(`[target-list.js] Could not load card ${type}/${id}:`, err.message);
            slot.textContent = `⚠ ${type}/${id}`;
            slot.classList.add('is-error');
        }
    }

    // Chercher tous les slots avec des attributs data-card-type et data-card-id
    const cardSlots = document.querySelectorAll('.backend-slot[data-card-type][data-card-id]');

    const loadPromises = Array.from(cardSlots).map(slot => {
        const type = slot.dataset.cardType;
        const id = slot.dataset.cardId;
        const extended = slot.dataset.extended === 'true';
        return loadCard(slot, type, id, extended);
    });

    if (loadPromises.length > 0) {
        await Promise.allSettled(loadPromises);
    }
});
