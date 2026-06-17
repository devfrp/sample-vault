import { create } from 'zustand';

const STORAGE_KEY = 'samplevault';

const defaultTags = [
  { category: 'Instrument', values: ['Kick', 'Snare', 'Hi-Hat', 'Bass', 'Synth', 'Pad', 'Guitar', 'Piano', 'Vocals', 'FX', 'Percussion', 'Drum Loop'] },
  { category: 'Genre', values: ['Hip-Hop', 'Trap', 'House', 'Techno', 'DnB', 'Dubstep', 'Lo-Fi', 'Ambient', 'Pop', 'Rock', 'Jazz', 'Funk'] },
  { category: 'Mood', values: ['Dark', 'Bright', 'Aggressive', 'Chill', 'Energetic', 'Melancholic', 'Uplifting', 'Tense'] },
  { category: 'Type', values: ['One-Shot', 'Loop', 'Stem', 'Break', 'Fill', 'Riser', 'Impact', 'Texture'] },
];

const loadPersisted = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
};

const savePersisted = (state) => {
  try {
    const toSave = {
      samples: state.samples.map((s) => ({
        id: s.id,
        name: s.name,
        path: s.path,
        duration: s.duration,
        format: s.format,
        size: s.size,
        bpm: s.bpm,
        key: s.key,
        tags: s.tags,
        favorite: s.favorite,
        collection: s.collection,
        peaks: s.peaks,
      })),
      tags: state.tags,
      customTags: state.customTags,
      collections: state.collections,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch { /* ignore */ }
};

let idCounter = Date.now();

export const useSampleStore = create((set, get) => ({
  // --- Samples ---
  samples: [],
  currentSampleId: null,
  isPlaying: false,
  volume: 0.8,
  viewMode: 'grid', // 'grid' | 'list'

  // --- Filters ---
  searchQuery: '',
  activeTagFilters: [],
  formatFilter: null,

  // --- Tags ---
  tags: defaultTags,
  customTags: [],

  // --- Favorites ---
  showFavoritesOnly: false,

  // --- Collections ---
  collections: [],

  // --- Player state ---
  playbackTime: 0,
  playbackDuration: 0,

  // === Actions ===

  addSample: (sample) => {
    const s = {
      ...sample,
      id: `s_${++idCounter}`,
      tags: sample.tags || [],
      favorite: false,
      collection: null,
      bpm: sample.bpm || null,
      key: sample.key || null,
      peaks: sample.peaks || null,
    };
    set((state) => {
      const exists = state.samples.find((x) => x.path === s.path);
      if (exists) return state;
      const next = { samples: [...state.samples, s] };
      savePersisted({ ...state, ...next });
      return next;
    });
  },

  addSamples: (newSamples) => {
    set((state) => {
      const existingPaths = new Set(state.samples.map((s) => s.path));
      const toAdd = newSamples
        .filter((s) => !existingPaths.has(s.path))
        .map((s) => ({
          ...s,
          id: `s_${++idCounter}`,
          tags: s.tags || [],
          favorite: false,
          collection: null,
          bpm: s.bpm || null,
          key: s.key || null,
          peaks: s.peaks || null,
        }));
      if (toAdd.length === 0) return state;
      const next = { samples: [...state.samples, ...toAdd] };
      savePersisted({ ...state, ...next });
      return next;
    });
  },

  removeSample: (id) => {
    set((state) => {
      const next = { samples: state.samples.filter((s) => s.id !== id) };
      savePersisted({ ...state, ...next });
      return next;
    });
  },

  clearAllSamples: () => {
    set((state) => {
      const next = { samples: [] };
      savePersisted({ ...state, ...next });
      return next;
    });
  },

  // --- Tags ---

  toggleTagFilter: (category, value) => {
    set((state) => {
      const key = `${category}:${value}`;
      const exists = state.activeTagFilters.includes(key);
      const next = {
        activeTagFilters: exists
          ? state.activeTagFilters.filter((k) => k !== key)
          : [...state.activeTagFilters, key],
      };
      return next;
    });
  },

  clearTagFilters: () => set({ activeTagFilters: [] }),

  addTagToSample: (sampleId, tag) => {
    set((state) => {
      const next = {
        samples: state.samples.map((s) =>
          s.id === sampleId && !s.tags.includes(tag)
            ? { ...s, tags: [...s.tags, tag] }
            : s
        ),
      };
      savePersisted({ ...state, ...next });
      return next;
    });
  },

  removeTagFromSample: (sampleId, tag) => {
    set((state) => {
      const next = {
        samples: state.samples.map((s) =>
          s.id === sampleId
            ? { ...s, tags: s.tags.filter((t) => t !== tag) }
            : s
        ),
      };
      savePersisted({ ...state, ...next });
      return next;
    });
  },

  addCustomTag: (tag) => {
    set((state) => {
      if (state.customTags.includes(tag)) return state;
      const next = { customTags: [...state.customTags, tag] };
      savePersisted({ ...state, ...next });
      return next;
    });
  },

  // --- Favorites ---

  toggleFavorite: (sampleId) => {
    set((state) => {
      const next = {
        samples: state.samples.map((s) =>
          s.id === sampleId ? { ...s, favorite: !s.favorite } : s
        ),
      };
      savePersisted({ ...state, ...next });
      return next;
    });
  },

  // --- Player ---

  setCurrentSample: (id) => {
    const { currentSampleId, isPlaying } = get();
    if (currentSampleId === id && isPlaying) {
      set({ isPlaying: false });
    } else {
      set({ currentSampleId: id, isPlaying: true });
    }
  },

  setIsPlaying: (isPlaying) => set({ isPlaying }),

  setVolume: (volume) => set({ volume }),

  setPlaybackTime: (playbackTime) => set({ playbackTime }),
  setPlaybackDuration: (playbackDuration) => set({ playbackDuration }),

  // --- Filters ---

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFormatFilter: (formatFilter) =>
    set((state) => ({ formatFilter: state.formatFilter === formatFilter ? null : formatFilter })),
  setShowFavoritesOnly: (v) => set({ showFavoritesOnly: v }),
  setViewMode: (viewMode) => set({ viewMode }),

  // --- Collections ---

  addCollection: (name) => {
    set((state) => {
      if (state.collections.find((c) => c.name === name)) return state;
      const next = { collections: [...state.collections, { name, sampleIds: [] }] };
      savePersisted({ ...state, ...next });
      return next;
    });
  },

  removeCollection: (name) => {
    set((state) => {
      const next = { collections: state.collections.filter((c) => c.name !== name) };
      savePersisted({ ...state, ...next });
      return next;
    });
  },

  toggleSampleInCollection: (sampleId, collectionName) => {
    set((state) => {
      const next = {
        collections: state.collections.map((c) => {
          if (c.name !== collectionName) return c;
          const has = c.sampleIds.includes(sampleId);
          return {
            ...c,
            sampleIds: has ? c.sampleIds.filter((id) => id !== sampleId) : [...c.sampleIds, sampleId],
          };
        }),
      };
      savePersisted({ ...state, ...next });
      return next;
    });
  },

  // --- BPM / Key ---

  setSampleBpm: (sampleId, bpm) => {
    set((state) => {
      const next = {
        samples: state.samples.map((s) =>
          s.id === sampleId ? { ...s, bpm } : s
        ),
      };
      savePersisted({ ...state, ...next });
      return next;
    });
  },

  setSampleKey: (sampleId, key) => {
    set((state) => {
      const next = {
        samples: state.samples.map((s) =>
          s.id === sampleId ? { ...s, key } : s
        ),
      };
      savePersisted({ ...state, ...next });
      return next;
    });
  },

  setSamplePeaks: (sampleId, peaks) => {
    set((state) => {
      const next = {
        samples: state.samples.map((s) =>
          s.id === sampleId ? { ...s, peaks } : s
        ),
      };
      savePersisted({ ...state, ...next });
      return next;
    });
  },

  // --- Restore on init ---
  rehydrate: () => {
    const data = loadPersisted();
    if (!data) return;
    if (data.samples) {
      set({
        samples: data.samples,
        tags: data.tags || defaultTags,
        customTags: data.customTags || [],
        collections: data.collections || [],
      });
    }
  },
}));
