import { useEffect, useRef, useCallback, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useSampleStore } from '../store';

export function useAudioEngine(containerRef) {
  const wavesurferRef = useRef(null);
  const isReadyRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    currentSampleId,
    isPlaying,
    volume,
    setIsPlaying,
    setPlaybackTime,
    setPlaybackDuration,
    samples,
    setSamplePeaks,
  } = useSampleStore();

  // Initialize WaveSurfer once
  useEffect(() => {
    if (!containerRef.current || wavesurferRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#8b5cf6',
      progressColor: '#7c3aed',
      cursorColor: '#a78bfa',
      cursorWidth: 2,
      height: 48,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      normalize: true,
      backend: 'WebAudio',
    });

    ws.on('ready', () => {
      isReadyRef.current = true;
      setIsLoading(false);
      setPlaybackDuration(ws.getDuration());
      if (isPlaying) ws.play();
    });

    ws.on('audioprocess', () => {
      setPlaybackTime(ws.getCurrentTime());
    });

    ws.on('finish', () => {
      setIsPlaying(false);
      setPlaybackTime(0);
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));

    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
      wavesurferRef.current = null;
      isReadyRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load sample when currentSampleId changes
  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws) return;

    if (!currentSampleId) {
      ws.empty();
      isReadyRef.current = false;
      return;
    }

    const sample = samples.find((s) => s.id === currentSampleId);
    if (!sample) return;

    if (sample.path) {
      setIsLoading(true);
      isReadyRef.current = false;
      ws.load(sample.path);
    }
  }, [currentSampleId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync play/pause
  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws || !isReadyRef.current) return;

    if (isPlaying) {
      ws.play();
    } else {
      ws.pause();
    }
  }, [isPlaying]);

  // Sync volume
  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws) return;
    ws.setVolume(volume);
  }, [volume]);

  const loadFromFile = useCallback(async (file, sampleId) => {
    const arrayBuffer = await file.arrayBuffer();

    // Decode audio to get duration and peaks
    const actx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await actx.decodeAudioData(arrayBuffer.slice(0));

    const duration = audioBuffer.duration;
    const peaks = extractPeaks(audioBuffer, 200);

    // Store peaks
    setSamplePeaks(sampleId, peaks);

    // Create blob URL for playback
    const blob = new Blob([arrayBuffer], { type: file.type || 'audio/wav' });
    const blobUrl = URL.createObjectURL(blob);

    actx.close();

    return { duration, peaks, blobUrl };
  }, [setSamplePeaks]);

  const loadFromPath = useCallback(async (path) => {
    setIsLoading(true);
    const ws = wavesurferRef.current;
    if (ws) {
      ws.load(path);
    }
  }, []);

  const destroy = useCallback(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
      isReadyRef.current = false;
    }
  }, []);

  return { isLoading, loadFromFile, loadFromPath, destroy };
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
