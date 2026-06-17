const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const KEY_PROFILES = {
  major: [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1],
  minor: [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0],
};

/**
 * Krumhansl-Schmuckler key detection via chromagram correlation.
 * Uses Goertzel algorithm optimized for single-pass frequency sampling.
 */
export function detectKeyFromBuffer(audioBuffer) {
  const sampleRate = audioBuffer.sampleRate;
  const data = audioBuffer.getChannelData(0);
  const chroma = computeChroma(data, sampleRate);

  const total = chroma.reduce((a, b) => a + b, 0);
  if (total < 0.001) return null;
  const normalized = chroma.map((v) => v / total);

  let bestScore = -Infinity;
  let bestKey = null;

  for (const [profileName, profile] of Object.entries(KEY_PROFILES)) {
    for (let shift = 0; shift < 12; shift++) {
      let score = 0;
      for (let i = 0; i < 12; i++) {
        score += normalized[(i + shift) % 12] * profile[i];
      }
      if (score > bestScore) {
        bestScore = score;
        bestKey = `${NOTE_NAMES[shift]} ${profileName}`;
      }
    }
  }

  return bestKey;
}

/**
 * Efficient chromagram using Goertzel algorithm on a limited window.
 * Processes max 3 seconds of audio, sampling 49 MIDI pitches (C2-C6).
 */
function computeChroma(signal, sampleRate) {
  const maxSamples = Math.min(signal.length, Math.floor(sampleRate * 3));
  const chroma = new Float64Array(12);

  for (let pitch = 36; pitch <= 84; pitch++) {
    const freq = 440 * Math.pow(2, (pitch - 69) / 12);
    const omega = (2 * Math.PI * freq) / sampleRate;

    let re = 0;
    let im = 0;
    let cosPrev = 1;
    let sinPrev = 0;
    let cosCurr;
    let sinCurr;
    const cosW = Math.cos(omega);
    const sinW = -Math.sin(omega);

    for (let i = 0; i < maxSamples; i++) {
      cosCurr = cosPrev * cosW - sinPrev * sinW;
      sinCurr = sinPrev * cosW + cosPrev * sinW;
      re += signal[i] * cosCurr;
      im += signal[i] * sinCurr;
      cosPrev = cosCurr;
      sinPrev = sinCurr;
    }

    const mag = Math.sqrt(re * re + im * im);
    chroma[pitch % 12] += mag;
  }

  return Array.from(chroma);
}
