
const ext = (typeof browser !== 'undefined') ? browser : (typeof chrome !== 'undefined' ? chrome : null);
const LOCAL_SEARCH_PAGE = 'pages/search.html';

function getLocalSearchUrl() {
  if (ext && ext.runtime && typeof ext.runtime.getURL === 'function') {
    return ext.runtime.getURL(LOCAL_SEARCH_PAGE);
  }
  return LOCAL_SEARCH_PAGE;
}

function ensureProtocol(url) {
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
    return 'https://' + url;
  }
  return url;
}

function storageGet(keys) {
  return new Promise((resolve) => {
    try {
      if (!ext || !ext.storage || !ext.storage.sync) {
        resolve({});
        return;
      }

      if (typeof browser !== 'undefined') {
        ext.storage.sync.get(keys).then(resolve).catch(() => resolve({}));
        return;
      }

      ext.storage.sync.get(keys, (result) => {
        resolve(result || {});
      });
    } catch (e) {
      resolve({});
    }
  });
}

function tabsQuery(queryInfo) {
  return new Promise((resolve) => {
    try {
      if (!ext || !ext.tabs || !ext.tabs.query) {
        resolve([]);
        return;
      }

      if (typeof browser !== 'undefined') {
        ext.tabs.query(queryInfo).then(resolve).catch(() => resolve([]));
        return;
      }

      ext.tabs.query(queryInfo, (tabs) => {
        resolve(tabs || []);
      });
    } catch (e) {
      resolve([]);
    }
  });
}

function tabsUpdate(tabId, updateProperties) {
  return new Promise((resolve) => {
    try {
      if (!ext || !ext.tabs || !ext.tabs.update || typeof tabId !== 'number') {
        resolve(null);
        return;
      }

      if (typeof browser !== 'undefined') {
        ext.tabs.update(tabId, updateProperties).then(resolve).catch(() => resolve(null));
        return;
      }

      ext.tabs.update(tabId, updateProperties, (tab) => {
        resolve(tab || null);
      });
    } catch (e) {
      resolve(null);
    }
  });
}

function tabsCreate(createProperties) {
  return new Promise((resolve) => {
    try {
      if (!ext || !ext.tabs || !ext.tabs.create) {
        resolve(null);
        return;
      }

      if (typeof browser !== 'undefined') {
        ext.tabs.create(createProperties).then(resolve).catch(() => resolve(null));
        return;
      }

      ext.tabs.create(createProperties, (tab) => {
        resolve(tab || null);
      });
    } catch (e) {
      resolve(null);
    }
  });
}

