// popup.js - moved from inline script to comply with CSP
(function () {
  const ext = (typeof browser !== 'undefined') ? browser : (typeof chrome !== 'undefined' ? chrome : null);

  function openOptions() {
    try {
      if (ext && ext.runtime && ext.runtime.openOptionsPage) {
        try { ext.runtime.openOptionsPage(); return; } catch (e) {}
      }
    } catch (e) {}
    try {
      const url = (ext && ext.runtime && ext.runtime.getURL) ? ext.runtime.getURL('pages/options.html') : 'pages/options.html';
      window.open(url, '_blank');
    } catch (e) {
      window.open('options.html', '_blank');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('openOptions');
    if (btn) {
      btn.addEventListener('click', () => {
        openOptions();
        try { window.close(); } catch (e) {}
      });
    }
  });
})();
