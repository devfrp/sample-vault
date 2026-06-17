import { useCallback, useRef, useState } from 'react';
import { useSampleStore } from '../store';
import { useTranslation } from '../i18n';
import { getFormat, hasFileSystemAccess } from '../utils/format';
import { detectBpm } from '../utils/bpm';
import { detectKeyFromBuffer } from '../utils/key-detection';
import { HiArrowUpTray, HiFolderPlus } from 'react-icons/hi2';

export default function ImportButton() {
  const { t } = useTranslation();
  const addSamples = useSampleStore((s) => s.addSamples);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);
  const dirInputRef = useRef(null);

  const processFile = useCallback(async (file) => {
    const format = getFormat(file.name);
    if (!['wav', 'mp3', 'flac', 'ogg', 'aiff', 'aif'].includes(format)) return null;

    let duration = null;
    let peaks = null;
    let bpm = null;
    let key = null;
    let blobUrl = null;

    try {
      const arrayBuffer = await file.arrayBuffer();

      const actx = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await actx.decodeAudioData(arrayBuffer.slice(0));

      duration = audioBuffer.duration;
      peaks = extractPeaks(audioBuffer, 200);

      // BPM detection (async off main thread if possible)
      try {
        bpm = detectBpm(audioBuffer);
      } catch { /* ignore */ }

      // Key detection
      try {
        key = detectKeyFromBuffer(audioBuffer);
      } catch { /* ignore */ }

      const blob = new Blob([arrayBuffer], { type: file.type || `audio/${format}` });
      blobUrl = URL.createObjectURL(blob);

      actx.close();
    } catch (err) {
      console.warn(`Failed to process ${file.name}:`, err);
      // Still add the file even if audio processing failed
      blobUrl = URL.createObjectURL(file);
    }

    return {
      name: file.name,
      path: blobUrl,
      format,
      duration,
      size: file.size,
      bpm,
      key,
      peaks,
    };
  }, []);

  const handleFiles = useCallback(async (files) => {
    setIsImporting(true);
    const audioFiles = Array.from(files).filter((f) => {
      const fmt = getFormat(f.name);
      return ['wav', 'mp3', 'flac', 'ogg', 'aiff', 'aif'].includes(fmt);
    });

    if (audioFiles.length === 0) {
      setIsImporting(false);
      return;
    }

    const samples = [];
    for (const file of audioFiles) {
      const sample = await processFile(file);
      if (sample) samples.push(sample);
    }

    if (samples.length > 0) {
      addSamples(samples);
    }
    setIsImporting(false);
  }, [addSamples, processFile]);

  const handleFileSelect = useCallback((e) => {
    handleFiles(e.target.files);
    e.target.value = '';
  }, [handleFiles]);

  const handleDirSelect = useCallback(async () => {
    if (!hasFileSystemAccess()) {
      alert(t.fileApiUnavailable);
      return;
    }

    try {
      const dirHandle = await window.showDirectoryPicker();
      const files = [];
      const scan = async (handle, prefix = '') => {
        for await (const [name, entry] of handle.entries()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            Object.defineProperty(file, 'webkitRelativePath', { value: prefix + name });
            files.push(file);
          } else if (entry.kind === 'directory') {
            await scan(entry, `${prefix}${name}/`);
          }
        }
      }
      await scan(dirHandle);
      await handleFiles(files);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Folder import failed:', err);
      }
    }
  }, [handleFiles, t]);

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.wav,.mp3,.flac,.ogg,.aiff,.aif"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={dirInputRef}
        type="file"
        webkitdirectory=""
        onChange={handleFileSelect}
        className="hidden"
      />

      <button onClick={() => fileInputRef.current?.click()} disabled={isImporting} className="btn-primary">
        <HiArrowUpTray className="w-4 h-4" />
        {isImporting ? t.importing : t.importFiles}
      </button>

      {hasFileSystemAccess() && (
        <button onClick={handleDirSelect} disabled={isImporting} className="btn-secondary">
          <HiFolderPlus className="w-4 h-4" />
          {t.folder}
        </button>
      )}

      {/* Fallback folder import for non-Chrome browsers */}
      {!hasFileSystemAccess() && (
        <button onClick={() => dirInputRef.current?.click()} disabled={isImporting} className="btn-secondary">
          <HiFolderPlus className="w-4 h-4" />
          {t.folder}
        </button>
      )}
    </div>
  );
}

function extractPeaks(audioBuffer, count) {
  const data = audioBuffer.getChannelData(0);
  const step = Math.floor(data.length / count);
  const peaks = [];
  for (let i = 0; i < count; i++) {
    const start = i * step;
    const end = start + step;
    let max = 0;
    for (let j = start; j < end; j++) {
      const abs = Math.abs(data[j]);
      if (abs > max) max = abs;
    }
    peaks.push(max);
  }
  return peaks;
}
