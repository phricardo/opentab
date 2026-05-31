const ext = (typeof browser !== 'undefined') ? browser : (typeof chrome !== 'undefined' ? chrome : null);

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
