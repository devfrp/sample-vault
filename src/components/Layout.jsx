import { useState, useCallback } from 'react';
import { useSampleStore } from '../store';
import { useTranslation } from '../i18n';
import ImportButton from './ImportButton';
import ExportMenu from './ExportMenu';
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';
import SampleGrid from './SampleGrid';
import AudioPlayer from './AudioPlayer';
import {
  HiSquares2X2,
  HiListBullet,
  HiMusicalNote,
  HiXMark,
  HiTrash,
} from 'react-icons/hi2';

export default function Layout() {
  const { t, lang, setLang } = useTranslation();
  const viewMode = useSampleStore((s) => s.viewMode);
  const setViewMode = useSampleStore((s) => s.setViewMode);
  const samples = useSampleStore((s) => s.samples);
  const clearAllSamples = useSampleStore((s) => s.clearAllSamples);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClear = useCallback(() => {
    clearAllSamples();
    setShowClearConfirm(false);
  }, [clearAllSamples]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-surface-900 border-b border-surface-800 px-4 py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Left */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <HiMusicalNote className="w-6 h-6 text-accent-500" />
              <h1 className="text-lg font-bold text-surface-100">SampleVault</h1>
            </div>
            <span className="text-xs text-surface-500 bg-surface-800 px-2 py-0.5 rounded-full">
              {t.samplesCount(samples.length)}
            </span>
          </div>

          {/* Center */}
          <div className="flex-1 max-w-md">
            <SearchBar />
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 bg-surface-800 rounded-lg p-0.5 mr-1">
              <button
                onClick={() => setLang('fr')}
                className={`px-2 py-1 rounded text-xs ${lang === 'fr' ? 'bg-surface-700 text-surface-200' : 'text-surface-500 hover:text-surface-300'}`}
                title="Français"
              >
                FR
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded text-xs ${lang === 'en' ? 'bg-surface-700 text-surface-200' : 'text-surface-500 hover:text-surface-300'}`}
                title="English"
              >
                EN
              </button>
            </div>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn-ghost text-xs px-2 py-1.5"
            >
              {sidebarOpen ? <HiXMark className="w-4 h-4" /> : t.filters}
            </button>

            <div className="flex items-center gap-0.5 bg-surface-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2 py-1.5 rounded text-xs ${viewMode === 'grid' ? 'bg-surface-700 text-surface-200' : 'text-surface-500 hover:text-surface-300'}`}
              >
                <HiSquares2X2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2 py-1.5 rounded text-xs ${viewMode === 'list' ? 'bg-surface-700 text-surface-200' : 'text-surface-500 hover:text-surface-300'}`}
              >
                <HiListBullet className="w-4 h-4" />
              </button>
            </div>

            <ImportButton />
            <ExportMenu />

            {samples.length > 0 && (
              showClearConfirm ? (
                <div className="flex items-center gap-1">
                  <button onClick={handleClear} className="btn text-xs px-2 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/40">
                    {t.confirm}
                  </button>
                  <button onClick={() => setShowClearConfirm(false)} className="btn-ghost text-xs px-2 py-1">
                    {t.cancel}
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowClearConfirm(true)} className="btn-ghost text-xs px-2 py-1.5 text-surface-500 hover:text-red-400" title={t.clearAll}>
                  <HiTrash className="w-4 h-4" />
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-60 flex-shrink-0 border-r border-surface-800 bg-surface-900/50 overflow-y-auto p-4">
            <FilterBar />
          </aside>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <SampleGrid onPreview={() => {}} />
        </main>
      </div>

      {/* Player */}
      <AudioPlayer />
    </div>
  );
}
