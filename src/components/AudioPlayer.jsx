import { useRef, useCallback } from 'react';
import { useSampleStore } from '../store';
import { useTranslation } from '../i18n';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { formatDuration } from '../utils/format';


import {
  HiPlay,
  HiPause,
  HiSpeakerWave,
  HiSpeakerXMark,
  HiDocumentDuplicate,
  HiHeart,
  HiArrowPath,
} from 'react-icons/hi2';

export default function AudioPlayer() {
  const { t } = useTranslation();
  const waveformRef = useRef(null);
  const { isLoading } = useAudioEngine(waveformRef);

  const currentSampleId = useSampleStore((s) => s.currentSampleId);
  const isPlaying = useSampleStore((s) => s.isPlaying);
  const setIsPlaying = useSampleStore((s) => s.setIsPlaying);
  const volume = useSampleStore((s) => s.volume);
  const setVolume = useSampleStore((s) => s.setVolume);
  const playbackTime = useSampleStore((s) => s.playbackTime);
  const playbackDuration = useSampleStore((s) => s.playbackDuration);
  const samples = useSampleStore((s) => s.samples);
  const toggleFavorite = useSampleStore((s) => s.toggleFavorite);
  const setSampleBpm = useSampleStore((s) => s.setSampleBpm);
  const setSampleKey = useSampleStore((s) => s.setSampleKey);

  const currentSample = samples.find((s) => s.id === currentSampleId);

  const handleCopyPath = useCallback(() => {
    if (currentSample?.path) {
      navigator.clipboard.writeText(currentSample.path).catch(() => {});
    }
  }, [currentSample]);

  const handleRedetect = useCallback(async () => {
    if (!currentSample?.path) return;

    try {
      const response = await fetch(currentSample.path);
      const arrayBuffer = await response.arrayBuffer();
      const actx = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await actx.decodeAudioData(arrayBuffer.slice(0));

      // Re-detect BPM and Key
      const { detectBpm } = await import('../utils/bpm');
      const { detectKeyFromBuffer } = await import('../utils/key-detection');
      const bpm = detectBpm(audioBuffer);
      const key = detectKeyFromBuffer(audioBuffer);

      if (bpm) setSampleBpm(currentSampleId, bpm);
      if (key) setSampleKey(currentSampleId, key);

      actx.close();
    } catch (err) {
      console.warn('Re-detection failed:', err);
    }
  }, [currentSample, currentSampleId, setSampleBpm, setSampleKey]);

  if (!currentSample) {
    return (
      <div className="h-16 flex items-center justify-center text-surface-600 text-sm border-t border-surface-800 bg-surface-950">
        {t.selectSample}
      </div>
    );
  }

  return (
    <div className="border-t border-surface-800 bg-surface-900/95 backdrop-blur">
      {/* Waveform */}
      <div ref={waveformRef} className="w-full cursor-pointer" />

      <div className="flex items-center gap-3 px-4 py-2">
        {/* Play/Pause */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 rounded-lg bg-accent-600 text-white hover:bg-accent-500 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <HiArrowPath className="w-5 h-5 animate-spin" />
          ) : isPlaying ? (
            <HiPause className="w-5 h-5" />
          ) : (
            <HiPlay className="w-5 h-5" />
          )}
        </button>

        {/* Time */}
        <span className="text-xs text-surface-400 min-w-[60px] tabular-nums">
          {formatDuration(playbackTime)} / {formatDuration(playbackDuration)}
        </span>

        {/* Sample info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-surface-200 truncate">{currentSample.name}</p>
          <div className="flex items-center gap-2 text-xs text-surface-500">
            <span className="uppercase">{currentSample.format}</span>
            {currentSample.bpm && <span className="text-accent-400">{currentSample.bpm} BPM</span>}
            {currentSample.key && <span className="text-surface-400">{currentSample.key}</span>}
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
            className="p-1 text-surface-500 hover:text-surface-300"
          >
            {volume === 0 ? <HiSpeakerXMark className="w-4 h-4" /> : <HiSpeakerWave className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-surface-700 rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-500"
          />
        </div>

        {/* Actions */}
        <button
          onClick={() => toggleFavorite(currentSample.id)}
          className={`p-1.5 rounded transition-colors ${currentSample.favorite ? 'text-red-400' : 'text-surface-500 hover:text-red-400'}`}
          title={t.favorite}
        >
          <HiHeart className="w-4 h-4" />
        </button>

        <button
          onClick={handleCopyPath}
          className="p-1.5 rounded text-surface-500 hover:text-surface-300 transition-colors"
          title={t.copyPath}
        >
          <HiDocumentDuplicate className="w-4 h-4" />
        </button>

        <button
          onClick={handleRedetect}
          className="p-1.5 rounded text-surface-500 hover:text-accent-400 transition-colors"
          title={t.redetect}
        >
          <HiArrowPath className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
