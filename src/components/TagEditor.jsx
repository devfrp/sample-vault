import { useState, useRef, useEffect } from 'react';
import { useSampleStore } from '../store';
import { useTranslation } from '../i18n';
import { HiXMark, HiPlus } from 'react-icons/hi2';

export default function TagEditor({ sample, onClose }) {
  const { t } = useTranslation();
  const tags = useSampleStore((s) => s.tags);
  const customTags = useSampleStore((s) => s.customTags);
  const addTagToSample = useSampleStore((s) => s.addTagToSample);
  const removeTagFromSample = useSampleStore((s) => s.removeTagFromSample);
  const addCustomTag = useSampleStore((s) => s.addCustomTag);

  const [newTag, setNewTag] = useState('');
  const inputRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const allTags = [
    ...tags,
    ...(customTags.length > 0 ? [{ category: 'Custom', values: customTags }] : []),
  ];

  const handleAddTag = (category, value) => {
    const key = `${category}:${value}`;
    if (sample.tags.includes(key)) {
      removeTagFromSample(sample.id, key);
    } else {
      addTagToSample(sample.id, key);
    }
  };

  const handleAddCustom = () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    addCustomTag(trimmed);
    addTagToSample(sample.id, `Custom:${trimmed}`);
    setNewTag('');
  };

  return (
    <div
      ref={panelRef}
      className="absolute z-50 right-0 top-full mt-1 w-72 bg-surface-800 border border-surface-700 rounded-xl shadow-xl p-3"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-surface-200">Tags — {sample.name}</h4>
        <button onClick={onClose} className="p-0.5 text-surface-500 hover:text-surface-300">
          <HiXMark className="w-4 h-4" />
        </button>
      </div>

      {/* Current tags */}
      {sample.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {sample.tags.map((tag) => {
            const val = tag.includes(':') ? tag.split(':').pop() : tag;
            return (
              <span
                key={tag}
                className="tag-active"
                onClick={() => removeTagFromSample(sample.id, tag)}
              >
                {val}
                <HiXMark className="w-3 h-3" />
              </span>
            );
          })}
        </div>
      )}

      {/* Tag categories */}
      <div className="max-h-64 overflow-y-auto space-y-2">
        {allTags.map((group) => (
          <div key={group.category}>
            <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-1">
              {group.category}
            </p>
            <div className="flex flex-wrap gap-1">
              {group.values.map((value) => {
                const key = `${group.category}:${value}`;
                const isActive = sample.tags.includes(key);
                return (
                  <span
                    key={key}
                    className={isActive ? 'tag-active' : 'tag'}
                    onClick={() => handleAddTag(group.category, value)}
                  >
                    {value}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Add custom tag */}
      <div className="mt-3 pt-3 border-t border-surface-700">
        <div className="flex gap-1.5">
          <input
            ref={inputRef}
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
            placeholder={t.newTag}
            className="input text-xs py-1.5"
          />
          <button onClick={handleAddCustom} className="btn-primary px-3 py-1.5 text-xs">
            <HiPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