function tabsRemove(tabIds) {
  return new Promise((resolve) => {
    try {
      if (!ext || !ext.tabs || !ext.tabs.remove || !tabIds || !tabIds.length) {
        resolve();
        return;
      }

      if (typeof browser !== 'undefined') {
        ext.tabs.remove(tabIds).then(resolve).catch(() => resolve());
        return;
      }

      ext.tabs.remove(tabIds, () => {
        resolve();
      });
    } catch (e) {
      resolve();
    }
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getStartupTargetUrl() {
  const result = await storageGet(['customUrl']);
  const url = (result && result.customUrl) ? String(result.customUrl).trim() : '';
  return url ? ensureProtocol(url) : getLocalSearchUrl();
}

async function isStartupSearchEnabled() {
  const result = await storageGet(['startupSearchEnabled']);
  const value = result ? result.startupSearchEnabled : undefined;

  return value === false || value === 'false' ? false : true;
}

async function findStartupTab() {
  let tabs = await tabsQuery({ active: true, currentWindow: true });
  if (tabs && tabs[0]) return tabs[0];

  tabs = await tabsQuery({ active: true });
  if (tabs && tabs[0]) return tabs[0];

  tabs = await tabsQuery({});
  return (tabs && tabs[0]) ? tabs[0] : null;
}

async function keepOnlyStartupTab(startupTab) {
  if (!startupTab || typeof startupTab.windowId !== 'number' || typeof startupTab.id !== 'number') {
    return;
  }

  const windowTabs = await tabsQuery({ windowId: startupTab.windowId });
  const tabIdsToClose = (windowTabs || [])
    .filter((tab) => tab && typeof tab.id === 'number' && tab.id !== startupTab.id)
    .map((tab) => tab.id);

  await tabsRemove(tabIdsToClose);
}

async function handleStartupNavigation() {
  try {
    if (!(await isStartupSearchEnabled())) return;

    await delay(300);

    const targetUrl = await getStartupTargetUrl();
    let startupTab = await findStartupTab();

    if (startupTab && typeof startupTab.id === 'number') {
      startupTab = await tabsUpdate(startupTab.id, { url: targetUrl, active: true }) || startupTab;
      await keepOnlyStartupTab(startupTab);
      return;
    }

    startupTab = await tabsCreate({ url: targetUrl, active: true });
    await keepOnlyStartupTab(startupTab);
  } catch (e) {
    // Ignore startup navigation failures so the extension does not block browser startup.
  }
}

function openOptionsInTab() {
  try {
    if (ext && ext.runtime && ext.runtime.openOptionsPage) {
      
      try { ext.runtime.openOptionsPage(); return; } catch (e) { /* fall back */ }
    }
  } catch (e) {
    // ignore and fall back
  }

  try {
    const url = (ext && ext.runtime && ext.runtime.getURL) ? ext.runtime.getURL('pages/options.html') : 'pages/options.html';
    if (ext && ext.tabs && ext.tabs.create) {
      
      try { ext.tabs.create({ url: url }); return; } catch (e) {}
    }
    
    if (self && self.clients && self.clients.openWindow) {
      self.clients.openWindow(url);
    }
  } catch (e) {
   
  }
}


if (ext && ext.action && ext.action.onClicked) {
  
  try { ext.action.onClicked.addListener(openOptionsInTab); } catch (e) {}
}

if (ext && ext.runtime && ext.runtime.onStartup) {
  try {
    ext.runtime.onStartup.addListener(() => {
      handleStartupNavigation();
    });
  } catch (e) {}
}

if (ext && ext.runtime && ext.runtime.onMessage) {
  try {
    ext.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!message || message.type !== 'navigate' || !message.url) return;

      const targetUrl = String(message.url || '');

      try {
        const createAndCloseSender = (senderTabId) => {
          try {
            if (ext.tabs && ext.tabs.create) {
              // Create a new active tab with the target URL
              const createTab = (opts) => {
                try {
                  const p = ext.tabs.create(opts);
                  if (p && typeof p.then === 'function') {
                    p.then((createdTab) => {
                      try {
                        // Focus the window if possible
                        if (createdTab && createdTab.windowId && ext.windows && ext.windows.update) {
                          try { ext.windows.update(createdTab.windowId, { focused: true }); } catch (e) {}
                        }
                        // Close the original sender tab if provided
                        if (typeof senderTabId === 'number' && ext.tabs && ext.tabs.remove) {
                          try { ext.tabs.remove(senderTabId); } catch (e) {}
                        }
                      } catch (e) {}
                    }).catch(() => {
                      // ignore
                    });
                  } else {
                    // Callback form
                    ext.tabs.create(opts, (createdTab) => {
                      try {
                        if (createdTab && createdTab.windowId && ext.windows && ext.windows.update) {
                          try { ext.windows.update(createdTab.windowId, { focused: true }); } catch (e) {}
                        }
                        if (typeof senderTabId === 'number' && ext.tabs && ext.tabs.remove) {
                          try { ext.tabs.remove(senderTabId); } catch (e) {}
                        }
                      } catch (e) {}
                    });
                  }
                } catch (e) {
                  // fallback to clients.openWindow
                  try { if (self && self.clients && self.clients.openWindow) self.clients.openWindow(targetUrl); } catch (e) {}
                }
              };

              createTab({ url: targetUrl, active: true });
              return true;
            }
          } catch (e) {}
          return false;
        };

        const senderTabId = (sender && sender.tab && typeof sender.tab.id === 'number') ? sender.tab.id : null;

        
        if (createAndCloseSender(senderTabId)) {
          // we've initiated create/close; done
        } else {
          // fallback: update current active tab
          if (ext.tabs && ext.tabs.query) {
            try {
              const p = ext.tabs.query({ active: true, currentWindow: true });
              if (p && typeof p.then === 'function') {
                p.then((tabs) => { if (tabs && tabs[0] && ext.tabs.update) ext.tabs.update(tabs[0].id, { url: targetUrl }); }).catch(() => {});
              } else {
                ext.tabs.query({ active: true, currentWindow: true }, (tabs) => { if (tabs && tabs[0] && ext.tabs.update) ext.tabs.update(tabs[0].id, { url: targetUrl }); });
              }
            } catch (e) {
              try { ext.tabs.query({ active: true, currentWindow: true }, (tabs) => { if (tabs && tabs[0] && ext.tabs.update) ext.tabs.update(tabs[0].id, { url: targetUrl }); }); } catch (e) {}
            }
          } else {
            // last resort
            try { if (self && self.clients && self.clients.openWindow) self.clients.openWindow(targetUrl); } catch (e) {}
          }
        }
      } catch (e) {
        try { if (self && self.clients && self.clients.openWindow) self.clients.openWindow(targetUrl); } catch (e) {}
      }

      // Indicate we handled the message (async)
      try { sendResponse && sendResponse({ ok: true }); } catch (e) {}
      return true;
    });
  } catch (e) {}
}
