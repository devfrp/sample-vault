import { useMemo } from 'react';
import { useSampleStore } from '../store';
import { useTranslation } from '../i18n';
import SampleCard from './SampleCard';
import { HiMusicalNote, HiFolderOpen } from 'react-icons/hi2';

export default function SampleGrid({ onPreview }) {
  const { t } = useTranslation();
  const samples = useSampleStore((s) => s.samples);
  const viewMode = useSampleStore((s) => s.viewMode);
  const searchQuery = useSampleStore((s) => s.searchQuery);
  const activeTagFilters = useSampleStore((s) => s.activeTagFilters);
  const formatFilter = useSampleStore((s) => s.formatFilter);
  const showFavoritesOnly = useSampleStore((s) => s.showFavoritesOnly);

  const filtered = useMemo(() => {
    let result = samples;

    if (showFavoritesOnly) {
      result = result.filter((s) => s.favorite);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (formatFilter) {
      result = result.filter((s) => s.format === formatFilter);
    }

    if (activeTagFilters.length > 0) {
      result = result.filter((s) =>
        activeTagFilters.every((key) => s.tags.includes(key))
      );
    }

    return result;
  }, [samples, searchQuery, activeTagFilters, formatFilter, showFavoritesOnly]);

  if (samples.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-surface-500">
        <HiFolderOpen className="w-16 h-16 mb-4 text-surface-700" />
        <p className="text-lg font-medium">{t.noSamples}</p>
        <p className="text-sm text-surface-600 mt-1">
          {t.noSamplesHint}
        </p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-surface-500">
        <HiMusicalNote className="w-16 h-16 mb-4 text-surface-700" />
        <p className="text-lg font-medium">{t.noResults}</p>
        <p className="text-sm text-surface-600 mt-1">
          {t.noResultsHint}
        </p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {filtered.map((sample) => (
          <SampleCard key={sample.id} sample={sample} onPreview={onPreview} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {filtered.map((sample) => (
        <SampleCard key={sample.id} sample={sample} onPreview={onPreview} />
      ))}
    </div>
  );
}
