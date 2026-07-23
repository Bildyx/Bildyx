document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector('#targetCity');
    const cards = Array.from(document.querySelectorAll('.tl-info-card'));
    const rows = Array.from(document.querySelectorAll('.tl-card-row'));

    if (!input) return;

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
});
