/**
 * BPM detection using onset detection + autocorrelation.
 * Algorithm: energy-based onset detection on multiple sub-bands,
 * then autocorrelation on the onset envelope.
 */
export function detectBpm(audioBuffer) {
  const sampleRate = audioBuffer.sampleRate;
  const data = audioBuffer.getChannelData(0);

  const onsets = detectOnsets(data, sampleRate);

  if (onsets.length < 4) {
    return detectBpmAutocorrelation(data, sampleRate);
  }

  const intervals = [];
  for (let i = 1; i < onsets.length; i++) {
    intervals.push(onsets[i] - onsets[i - 1]);
  }

  const median = getMedian(intervals);
  if (median <= 0) return null;

  let bpm = 60 / median;

  // Clamp to realistic range
  bpm = Math.round(bpm * 2) / 2;

  if (bpm < 60) bpm *= 2;
  if (bpm > 200) bpm /= 2;
  if (bpm < 60 || bpm > 200) return null;

  return Math.round(bpm);
}

function detectOnsets(data, sampleRate) {
  const hopSize = 512;
  const frameCount = Math.floor(data.length / hopSize) - 1;

  const energies = [];
  for (let i = 0; i < frameCount; i++) {
    const start = i * hopSize;
    let sum = 0;
    for (let j = 0; j < hopSize; j++) {
      sum += data[start + j] * data[start + j];
    }
    energies.push(sum / hopSize);
  }

  // Spectral flux (simplified: energy difference)
  const onsets = [];
  let prevEnergy = 0;

  for (let i = 1; i < energies.length; i++) {
    const diff = Math.max(0, energies[i] - prevEnergy);
    prevEnergy = energies[i];

    // Adaptive threshold
    const threshold = getMedian(energies) * 0.3;
    if (diff > threshold) {
      onsets.push((i * hopSize) / sampleRate);
    }
  }

  return onsets;
}

function detectBpmAutocorrelation(data, sampleRate) {
  const hopSize = 256;
  const envelopeLength = Math.min(2048, Math.floor(data.length / hopSize));

  const envelope = new Float32Array(envelopeLength);
  for (let i = 0; i < envelopeLength; i++) {
    let sum = 0;
    const start = i * hopSize;
    for (let j = 0; j < hopSize; j++) {
      sum += Math.abs(data[start + j]);
    }
    envelope[i] = sum;
  }

  const envSampleRate = sampleRate / hopSize;
  const minLag = Math.floor(envSampleRate * (60 / 200)); // 200 BPM max
  const maxLag = Math.floor(envSampleRate * (60 / 60));  // 60 BPM min
  const corrLength = maxLag;

  if (corrLength <= minLag) return null;

  let bestBpm = null;
  let bestCorr = -Infinity;

  for (let bpm = 70; bpm <= 190; bpm += 0.5) {
    const lag = Math.round(envSampleRate * (60 / bpm));
    if (lag < minLag || lag > envelopeLength / 2) continue;

    let correlation = 0;
    for (let i = 0; i < envelopeLength - lag; i++) {
      correlation += envelope[i] * envelope[i + lag];
    }
    correlation /= (envelopeLength - lag);

    if (correlation > bestCorr) {
      bestCorr = correlation;
      bestBpm = bpm;
    }
  }

  if (bestBpm) {
    bestBpm = Math.round(bestBpm * 2) / 2;
  }

  return bestBpm ? Math.round(bestBpm) : null;
}

function getMedian(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
