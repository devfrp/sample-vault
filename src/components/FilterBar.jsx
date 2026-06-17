import { useSampleStore } from '../store';
import { useTranslation } from '../i18n';
import { parseTagKey } from '../utils/tags';
import { HiXMark } from 'react-icons/hi2';

export default function FilterBar() {
  const { t } = useTranslation();
  const tags = useSampleStore((s) => s.tags);
  const customTags = useSampleStore((s) => s.customTags);
  const activeTagFilters = useSampleStore((s) => s.activeTagFilters);
  const formatFilter = useSampleStore((s) => s.formatFilter);
  const showFavoritesOnly = useSampleStore((s) => s.showFavoritesOnly);
  const toggleTagFilter = useSampleStore((s) => s.toggleTagFilter);
  const clearTagFilters = useSampleStore((s) => s.clearTagFilters);
  const setFormatFilter = useSampleStore((s) => s.setFormatFilter);
  const setShowFavoritesOnly = useSampleStore((s) => s.setShowFavoritesOnly);
  const samples = useSampleStore((s) => s.samples);

  const formats = [...new Set(samples.map((s) => s.format).filter(Boolean))];

  return (
    <div className="space-y-3">
      {/* Active filters chips */}
      {activeTagFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeTagFilters.map((key) => {
            const { category, value } = parseTagKey(key);
            return (
              <span key={key} className="tag-active" onClick={() => toggleTagFilter(category, value)}>
                {value}
                <HiXMark className="w-3 h-3" />
              </span>
            );
          })}
          <button onClick={clearTagFilters} className="text-xs text-surface-500 hover:text-surface-300 ml-1">
            {t.clearFilters}
          </button>
        </div>
      )}

      {/* Tag categories */}
      {tags.map((group) => (
        <div key={group.category}>
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
            {group.category}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {group.values.map((value) => {
              const key = `${group.category}:${value}`;
              const isActive = activeTagFilters.includes(key);
              return (
                <span
                  key={key}
                  className={isActive ? 'tag-active' : 'tag'}
                  onClick={() => toggleTagFilter(group.category, value)}
                >
                  {value}
                </span>
              );
            })}
          </div>
        </div>
      ))}

      {/* Custom tags */}
      {customTags.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
            {t.custom}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {customTags.map((tag) => {
              const key = `Custom:${tag}`;
              const isActive = activeTagFilters.includes(key);
              return (
                <span
                  key={key}
                  className={isActive ? 'tag-active' : 'tag'}
                  onClick={() => toggleTagFilter('Custom', tag)}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Format filter */}
      {formats.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
            {t.format}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {formats.map((fmt) => (
              <span
                key={fmt}
                className={formatFilter === fmt ? 'tag-active uppercase' : 'tag uppercase'}
                onClick={() => setFormatFilter(fmt)}
              >
                {fmt}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Favorites toggle */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showFavoritesOnly}
            onChange={(e) => setShowFavoritesOnly(e.target.checked)}
            className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-accent-500 focus:ring-accent-500"
          />
          <span className="text-xs font-medium text-surface-400">{t.favoritesOnly}</span>
        </label>
      </div>
    </div>
  );
}
