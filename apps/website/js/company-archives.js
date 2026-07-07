(() => {
  'use strict';

  window.BildyxCompanyArchives = {
    mount(slotName, html) {
      const slot = document.querySelector(`[data-card-slot="${slotName}"]`);
      if (!slot) return false;
      slot.innerHTML = html;
      return true;
    },
    clear(slotName) {
      const slot = document.querySelector(`[data-card-slot="${slotName}"]`);
      if (!slot) return false;
      slot.replaceChildren();
      return true;
    }
  };
})();
