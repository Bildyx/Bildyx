// @ts-nocheck
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".nav-buttons");

  if (nav) {
    nav.innerHTML = `
            <a class="mre-account-button" href="generic.php?page=account" aria-label="Account">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"></circle>
                    <path d="M5.8 19c.6-3.2 2.8-5 6.2-5s5.6 1.8 6.2 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
                </svg>
            </a>
        `;
  }

  /*
   * Point d'entrée facultatif pour le futur back-end.
   * Exemple : window.BildyxMicroResume.mountCard('experience-company-card', html)
   */
  window.BildyxMicroResume = {
    mountCard(slotId, html) {
      const slot = document.getElementById(slotId);
      if (!slot) return false;
      slot.innerHTML = html;
      return true;
    },
  };
});
