> [🇫🇷 Version française](README.fr.md)

# SampleVault 🔊

**Offline-first** audio sample manager, designed for music producer and sound designer workflows.

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Stack: React](https://img.shields.io/badge/frontend-React%20%2B%20Tailwind-61DAFB?logo=react)
![Stack: Node](https://img.shields.io/badge/backend-Node.js%20%2B%20SQLite-339933?logo=node.js)

## ✨ Features

- **Local import** — individual files or entire folders via File System Access API
- **Audio preview** — interactive waveform with wavesurfer.js
- **Auto-detection** — BPM (autocorrelation) + musical key (Krumhansl-Schmuckler)
- **Tags** — instrument, genre, mood, type + custom tags
- **Filters** — multi-tag, format, favorites, full-text search
- **Export** — CSV / JSON of the filtered list
- **Path copy** — for drag & drop into Reaper, Ableton, FL Studio
- **Collections** — organize your samples by project
- **100% offline** — everything stays local, no data leaves your machine

## 🚀 Installation

```bash
git clone https://github.com/<user>/sample-vault.git
cd sample-vault

# Front-end (required)
npm install
npm run dev      # → http://localhost:3000

# Production build (for GitHub Pages)
npm run build    # → dist/
```

### Optional backend (folder scanning + SQLite persistence)

```bash
npm install better-sqlite3 express cors music-metadata
npm run server   # → http://localhost:3100
```

Environment variables:
- `SAMPLES_DIR` — folder to scan (default: `~/Samples`)
- `PORT` — server port (default: `3100`)

## 📁 Structure

```
sample-vault/
├── index.html                 # HTML entry point
├── package.json               # Dependencies & scripts
├── vite.config.js             # Vite config
├── tailwind.config.js         # Tailwind theme
├── .eslintrc.cjs              # ESLint config
├── src/
│   ├── index.jsx              # React entry point
│   ├── index.css              # Global styles (Tailwind)
│   ├── App.jsx                # Root component
│   ├── store.js               # Zustand store (state management)
│   ├── components/
│   │   ├── Layout.jsx         # Main layout
│   │   ├── SampleGrid.jsx     # Sample grid/list
│   │   ├── SampleCard.jsx     # Sample card (grid + list)
│   │   ├── AudioPlayer.jsx    # Player with waveform
│   │   ├── FilterBar.jsx      # Filters & tags
│   │   ├── SearchBar.jsx      # Search bar
│   │   ├── TagEditor.jsx      # Tag editor (popup)
│   │   ├── ImportButton.jsx   # File/folder import
│   │   └── ExportMenu.jsx     # CSV/JSON export
│   ├── hooks/
│   │   └── useAudioEngine.js  # WaveSurfer hook
│   └── utils/
│       ├── bpm.js             # BPM detection
│       ├── key-detection.js   # Musical key detection
│       ├── format.js          # Formatters (size, duration)
│       ├── export.js          # CSV/JSON export
│       └── tags.js            # Tag utilities
├── server/
│   └── index.js               # Express + SQLite backend
└── .github/
    └── workflows/
        └── ci.yml             # GitHub Actions CI
```

## 🖥️ GitHub Pages Deployment

1. Build the project: `npm run build`
2. The `dist/` folder is ready to deploy
3. Configure GitHub Pages to serve from `/docs` or use `gh-pages`

```bash
npx gh-pages -d dist
```

## 🎹 Shortcuts

| Action | Description |
|--------|-------------|
| Click a sample | Play / Pause |
| 📋 Button | Copy file path |
| 🔄 Button | Re-detect BPM & Key |
| Filters | Click = enable, click again = disable |

## 🔧 Compatibility

- **Linux** (Manjaro / Ubuntu) — primary target
- **Browsers** — Chrome, Edge, Firefox (File System Access API requires Chromium for folder import)
- **Supported formats** — WAV, MP3, FLAC, OGG, AIFF

## 📄 License

MIT
