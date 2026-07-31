import { CardService } from "../services/card.service";

const cardService = new CardService();

document.addEventListener('DOMContentLoaded', async () => {
    // ─── Filtre de recherche ──────────────────────────────────
    const input = document.querySelector('#targetCity') as HTMLInputElement | null;
    const cards = Array.from(document.querySelectorAll('.tl-info-card')) as HTMLElement[];
    const rows = Array.from(document.querySelectorAll('.tl-card-row')) as HTMLElement[];

    if (input) {
        const filterCards = () => {
            const query = input.value.trim().toLowerCase();

            cards.forEach((card) => {
                const searchable = `${card.dataset.city || ''} ${card.dataset.name || ''} ${card.textContent}`.toLowerCase();
                card.hidden = query.length > 0 && !searchable.includes(query);
            });

            rows.forEach((row) => {
                const visibleCards = Array.from(row.querySelectorAll('.tl-info-card')).filter((card) => !(card as HTMLElement).hidden);
                row.classList.toggle('is-empty', visibleCards.length === 0);
            });
        };

        input.addEventListener('input', filterCards);
    }

    // ─── Chargement des cartes API ────────────────────────────
    /**
     * Charge le HTML d'une carte depuis l'API et l'insère dans le slot.
     */
    async function loadCard(slot: HTMLElement, type: string, id: string, extended = false) {
        slot.textContent = '...';
        try {
            const extParam = extended ? 'true' : 'false';
            let html = '';

            switch (type) {
                case 'country':
                    html = await cardService.getCountry(id, extParam);
                    break;
                case 'city':
                    html = await cardService.getCity(id, extParam);
                    break;
                case 'job':
                    html = await cardService.getJob(id, extParam);
                    break;
                case 'organization':
                    html = await cardService.getOrganization(id, extParam);
                    break;
                case 'university':
                    html = await cardService.getOrganization(id, extParam);
                    break;
                case 'skill':
                    html = await cardService.getSkill(id, extParam);
                    break;
                case 'industry':
                    html = await cardService.getIndustry(id, extParam);
                    break;
                case 'certification':
                    html = await cardService.getCertification(id, extParam);
                    break;
                case 'subject':
                    html = await cardService.getSubject(id, extParam);
                    break;
                case 'degree':
                    html = await cardService.getDegree(id, extParam);
                    break;
                default:
                    throw new Error(`Unsupported card type: ${type}`);
            }

            // Créer un wrapper et insérer le HTML de la carte
            const wrapper = document.createElement('div');
            wrapper.className = 'api-card-wrapper';
            wrapper.innerHTML = html;
            slot.replaceWith(wrapper);
        } catch (err: any) {
            console.warn(`[target-list.ts] Could not load card ${type}/${id}:`, err.message);
            slot.textContent = `⚠ ${type}/${id}`;
            slot.classList.add('is-error');
        }
    }

    // Chercher tous les slots avec des attributs data-card-type et data-card-id
    const cardSlots = document.querySelectorAll('.backend-slot[data-card-type][data-card-id]');

    const loadPromises = Array.from(cardSlots).map(element => {
        const slot = element as HTMLElement;
        const type = slot.dataset.cardType || '';
        const id = slot.dataset.cardId || '';
        const extended = slot.dataset.extended === 'true';
        return loadCard(slot, type, id, extended);
    });

    if (loadPromises.length > 0) {
        await Promise.allSettled(loadPromises);
    }
});
