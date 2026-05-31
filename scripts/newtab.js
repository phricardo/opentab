// Compatibility: prefer browser.* for Firefox, fall back to chrome.* for others
const ext = (typeof browser !== 'undefined') ? browser : (typeof chrome !== 'undefined' ? chrome : null);
const EXTENSION_SEARCH_PAGE = 'pages/search.html';
const LOCAL_SEARCH_PAGE = 'search.html';

function getLocalSearchUrl() {
  if (ext && ext.runtime && typeof ext.runtime.getURL === 'function') {
    return ext.runtime.getURL(EXTENSION_SEARCH_PAGE);
  }
  return LOCAL_SEARCH_PAGE;
}

function ensureProtocol(url) {
  // If URL doesn't have a scheme, prepend https://
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
    return 'https://' + url;
  }
  return url;
}

function redirectTo(url) {

  try {
    try { window.focus(); } catch (e) {}
    try {
      // Focus the document.body if possible
      if (document && document.body && typeof document.body.focus === 'function') {
        document.body.tabIndex = document.body.tabIndex || -1;
        document.body.focus();
      }
    } catch (e) {}

    let _tmp = null;
    try {
      _tmp = document.createElement('button');
      _tmp.style.position = 'fixed';
      _tmp.style.left = '-9999px';
      _tmp.style.width = '1px';
      _tmp.style.height = '1px';
      _tmp.tabIndex = 0;
      document.body && document.body.appendChild(_tmp);
      try { _tmp.focus(); } catch (e) {}
    } catch (e) {
      _tmp = null;
    }

    
    let fallbackTimer = null;
    const doFallback = () => {
      try { window.location.replace(url); } catch (e) { window.location.href = url; }
    };

    try {
      if (ext && ext.runtime && ext.runtime.sendMessage) {
        // Start a fallback timer in case the background doesn't respond
        fallbackTimer = setTimeout(doFallback, 350);

        // browser.* returns a promise
        if (typeof browser !== 'undefined') {
          try {
            ext.runtime.sendMessage({ type: 'navigate', url: url }).then((resp) => {
              try { if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; } } catch (e) {}
            }).catch(() => { /* on failure, fallback timer will fire */ });
          } catch (e) { /* ignore and let fallback run */ }
        } else {
          // chrome.* callback form
          try {
            ext.runtime.sendMessage({ type: 'navigate', url: url }, (resp) => {
              try {
                if (ext.runtime && ext.runtime.lastError) {
                  // lastError indicates failure; let fallback happen
                } else {
                  if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }
                }
              } catch (e) {}
            });
          } catch (e) { /* ignore and let fallback run */ }
        }
      } else {
        // No background messaging available - fall back immediately.
        doFallback();
      }
    } catch (e) {
      try { doFallback(); } catch (e) {}
    }

    // Clean up the temporary element after a short time
    setTimeout(() => { try { if (_tmp && _tmp.parentNode) _tmp.parentNode.removeChild(_tmp); } catch (e) {} }, 2000);
  } catch (e) {
    try{ window.location.replace(url);}catch(e){window.location.href=url;}
  }
}

// Fast-path: try synchronous read from localStorage (very fast, no async delay)
try {
  const cached = localStorage.getItem('customUrl');
  if (cached && String(cached).trim()) {
    redirectTo(ensureProtocol(String(cached).trim()));
  } else {
    // Fallback to storage.sync (async) if no cached value
    if (ext && ext.storage && ext.storage.sync) {
      if (typeof browser !== 'undefined') {
        ext.storage.sync.get(['customUrl']).then((result) => {
          const url = (result && result.customUrl) ? String(result.customUrl).trim() : '';
          if (url) {
            try { localStorage.setItem('customUrl', url); } catch (e) {}
            redirectTo(ensureProtocol(url));
          } else {
            redirectTo(getLocalSearchUrl());
          }
        }).catch(() => redirectTo(getLocalSearchUrl()));
      } else {
        ext.storage.sync.get(['customUrl'], (result) => {
          const url = (result && result.customUrl) ? String(result.customUrl).trim() : '';
          if (url) {
            try { localStorage.setItem('customUrl', url); } catch (e) {}
            redirectTo(ensureProtocol(url));
          } else {
            redirectTo(getLocalSearchUrl());
          }
        });
      }
    } else {
      // If storage API isn't available, fall back to the local search page.
      redirectTo(getLocalSearchUrl());
    }
  }
} catch (e) {
  // If localStorage access throws for any reason, fall back to async storage.
  if (ext && ext.storage && ext.storage.sync) {
    if (typeof browser !== 'undefined') {
      ext.storage.sync.get(['customUrl']).then((result) => {
        const url = (result && result.customUrl) ? String(result.customUrl).trim() : '';
        if (url) redirectTo(ensureProtocol(url)); else redirectTo(getLocalSearchUrl());
      }).catch(() => redirectTo(getLocalSearchUrl()));
    } else {
      ext.storage.sync.get(['customUrl'], (result) => {
        const url = (result && result.customUrl) ? String(result.customUrl).trim() : '';
        if (url) redirectTo(ensureProtocol(url)); else redirectTo(getLocalSearchUrl());
      });
    }
  } else {
    redirectTo(getLocalSearchUrl());
  }
}
