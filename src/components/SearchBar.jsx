import { useSampleStore } from '../store';
import { useTranslation } from '../i18n';
import { HiMagnifyingGlass, HiXMark } from 'react-icons/hi2';

export default function SearchBar() {
  const { t } = useTranslation();
  const searchQuery = useSampleStore((s) => s.searchQuery);
  const setSearchQuery = useSampleStore((s) => s.setSearchQuery);

  return (
    <div className="relative">
      <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t.searchPlaceholder}
        className="input pl-9 pr-8"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-surface-500 hover:text-surface-300"
        >
          <HiXMark className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
