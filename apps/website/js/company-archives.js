(() => {
  const mount = (selector, html) => {
    const target = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!target) return false;
    target.innerHTML = html;
    return true;
  };

  window.BildyxCompanyArchives = { mount };
})();
