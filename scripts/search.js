document.addEventListener("DOMContentLoaded", () => {
  const ext =
    typeof browser !== "undefined"
      ? browser
      : typeof chrome !== "undefined"
        ? chrome
        : null;
  const root = document.documentElement;
  const form = document.getElementById("searchForm");
  const input = document.getElementById("searchInput");
  const searchEngineIcon = document.getElementById("searchEngineIcon");
  const searchSuggestions = document.getElementById("searchSuggestions");
  const button = document.getElementById("searchButton");
  const searchLogo = document.getElementById("searchLogo");
  const clockWidget = document.getElementById("clockWidget");
  const clockTime = document.getElementById("clockTime");
  const clockDate = document.getElementById("clockDate");
  const settingsLink = document.getElementById("settingsLink");
  const devCredit = document.getElementById("devCredit");
  const devCreditText = document.getElementById("devCreditText");
  const shortcutsGrid = document.getElementById("shortcutsGrid");
  const shortcutModal = document.getElementById("shortcutModal");
  const shortcutForm = document.getElementById("shortcutForm");
  const shortcutUrl = document.getElementById("shortcutUrl");
  const shortcutLabel = document.getElementById("shortcutLabel");
  const shortcutStatus = document.getElementById("shortcutStatus");
  const shortcutModalTitle = document.getElementById("shortcutModalTitle");
  const shortcutUrlLabel = document.getElementById("shortcutUrlLabel");
  const shortcutNameLabel = document.getElementById("shortcutNameLabel");
  const shortcutCancel = document.getElementById("shortcutCancel");
  const shortcutSave = document.getElementById("shortcutSave");

  const STORAGE_KEYS = [
    "searchTheme",
    "searchLanguage",
    "searchEngine",
    "searchLogoMode",
    "searchLogoText",
    "searchPrimaryButtonColor",
  ];
  const SHORTCUTS_KEY = "searchShortcuts";
  const SEARCH_HISTORY_KEY = "searchQueryHistory";
  const MAX_SEARCH_HISTORY = 100;
  const MAX_SEARCH_SUGGESTIONS = 6;
  const MAX_SHORTCUTS = 8;
  const DEFAULT_SHORTCUTS = [
    { url: "https://www.youtube.com/", label: "YouTube" },
  ];
  const DEFAULT_QUERY_SUGGESTIONS = [
    "Instagram",
    "Facebook",
    "WhatsApp Web",
    "TikTok",
    "X / Twitter",
    "Reddit",
    "Pinterest",
    "LinkedIn",
    "YouTube",
    "Netflix",
    "Spotify",
    "Twitch",
    "Prime Video",
    "Disney+",
    "HBO Max / Max",
    "Amazon",
    "Mercado Livre",
    "Shopee",
    "AliExpress",
    "Shein",
    "eBay",
    "Gmail",
    "Google Drive",
    "Google Tradutor",
    "Google Maps",
    "Google Docs",
    "Google Fotos",
    "Google Agenda",
    "ChatGPT",
    "Gemini",
    "Claude",
    "Canva",
    "Figma",
    "Notion",
    "Trello",
    "GitHub",
    "Stack Overflow",
    "Wikipedia",
    "CNN",
    "BBC",
    "G1",
    "UOL",
    "The New York Times",
    "The Guardian",
    "Nubank",
    "Ita\u00fa",
    "Bradesco",
    "Banco do Brasil",
    "Caixa",
    "Santander",
    "PayPal",
    "Wise",
    "gov.br",
    "Receita Federal",
    "INSS",
    "Correios",
    "Detran",
    "Enem / Inep",
    "e-CAC",
    "previs\u00e3o do tempo",
    "tradutor",
    "calculadora",
    "conversor de moeda",
    "CEP",
    "rastreamento Correios",
    "mapa",
    "como chegar",
    "login Gmail",
  ];
  const DEFAULTS = {
    searchTheme: "system",
    searchLanguage: "browser",
    searchEngine: "duckduckgo",
    searchLogoMode: "default",
    searchLogoText: "OpenTab Search",
    searchPrimaryButtonColor: "",
  };
  const messages = {
    en: {
      title: "Search",
      search: "Search",
      searchForm: "Search the web",
      settings: "Settings",
      shortcuts: "Shortcuts",
      shortcutsDescription: "Pinned site shortcuts",
      addSite: "Add site",
      addSiteAt: "Add site to shortcut slot",
      openShortcut: "Open {name}",
      removeShortcut: "Remove {name}",
      siteUrl: "URL",
      siteName: "Name",
      optionalName: "Optional",
      cancel: "Cancel",
      save: "Save",
      closeDialog: "Close add site dialog",
      invalidShortcutUrl: "Enter a valid URL.",
      shortcutLimit: "You can pin up to 8 sites.",
      clockLabel: "Current date and time",
      openSourceCredit: "This project is open source and available at {repo}",
      openSourceRepoLabel: "phricardo/opentab",
    },
    "pt-BR": {
      title: "Buscar",
      search: "Buscar",
      searchForm: "Buscar na web",
      settings: "Configura\u00e7\u00f5es",
      shortcuts: "Atalhos",
      shortcutsDescription: "Atalhos de sites fixados",
      addSite: "Adicionar site",
      addSiteAt: "Adicionar site ao espa\u00e7o de atalho",
      openShortcut: "Abrir {name}",
      removeShortcut: "Remover {name}",
      siteUrl: "URL",
      siteName: "Nome",
      optionalName: "Opcional",
      cancel: "Cancelar",
      save: "Salvar",
      closeDialog: "Fechar janela de adicionar site",
      invalidShortcutUrl: "Informe uma URL v\u00e1lida.",
      shortcutLimit: "Voc\u00ea pode fixar at\u00e9 8 sites.",
      clockLabel: "Data e hora atuais",
      openSourceCredit:
        "Este projeto \u00e9 de c\u00f3digo aberto e est\u00e1 dispon\u00edvel em {repo}",
      openSourceRepoLabel: "phricardo/opentab",
    },
  };

  let preferences = readLocalPreferences();
  let hasLocalShortcuts = hasLocalShortcutsValue();
  let shortcuts = readLocalShortcuts();
  let queryHistory = readQueryHistory();
  let activeSuggestionIndex = -1;
  let visibleSuggestions = [];
  let shortcutModalTrigger = null;

  function storageGet(keys, cb) {
    if (ext && ext.storage && ext.storage.sync) {
      if (typeof browser !== "undefined") {
        ext.storage.sync
          .get(keys)
          .then(cb)
          .catch(() => cb({}));
      } else {
        ext.storage.sync.get(keys, cb);
      }
    } else {
      cb({});
    }
  }

  function storageSet(values, cb) {
    if (ext && ext.storage && ext.storage.sync) {
      if (typeof browser !== "undefined") {
        ext.storage.sync
          .set(values)
          .then(() => {
            if (cb) cb();
          })
          .catch(() => {
            if (cb) cb();
          });
      } else {
        ext.storage.sync.set(values, () => {
          if (cb) cb();
        });
      }
    } else if (cb) {
      cb();
    }
  }

  function readLocalPreferences() {
    const values = { ...DEFAULTS };

    try {
      const theme = localStorage.getItem("searchTheme");
      const language = localStorage.getItem("searchLanguage");
      const searchEngine = localStorage.getItem("searchEngine");
      const logoMode = localStorage.getItem("searchLogoMode");
      const logoText = localStorage.getItem("searchLogoText");
      const logoImage = localStorage.getItem("searchLogoImage");
      const primaryButtonColor = localStorage.getItem(
        "searchPrimaryButtonColor",
      );

      if (isValidTheme(theme)) values.searchTheme = theme;
      if (isValidLanguage(language)) values.searchLanguage = language;
      if (isValidSearchEngine(searchEngine)) values.searchEngine = searchEngine;
      if (isValidLogoMode(logoMode)) {
        values.searchLogoMode = logoMode;
      } else if (
        logoImage ||
        (isValidLogoText(logoText) &&
          logoText.trim() !== DEFAULTS.searchLogoText)
      ) {
        values.searchLogoMode = "custom";
      }
      if (isValidLogoText(logoText)) values.searchLogoText = logoText.trim();
      if (isValidHexColor(primaryButtonColor))
        values.searchPrimaryButtonColor = normalizeHexColor(primaryButtonColor);
    } catch (e) {}

    return values;
  }

  function readLocalShortcuts() {
    try {
      if (!hasLocalShortcutsValue())
        return normalizeShortcuts(DEFAULT_SHORTCUTS);
      return normalizeShortcuts(
        JSON.parse(localStorage.getItem(SHORTCUTS_KEY) || "[]"),
      );
    } catch (e) {
      return normalizeShortcuts(DEFAULT_SHORTCUTS);
    }
  }

  function writeLocalShortcuts(nextShortcuts) {
    try {
      localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(nextShortcuts));
      hasLocalShortcuts = true;
    } catch (e) {}
  }

  function hasLocalShortcutsValue() {
    try {
      return localStorage.getItem(SHORTCUTS_KEY) !== null;
    } catch (e) {
      return false;
    }
  }

  function normalizeQuery(query) {
    return String(query || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function readQueryHistory() {
    try {
      const parsed = JSON.parse(
        localStorage.getItem(SEARCH_HISTORY_KEY) || "[]",
      );
      if (!Array.isArray(parsed)) return [];

      return parsed
        .map((item) => {
          const query = String(item && item.query ? item.query : "")
            .trim()
            .replace(/\s+/g, " ");
          const normalized = normalizeQuery(
            item && item.normalized ? item.normalized : query,
          );
          if (!query || !normalized) return null;

          return {
            query,
            normalized,
            count: Math.max(1, Number(item.count) || 1),
            lastUsed: Math.max(0, Number(item.lastUsed) || 0),
          };
        })
        .filter(Boolean)
        .slice(0, MAX_SEARCH_HISTORY);
    } catch (e) {
      return [];
    }
  }

  function writeQueryHistory(nextHistory) {
    queryHistory = nextHistory.slice(0, MAX_SEARCH_HISTORY);
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(queryHistory));
    } catch (e) {}
  }

  function rememberQuery(query) {
    const cleanQuery = String(query || "")
      .trim()
      .replace(/\s+/g, " ");
    const normalized = normalizeQuery(cleanQuery);
    if (!normalized) return;

    const now = Date.now();
    const existingIndex = queryHistory.findIndex(
      (item) => item.normalized === normalized,
    );
    const nextHistory = queryHistory.slice();

    if (existingIndex >= 0) {
      nextHistory[existingIndex] = {
        ...nextHistory[existingIndex],
        query: cleanQuery,
        count: nextHistory[existingIndex].count + 1,
        lastUsed: now,
      };
    } else {
      nextHistory.push({
        query: cleanQuery,
        normalized,
        count: 1,
        lastUsed: now,
      });
    }

    nextHistory.sort((a, b) => b.lastUsed - a.lastUsed);
    writeQueryHistory(nextHistory);
  }

  function getQuerySuggestions(query) {
    const normalized = normalizeQuery(query);
    if (!normalized) return [];

    const candidates = new Map();

    DEFAULT_QUERY_SUGGESTIONS.forEach((defaultQuery) => {
      const defaultNormalized = normalizeQuery(defaultQuery);
      if (!defaultNormalized || !defaultNormalized.includes(normalized)) return;

      candidates.set(defaultNormalized, {
        query: defaultQuery,
        normalized: defaultNormalized,
        count: 0,
        lastUsed: 0,
        source: "default",
      });
    });

    queryHistory.forEach((item) => {
      if (!item.normalized.includes(normalized)) return;

      candidates.set(item.normalized, {
        ...item,
        source: "history",
      });
    });

    return Array.from(candidates.values())
      .map((item) => {
        const isPrefixMatch = item.normalized.startsWith(normalized);
        const recencyScore = Math.max(0, item.lastUsed || 0) / 1000000000000;
        const frequencyScore = Math.log2((item.count || 1) + 1);
        const sourceScore = item.source === "history" ? 250 : 0;

        return {
          ...item,
          score:
            (isPrefixMatch ? 1000 : 0) +
            sourceScore +
            frequencyScore * 10 +
            recencyScore,
        };
      })
      .sort(
        (a, b) =>
          b.score - a.score ||
          b.lastUsed - a.lastUsed ||
          a.query.localeCompare(b.query),
      )
      .slice(0, MAX_SEARCH_SUGGESTIONS);
  }

  function isValidTheme(theme) {
    return theme === "system" || theme === "light" || theme === "dark";
  }

  function isValidLanguage(language) {
    return language === "browser" || language === "pt-BR" || language === "en";
  }

  function isValidSearchEngine(searchEngine) {
    return searchEngine === "duckduckgo" || searchEngine === "google-br";
  }

  function isValidLogoMode(logoMode) {
    return logoMode === "default" || logoMode === "custom";
  }

  function isValidLogoText(logoText) {
    return typeof logoText === "string" && logoText.trim().length > 0;
  }

  function isValidHexColor(color) {
    return (
      typeof color === "string" &&
      /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color.trim())
    );
  }

  function normalizeHexColor(color) {
    const value = color.trim().toLowerCase();

    if (value.length === 4) {
      return (
        "#" + value[1] + value[1] + value[2] + value[2] + value[3] + value[3]
      );
    }

    return value;
  }

  function ensureProtocol(url) {
    const value = String(url || "").trim();
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value)) {
      return "https://" + value;
    }
    return value;
  }

  function isValidShortcutUrl(url) {
    try {
      const parsed = new URL(ensureProtocol(url));
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (e) {
      return false;
    }
  }

  function getShortcutLabel(url, label) {
    const customLabel = String(label || "").trim();
    if (customLabel) return customLabel.slice(0, 40);

    try {
      const hostname = new URL(url).hostname.replace(/^www\./, "");
      const firstPart = hostname.split(".")[0] || hostname;
      return firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
    } catch (e) {
      return "Site";
    }
  }

  function normalizeShortcuts(value) {
    if (!Array.isArray(value)) return [];

    return value
      .map((shortcut) => {
        const url =
          shortcut && shortcut.url ? ensureProtocol(shortcut.url) : "";
        if (!isValidShortcutUrl(url)) return null;

        return {
          url,
          label: getShortcutLabel(url, shortcut.label),
        };
      })
      .filter(Boolean)
      .slice(0, MAX_SHORTCUTS);
  }

  // -------------------------- //
  const DARK_FAVICON_FILTERS = {
    "github.com": "invert(1)",
    "github.io": "invert(1)",
  };

  function normalizeHost(url) {
    return new URL(url).hostname.replace(/^www\./, "").replace(/^m\./, "");
  }

  function getFaviconUrl(url) {
    const host = normalizeHost(url);

    return `https://icons.duckduckgo.com/ip3/${host}.ico`;
  }

  function isDarkThemeActive() {
    if (preferences.searchTheme === "dark") return true;
    if (preferences.searchTheme === "light") return false;

    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }

  function getManualFaviconFilter(url) {
    try {
      return DARK_FAVICON_FILTERS[normalizeHost(url)] || "";
    } catch (e) {
      return "";
    }
  }

  function getAverageIconBrightness(img) {
    const size = 24;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) return null;

    canvas.width = size;
    canvas.height = size;
    context.drawImage(img, 0, 0, size, size);

    const { data } = context.getImageData(0, 0, size, size);

    let brightnessTotal = 0;
    let visiblePixels = 0;

    for (let index = 0; index < data.length; index += 4) {
      const alpha = data[index + 3];

      if (alpha < 40) continue;

      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

      brightnessTotal += brightness;
      visiblePixels += 1;
    }

    if (!visiblePixels) return null;

    return brightnessTotal / visiblePixels;
  }

  function applyFaviconThemeFix(img, url) {
    img.style.removeProperty("filter");
    img.onload = null;

    if (!isDarkThemeActive()) return;

    const manualFilter = getManualFaviconFilter(url);

    if (manualFilter) {
      img.style.filter = manualFilter;
      return;
    }

    img.onload = () => {
      try {
        const averageBrightness = getAverageIconBrightness(img);

        if (averageBrightness !== null && averageBrightness < 80) {
          img.style.filter = "invert(1)";
        }
      } catch (e) {
        // Se o canvas for bloqueado por CORS, nao inverte automaticamente.
        // Assim evitamos estragar favicons coloridos como Instagram, YouTube etc.
      }
    };
  }

  function refreshFaviconThemeFixes() {
    document
      .querySelectorAll(".shortcut-favicon[data-shortcut-url]")
      .forEach((img) => {
        applyFaviconThemeFix(img, img.dataset.shortcutUrl);
      });
  }
  // -------------------------- //

  function getTextColorForBackground(hexColor) {
    const normalized = normalizeHexColor(hexColor);
    const red = parseInt(normalized.slice(1, 3), 16);
    const green = parseInt(normalized.slice(3, 5), 16);
    const blue = parseInt(normalized.slice(5, 7), 16);
    const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;

    return luminance > 0.55 ? "#111111" : "#ffffff";
  }

  function getBrowserLanguage() {
    const languages =
      Array.isArray(navigator.languages) && navigator.languages.length
        ? navigator.languages
        : [navigator.language || "en"];
    const preferredLanguage = String(languages[0] || "en").toLowerCase();

    return preferredLanguage.startsWith("pt") ? "pt-BR" : "en";
  }

  function getActiveLanguage() {
    return preferences.searchLanguage === "browser"
      ? getBrowserLanguage()
      : preferences.searchLanguage;
  }

  function formatClockDate(date, language) {
    if (language === "pt-BR") {
      return new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(date);
    }

    const parts = new Intl.DateTimeFormat("en", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).formatToParts(date);
    const values = parts.reduce((result, part) => {
      result[part.type] = part.value;
      return result;
    }, {});

    return values.weekday + ", " + values.day + " " + values.month;
  }

  function updateClock() {
    if (!clockTime || !clockDate) return;

    const now = new Date();
    const language = getActiveLanguage();
    const text = messages[language] || messages.en;
    const formattedTime = new Intl.DateTimeFormat(language, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      hourCycle: "h23",
    }).format(now);

    clockTime.textContent = formattedTime;
    clockTime.dateTime = now.toISOString();
    clockDate.textContent = formatClockDate(now, language);

    if (clockWidget) {
      clockWidget.setAttribute(
        "aria-label",
        text.clockLabel + ": " + formattedTime + ", " + clockDate.textContent,
      );
    }
  }

  function getOptionsUrl() {
    if (ext && ext.runtime && typeof ext.runtime.getURL === "function") {
      return ext.runtime.getURL("pages/options.html");
    }
    return "options.html";
  }

  function createDefaultLogoMark() {
    const mark = document.createElement("span");
    mark.className = "default-logo-mark";
    mark.setAttribute("aria-hidden", "true");
    return mark;
  }

  function getSearchUrl(query) {
    const encodedQuery = encodeURIComponent(query);
    if (preferences.searchEngine === "google-br") {
      return "https://www.google.com.br/search?q=" + encodedQuery;
    }
    return "https://duckduckgo.com/?q=" + encodedQuery;
  }

  function applyTheme() {
    root.dataset.theme = isValidTheme(preferences.searchTheme)
      ? preferences.searchTheme
      : DEFAULTS.searchTheme;
  }

  function applyPrimaryButtonColor() {
    if (!isValidHexColor(preferences.searchPrimaryButtonColor)) {
      root.style.removeProperty("--primary-button-bg");
      root.style.removeProperty("--primary-button-border");
      root.style.removeProperty("--primary-button-text");
      root.style.removeProperty("--primary-button-focus");
      root.style.removeProperty("--primary-button-focus-shadow");
      return;
    }

    const color = normalizeHexColor(preferences.searchPrimaryButtonColor);
    root.style.setProperty("--primary-button-bg", color);
    root.style.setProperty("--primary-button-border", color);
    root.style.setProperty(
      "--primary-button-text",
      getTextColorForBackground(color),
    );
    root.style.setProperty("--primary-button-focus", color);
    root.style.setProperty("--primary-button-focus-shadow", color + "55");
  }

  function applySearchEngineIcon() {
    if (!searchEngineIcon) return;

    searchEngineIcon.dataset.engine =
      preferences.searchEngine === "google-br" ? "google" : "duckduckgo";
  }

  function applyLanguage() {
    const language = getActiveLanguage();
    const text = messages[language] || messages.en;

    root.lang = language;
    document.title = text.title;
    form.setAttribute("aria-label", text.searchForm);
    input.placeholder = text.search;
    input.setAttribute("aria-label", text.search);
    button.textContent = text.search;
    updateClock();
    settingsLink.textContent = text.settings;
    settingsLink.setAttribute("aria-label", text.settings);
    devCreditText.textContent = text.openSourceCredit.replace(
      "{repo}",
      text.openSourceRepoLabel,
    );
    devCredit.setAttribute(
      "aria-label",
      text.openSourceCredit.replace("{repo}", text.openSourceRepoLabel),
    );
    shortcutsGrid.setAttribute("aria-label", text.shortcutsDescription);
    shortcutModalTitle.textContent = text.addSite;
    shortcutUrlLabel.textContent = text.siteUrl;
    shortcutNameLabel.textContent = text.siteName;
    shortcutUrl.placeholder = "https://example.com";
    shortcutLabel.placeholder = text.optionalName;
    shortcutCancel.textContent = text.cancel;
    shortcutCancel.setAttribute("aria-label", text.closeDialog);
    shortcutSave.textContent = text.save;
    renderShortcuts();
  }

  function getLogoImage() {
    try {
      return localStorage.getItem("searchLogoImage") || "";
    } catch (e) {
      return "";
    }
  }

  function applyLogo() {
    const logoImage = getLogoImage();
    const logoText = isValidLogoText(preferences.searchLogoText)
      ? preferences.searchLogoText.trim()
      : DEFAULTS.searchLogoText;
    const isCustomLogo = preferences.searchLogoMode === "custom";

    searchLogo.replaceChildren();
    searchLogo.setAttribute("aria-label", logoText);

    if (!isCustomLogo) {
      searchLogo.appendChild(createDefaultLogoMark());
      return;
    }

    if (logoImage) {
      const image = document.createElement("img");
      image.src = logoImage;
      image.alt = logoText;
      searchLogo.appendChild(image);
      return;
    }

    searchLogo.textContent = logoText;
  }

  function applyPreferences() {
    applyTheme();
    applyPrimaryButtonColor();
    applySearchEngineIcon();
    applyLanguage();
    applyLogo();
  }

  function currentText() {
    return messages[getActiveLanguage()] || messages.en;
  }

  function renderShortcuts() {
    const text = currentText();
    shortcutsGrid.replaceChildren();

    for (let index = 0; index < MAX_SHORTCUTS; index += 1) {
      const shortcut = shortcuts[index];
      const item = document.createElement("button");
      item.className = shortcut
        ? "shortcut-card is-filled"
        : "shortcut-card is-empty";
      item.type = "button";

      if (shortcut) {
        item.setAttribute(
          "aria-label",
          text.openShortcut.replace("{name}", shortcut.label),
        );

        const tile = document.createElement("span");
        tile.className = "shortcut-tile";

        const image = document.createElement("img");
        image.className = "shortcut-favicon";

        applyFaviconThemeFix(image, shortcut.url);
        image.src = getFaviconUrl(shortcut.url);

        image.alt = "";
        image.loading = "lazy";

        const removeButton = document.createElement("button");
        removeButton.className = "shortcut-remove";
        removeButton.type = "button";
        removeButton.setAttribute(
          "aria-label",
          text.removeShortcut.replace("{name}", shortcut.label),
        );
        removeButton.textContent = "\u00d7";
        removeButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          removeShortcut(index);
        });

        const label = document.createElement("span");
        label.className = "shortcut-label";
        label.textContent = shortcut.label;

        tile.appendChild(image);
        tile.appendChild(removeButton);
        item.appendChild(tile);
        item.appendChild(label);
        item.addEventListener("click", () => {
          window.location.href = shortcut.url;
        });
      } else {
        item.setAttribute("aria-label", text.addSiteAt);

        const tile = document.createElement("span");
        tile.className = "shortcut-tile";

        const plus = document.createElement("span");
        plus.className = "shortcut-plus";
        plus.setAttribute("aria-hidden", "true");
        plus.textContent = "+";

        const label = document.createElement("span");
        label.className = "shortcut-label";
        label.textContent = text.addSite;

        tile.appendChild(plus);
        item.appendChild(tile);
        item.appendChild(label);
        item.addEventListener("click", openShortcutModal);
      }

      shortcutsGrid.appendChild(item);
    }
  }

  function openShortcutModal() {
    shortcutModalTrigger =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    shortcutForm.reset();
    shortcutStatus.textContent = "";
    shortcutStatus.classList.remove("is-error");
    shortcutUrl.removeAttribute("aria-invalid");
    shortcutModal.hidden = false;
    shortcutUrl.focus();
  }

  function closeShortcutModal() {
    shortcutModal.hidden = true;
    shortcutUrl.removeAttribute("aria-invalid");
    shortcutStatus.textContent = "";
    shortcutStatus.classList.remove("is-error");

    if (
      shortcutModalTrigger &&
      typeof shortcutModalTrigger.focus === "function"
    ) {
      shortcutModalTrigger.focus();
    } else {
      input.focus();
    }
    shortcutModalTrigger = null;
  }

  function keepFocusInShortcutModal(event) {
    if (event.key !== "Tab" || shortcutModal.hidden) return;

    const focusableElements = Array.from(
      shortcutModal.querySelectorAll(
        'button, input, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.disabled && element.offsetParent !== null);

    if (!focusableElements.length) return;

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function saveShortcuts(nextShortcuts) {
    shortcuts = normalizeShortcuts(nextShortcuts);
    writeLocalShortcuts(shortcuts);
    storageSet({ [SHORTCUTS_KEY]: shortcuts });
    renderShortcuts();
  }

  function removeShortcut(index) {
    saveShortcuts(
      shortcuts.filter(
        (shortcut, shortcutIndex) => shortcut && shortcutIndex !== index,
      ),
    );
  }

  function closeSearchSuggestions() {
    activeSuggestionIndex = -1;
    visibleSuggestions = [];
    searchSuggestions.hidden = true;
    searchSuggestions.replaceChildren();
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
  }

  function setActiveSuggestion(index) {
    activeSuggestionIndex = index;

    Array.from(searchSuggestions.children).forEach((child, childIndex) => {
      const isActive = childIndex === activeSuggestionIndex;
      child.classList.toggle("is-active", isActive);
      child.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    if (
      activeSuggestionIndex >= 0 &&
      searchSuggestions.children[activeSuggestionIndex]
    ) {
      input.setAttribute(
        "aria-activedescendant",
        searchSuggestions.children[activeSuggestionIndex].id,
      );
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  }

  function submitSearch(query) {
    const cleanQuery = String(query || "")
      .trim()
      .replace(/\s+/g, " ");
    if (!cleanQuery) {
      input.focus();
      return;
    }

    rememberQuery(cleanQuery);
    closeSearchSuggestions();
    window.location.href = getSearchUrl(cleanQuery);
  }

  function selectSuggestion(index) {
    const suggestion = visibleSuggestions[index];
    if (!suggestion) return;

    input.value = suggestion.query;
    submitSearch(suggestion.query);
  }

  function renderSearchSuggestions() {
    const suggestions = getQuerySuggestions(input.value);
    visibleSuggestions = suggestions;
    activeSuggestionIndex = -1;
    searchSuggestions.replaceChildren();

    if (!suggestions.length) {
      closeSearchSuggestions();
      return;
    }

    suggestions.forEach((suggestion, index) => {
      const option = document.createElement("button");
      option.className = "search-suggestion";
      option.type = "button";
      option.id = "searchSuggestion-" + index;
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", "false");
      option.textContent = suggestion.query;
      option.addEventListener("mousedown", (event) => {
        event.preventDefault();
      });
      option.addEventListener("click", () => {
        selectSuggestion(index);
      });
      searchSuggestions.appendChild(option);
    });

    searchSuggestions.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  settingsLink.href = getOptionsUrl();

  if (window.matchMedia) {
    const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleColorSchemeChange = () => {
      if (preferences.searchTheme === "system") applyTheme();
    };

    if (typeof colorSchemeQuery.addEventListener === "function") {
      colorSchemeQuery.addEventListener("change", handleColorSchemeChange);
    } else if (typeof colorSchemeQuery.addListener === "function") {
      colorSchemeQuery.addListener(handleColorSchemeChange);
    }
  }

  window.addEventListener("languagechange", () => {
    if (preferences.searchLanguage === "browser") applyLanguage();
  });

  applyPreferences();
  updateClock();
  setInterval(updateClock, 1000);

  storageGet(STORAGE_KEYS, (result) => {
    let changed = false;

    if (
      result &&
      isValidTheme(result.searchTheme) &&
      result.searchTheme !== preferences.searchTheme
    ) {
      preferences.searchTheme = result.searchTheme;
      changed = true;
    }

    if (
      result &&
      isValidLanguage(result.searchLanguage) &&
      result.searchLanguage !== preferences.searchLanguage
    ) {
      preferences.searchLanguage = result.searchLanguage;
      changed = true;
    }

    if (
      result &&
      isValidSearchEngine(result.searchEngine) &&
      result.searchEngine !== preferences.searchEngine
    ) {
      preferences.searchEngine = result.searchEngine;
      changed = true;
    }

    if (
      result &&
      isValidLogoMode(result.searchLogoMode) &&
      result.searchLogoMode !== preferences.searchLogoMode
    ) {
      preferences.searchLogoMode = result.searchLogoMode;
      changed = true;
    } else if (
      result &&
      !isValidLogoMode(result.searchLogoMode) &&
      isValidLogoText(result.searchLogoText) &&
      result.searchLogoText.trim() !== DEFAULTS.searchLogoText &&
      preferences.searchLogoMode !== "custom"
    ) {
      preferences.searchLogoMode = "custom";
      changed = true;
    }

    if (
      result &&
      isValidLogoText(result.searchLogoText) &&
      result.searchLogoText !== preferences.searchLogoText
    ) {
      preferences.searchLogoText = result.searchLogoText.trim();
      changed = true;
    }

    if (
      result &&
      Object.prototype.hasOwnProperty.call(result, "searchPrimaryButtonColor")
    ) {
      const syncedColor = result.searchPrimaryButtonColor;

      if (
        isValidHexColor(syncedColor) &&
        normalizeHexColor(syncedColor) !== preferences.searchPrimaryButtonColor
      ) {
        preferences.searchPrimaryButtonColor = normalizeHexColor(syncedColor);
        changed = true;
      } else if (!syncedColor && preferences.searchPrimaryButtonColor) {
        preferences.searchPrimaryButtonColor =
          DEFAULTS.searchPrimaryButtonColor;
        changed = true;
      }
    }

    if (changed) {
      try {
        localStorage.setItem("searchTheme", preferences.searchTheme);
        localStorage.setItem("searchLanguage", preferences.searchLanguage);
        localStorage.setItem("searchEngine", preferences.searchEngine);
        localStorage.setItem("searchLogoMode", preferences.searchLogoMode);
        localStorage.setItem("searchLogoText", preferences.searchLogoText);
        if (preferences.searchPrimaryButtonColor) {
          localStorage.setItem(
            "searchPrimaryButtonColor",
            preferences.searchPrimaryButtonColor,
          );
        } else {
          localStorage.removeItem("searchPrimaryButtonColor");
        }
      } catch (e) {}
      applyPreferences();
    }
  });

  storageGet([SHORTCUTS_KEY], (result) => {
    if (
      !result ||
      !Object.prototype.hasOwnProperty.call(result, SHORTCUTS_KEY)
    ) {
      if (!hasLocalShortcuts) {
        saveShortcuts(shortcuts);
      }
      renderShortcuts();
      return;
    }

    const syncedShortcuts = normalizeShortcuts(result[SHORTCUTS_KEY]);
    if (JSON.stringify(syncedShortcuts) !== JSON.stringify(shortcuts)) {
      shortcuts = syncedShortcuts;
      writeLocalShortcuts(shortcuts);
      renderShortcuts();
    }
  });

  shortcutCancel.addEventListener("click", closeShortcutModal);

  shortcutModal.addEventListener("click", (event) => {
    if (
      event.target &&
      event.target.hasAttribute("data-close-shortcut-modal")
    ) {
      closeShortcutModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !shortcutModal.hidden) {
      closeShortcutModal();
      return;
    }

    keepFocusInShortcutModal(event);
  });

  shortcutUrl.addEventListener("input", () => {
    if (!shortcutUrl.hasAttribute("aria-invalid")) return;

    shortcutUrl.removeAttribute("aria-invalid");
    shortcutStatus.textContent = "";
    shortcutStatus.classList.remove("is-error");
  });

  shortcutForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = currentText();
    if (shortcuts.length >= MAX_SHORTCUTS) {
      shortcutStatus.textContent = text.shortcutLimit;
      shortcutStatus.classList.add("is-error");
      shortcutUrl.setAttribute("aria-invalid", "true");
      return;
    }

    const url = ensureProtocol(shortcutUrl.value);
    if (!isValidShortcutUrl(url)) {
      shortcutStatus.textContent = text.invalidShortcutUrl;
      shortcutStatus.classList.add("is-error");
      shortcutUrl.setAttribute("aria-invalid", "true");
      shortcutUrl.focus();
      return;
    }

    shortcutUrl.removeAttribute("aria-invalid");
    saveShortcuts([
      ...shortcuts,
      {
        url,
        label: getShortcutLabel(url, shortcutLabel.value),
      },
    ]);
    closeShortcutModal();
  });

  input.addEventListener("input", renderSearchSuggestions);

  input.addEventListener("keydown", (event) => {
    if (
      searchSuggestions.hidden &&
      (event.key === "ArrowDown" || event.key === "ArrowUp")
    ) {
      renderSearchSuggestions();
    }

    if (!searchSuggestions.hidden && event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex =
        activeSuggestionIndex < visibleSuggestions.length - 1
          ? activeSuggestionIndex + 1
          : 0;
      setActiveSuggestion(nextIndex);
      return;
    }

    if (!searchSuggestions.hidden && event.key === "ArrowUp") {
      event.preventDefault();
      const nextIndex =
        activeSuggestionIndex > 0
          ? activeSuggestionIndex - 1
          : visibleSuggestions.length - 1;
      setActiveSuggestion(nextIndex);
      return;
    }

    if (
      !searchSuggestions.hidden &&
      event.key === "Enter" &&
      activeSuggestionIndex >= 0
    ) {
      event.preventDefault();
      selectSuggestion(activeSuggestionIndex);
      return;
    }

    if (!searchSuggestions.hidden && event.key === "Escape") {
      event.preventDefault();
      closeSearchSuggestions();
    }
  });

  input.addEventListener("blur", () => {
    setTimeout(closeSearchSuggestions, 120);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    submitSearch(input.value);
  });
});
