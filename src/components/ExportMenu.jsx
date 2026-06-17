import { useState, useRef, useEffect, useMemo } from 'react';
import { useSampleStore } from '../store';
import { useTranslation } from '../i18n';
import { exportCSV, exportJSON } from '../utils/export';
import { HiArrowDownTray, HiTableCells, HiCodeBracketSquare } from 'react-icons/hi2';

export default function ExportMenu() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const samples = useSampleStore((s) => s.samples);
  const searchQuery = useSampleStore((s) => s.searchQuery);
  const activeTagFilters = useSampleStore((s) => s.activeTagFilters);
  const formatFilter = useSampleStore((s) => s.formatFilter);
  const showFavoritesOnly = useSampleStore((s) => s.showFavoritesOnly);

  const filtered = useMemo(() => {
    let result = samples;
    if (showFavoritesOnly) result = result.filter((s) => s.favorite);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)));
    }
    if (formatFilter) result = result.filter((s) => s.format === formatFilter);
    if (activeTagFilters.length > 0) {
      result = result.filter((s) =>
        activeTagFilters.every((key) => s.tags.includes(key)));
    }
    return result;
  }, [samples, searchQuery, activeTagFilters, formatFilter, showFavoritesOnly]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="btn-secondary">
        <HiArrowDownTray className="w-4 h-4" />
        {t.export}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-surface-800 border border-surface-700 rounded-xl shadow-xl p-1.5 z-50">
          <button
            onClick={() => { exportCSV(filtered); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-300 hover:bg-surface-700 rounded-lg transition-colors"
          >
            <HiTableCells className="w-4 h-4 text-surface-500" />
            {t.exportCsv}
            <span className="ml-auto text-xs text-surface-500">{filtered.length}</span>
          </button>
          <button
            onClick={() => { exportJSON(filtered); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-300 hover:bg-surface-700 rounded-lg transition-colors"
          >
            <HiCodeBracketSquare className="w-4 h-4 text-surface-500" />
            {t.exportJson}
            <span className="ml-auto text-xs text-surface-500">{filtered.length}</span>
          </button>
          <div className="border-t border-surface-700 mt-1 pt-1">
            <p className="px-3 py-1 text-[10px] text-surface-500">
              {filtered.length === samples.length
                ? t.allSamples
                : t.filteredSamples(filtered.length, samples.length)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
