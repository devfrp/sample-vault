> [🇬🇧 English version](README.md)

# SampleVault 🔊

Gestionnaire de samples audio **offline-first**, pensé pour le workflow des producteurs musique / sound designers.

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Stack: React](https://img.shields.io/badge/frontend-React%20%2B%20Tailwind-61DAFB?logo=react)
![Stack: Node](https://img.shields.io/badge/backend-Node.js%20%2B%20SQLite-339933?logo=node.js)

## ✨ Fonctionnalités

- **Import local** — fichiers individuels ou dossier entier via File System Access API
- **Prévisualisation audio** — waveform interactive avec wavesurfer.js
- **Détection automatique** — BPM (autocorrélation) + clé musicale (Krumhansl-Schmuckler)
- **Tags** — instrument, genre, humeur, type + tags custom
- **Filtres** — multi-tags, format, favoris, recherche full-text
- **Export** — CSV / JSON de la liste filtrée
- **Copie de chemin** — pour drag & drop vers Reaper, Ableton, FL Studio
- **Collections** — organisez vos samples par projet
- **100% offline** — tout reste en local, aucune donnée ne sort

## 🚀 Installation

```bash
git clone https://github.com/<user>/sample-vault.git
cd sample-vault

# Front-end (obligatoire)
npm install
npm run dev      # → http://localhost:3000

# Build production (pour GitHub Pages)
npm run build    # → dist/
```

### Backend optionnel (scan dossier + persistance SQLite)

```bash
npm install better-sqlite3 express cors music-metadata
npm run server   # → http://localhost:3100
```

Variables d'environnement :
- `SAMPLES_DIR` — dossier à scanner (défaut: `~/Samples`)
- `PORT` — port du serveur (défaut: `3100`)

## 📁 Structure

```
sample-vault/
├── index.html                 # Entrée HTML
├── package.json               # Dépendances & scripts
├── vite.config.js             # Configuration Vite
├── tailwind.config.js         # Thème Tailwind
├── .eslintrc.cjs              # Configuration ESLint
├── src/
│   ├── index.jsx              # Point d'entrée React
│   ├── index.css              # Styles globaux (Tailwind)
│   ├── App.jsx                # Composant racine
│   ├── store.js               # Store Zustand (state management)
│   ├── components/
│   │   ├── Layout.jsx         # Layout principal
│   │   ├── SampleGrid.jsx     # Grille/liste des samples
│   │   ├── SampleCard.jsx     # Carte sample (grid + list)
│   │   ├── AudioPlayer.jsx    # Lecteur avec waveform
│   │   ├── FilterBar.jsx      # Filtres & tags
│   │   ├── SearchBar.jsx      # Barre de recherche
│   │   ├── TagEditor.jsx      # Éditeur de tags (popup)
│   │   ├── ImportButton.jsx   # Import fichiers/dossier
│   │   └── ExportMenu.jsx     # Export CSV/JSON
│   ├── hooks/
│   │   └── useAudioEngine.js  # Hook WaveSurfer
│   └── utils/
│       ├── bpm.js             # Détection BPM
│       ├── key-detection.js   # Détection de clé musicale
│       ├── format.js          # Formateurs (taille, durée)
│       ├── export.js          # Export CSV/JSON
│       └── tags.js            # Utilitaires tags
├── server/
│   └── index.js               # Backend Express + SQLite
└── .github/
    └── workflows/
        └── ci.yml             # CI GitHub Actions
```

## 🖥️ Déploiement GitHub Pages

1. Build le projet : `npm run build`
2. Le dossier `dist/` est prêt à être déployé
3. Configure GitHub Pages pour servir depuis `/docs` ou utilise `gh-pages`

```bash
npx gh-pages -d dist
```

## 🎹 Raccourcis

| Action | Description |
|--------|-------------|
| Clic sur un sample | Lecture / Pause |
| Bouton 📋 | Copier le chemin du fichier |
| Bouton 🔄 | Re-détecter BPM & Key |
| Filtres | Clic = activer, re-clic = désactiver |

## 🔧 Compatibilité

- **Linux** (Manjaro / Ubuntu) — prioritaire
- **Navigateurs** — Chrome, Edge, Firefox (File System Access API nécessite Chromium pour l'import de dossier)
- **Formats supportés** — WAV, MP3, FLAC, OGG, AIFF

## 📄 Licence

MIT
