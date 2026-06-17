import { useRef, useCallback, useEffect } from 'react';
import { useSampleStore } from '../store';
import { useTranslation } from '../i18n';
import { formatSize, formatDuration } from '../utils/format';
import { HiPlay, HiStop, HiHeart, HiClock, HiDocumentDuplicate } from 'react-icons/hi2';

const WAVEFORM_BAR_WIDTH = 3;
const WAVEFORM_GAP = 1;

export default function SampleCard({ sample, onPreview }) {
  const { t } = useTranslation();
  const {
    currentSampleId,
    isPlaying,
    setCurrentSample,
    toggleFavorite,
    viewMode,
  } = useSampleStore();

  const canvasRef = useRef(null);
  const isActive = currentSampleId === sample.id;
  const isGrid = viewMode === 'grid';

  // Draw mini waveform on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    const peaks = sample.peaks;
    if (!peaks || peaks.length === 0) {
      // Draw flat line
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      return;
    }

    const barCount = Math.floor(w / (WAVEFORM_BAR_WIDTH + WAVEFORM_GAP));
    const step = Math.floor(peaks.length / barCount) || 1;

    for (let i = 0; i < barCount; i++) {
      const peakIdx = i * step;
      let val = 0;
      for (let j = 0; j < step && peakIdx + j < peaks.length; j++) {
        val = Math.max(val, peaks[peakIdx + j]);
      }
      const barHeight = Math.max(1, val * h * 0.8);
      const x = i * (WAVEFORM_BAR_WIDTH + WAVEFORM_GAP);
      const y = (h - barHeight) / 2;

      ctx.fillStyle = isActive ? '#a78bfa' : '#475569';
      ctx.fillRect(x, y, WAVEFORM_BAR_WIDTH, barHeight);
    }
  }, [sample.peaks, isActive, isGrid]);

  const handleClick = useCallback(() => {
    setCurrentSample(sample.id);
    if (onPreview) onPreview(sample);
  }, [sample, setCurrentSample, onPreview]);

  const handleCopyPath = useCallback((e) => {
    e.stopPropagation();
    if (sample.path) {
      navigator.clipboard.writeText(sample.path).catch(() => {});
    }
  }, [sample.path]);

  if (isGrid) {
    return (
      <div
        onClick={handleClick}
        className={`group cursor-pointer rounded-xl border p-3 transition-all duration-150
          ${isActive
            ? 'border-accent-500 bg-accent-500/10 shadow-lg shadow-accent-500/10'
            : 'border-surface-700 bg-surface-900 hover:border-surface-500 hover:bg-surface-800'}`}
      >
        {/* Waveform */}
        <div className="h-12 w-full rounded-md bg-surface-950/50 overflow-hidden mb-2">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {/* Play indicator */}
        {isActive && isPlaying && (
          <div className="flex items-center gap-1 mb-1 text-accent-400">
            <HiPlay className="w-3 h-3" />
            <div className="flex gap-0.5 items-end h-3">
              {[0.6, 1, 0.4, 0.8, 0.3, 1, 0.5].map((h, i) => (
                <div key={i} className="w-1 bg-accent-500 rounded-sm animate-pulse" style={{ height: `${h * 12}px`, animationDelay: `${i * 100}ms` }} />
              ))}
            </div>
          </div>
        )}

        {/* Name */}
        <p className="text-sm font-medium text-surface-200 truncate" title={sample.name}>
          {sample.name}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-2 mt-1 text-xs text-surface-500">
          <span className="uppercase bg-surface-800 px-1.5 py-0.5 rounded text-surface-400">
            {sample.format}
          </span>
          {sample.duration != null && (
            <span className="flex items-center gap-0.5">
              <HiClock className="w-3 h-3" />
              {formatDuration(sample.duration)}
            </span>
          )}
          {sample.size != null && (
            <span>{formatSize(sample.size)}</span>
          )}
        </div>

        {/* BPM / Key */}
        {(sample.bpm || sample.key) && (
          <div className="flex items-center gap-2 mt-1 text-xs text-surface-400">
            {sample.bpm && <span className="bg-surface-800 px-1.5 py-0.5 rounded">{sample.bpm} BPM</span>}
            {sample.key && <span className="bg-surface-800 px-1.5 py-0.5 rounded">{sample.key}</span>}
          </div>
        )}

        {/* Tags */}
        {sample.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {sample.tags.slice(0, 3).map((tag) => {
              const val = tag.includes(':') ? tag.split(':').pop() : tag;
              return (
                <span key={tag} className="text-[10px] bg-surface-800 text-surface-400 px-1.5 py-0.5 rounded">
                  {val}
                </span>
              );
            })}
            {sample.tags.length > 3 && (
              <span className="text-[10px] text-surface-500">+{sample.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-800">
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(sample.id); }}
            className={`p-1 rounded transition-colors ${sample.favorite ? 'text-red-400' : 'text-surface-600 hover:text-red-400'}`}
            title={t.favorite}
          >
            <HiHeart className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopyPath}
            className="p-1 rounded text-surface-600 hover:text-surface-300 transition-colors"
            title={t.copyPath}
          >
            <HiDocumentDuplicate className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div
      onClick={handleClick}
      className={`group flex items-center gap-3 cursor-pointer rounded-lg border px-4 py-2.5 transition-all duration-150
        ${isActive
          ? 'border-accent-500 bg-accent-500/10'
          : 'border-transparent bg-surface-900 hover:bg-surface-800 hover:border-surface-700'}`}
    >
      {/* Mini waveform */}
      <div className="w-20 h-8 rounded bg-surface-950/50 overflow-hidden flex-shrink-0 hidden sm:block">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Play/Stop icon */}
      <div className="flex-shrink-0 w-6 text-center">
        {isActive && isPlaying ? (
          <HiStop className="w-4 h-4 text-accent-400 mx-auto" />
        ) : (
          <HiPlay className="w-4 h-4 text-surface-500 mx-auto" />
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-surface-200 truncate">{sample.name}</p>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-surface-500">
          <span className="uppercase bg-surface-800 px-1 py-0.5 rounded text-surface-400">{sample.format}</span>
          {sample.duration != null && formatDuration(sample.duration)}
          {sample.size != null && formatSize(sample.size)}
          {sample.bpm && <span className="text-accent-400">{sample.bpm} BPM</span>}
          {sample.key && <span className="text-surface-400">{sample.key}</span>}
        </div>
      </div>

      {/* Tags */}
      <div className="hidden lg:flex flex-wrap gap-1 max-w-[200px]">
        {sample.tags.slice(0, 3).map((tag) => {
          const val = tag.includes(':') ? tag.split(':').pop() : tag;
          return (
            <span key={tag} className="text-[10px] bg-surface-800 text-surface-400 px-1.5 py-0.5 rounded whitespace-nowrap">
              {val}
            </span>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(sample.id); }}
          className={`p-1.5 rounded transition-colors ${sample.favorite ? 'text-red-400' : 'text-surface-600 hover:text-red-400 opacity-0 group-hover:opacity-100'}`}
          title={t.favorite}
        >
          <HiHeart className="w-4 h-4" />
        </button>
        <button
          onClick={handleCopyPath}
          className="p-1.5 rounded text-surface-600 hover:text-surface-300 transition-colors opacity-0 group-hover:opacity-100"
          title={t.copyPath}
        >
          <HiDocumentDuplicate className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
