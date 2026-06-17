import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const translations = {
  fr: {
    // Layout
    filters: 'Filtres',
    confirm: 'Confirmer',
    cancel: 'Annuler',
    clearAll: 'Vider tout',
    samplesCount: (n) => `${n} samples`,

    // SampleGrid
    noSamples: 'Aucun sample chargé',
    noSamplesHint: 'Utilisez "Importer" pour charger des fichiers ou un dossier',
    noResults: 'Aucun résultat',
    noResultsHint: 'Essayez de modifier vos filtres ou votre recherche',

    // SearchBar
    searchPlaceholder: 'Rechercher par nom ou tag...',

    // FilterBar
    clearFilters: 'Tout effacer',
    custom: 'Custom',
    format: 'Format',
    favoritesOnly: 'Favoris uniquement',

    // ImportButton
    fileApiUnavailable: "L'API File System Access n'est pas disponible dans ce navigateur. Utilisez Chrome ou Edge.",
    importing: 'Import...',
    importFiles: 'Importer fichiers',
    folder: 'Dossier',

    // ExportMenu
    export: 'Exporter',
    exportCsv: 'Exporter en CSV',
    exportJson: 'Exporter en JSON',
    allSamples: 'Tous les samples',
    filteredSamples: (filtered, total) => `${filtered}/${total} samples filtrés`,

    // AudioPlayer
    selectSample: 'Sélectionnez un sample pour le lire',
    favorite: 'Favori',
    copyPath: 'Copier le chemin',
    redetect: 'Re-détecter BPM & Key',

    // TagEditor
    newTag: 'Nouveau tag...',
  },
  en: {
    // Layout
    filters: 'Filters',
    confirm: 'Confirm',
    cancel: 'Cancel',
    clearAll: 'Clear all',
    samplesCount: (n) => `${n} sample${n !== 1 ? 's' : ''}`,

    // SampleGrid
    noSamples: 'No samples loaded',
    noSamplesHint: 'Use "Import" to load files or a folder',
    noResults: 'No results',
    noResultsHint: 'Try changing your filters or search',

    // SearchBar
    searchPlaceholder: 'Search by name or tag...',

    // FilterBar
    clearFilters: 'Clear all',
    custom: 'Custom',
    format: 'Format',
    favoritesOnly: 'Favorites only',

    // ImportButton
    fileApiUnavailable: 'The File System Access API is not available in this browser. Use Chrome or Edge.',
    importing: 'Import...',
    importFiles: 'Import files',
    folder: 'Folder',

    // ExportMenu
    export: 'Export',
    exportCsv: 'Export as CSV',
    exportJson: 'Export as JSON',
    allSamples: 'All samples',
    filteredSamples: (filtered, total) => `${filtered}/${total} filtered samples`,

    // AudioPlayer
    selectSample: 'Select a sample to play',
    favorite: 'Favorite',
    copyPath: 'Copy path',
    redetect: 'Re-detect BPM & Key',

    // TagEditor
    newTag: 'New tag...',
  },
};

const STORAGE_KEY = 'samplevault-lang';

function loadLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (saved === 'fr' || saved === 'en')) return saved;
  } catch { /* ignore */ }
  return 'fr';
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const l = loadLang();
    document.documentElement.lang = l;
    return l;
  });

  const setLang = useCallback((l) => {
    setLangState(l);
    document.documentElement.lang = l;
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  }, []);

  const value = useMemo(() => ({ lang, setLang, t: translations[lang] }), [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider');
  return ctx;
}
