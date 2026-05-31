// options.js - handle saving and restoring the custom URL and page preferences
document.addEventListener('DOMContentLoaded', () => {
  const ext = (typeof browser !== 'undefined') ? browser : (typeof chrome !== 'undefined' ? chrome : null);
  const root = document.documentElement;
  const input = document.getElementById('customUrl');
  const saveBtn = document.getElementById('save');
  const clearBtn = document.getElementById('clear');
  const backToSearch = document.getElementById('backToSearch');
  const backToSearchText = document.getElementById('backToSearchText');
  const status = document.getElementById('status');
  const themeSelect = document.getElementById('themeSelect');
  const languageSelect = document.getElementById('languageSelect');
  const searchEngineSelect = document.getElementById('searchEngineSelect');
  const optionsTitle = document.getElementById('optionsTitle');
  const optionsDescription = document.getElementById('optionsDescription');
  const themeSelectLabel = document.getElementById('themeSelectLabel');
  const languageSelectLabel = document.getElementById('languageSelectLabel');
  const searchEngineSelectLabel = document.getElementById('searchEngineSelectLabel');
  const customUrlLabel = document.getElementById('customUrlLabel');
  const logoSectionTitle = document.getElementById('logoSectionTitle');
  const logoSectionDescription = document.getElementById('logoSectionDescription');
  const logoTextInput = document.getElementById('logoText');
  const logoTextLabel = document.getElementById('logoTextLabel');
  const logoImageInput = document.getElementById('logoImageInput');
  const logoImageLabel = document.getElementById('logoImageLabel');
  const logoImageButton = document.getElementById('logoImageButton');
  const logoImageFileName = document.getElementById('logoImageFileName');
  const logoPreviewLabel = document.getElementById('logoPreviewLabel');
  const logoPreview = document.getElementById('logoPreview');
  const customLogoControls = document.getElementById('customLogoControls');
  const removeLogoImageBtn = document.getElementById('removeLogoImage');
  const restoreDefaultLogoBtn = document.getElementById('restoreDefaultLogo');
  const appearanceSectionTitle = document.getElementById('appearanceSectionTitle');
  const appearanceSectionDescription = document.getElementById('appearanceSectionDescription');
  const primaryButtonColorInput = document.getElementById('primaryButtonColor');
  const primaryButtonColorLabel = document.getElementById('primaryButtonColorLabel');
  const resetPrimaryButtonColorBtn = document.getElementById('resetPrimaryButtonColor');
  const primaryButtonPreview = document.getElementById('primaryButtonPreview');
  const showClockToggle = document.getElementById('showClockToggle');
  const showClockToggleLabel = document.getElementById('showClockToggleLabel');
  const resetSectionTitle = document.getElementById('resetSectionTitle');
  const resetSectionDescription = document.getElementById('resetSectionDescription');
  const resetExtensionBtn = document.getElementById('resetExtension');

  const PREFERENCE_KEYS = ['searchTheme', 'searchLanguage', 'searchEngine', 'searchLogoMode', 'searchLogoText', 'searchPrimaryButtonColor', 'searchShowClock'];
  const RESET_LOCAL_KEYS = [
    'customUrl',
    'searchTheme',
    'searchLanguage',
    'searchEngine',
    'searchLogoMode',
    'searchLogoText',
    'searchPrimaryButtonColor',
    'searchShowClock',
    'searchLogoImage',
    'searchShortcuts',
    'searchQueryHistory'
  ];
  const RESET_SYNC_KEYS = [
    'customUrl',
    'searchTheme',
    'searchLanguage',
    'searchEngine',
    'searchLogoMode',
    'searchLogoText',
    'searchPrimaryButtonColor',
    'searchShowClock',
    'searchShortcuts'
  ];
  const MAX_LOGO_IMAGE_SIZE = 512 * 1024;
  const DEFAULTS = {
    searchTheme: 'system',
    searchLanguage: 'browser',
    searchEngine: 'duckduckgo',
    searchLogoMode: 'default',
    searchLogoText: 'OpenTab Search',
    searchPrimaryButtonColor: '',
    searchShowClock: true
  };
  const messages = {
    en: {
      title: 'Extension Options',
      heading: 'Options',
      description: 'Enter a custom URL to open when you open a new tab. Leave empty to use the local search page.',
      themeLabel: 'Theme',
      languageLabel: 'Language',
      searchEngineLabel: 'Search engine',
      back: 'Back',
      customUrlLabel: 'Custom URL',
      customUrlPlaceholder: 'https://example.com or example.com',
      appearanceSectionTitle: 'Appearance',
      appearanceSectionDescription: 'Customize the main search button color.',
      primaryButtonColorLabel: 'Primary button color',
      resetPrimaryButtonColor: 'Restore default',
      primaryButtonPreview: 'Search',
      showClock: 'Show clock',
      logoSectionTitle: 'Logo',
      logoSectionDescription: 'Customize the logo shown on the search page.',
      logoTextLabel: 'Logo text',
      logoTextPlaceholder: 'OpenTab Search',
      logoImageLabel: 'Logo image',
      chooseLogoImage: 'Choose image',
      noLogoImageSelected: 'No image selected',
      logoPreviewLabel: 'Preview',
      logoPreviewAria: 'Logo preview: {name}',
      removeLogoImage: 'Remove image',
      removeDefaultLogo: 'Remove default logo',
      restoreDefaultLogo: 'Restore default logo',
      resetSectionTitle: 'Reset extension',
      resetSectionDescription: 'This removes all extension settings and pinned shortcuts.',
      resetExtension: 'Reset extension',
      resetConfirm: 'Reset all extension settings? This cannot be undone.',
      save: 'Save',
      clear: 'Clear',
      invalidUrl: 'Invalid URL',
      invalidLogoImage: 'Choose a valid image file up to 512 KB',
      invalidLogoText: 'Logo text is required',
      invalidPrimaryButtonColor: 'Choose a valid button color',
      cleared: 'Cleared - using local search page',
      reset: 'Extension reset',
      saved: 'Saved',
      themeOptions: {
        system: 'System',
        light: 'Light',
        dark: 'Dark'
      },
      languageOptions: {
        browser: 'Browser',
        'pt-BR': 'Portugu\u00eas',
        en: 'English'
      },
      searchEngineOptions: {
        duckduckgo: 'DuckDuckGo',
        'google-br': 'Google'
      }
    },
    'pt-BR': {
      title: 'Op\u00e7\u00f5es da extens\u00e3o',
      heading: 'Op\u00e7\u00f5es',
      description: 'Informe uma URL personalizada para abrir em novas abas. Deixe vazio para usar a p\u00e1gina de busca local.',
      themeLabel: 'Tema',
      languageLabel: 'Idioma',
      searchEngineLabel: 'Mecanismo de busca',
      back: 'Voltar',
      customUrlLabel: 'URL personalizada',
      customUrlPlaceholder: 'https://exemplo.com ou exemplo.com',
      appearanceSectionTitle: 'Apar\u00eancia',
      appearanceSectionDescription: 'Personalize a cor do bot\u00e3o principal de busca.',
      primaryButtonColorLabel: 'Cor do bot\u00e3o principal',
      resetPrimaryButtonColor: 'Restaurar padr\u00e3o',
      primaryButtonPreview: 'Buscar',
      showClock: 'Exibir rel\u00f3gio',
      logoSectionTitle: 'Logotipo',
      logoSectionDescription: 'Personalize o logotipo exibido na p\u00e1gina de busca.',
      logoTextLabel: 'Texto do logotipo',
      logoTextPlaceholder: 'OpenTab Search',
      logoImageLabel: 'Imagem do logotipo',
      chooseLogoImage: 'Escolher imagem',
      noLogoImageSelected: 'Nenhuma imagem selecionada',
      logoPreviewLabel: 'Pr\u00e9via',
      logoPreviewAria: 'Pr\u00e9via do logotipo: {name}',
      removeLogoImage: 'Remover imagem',
      removeDefaultLogo: 'Remover logotipo padr\u00e3o',
      restoreDefaultLogo: 'Restaurar logotipo padr\u00e3o',
      resetSectionTitle: 'Redefinir extens\u00e3o',
      resetSectionDescription: 'Isso remove todas as configura\u00e7\u00f5es e atalhos fixados.',
      resetExtension: 'Redefinir extens\u00e3o',
      resetConfirm: 'Redefinir toda a extens\u00e3o? Isso n\u00e3o pode ser desfeito.',
      save: 'Salvar',
      clear: 'Limpar',
      invalidUrl: 'URL inv\u00e1lida',
      invalidLogoImage: 'Escolha uma imagem v\u00e1lida de at\u00e9 512 KB',
      invalidLogoText: 'O texto do logotipo \u00e9 obrigat\u00f3rio',
      invalidPrimaryButtonColor: 'Escolha uma cor de bot\u00e3o v\u00e1lida',
      cleared: 'Limpo - usando a p\u00e1gina de busca local',
      reset: 'Extens\u00e3o redefinida',
      saved: 'Salvo',
      themeOptions: {
        system: 'Sistema',
        light: 'Claro',
        dark: 'Escuro'
      },
      languageOptions: {
        browser: 'Navegador',
        'pt-BR': 'Portugu\u00eas',
        en: 'English'
      },
      searchEngineOptions: {
        duckduckgo: 'DuckDuckGo',
        'google-br': 'Google'
      }
    }
  };

  let preferences = readLocalPreferences();
  let statusTimer = null;

  function showStatus(msg, ok = true) {
    status.textContent = msg;
    status.classList.toggle('is-ok', ok);
    status.classList.toggle('is-error', !ok);

    if (statusTimer) clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      status.textContent = '';
      status.classList.remove('is-ok', 'is-error');
    }, 2500);
  }

  // Helper storage wrappers to support browser (promises) and chrome (callbacks)
  function storageGet(keys, cb) {
    if (ext && ext.storage && ext.storage.sync) {
      if (typeof browser !== 'undefined') {
        ext.storage.sync.get(keys).then(cb).catch(() => cb({}));
      } else {
        ext.storage.sync.get(keys, cb);
      }
    } else {
      cb({});
    }
  }

  function storageSet(obj, cb) {
    if (ext && ext.storage && ext.storage.sync) {
      if (typeof browser !== 'undefined') {
        ext.storage.sync.set(obj).then(() => { if (cb) cb(); }).catch(() => { if (cb) cb(); });
      } else {
        ext.storage.sync.set(obj, cb);
      }
    } else {
      if (cb) cb();
    }
  }

  function storageRemove(keys, cb) {
    if (ext && ext.storage && ext.storage.sync) {
      if (typeof browser !== 'undefined') {
        ext.storage.sync.remove(keys).then(() => { if (cb) cb(); }).catch(() => { if (cb) cb(); });
      } else {
        ext.storage.sync.remove(keys, cb);
      }
    } else {
      if (cb) cb();
    }
  }

  function readLocalPreferences() {
    const values = { ...DEFAULTS };

    try {
      const theme = localStorage.getItem('searchTheme');
      const language = localStorage.getItem('searchLanguage');
      const searchEngine = localStorage.getItem('searchEngine');
      const logoMode = localStorage.getItem('searchLogoMode');
      const logoText = localStorage.getItem('searchLogoText');
      const logoImage = localStorage.getItem('searchLogoImage');
      const primaryButtonColor = localStorage.getItem('searchPrimaryButtonColor');
      const showClock = localStorage.getItem('searchShowClock');

      if (isValidTheme(theme)) values.searchTheme = theme;
      if (isValidLanguage(language)) values.searchLanguage = language;
      if (isValidSearchEngine(searchEngine)) values.searchEngine = searchEngine;
      if (isValidLogoMode(logoMode)) {
        values.searchLogoMode = logoMode;
      } else if (logoImage || (isValidLogoText(logoText) && logoText.trim() !== DEFAULTS.searchLogoText)) {
        values.searchLogoMode = 'custom';
      }
      if (isValidLogoText(logoText)) values.searchLogoText = logoText.trim();
      if (isValidHexColor(primaryButtonColor)) values.searchPrimaryButtonColor = normalizeHexColor(primaryButtonColor);
      if (isValidBooleanString(showClock)) values.searchShowClock = showClock === 'true';
    } catch (e) {}

    return values;
  }

  function savePreferences() {
    try {
      localStorage.setItem('searchTheme', preferences.searchTheme);
      localStorage.setItem('searchLanguage', preferences.searchLanguage);
      localStorage.setItem('searchEngine', preferences.searchEngine);
      localStorage.setItem('searchLogoMode', preferences.searchLogoMode);
      localStorage.setItem('searchLogoText', preferences.searchLogoText);
      if (preferences.searchPrimaryButtonColor) {
        localStorage.setItem('searchPrimaryButtonColor', preferences.searchPrimaryButtonColor);
      } else {
        localStorage.removeItem('searchPrimaryButtonColor');
      }
      localStorage.setItem('searchShowClock', String(preferences.searchShowClock));
    } catch (e) {}

    storageSet(preferences);
  }

  function isValidTheme(theme) {
    return theme === 'system' || theme === 'light' || theme === 'dark';
  }

  function isValidLanguage(language) {
    return language === 'browser' || language === 'pt-BR' || language === 'en';
  }

  function isValidSearchEngine(searchEngine) {
    return searchEngine === 'duckduckgo' || searchEngine === 'google-br';
  }

  function isValidLogoMode(logoMode) {
    return logoMode === 'default' || logoMode === 'custom';
  }

  function isValidLogoText(logoText) {
    return typeof logoText === 'string' && logoText.trim().length > 0;
  }

  function isValidHexColor(color) {
    return typeof color === 'string' && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color.trim());
  }

  function isValidBooleanString(value) {
    return value === 'true' || value === 'false';
  }

  function normalizeHexColor(color) {
    const value = color.trim().toLowerCase();

    if (value.length === 4) {
      return '#' + value[1] + value[1] + value[2] + value[2] + value[3] + value[3];
    }

    return value;
  }

  function getTextColorForBackground(hexColor) {
    const normalized = normalizeHexColor(hexColor);
    const red = parseInt(normalized.slice(1, 3), 16);
    const green = parseInt(normalized.slice(3, 5), 16);
    const blue = parseInt(normalized.slice(5, 7), 16);
    const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;

    return luminance > 0.55 ? '#111111' : '#ffffff';
  }

  function getBrowserLanguage() {
    const languages = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language || 'en'];
    const preferredLanguage = String(languages[0] || 'en').toLowerCase();

    return preferredLanguage.startsWith('pt') ? 'pt-BR' : 'en';
  }

  function getActiveLanguage() {
    return preferences.searchLanguage === 'browser' ? getBrowserLanguage() : preferences.searchLanguage;
  }

  function getSearchUrl() {
    if (ext && ext.runtime && typeof ext.runtime.getURL === 'function') {
      return ext.runtime.getURL('pages/search.html');
    }
    return 'search.html';
  }

  function createDefaultLogoMark() {
    const mark = document.createElement('span');
    mark.className = 'default-logo-mark';
    mark.setAttribute('aria-hidden', 'true');
    return mark;
  }

  function getActiveDefaultPrimaryButtonColor() {
    if (preferences.searchTheme === 'dark') return '#222222';
    if (preferences.searchTheme === 'light') return '#f3f4f6';

    try {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? '#222222'
        : '#f3f4f6';
    } catch (e) {
      return '#f3f4f6';
    }
  }

  function syncPrimaryButtonColorInput() {
    primaryButtonColorInput.value = isValidHexColor(preferences.searchPrimaryButtonColor)
      ? normalizeHexColor(preferences.searchPrimaryButtonColor)
      : getActiveDefaultPrimaryButtonColor();
  }

  function setOptionText(select, value, text) {
    const option = select.querySelector('option[value="' + value + '"]');
    if (option) option.textContent = text;
  }

  function applyTheme() {
    root.dataset.theme = isValidTheme(preferences.searchTheme) ? preferences.searchTheme : DEFAULTS.searchTheme;
  }

  function applyPrimaryButtonColor() {
    if (!isValidHexColor(preferences.searchPrimaryButtonColor)) {
      root.style.removeProperty('--primary-button-bg');
      root.style.removeProperty('--primary-button-border');
      root.style.removeProperty('--primary-button-text');
      root.style.removeProperty('--primary-button-focus');
      root.style.removeProperty('--primary-button-focus-shadow');
      return;
    }

    const color = normalizeHexColor(preferences.searchPrimaryButtonColor);
    root.style.setProperty('--primary-button-bg', color);
    root.style.setProperty('--primary-button-border', color);
    root.style.setProperty('--primary-button-text', getTextColorForBackground(color));
    root.style.setProperty('--primary-button-focus', color);
    root.style.setProperty('--primary-button-focus-shadow', color + '55');
  }

  function getLogoImage() {
    try {
      return localStorage.getItem('searchLogoImage') || '';
    } catch (e) {
      return '';
    }
  }

  function setLogoImage(dataUrl) {
    try {
      if (dataUrl) {
        localStorage.setItem('searchLogoImage', dataUrl);
      } else {
        localStorage.removeItem('searchLogoImage');
      }
    } catch (e) {}
  }

  function applyLogoPreview() {
    const logoImage = getLogoImage();
    const logoText = isValidLogoText(preferences.searchLogoText)
      ? preferences.searchLogoText.trim()
      : DEFAULTS.searchLogoText;
    const isCustomLogo = preferences.searchLogoMode === 'custom';
    const text = currentText();

    logoPreview.replaceChildren();
    logoPreview.setAttribute('aria-label', text.logoPreviewAria.replace('{name}', logoText));

    customLogoControls.hidden = !isCustomLogo;
    restoreDefaultLogoBtn.hidden = !isCustomLogo;
    removeLogoImageBtn.textContent = isCustomLogo ? text.removeLogoImage : text.removeDefaultLogo;
    logoTextInput.required = isCustomLogo;
    logoImageInput.disabled = !isCustomLogo;

    if (!isCustomLogo) {
      logoPreview.appendChild(createDefaultLogoMark());
      return;
    }

    if (logoImage) {
      const image = document.createElement('img');
      image.src = logoImage;
      image.alt = logoText;
      logoPreview.appendChild(image);
      return;
    }

    logoPreview.textContent = logoText;
  }

  function setLogoImageFileName(fileName) {
    const text = currentText();
    logoImageFileName.textContent = fileName || text.noLogoImageSelected;
  }

  function applyLanguage() {
    const language = getActiveLanguage();
    const text = messages[language] || messages.en;

    root.lang = language;
    document.title = text.title;
    optionsTitle.textContent = text.heading;
    optionsDescription.textContent = text.description;
    backToSearchText.textContent = text.back;
    backToSearch.setAttribute('aria-label', text.back);
    themeSelectLabel.textContent = text.themeLabel;
    languageSelectLabel.textContent = text.languageLabel;
    searchEngineSelectLabel.textContent = text.searchEngineLabel;
    customUrlLabel.textContent = text.customUrlLabel;
    input.placeholder = text.customUrlPlaceholder;
    appearanceSectionTitle.textContent = text.appearanceSectionTitle;
    appearanceSectionDescription.textContent = text.appearanceSectionDescription;
    primaryButtonColorLabel.textContent = text.primaryButtonColorLabel;
    resetPrimaryButtonColorBtn.textContent = text.resetPrimaryButtonColor;
    primaryButtonPreview.textContent = text.primaryButtonPreview;
    showClockToggleLabel.textContent = text.showClock;
    logoSectionTitle.textContent = text.logoSectionTitle;
    logoSectionDescription.textContent = text.logoSectionDescription;
    logoTextLabel.textContent = text.logoTextLabel;
    logoTextInput.placeholder = text.logoTextPlaceholder;
    logoImageLabel.textContent = text.logoImageLabel;
    logoImageButton.textContent = text.chooseLogoImage;
    if (!logoImageInput.files || !logoImageInput.files.length) {
      setLogoImageFileName('');
    }
    logoPreviewLabel.textContent = text.logoPreviewLabel;
    restoreDefaultLogoBtn.textContent = text.restoreDefaultLogo;
    resetSectionTitle.textContent = text.resetSectionTitle;
    resetSectionDescription.textContent = text.resetSectionDescription;
    resetExtensionBtn.textContent = text.resetExtension;
    saveBtn.textContent = text.save;
    clearBtn.textContent = text.clear;

    setOptionText(themeSelect, 'system', text.themeOptions.system);
    setOptionText(themeSelect, 'light', text.themeOptions.light);
    setOptionText(themeSelect, 'dark', text.themeOptions.dark);
    setOptionText(languageSelect, 'browser', text.languageOptions.browser);
    setOptionText(languageSelect, 'pt-BR', text.languageOptions['pt-BR']);
    setOptionText(languageSelect, 'en', text.languageOptions.en);
    setOptionText(searchEngineSelect, 'duckduckgo', text.searchEngineOptions.duckduckgo);
    setOptionText(searchEngineSelect, 'google-br', text.searchEngineOptions['google-br']);
  }

  function applyPreferences() {
    themeSelect.value = preferences.searchTheme;
    languageSelect.value = preferences.searchLanguage;
    searchEngineSelect.value = preferences.searchEngine;
    logoTextInput.value = preferences.searchLogoText;
    showClockToggle.checked = preferences.searchShowClock !== false;
    syncPrimaryButtonColorInput();
    applyTheme();
    applyPrimaryButtonColor();
    applyLanguage();
    applyLogoPreview();
  }

  function currentText() {
    return messages[getActiveLanguage()] || messages.en;
  }

  function resetExtension() {
    const text = currentText();

    if (!window.confirm(text.resetConfirm)) return;

    try {
      RESET_LOCAL_KEYS.forEach((key) => localStorage.removeItem(key));
    } catch (e) {}

    storageRemove(RESET_SYNC_KEYS, () => {
      preferences = { ...DEFAULTS };
      input.value = '';
      logoImageInput.value = '';
      setLogoImageFileName('');
      status.textContent = '';
      status.classList.remove('is-ok', 'is-error');
      applyPreferences();
      showStatus(text.reset);
    });
  }

  backToSearch.href = getSearchUrl();

  // Restore saved value: prefer localStorage (fast) then fall back to storage.sync
  try {
    const cached = localStorage.getItem('customUrl');
    if (cached) input.value = cached;
    else {
      storageGet(['customUrl'], (res) => {
        if (res && res.customUrl) input.value = res.customUrl;
      });
    }
  } catch (e) {
    storageGet(['customUrl'], (res) => { if (res && res.customUrl) input.value = res.customUrl; });
  }

  storageGet(PREFERENCE_KEYS, (result) => {
    let changed = false;

    if (result && isValidTheme(result.searchTheme) && result.searchTheme !== preferences.searchTheme) {
      preferences.searchTheme = result.searchTheme;
      changed = true;
    }

    if (result && isValidLanguage(result.searchLanguage) && result.searchLanguage !== preferences.searchLanguage) {
      preferences.searchLanguage = result.searchLanguage;
      changed = true;
    }

    if (result && isValidSearchEngine(result.searchEngine) && result.searchEngine !== preferences.searchEngine) {
      preferences.searchEngine = result.searchEngine;
      changed = true;
    }

    if (result && isValidLogoMode(result.searchLogoMode) && result.searchLogoMode !== preferences.searchLogoMode) {
      preferences.searchLogoMode = result.searchLogoMode;
      changed = true;
    } else if (
      result &&
      !isValidLogoMode(result.searchLogoMode) &&
      isValidLogoText(result.searchLogoText) &&
      result.searchLogoText.trim() !== DEFAULTS.searchLogoText &&
      preferences.searchLogoMode !== 'custom'
    ) {
      preferences.searchLogoMode = 'custom';
      changed = true;
    }

    if (result && isValidLogoText(result.searchLogoText) && result.searchLogoText !== preferences.searchLogoText) {
      preferences.searchLogoText = result.searchLogoText.trim();
      changed = true;
    }

    if (result && Object.prototype.hasOwnProperty.call(result, 'searchPrimaryButtonColor')) {
      const syncedColor = result.searchPrimaryButtonColor;

      if (isValidHexColor(syncedColor) && normalizeHexColor(syncedColor) !== preferences.searchPrimaryButtonColor) {
        preferences.searchPrimaryButtonColor = normalizeHexColor(syncedColor);
        changed = true;
      } else if (!syncedColor && preferences.searchPrimaryButtonColor) {
        preferences.searchPrimaryButtonColor = DEFAULTS.searchPrimaryButtonColor;
        changed = true;
      }
    }

    if (result && typeof result.searchShowClock === 'boolean' && result.searchShowClock !== preferences.searchShowClock) {
      preferences.searchShowClock = result.searchShowClock;
      changed = true;
    }

    if (changed) {
      try {
        localStorage.setItem('searchTheme', preferences.searchTheme);
        localStorage.setItem('searchLanguage', preferences.searchLanguage);
        localStorage.setItem('searchEngine', preferences.searchEngine);
        localStorage.setItem('searchLogoMode', preferences.searchLogoMode);
        localStorage.setItem('searchLogoText', preferences.searchLogoText);
        if (preferences.searchPrimaryButtonColor) {
          localStorage.setItem('searchPrimaryButtonColor', preferences.searchPrimaryButtonColor);
        } else {
          localStorage.removeItem('searchPrimaryButtonColor');
        }
        localStorage.setItem('searchShowClock', String(preferences.searchShowClock));
      } catch (e) {}
      applyPreferences();
    }
  });

  // Basic URL validation: non-empty and not too long
  function validateUrl(u) {
    if (!u) return true; // allow clearing
    if (u.length > 2000) return false;
    return true;
  }

  themeSelect.addEventListener('change', () => {
    preferences.searchTheme = isValidTheme(themeSelect.value) ? themeSelect.value : DEFAULTS.searchTheme;
    applyPreferences();
    savePreferences();
  });

  languageSelect.addEventListener('change', () => {
    preferences.searchLanguage = isValidLanguage(languageSelect.value) ? languageSelect.value : DEFAULTS.searchLanguage;
    applyPreferences();
    savePreferences();
  });

  searchEngineSelect.addEventListener('change', () => {
    preferences.searchEngine = isValidSearchEngine(searchEngineSelect.value) ? searchEngineSelect.value : DEFAULTS.searchEngine;
    applyPreferences();
    savePreferences();
  });

  logoTextInput.addEventListener('input', () => {
    const text = currentText();
    const value = logoTextInput.value.trim();

    if (preferences.searchLogoMode === 'custom' && !value) {
      showStatus(text.invalidLogoText, false);
      return;
    }

    preferences.searchLogoText = value || DEFAULTS.searchLogoText;
    applyLogoPreview();
    savePreferences();
  });

  primaryButtonColorInput.addEventListener('input', () => {
    const text = currentText();
    const color = primaryButtonColorInput.value;

    if (!isValidHexColor(color)) {
      showStatus(text.invalidPrimaryButtonColor, false);
      return;
    }

    preferences.searchPrimaryButtonColor = normalizeHexColor(color);
    applyPrimaryButtonColor();
    savePreferences();
  });

  showClockToggle.addEventListener('change', () => {
    preferences.searchShowClock = showClockToggle.checked;
    savePreferences();
  });

  resetPrimaryButtonColorBtn.addEventListener('click', () => {
    const text = currentText();

    preferences.searchPrimaryButtonColor = DEFAULTS.searchPrimaryButtonColor;
    syncPrimaryButtonColorInput();
    applyPrimaryButtonColor();
    savePreferences();
    showStatus(text.saved);
  });

  logoImageInput.addEventListener('change', () => {
    const text = currentText();
    const file = logoImageInput.files && logoImageInput.files[0];

    if (!file) return;

    if (preferences.searchLogoMode === 'custom' && !isValidLogoText(logoTextInput.value)) {
      logoImageInput.value = '';
      showStatus(text.invalidLogoText, false);
      return;
    }

    if (!file.type.startsWith('image/') || file.size > MAX_LOGO_IMAGE_SIZE) {
      logoImageInput.value = '';
      showStatus(text.invalidLogoImage, false);
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setLogoImage(String(reader.result || ''));
      setLogoImageFileName(file.name);
      applyLogoPreview();
      showStatus(text.saved);
    });
    reader.addEventListener('error', () => {
      showStatus(text.invalidLogoImage, false);
    });
    reader.readAsDataURL(file);
  });

  removeLogoImageBtn.addEventListener('click', () => {
    const text = currentText();

    if (preferences.searchLogoMode !== 'custom') {
      preferences.searchLogoMode = 'custom';
      preferences.searchLogoText = isValidLogoText(preferences.searchLogoText)
        ? preferences.searchLogoText.trim()
        : DEFAULTS.searchLogoText;
      logoTextInput.value = preferences.searchLogoText;
      setLogoImage('');
      logoImageInput.value = '';
      setLogoImageFileName('');
      applyPreferences();
      savePreferences();
      showStatus(text.saved);
      return;
    }

    setLogoImage('');
    logoImageInput.value = '';
    setLogoImageFileName('');
    applyLogoPreview();
    showStatus(text.saved);
  });

  restoreDefaultLogoBtn.addEventListener('click', () => {
    const text = currentText();

    preferences.searchLogoMode = DEFAULTS.searchLogoMode;
    preferences.searchLogoText = DEFAULTS.searchLogoText;
    setLogoImage('');
    logoImageInput.value = '';
    setLogoImageFileName('');
    applyPreferences();
    savePreferences();
    showStatus(text.saved);
  });

  if (window.matchMedia) {
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleColorSchemeChange = () => {
      if (preferences.searchTheme === 'system') {
        applyTheme();
        if (!isValidHexColor(preferences.searchPrimaryButtonColor)) {
          syncPrimaryButtonColorInput();
        }
      }
    };

    if (typeof colorSchemeQuery.addEventListener === 'function') {
      colorSchemeQuery.addEventListener('change', handleColorSchemeChange);
    } else if (typeof colorSchemeQuery.addListener === 'function') {
      colorSchemeQuery.addListener(handleColorSchemeChange);
    }
  }

  window.addEventListener('languagechange', () => {
    if (preferences.searchLanguage === 'browser') applyLanguage();
  });

  applyPreferences();

  saveBtn.addEventListener('click', () => {
    const text = currentText();
    const val = input.value.trim();
    if (!validateUrl(val)) {
      showStatus(text.invalidUrl, false);
      return;
    }

    if (val === '') {
      // empty -> remove key
      try { localStorage.removeItem('customUrl'); } catch (e) {}
      storageRemove(['customUrl'], () => {
        showStatus(text.cleared);
      });
      return;
    }

    // Save to both localStorage (fast local read) and storage.sync (for sync across devices)
    try { localStorage.setItem('customUrl', val); } catch (e) {}
    storageSet({ customUrl: val }, () => { showStatus(text.saved); });
  });

  clearBtn.addEventListener('click', () => {
    const text = currentText();

    input.value = '';
    try { localStorage.removeItem('customUrl'); } catch (e) {}
    storageRemove(['customUrl'], () => { showStatus(text.cleared); });
  });

  resetExtensionBtn.addEventListener('click', resetExtension);
});
